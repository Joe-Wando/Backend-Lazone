import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getToken } from '@willsoto/nestjs-prometheus';
import { DataSource } from 'typeorm';
import { ReservationsService } from './reservations.service';
import { Reservation, StatutReservation } from './entities/reservation.entity';
import { PaiementService } from '../paiement/paiement.service';
import { User, UserRole } from '../users/entities/user.entity';
import { PAIEMENTS_TOTAL, RESERVATIONS_TOTAL } from '../metrics/metrics.constants';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let manager: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };
  let dataSource: { transaction: jest.Mock };

  const proprietaire: User = { id: 'user-1', role: UserRole.USER } as User;
  const autreUtilisateur: User = { id: 'user-2', role: UserRole.USER } as User;

  beforeEach(async () => {
    manager = {
      findOne: jest.fn(),
      create: jest.fn((_entity, data) => data),
      save: jest.fn((data) => data),
    };
    dataSource = {
      transaction: jest.fn((callback) => callback(manager)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: getRepositoryToken(Reservation), useValue: {} },
        { provide: DataSource, useValue: dataSource },
        { provide: PaiementService, useValue: {} },
        { provide: getToken(RESERVATIONS_TOTAL), useValue: { inc: jest.fn() } },
        { provide: getToken(PAIEMENTS_TOTAL), useValue: { inc: jest.fn() } },
      ],
    }).compile();

    service = module.get(ReservationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it("lève NotFoundException si la séance n'existe pas", async () => {
      manager.findOne.mockResolvedValue(null);

      await expect(
        service.create('user-1', { showtimeId: 'inconnue', nbPlaces: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lève BadRequestException si la séance est déjà passée', async () => {
      manager.findOne.mockResolvedValue({
        id: 'showtime-1',
        dateHeure: new Date('2000-01-01'),
        prix: 5000,
        placesReservees: 0,
        salle: { capacite: 100 },
        film: { titre: 'Film test' },
      });

      await expect(
        service.create('user-1', { showtimeId: 'showtime-1', nbPlaces: 1 }),
      ).rejects.toThrow(BadRequestException);
    });

    it("lève BadRequestException si plus de places que ce qu'il reste", async () => {
      manager.findOne.mockResolvedValue({
        id: 'showtime-1',
        dateHeure: new Date('2999-01-01'),
        prix: 5000,
        placesReservees: 100,
        salle: { capacite: 100 },
        film: { titre: 'Film test' },
      });

      await expect(
        service.create('user-1', { showtimeId: 'showtime-1', nbPlaces: 1 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('annuler', () => {
    it("lève ForbiddenException si l'utilisateur n'est ni propriétaire ni admin", async () => {
      manager.findOne.mockResolvedValue({
        id: 'reservation-1',
        userId: proprietaire.id,
        statut: StatutReservation.CONFIRMED,
      });

      await expect(
        service.annuler('reservation-1', autreUtilisateur),
      ).rejects.toThrow(ForbiddenException);
    });

    it('lève BadRequestException si la réservation est déjà annulée', async () => {
      manager.findOne.mockResolvedValue({
        id: 'reservation-1',
        userId: proprietaire.id,
        statut: StatutReservation.CANCELLED,
      });

      await expect(
        service.annuler('reservation-1', proprietaire),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
