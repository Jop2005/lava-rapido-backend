import { IsOptional, IsEnum } from 'class-validator';
import { PaginacionDto } from '../../../shared/dto/paginacion.dto';
import { Rol } from '../../../shared/enums/rol.enum';

export class PaginacionUsuarioDto extends PaginacionDto {
  @IsOptional()
  @IsEnum(Rol, { message: 'Rol inválido' })
  rol?: Rol;
}