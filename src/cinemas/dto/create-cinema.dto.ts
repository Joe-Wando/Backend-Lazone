import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCinemaDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  ville: string;

  @IsOptional()
  @IsString()
  adresse?: string;

  @IsOptional()
  @IsString()
  telephone?: string;
}
