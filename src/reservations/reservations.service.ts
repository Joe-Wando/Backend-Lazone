import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { Reservation, StatutReservation } from './entities/reservation.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { Showtime } from '../showtimes/entities/showtime.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { PaiementService } from '../paiement/paiement.service';
import { PAIEMENTS_TOTAL, RESERVATIONS_TOTAL } from '../metrics/metrics.constants';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly dataSource: DataSource,
    private readonly paiementService: PaiementService,
    @InjectMetric(RESERVATIONS_TOTAL)
    private readonly reservationsTotal: Counter<string>,
    @InjectMetric(PAIEMENTS_TOTAL)
    private readonly paiementsTotal: Counter<string>,
  ) {}

  async create(
    userId: string,
    dto: CreateReservationDto,
  ): Promise<Reservation & { checkoutUrl: string }> {
    return this.dataSource.transaction(async (manager) => {
      const showtime = await manager.findOne(Showtime, {
        where: { id: dto.showtimeId },
      });
      if (!showtime) {
        throw new NotFoundException(`Séance ${dto.showtimeId} introuvable`);
      }

      if (showtime.dateHeure <= new Date()) {
        throw new BadRequestException('Cette séance est déjà passée');
      }

      const placesRestantes = showtime.salle.capacite - showtime.placesReservees;
      if (dto.nbPlaces > placesRestantes) {
        throw new BadRequestException(
          `Seulement ${placesRestantes} place(s) disponible(s) pour cette séance`,
        );
      }

      const prixTotal = dto.nbPlaces * showtime.prix;

      const tickets = Array.from({ length: dto.nbPlaces }, (_, i) =>
        manager.create(Ticket, {
          numeroSiege: `A${showtime.placesReservees + i + 1}`,
          numeroTicket: this.genererNumeroTicket(),
          qrcode: undefined,
        }),
      );

      const reservation = manager.create(Reservation, {
        userId,
        showtimeId: dto.showtimeId,
        nbPlaces: dto.nbPlaces,
        prixTotal,
        statut: StatutReservation.PENDING,
        tickets,
      });

      const saved = await manager.save(reservation);

      showtime.placesReservees += dto.nbPlaces;
      await manager.save(showtime);

      // Appel NabooPay dans la même transaction : si le paiement ne peut pas
      // être initié, toute la réservation (places incluses) est annulée.
      const { orderId, checkoutUrl, montantAPayer } =
        await this.paiementService.creerTransaction(
          prixTotal,
          `Réservation ${dto.nbPlaces} place(s) - ${showtime.film.titre}`,
        );

      saved.orderId = orderId;
      saved.montantAPayer = montantAPayer;
      await manager.save(saved);

      this.reservationsTotal.inc();

      return Object.assign(saved, { checkoutUrl });
    });
  }

  findAllForUser(userId: string): Promise<Reservation[]> {
    return this.reservationRepository.find({ where: { userId } });
  }

  findAll(): Promise<Reservation[]> {
    return this.reservationRepository.find();
  }

  async findOne(id: string, user: User): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
    });
    if (!reservation) {
      throw new NotFoundException(`Réservation ${id} introuvable`);
    }
    this.verifierProprietaire(reservation, user);
    return reservation;
  }

  async annuler(id: string, user: User): Promise<Reservation> {
    return this.dataSource.transaction(async (manager) => {
      const reservation = await manager.findOne(Reservation, {
        where: { id },
      });
      if (!reservation) {
        throw new NotFoundException(`Réservation ${id} introuvable`);
      }
      this.verifierProprietaire(reservation, user);

      if (reservation.statut === StatutReservation.CANCELLED) {
        throw new BadRequestException('Cette réservation est déjà annulée');
      }

      reservation.statut = StatutReservation.CANCELLED;
      await manager.save(reservation);
      await this.recrediterPlaces(manager, reservation);

      this.paiementsTotal.inc({ statut: 'cancelled' });

      return reservation;
    });
  }

  async remove(id: string): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const reservation = await manager.findOne(Reservation, {
        where: { id },
      });
      if (!reservation) {
        throw new NotFoundException(`Réservation ${id} introuvable`);
      }

      if (reservation.statut === StatutReservation.CONFIRMED) {
        await this.recrediterPlaces(manager, reservation);
      }

      await manager.remove(reservation);
    });
  }

  private async recrediterPlaces(
    manager: EntityManager,
    reservation: Reservation,
  ): Promise<void> {
    const showtime = await manager.findOne(Showtime, {
      where: { id: reservation.showtimeId },
    });
    if (!showtime) {
      return;
    }
    showtime.placesReservees -= reservation.nbPlaces;
    await manager.save(showtime);
  }

  private verifierProprietaire(reservation: Reservation, user: User): void {
    if (user.role !== UserRole.ADMIN && reservation.userId !== user.id) {
      throw new ForbiddenException("Vous n'avez pas accès à cette réservation");
    }
  }

  private genererNumeroTicket(): string {
    const partie = randomBytes(5).toString('hex').toUpperCase();
    return `TK-${partie.slice(0, 6)}-${partie.slice(6, 9)}`;
  }
}
