import { IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

export class ActualizarTipoPrendaDto {
  @IsString({ message: 'El tipo debe ser un texto' })
  @MinLength(3, { message: 'El tipo debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El tipo no puede tener más de 50 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { 
    message: 'El tipo solo puede contener letras y espacios' 
  })
  tipo: string;
}