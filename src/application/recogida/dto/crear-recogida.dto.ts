import { IsString, IsDateString, IsNotEmpty, Matches } from 'class-validator';

export class CrearRecogidaDto {
  @IsString()
  @IsNotEmpty({ message: 'El lugar de recogida es requerido' })
  lugar: string;

  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  fecha: string;

  @IsString()
  @IsNotEmpty({ message: 'La hora de recogida es requerida' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora debe tener formato HH:MM (ej: 14:30)',
  })
  hora: string;

  @IsString()
  @IsNotEmpty({ message: 'El ID de la solicitud es requerido' })
  idSolicitud: string;
}