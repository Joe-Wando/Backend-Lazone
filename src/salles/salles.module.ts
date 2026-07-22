import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Salle } from './entities/salle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Salle])],
  exports: [TypeOrmModule],
})
export class SallesModule {}
