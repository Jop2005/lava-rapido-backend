import { 
  IsArray, 
  ValidateNested, 
  IsEnum, 
  ArrayMinSize, 
  IsString, 
  IsDateString, 
  IsNotEmpty, 
  Matches,
  IsOptional 
} from 'class-validator';
import { Type } from 'class-transformer';
import { LineaSolicitudDto } from './linea-solicitud.dto';
import { TratamientoEspecial } from '../../../shared/enums/tratamiento-especial.enum';

export class CrearSolicitudDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe incluir al menos un tipo de prenda' })
  @ValidateNested({ each: true })
  @Type(() => LineaSolicitudDto)
  lineas: LineaSolicitudDto[];

  @IsEnum(TratamientoEspecial, { 
    message: 'Tratamiento especial inválido. Debe ser: NINGUNO, PLANCHADO, DOBLADO o AMBOS' 
  })
  @IsOptional()
  tratamientoEspecial?: TratamientoEspecial = TratamientoEspecial.NINGUNO;

  @IsString()
  @IsNotEmpty({ message: 'El lugar de recogida es requerido' })
  lugarRecogida: string;

  @IsDateString({}, { message: 'La fecha de recogida debe tener formato YYYY-MM-DD' })
  fechaRecogida: string;

  @IsString()
  @IsNotEmpty({ message: 'La hora de recogida es requerida' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora debe tener formato HH:MM (ej: 14:30)',
  })
  horaRecogida: string;

  @IsOptional()
  @IsString()
  lugarEntrega?: string;
}