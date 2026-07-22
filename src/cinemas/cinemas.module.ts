import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cinema } from './entities/cinema.entity';
import { CinemasService } from './cinemas.service';
import { CinemasController } from './cinemas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cinema])],
  controllers: [CinemasController],
  providers: [CinemasService],
  exports: [TypeOrmModule, CinemasService],
})
export class CinemasModule {}
