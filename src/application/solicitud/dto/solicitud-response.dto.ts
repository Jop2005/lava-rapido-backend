import { EstadoSolicitud } from '../../../shared/enums/estado-solicitud.enum';
import { TratamientoEspecial } from '../../../shared/enums/tratamiento-especial.enum';

export class LineaSolicitudResponseDto {
  tipoPrenda: string;
  cantidad: number;
}

export class SolicitudResponseDto {
  codigoSeguimiento: string;
  fechaCreacion: Date;
  estadoActual: EstadoSolicitud;
  tratamientoEspecial: TratamientoEspecial;
  idCliente: string;
  lineas: LineaSolicitudResponseDto[];
}