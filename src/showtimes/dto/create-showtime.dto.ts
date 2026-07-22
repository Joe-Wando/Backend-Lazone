import { IsDateString, IsNumber, IsUUID } from 'class-validator';

export class CreateShowtimeDto {
  @IsUUID()
  filmId: string;

  @IsUUID()
  salleId: string;

  @IsDateString()
  dateHeure: string;

  @IsNumber()
  prix: number;
}
