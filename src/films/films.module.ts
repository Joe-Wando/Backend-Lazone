import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Film } from './entities/film.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Film])],
  exports: [TypeOrmModule],
})
export class FilmsModule {}
