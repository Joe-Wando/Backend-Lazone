import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  password: string;
}