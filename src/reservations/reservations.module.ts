import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { PaiementModule } from '../paiement/paiement.module';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation]), PaiementModule, MetricsModule],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [TypeOrmModule, ReservationsService],
})
export class ReservationsModule {}
