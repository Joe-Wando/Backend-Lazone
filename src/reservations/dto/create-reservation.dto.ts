import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class CreateReservationDto {
  @IsUUID()
  showtimeId: string;

  @IsInt()
  @Min(1)
  @Max(10)
  nbPlaces: number;
}
