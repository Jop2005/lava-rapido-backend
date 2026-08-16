import { EstadoEntrega } from '../../../shared/enums/entrega-estado.enum';

export class EntregaResponseDto {
  id: number;
  lugar: string;
  fecha: Date;
  estado: EstadoEntrega;
  idSolicitud: string;
  idConductor: string | null;
}