import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import {
  Reservation,
  StatutReservation,
} from '../reservations/entities/reservation.entity';
import { PAIEMENTS_TOTAL } from '../metrics/metrics.constants';

const NABOOPAY_BASE_URL = 'https://api.naboopay.com';

export interface ResultatTransaction {
  orderId: string;
  checkoutUrl: string;
  montantAPayer: number;
}

@Injectable()
export class PaiementService {
  private readonly logger = new Logger(PaiementService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectMetric(PAIEMENTS_TOTAL)
    private readonly paiementsTotal: Counter<string>,
  ) {}

  async creerTransaction(
    montant: number,
    description: string,
    reservationId: string,
  ): Promise<ResultatTransaction> {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    try {
      const response = await firstValueFrom(
        // NabooPay expose la création de transaction en v1 (PUT), alors que la
        // lecture/suppression se fait en v2 : mélange confirmé côté NabooPay,
        // pas une erreur d'intégration (cf. découverte phase 1).
        this.httpService.request({
          method: 'PUT',
          url: `${NABOOPAY_BASE_URL}/api/v1/transaction/create-transaction`,
          headers: {
            Authorization: `Bearer ${this.configService.get('NABOOPAY_API_KEY')}`,
          },
          data: {
            method_of_payment: ['WAVE', 'ORANGE_MONEY'],
            products: [
              {
                name: description,
                category: 'Reservation',
                amount: montant,
                quantity: 1,
                description,
              },
            ],
            success_url: `${frontendUrl}/paiement/succes?reservationId=${reservationId}`,
            error_url: `${frontendUrl}/paiement/erreur?reservationId=${reservationId}`,
            is_escrow: false,
          },
        }),
      );

      return {
        orderId: response.data.order_id,
        checkoutUrl: response.data.checkout_url,
        montantAPayer: response.data.amount_to_pay,
      };
    } catch {
      throw new ServiceUnavailableException(
        'Impossible de contacter NabooPay pour le moment',
      );
    }
  }

  async confirmerParOrderId(orderId: string): Promise<void> {
    this.logger.log(`Recherche de la réservation pour orderId=${orderId}`);
    const reservation = await this.reservationRepository.findOne({
      where: { orderId },
    });

    if (!reservation) {
      this.logger.warn(`Aucune réservation trouvée pour orderId=${orderId}`);
      return;
    }

    this.logger.log(
      `Réservation ${reservation.id} trouvée, statut actuel=${reservation.statut}`,
    );

    if (reservation.statut !== StatutReservation.PENDING) {
      this.logger.log(
        `Réservation ${reservation.id} déjà au statut ${reservation.statut}, aucune action (idempotence)`,
      );
      return;
    }

    reservation.statut = StatutReservation.CONFIRMED;
    await this.reservationRepository.save(reservation);
    this.paiementsTotal.inc({ statut: 'confirmed' });
    this.logger.log(`Réservation ${reservation.id} passée à CONFIRMED`);
  }
}
