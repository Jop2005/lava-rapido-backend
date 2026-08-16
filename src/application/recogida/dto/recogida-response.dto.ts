import { EstadoRecogida } from '../../../shared/enums/recogida-estado.enum';

export class RecogidaResponseDto {
  id: number;
  lugar: string;
  fecha: Date;
  hora: string;
  estado: EstadoRecogida;
  idSolicitud: string;
  idConductor: string | null;
}