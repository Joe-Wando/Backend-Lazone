import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import {
  Reservation,
  StatutReservation,
} from '../reservations/entities/reservation.entity';

const NABOOPAY_BASE_URL = 'https://api.naboopay.com';
// URLs provisoires en attendant l'intégration frontend (cf. tâche "Frontend" à venir).
const FRONTEND_SUCCESS_URL = 'https://la-zone-navy.vercel.app/paiement/succes';
const FRONTEND_ERROR_URL = 'https://la-zone-navy.vercel.app/paiement/echec';

export interface ResultatTransaction {
  orderId: string;
  checkoutUrl: string;
  montantAPayer: number;
}

@Injectable()
export class PaiementService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async creerTransaction(
    montant: number,
    description: string,
  ): Promise<ResultatTransaction> {
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
            success_url: FRONTEND_SUCCESS_URL,
            error_url: FRONTEND_ERROR_URL,
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
    const reservation = await this.reservationRepository.findOne({
      where: { orderId },
    });
    if (!reservation) {
      return;
    }
    if (reservation.statut !== StatutReservation.PENDING) {
      return;
    }
    reservation.statut = StatutReservation.CONFIRMED;
    await this.reservationRepository.save(reservation);
  }
}
