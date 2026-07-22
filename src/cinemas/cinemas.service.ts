import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cinema } from './entities/cinema.entity';
import { CreateCinemaDto } from './dto/create-cinema.dto';
import { UpdateCinemaDto } from './dto/update-cinema.dto';

@Injectable()
export class CinemasService {
  constructor(
    @InjectRepository(Cinema)
    private readonly cinemaRepository: Repository<Cinema>,
  ) {}

  async create(dto: CreateCinemaDto): Promise<Cinema> {
    const cinema = this.cinemaRepository.create(dto);
    return this.cinemaRepository.save(cinema);
  }

  async findAll(): Promise<Cinema[]> {
    return this.cinemaRepository.find();
  }

  async findOne(id: string): Promise<Cinema> {
    const cinema = await this.cinemaRepository.findOne({ where: { id } });
    if (!cinema) {
      throw new NotFoundException(`Cinéma ${id} introuvable`);
    }
    return cinema;
  }

  async update(id: string, dto: UpdateCinemaDto): Promise<Cinema> {
    const cinema = await this.findOne(id);
    Object.assign(cinema, dto);
    return this.cinemaRepository.save(cinema);
  }

  async remove(id: string): Promise<void> {
    const cinema = await this.findOne(id);
    await this.cinemaRepository.remove(cinema);
  }
}
