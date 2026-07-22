import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Salle } from './entities/salle.entity';
import { SallesService } from './salles.service';
import { CinemasModule } from '../cinemas/cinemas.module';
import { SallesController } from './salles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Salle]), CinemasModule],
  controllers: [SallesController],
  providers: [SallesService],
  exports: [TypeOrmModule, SallesService],
})
export class SallesModule {}
