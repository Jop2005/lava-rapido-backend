import { EstadoEntrega } from '../../shared/enums/entrega-estado.enum';

export class Entrega {
  constructor(
    public readonly id: number,
    public readonly lugar: string,
    public readonly fecha: Date,
    public readonly estado: EstadoEntrega,
    public readonly idSolicitud: string,
    public readonly idConductor: string | null,
  ) {}

  estaPendiente(): boolean {
    return this.estado === EstadoEntrega.PENDIENTE;
  }

  estaRealizada(): boolean {
    return this.estado === EstadoEntrega.REALIZADA;
  }

  esDeConductor(conductorId: string): boolean {
    return this.idConductor === conductorId;
  }
}