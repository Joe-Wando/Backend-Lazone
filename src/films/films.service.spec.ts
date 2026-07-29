import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FilmsService } from './films.service';
import { TmdbService } from './tmdb.service';
import { Film } from './entities/film.entity';

describe('FilmsService', () => {
  let service: FilmsService;
  let filmRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  const film: Film = {
    id: 'film-1',
    tmdbId: 550,
    titre: 'Fight Club',
    description: '...',
    affiche: undefined,
    duree: 139,
    genre: 'Drame',
    note: 8.4,
    showtimes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Film;

  beforeEach(async () => {
    filmRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilmsService,
        { provide: getRepositoryToken(Film), useValue: filmRepository },
        { provide: TmdbService, useValue: {} },
      ],
    }).compile();

    service = module.get(FilmsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('retourne le film existant', async () => {
      filmRepository.findOne.mockResolvedValue(film);

      const resultat = await service.findOne('film-1');

      expect(resultat).toEqual(film);
    });

    it("lève NotFoundException si le film n'existe pas", async () => {
      filmRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('inconnu')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('lève ConflictException si le tmdbId existe déjà', async () => {
      filmRepository.findOne.mockResolvedValue(film);

      await expect(
        service.create({
          tmdbId: 550,
          titre: 'Fight Club',
        } as any),
      ).rejects.toThrow(ConflictException);
      expect(filmRepository.save).not.toHaveBeenCalled();
    });
  });
});
