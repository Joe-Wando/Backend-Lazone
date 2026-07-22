import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from './app.module';

import { UsersService } from './users/users.service';
import { User, UserRole } from './users/entities/user.entity';
import { FilmsService } from './films/films.service';
import { TmdbService } from './films/tmdb.service';
import { Film } from './films/entities/film.entity';
import { CinemasService } from './cinemas/cinemas.service';
import { Cinema } from './cinemas/entities/cinema.entity';
import { SallesService } from './salles/salles.service';
import { Salle } from './salles/entities/salle.entity';
import { ShowtimesService } from './showtimes/showtimes.service';
import { Showtime } from './showtimes/entities/showtime.entity';
import { ReservationsService } from './reservations/reservations.service';
import { Reservation } from './reservations/entities/reservation.entity';
import { Ticket } from './tickets/entities/ticket.entity';

const TMDB_IDS_A_IMPORTER = [550, 27205, 155];

async function viderLesTables(app: Awaited<ReturnType<typeof NestFactory.createApplicationContext>>) {
  const ticketRepository: Repository<Ticket> = app.get(getRepositoryToken(Ticket));
  const reservationRepository: Repository<Reservation> = app.get(getRepositoryToken(Reservation));
  const showtimeRepository: Repository<Showtime> = app.get(getRepositoryToken(Showtime));
  const salleRepository: Repository<Salle> = app.get(getRepositoryToken(Salle));
  const cinemaRepository: Repository<Cinema> = app.get(getRepositoryToken(Cinema));
  const filmRepository: Repository<Film> = app.get(getRepositoryToken(Film));
  const userRepository: Repository<User> = app.get(getRepositoryToken(User));

  await ticketRepository.createQueryBuilder().delete().execute();
  await reservationRepository.createQueryBuilder().delete().execute();
  await showtimeRepository.createQueryBuilder().delete().execute();
  await salleRepository.createQueryBuilder().delete().execute();
  await cinemaRepository.createQueryBuilder().delete().execute();
  await filmRepository.createQueryBuilder().delete().execute();
  await userRepository.createQueryBuilder().delete().execute();

  console.log('Tables vidées (tickets, reservations, showtimes, salles, cinemas, films, users)');
}

function dateAleatoireEntreDemainEtUneSemaine(): string {
  const demain = Date.now() + 24 * 60 * 60 * 1000;
  const dansUneSemaine = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const timestamp = demain + Math.random() * (dansUneSemaine - demain);
  return new Date(timestamp).toISOString();
}

function prixAleatoire(): number {
  return Math.round((2500 + Math.random() * (5000 - 2500)) / 100) * 100;
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    await viderLesTables(app);

    const usersService = app.get(UsersService);
    const cinemasService = app.get(CinemasService);
    const sallesService = app.get(SallesService);
    const filmsService = app.get(FilmsService);
    const tmdbService = app.get(TmdbService);
    const showtimesService = app.get(ShowtimesService);
    const reservationsService = app.get(ReservationsService);

    // --- Utilisateurs ---
    const motDePasseHache = await bcrypt.hash('motdepasse123', 10);

    const admin = await usersService.create({
      email: 'admin@lazone.sn',
      password: motDePasseHache,
      nom: 'Wando',
      prenom: 'Jonathan',
      role: UserRole.ADMIN,
    });

    const client = await usersService.create({
      email: 'client@lazone.sn',
      password: motDePasseHache,
      nom: 'Diop',
      prenom: 'Awa',
      role: UserRole.USER,
    });

    console.log(`2 utilisateurs créés (admin: ${admin.email}, client: ${client.email})`);

    // --- Cinéma ---
    const cinema = await cinemasService.create({
      nom: 'Cinéma Sea Plaza',
      ville: 'Dakar',
      adresse: 'Corniche Ouest',
      telephone: '+221 33 800 00 00',
    });
    console.log(`1 cinéma créé (${cinema.nom})`);

    // --- Salles ---
    const salle1 = await sallesService.create({
      nom: 'Salle 1',
      capacite: 120,
      cinemaId: cinema.id,
    });
    const salle2 = await sallesService.create({
      nom: 'Salle 2',
      capacite: 80,
      cinemaId: cinema.id,
    });
    const salles = [salle1, salle2];
    console.log(`2 salles créées`);

    // --- Films (import TMDB) ---
    const films: Film[] = [];
    for (const tmdbId of TMDB_IDS_A_IMPORTER) {
      try {
        const filmTmdb = await tmdbService.getFilmParId(tmdbId);
        const film = await filmsService.create(filmTmdb);
        films.push(film);
      } catch (error) {
        console.warn(
          `⚠ Impossible d'importer le film tmdbId=${tmdbId} depuis TMDB : ${
            error instanceof Error ? error.message : error
          }`,
        );
      }
    }
    console.log(`${films.length}/${TMDB_IDS_A_IMPORTER.length} films importés depuis TMDB`);

    if (films.length === 0) {
      console.warn(
        '⚠ Aucun film importé, impossible de créer des séances ou une réservation. Arrêt du seed.',
      );
      return;
    }

    // --- Séances (6, en combinant films et salles) ---
    const showtimes: Showtime[] = [];
    for (let i = 0; i < 6; i++) {
      const film = films[i % films.length];
      const salle = salles[i % salles.length];
      const showtime = await showtimesService.create({
        filmId: film.id,
        salleId: salle.id,
        dateHeure: dateAleatoireEntreDemainEtUneSemaine(),
        prix: prixAleatoire(),
      });
      showtimes.push(showtime);
    }
    console.log(`${showtimes.length} séances créées`);

    // --- Réservation de démonstration ---
    const reservation = await reservationsService.create(client.id, {
      showtimeId: showtimes[0].id,
      nbPlaces: 2,
    });
    console.log(
      `1 réservation créée pour ${client.email} (2 places, ${reservation.tickets.length} tickets, prix total ${reservation.prixTotal})`,
    );

    console.log('\nRésumé du seed :');
    console.log(`  - Utilisateurs : 2`);
    console.log(`  - Cinémas      : 1`);
    console.log(`  - Salles       : ${salles.length}`);
    console.log(`  - Films        : ${films.length}`);
    console.log(`  - Séances      : ${showtimes.length}`);
    console.log(`  - Réservations : 1 (${reservation.tickets.length} tickets)`);
  } finally {
    await app.close();
  }
}

bootstrap()
  .then(() => {
    console.log('\nSeed terminé avec succès.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erreur lors du seed :', error);
    process.exit(1);
  });
