import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface FilmTmdb {
  tmdbId: number;
  titre: string;
  description?: string;
  affiche?: string;
  duree?: number;
  genre?: string;
  note?: number;
}

export interface OptionsDecouverte {
  avecGenres?: number;
  sansGenres?: number;
  page?: number;
}

@Injectable()
export class TmdbService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getFilmsPopulaires(page = 1): Promise<FilmTmdb[]> {
    const data = await this.appelerTmdb('/movie/popular', { page });
    return data.results.map((film: any) => this.mapperFilm(film));
  }

  async getFilmParId(tmdbId: number): Promise<FilmTmdb> {
    const data = await this.appelerTmdb(`/movie/${tmdbId}`);
    return this.mapperFilm(data);
  }

  async rechercher(query: string): Promise<FilmTmdb[]> {
    const data = await this.appelerTmdb('/search/movie', { query });
    return data.results.map((film: any) => this.mapperFilm(film));
  }

  async decouvrirParGenre(options: OptionsDecouverte = {}): Promise<FilmTmdb[]> {
    const params: Record<string, string | number> = {
      page: options.page ?? 1,
      sort_by: 'popularity.desc',
    };
    if (options.avecGenres) {
      params.with_genres = options.avecGenres;
    }
    if (options.sansGenres) {
      params.without_genres = options.sansGenres;
    }
    const data = await this.appelerTmdb('/discover/movie', params);
    return data.results.map((film: any) => this.mapperFilm(film));
  }

  private async appelerTmdb(
    chemin: string,
    params: Record<string, string | number> = {},
  ): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${TMDB_BASE_URL}${chemin}`, {
          params: {
            ...params,
            api_key: this.configService.get('TMDB_API_KEY'),
            language: 'fr-FR',
          },
        }),
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        throw new NotFoundException('Film introuvable sur TMDB');
      }
      throw new ServiceUnavailableException(
        "Impossible de contacter le service TMDB pour le moment",
      );
    }
  }

  private mapperFilm(film: any): FilmTmdb {
    return {
      tmdbId: film.id,
      titre: film.title,
      description: film.overview ?? undefined,
      affiche: film.poster_path
        ? `${TMDB_IMAGE_BASE_URL}${film.poster_path}`
        : undefined,
      duree: film.runtime ?? undefined,
      genre: Array.isArray(film.genres)
        ? film.genres.map((g: any) => g.name).join(', ')
        : undefined,
      note: film.vote_average ?? undefined,
    };
  }
}
