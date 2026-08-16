import { EstadoSolicitud } from '../../../shared/enums/estado-solicitud.enum';

export class HistorialResponseDto {
  idSolicitud: string;
  fechaHora: Date;
  estado: EstadoSolicitud;
  idResponsable: string;
  nombreResponsable?: string;
}