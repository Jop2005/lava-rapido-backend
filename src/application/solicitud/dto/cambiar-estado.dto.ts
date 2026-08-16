import { IsEnum } from 'class-validator';
import { EstadoSolicitud } from '../../../shared/enums/estado-solicitud.enum';

export class CambiarEstadoDto {
  @IsEnum(EstadoSolicitud)
  estado: EstadoSolicitud;
}