import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cinema } from './entities/cinema.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cinema])],
  exports: [TypeOrmModule],
})
export class CinemasModule {}
