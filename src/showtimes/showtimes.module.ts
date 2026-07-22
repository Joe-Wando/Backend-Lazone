import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Showtime } from './entities/showtime.entity';
import { ShowtimesService } from './showtimes.service';
import { FilmsModule } from '../films/films.module';
import { SallesModule } from '../salles/salles.module';

@Module({
  imports: [TypeOrmModule.forFeature([Showtime]), FilmsModule, SallesModule],
  providers: [ShowtimesService],
  exports: [TypeOrmModule, ShowtimesService],
})
export class ShowtimesModule {}
