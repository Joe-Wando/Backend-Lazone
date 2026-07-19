import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Film } from './entities/film.entity';
import { TmdbService } from './tmdb.service';
import { FilmsService } from './films.service';
import { FilmsController } from './films.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Film]), HttpModule],
  controllers: [FilmsController],
  providers: [TmdbService, FilmsService],
  exports: [TypeOrmModule, TmdbService, FilmsService],
})
export class FilmsModule {}
