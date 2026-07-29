import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { Cinema } from '../src/cinemas/entities/cinema.entity';
import { Salle } from '../src/salles/entities/salle.entity';
import { Film } from '../src/films/entities/film.entity';
import { Showtime } from '../src/showtimes/entities/showtime.entity';
import { PaiementService } from '../src/paiement/paiement.service';

const paiementServiceMock = {
  creerTransaction: jest.fn().mockResolvedValue({
    orderId: 'mock-order-id-e2e',
    checkoutUrl: 'https://checkout.naboopay.com/checkout/mock-order-id-e2e',
    montantAPayer: 3090,
  }),
};

describe('Reservations (e2e)', () => {
  let app: INestApplication<App>;
  let showtimeId: string;
  let tokenProprietaire: string;
  let tokenAutreUtilisateur: string;
  let reservationId: string;

  const emailProprietaire = `test.e2e.resa.a.${Date.now()}@lazone.sn`;
  const emailAutre = `test.e2e.resa.b.${Date.now()}@lazone.sn`;
  const motDePasse = 'motdepasse123';

  beforeAll(async () => {
    // Timeout par défaut (5s) trop court : init de l'app + création de la
    // chaîne cinéma/salle/film/séance + 2 inscriptions.
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PaiementService)
      .useValue(paiementServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Chaîne complète créée directement en base pour ne dépendre d'aucune
    // donnée de seed préexistante.
    const cinemaRepository: Repository<Cinema> = moduleFixture.get(
      getRepositoryToken(Cinema),
    );
    const salleRepository: Repository<Salle> = moduleFixture.get(
      getRepositoryToken(Salle),
    );
    const filmRepository: Repository<Film> = moduleFixture.get(
      getRepositoryToken(Film),
    );
    const showtimeRepository: Repository<Showtime> = moduleFixture.get(
      getRepositoryToken(Showtime),
    );

    const cinema = await cinemaRepository.save(
      cinemaRepository.create({ nom: 'Cinéma Test E2E', ville: 'Dakar' }),
    );
    const salle = await salleRepository.save(
      salleRepository.create({
        nom: 'Salle Test E2E',
        capacite: 10,
        cinemaId: cinema.id,
      }),
    );
    const film = await filmRepository.save(
      filmRepository.create({
        tmdbId: Math.floor(Math.random() * 1_000_000) + 900_000,
        titre: 'Film Test E2E',
      }),
    );
    const showtime = await showtimeRepository.save(
      showtimeRepository.create({
        filmId: film.id,
        salleId: salle.id,
        dateHeure: new Date(Date.now() + 24 * 60 * 60 * 1000),
        prix: 3000,
        placesReservees: 0,
      }),
    );
    showtimeId = showtime.id;

    const reponseProprietaire = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: emailProprietaire,
        password: motDePasse,
        nom: 'Test',
        prenom: 'A',
      });
    tokenProprietaire = reponseProprietaire.body.accessToken;

    const reponseAutre = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: emailAutre,
        password: motDePasse,
        nom: 'Test',
        prenom: 'B',
      });
    tokenAutreUtilisateur = reponseAutre.body.accessToken;
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('POST /reservations sans token (401)', async () => {
    await request(app.getHttpServer())
      .post('/reservations')
      .send({ showtimeId, nbPlaces: 1 })
      .expect(401);
  });

  it('POST /reservations avec token + séance existante (201, pending + checkoutUrl)', async () => {
    const reponse = await request(app.getHttpServer())
      .post('/reservations')
      .set('Authorization', `Bearer ${tokenProprietaire}`)
      .send({ showtimeId, nbPlaces: 1 })
      .expect(201);

    expect(reponse.body.statut).toBe('pending');
    expect(reponse.body.checkoutUrl).toBeDefined();
    expect(paiementServiceMock.creerTransaction).toHaveBeenCalled();
    reservationId = reponse.body.id;
  });

  it('GET /reservations avec le propriétaire (200)', async () => {
    const reponse = await request(app.getHttpServer())
      .get('/reservations')
      .set('Authorization', `Bearer ${tokenProprietaire}`)
      .expect(200);

    expect(
      reponse.body.some((r: { id: string }) => r.id === reservationId),
    ).toBe(true);
  });

  it('GET /reservations/:id avec un autre utilisateur (403)', async () => {
    await request(app.getHttpServer())
      .get(`/reservations/${reservationId}`)
      .set('Authorization', `Bearer ${tokenAutreUtilisateur}`)
      .expect(403);
  });
});
