import { IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSalleDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsInt()
  capacite: number;

  @IsUUID()
  cinemaId: string;
}
