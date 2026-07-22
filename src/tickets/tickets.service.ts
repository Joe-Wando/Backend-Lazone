import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  findAll(): Promise<Ticket[]> {
    return this.ticketRepository.find();
  }

  async findOne(id: string, user: User): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: { reservation: true },
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket ${id} introuvable`);
    }
    if (user.role !== UserRole.ADMIN && ticket.reservation.userId !== user.id) {
      throw new ForbiddenException("Vous n'avez pas accès à ce ticket");
    }
    return ticket;
  }
}
