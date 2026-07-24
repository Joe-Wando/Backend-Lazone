import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Showtime } from './entities/showtime.entity';
import { ShowtimesService } from './showtimes.service';
import { FilmsModule } from '../films/films.module';
import { SallesModule } from '../salles/salles.module';
import { ShowtimesController } from './showtimes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Showtime]), FilmsModule, SallesModule],
  controllers: [ShowtimesController],
  providers: [ShowtimesService],
  exports: [TypeOrmModule, ShowtimesService],
})
export class ShowtimesModule {}
