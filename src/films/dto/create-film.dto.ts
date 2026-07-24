import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFilmDto {
  @IsInt()
  tmdbId: number;

  @IsString()
  @IsNotEmpty()
  titre: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  affiche?: string;

  @IsOptional()
  @IsInt()
  duree?: number;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsNumber()
  note?: number;
}
