import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cinema } from './entities/cinema.entity';
import { CinemasService } from './cinemas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cinema])],
  providers: [CinemasService],
  exports: [TypeOrmModule, CinemasService],
})
export class CinemasModule {}
