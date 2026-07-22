import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Showtime } from './entities/showtime.entity';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';
import { FilmsService } from '../films/films.service';
import { SallesService } from '../salles/salles.service';

@Injectable()
export class ShowtimesService {
  constructor(
    @InjectRepository(Showtime)
    private readonly showtimeRepository: Repository<Showtime>,
    private readonly filmsService: FilmsService,
    private readonly sallesService: SallesService,
  ) {}

  async create(dto: CreateShowtimeDto): Promise<Showtime> {
    await this.filmsService.findOne(dto.filmId);
    await this.sallesService.findOne(dto.salleId);
    const showtime = this.showtimeRepository.create(dto);
    return this.showtimeRepository.save(showtime);
  }

  async findAll(): Promise<Showtime[]> {
    return this.showtimeRepository.find();
  }

  async findOne(id: string): Promise<Showtime> {
    const showtime = await this.showtimeRepository.findOne({ where: { id } });
    if (!showtime) {
      throw new NotFoundException(`Séance ${id} introuvable`);
    }
    return showtime;
  }

  async update(id: string, dto: UpdateShowtimeDto): Promise<Showtime> {
    const showtime = await this.findOne(id);
    Object.assign(showtime, dto);
    return this.showtimeRepository.save(showtime);
  }

  async remove(id: string): Promise<void> {
    const showtime = await this.findOne(id);
    await this.showtimeRepository.remove(showtime);
  }
}
