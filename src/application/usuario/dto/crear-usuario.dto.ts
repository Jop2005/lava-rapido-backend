import {
  IsString,
  IsEmail,
  IsDateString,
  MinLength,
  MaxLength,
  Length,
  IsStrongPassword,
  Matches,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Rol } from '../../../shared/enums/rol.enum';

export class CrearUsuarioDto {
  @IsString()
  @Length(11, 11, { message: 'La cédula debe tener exactamente 11 dígitos' })
  @Matches(/^[0-9]+$/, { message: 'La cédula solo debe contener números' })
  id: string;

  @IsString()
  @MinLength(4, { message: 'El nombre de usuario debe tener al menos 4 caracteres' })
  @MaxLength(50, { message: 'El nombre de usuario no puede tener más de 50 caracteres' })
  nombreUsuario: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @IsStrongPassword({
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }, { message: 'La contraseña debe tener al menos una mayúscula, un número y un símbolo' })
  password: string;

  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  nombre: string;

  @IsDateString({}, { message: 'La fecha de nacimiento debe tener formato YYYY-MM-DD' })
  fechaNacimiento: string;

  @IsEmail({}, { message: 'El correo debe tener un formato válido' })
  correo: string;
  
  @IsEnum(Rol, { message: 'Rol inválido' })
  rol: Rol;

  @IsOptional()
  @IsString()
  fotoPerfil?: string;
}