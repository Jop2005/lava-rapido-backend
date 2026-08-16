import { IsString, MinLength, IsStrongPassword } from 'class-validator';

export class CambiarContraseñaDto {
  @IsString()
  @MinLength(8, { message: 'La contraseña actual debe tener al menos 8 caracteres' })
  contraseñaActual: string;

  @IsString()
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
  @IsStrongPassword({
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }, { message: 'La contraseña debe tener al menos una mayúscula, un número y un símbolo' })
  nuevaContraseña: string;

  @IsString()
  @MinLength(8, { message: 'La confirmación debe tener al menos 8 caracteres' })
  confirmarContraseña: string;
}