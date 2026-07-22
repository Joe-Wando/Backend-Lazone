import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Salle } from './entities/salle.entity';
import { SallesService } from './salles.service';
import { CinemasModule } from '../cinemas/cinemas.module';

@Module({
  imports: [TypeOrmModule.forFeature([Salle]), CinemasModule],
  providers: [SallesService],
  exports: [TypeOrmModule, SallesService],
})
export class SallesModule {}
