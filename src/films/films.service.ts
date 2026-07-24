import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Film } from './entities/film.entity';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { TmdbService } from './tmdb.service';

@Injectable()
export class FilmsService {
  constructor(
    @InjectRepository(Film)
    private readonly filmRepository: Repository<Film>,
    private readonly tmdbService: TmdbService,
  ) {}

  async create(dto: CreateFilmDto): Promise<Film> {
    const existant = await this.filmRepository.findOne({
      where: { tmdbId: dto.tmdbId },
    });
    if (existant) {
      throw new ConflictException(
        `Un film avec le tmdbId ${dto.tmdbId} existe déjà`,
      );
    }
    const film = this.filmRepository.create(dto);
    return this.filmRepository.save(film);
  }

  async findAll(): Promise<Film[]> {
    return this.filmRepository.find();
  }

  async findOne(id: string): Promise<Film> {
    const film = await this.filmRepository.findOne({ where: { id } });
    if (!film) {
      throw new NotFoundException(`Film ${id} introuvable`);
    }
    return film;
  }

  async update(id: string, dto: UpdateFilmDto): Promise<Film> {
    const film = await this.findOne(id);
    Object.assign(film, dto);
    return this.filmRepository.save(film);
  }

  async remove(id: string): Promise<void> {
    const film = await this.findOne(id);
    await this.filmRepository.remove(film);
  }

  async importerDepuisTmdb(tmdbId: number): Promise<Film> {
    const existant = await this.filmRepository.findOne({ where: { tmdbId } });
    if (existant) {
      return existant;
    }
    const filmTmdb = await this.tmdbService.getFilmParId(tmdbId);
    const film = this.filmRepository.create(filmTmdb);
    return this.filmRepository.save(film);
  }
}
