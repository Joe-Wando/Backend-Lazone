import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from '../reservations/entities/reservation.entity';
import { PaiementService } from './paiement.service';
import { PaiementController } from './paiement.controller';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Reservation])],
  controllers: [PaiementController],
  providers: [PaiementService],
  exports: [PaiementService],
})
export class PaiementModule {}
