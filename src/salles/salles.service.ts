import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Salle } from './entities/salle.entity';
import { CreateSalleDto } from './dto/create-salle.dto';
import { UpdateSalleDto } from './dto/update-salle.dto';
import { CinemasService } from '../cinemas/cinemas.service';

@Injectable()
export class SallesService {
  constructor(
    @InjectRepository(Salle)
    private readonly salleRepository: Repository<Salle>,
    private readonly cinemasService: CinemasService,
  ) {}

  async create(dto: CreateSalleDto): Promise<Salle> {
    await this.cinemasService.findOne(dto.cinemaId);
    const salle = this.salleRepository.create(dto);
    return this.salleRepository.save(salle);
  }

  async findAll(): Promise<Salle[]> {
    return this.salleRepository.find();
  }

  async findOne(id: string): Promise<Salle> {
    const salle = await this.salleRepository.findOne({ where: { id } });
    if (!salle) {
      throw new NotFoundException(`Salle ${id} introuvable`);
    }
    return salle;
  }

  async update(id: string, dto: UpdateSalleDto): Promise<Salle> {
    const salle = await this.findOne(id);
    Object.assign(salle, dto);
    return this.salleRepository.save(salle);
  }

  async remove(id: string): Promise<void> {
    const salle = await this.findOne(id);
    await this.salleRepository.remove(salle);
  }
}
