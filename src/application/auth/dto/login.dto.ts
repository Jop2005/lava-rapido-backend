import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(4)
  nombreUsuario: string;

  @IsString()
  @MinLength(8)
  password: string;
}