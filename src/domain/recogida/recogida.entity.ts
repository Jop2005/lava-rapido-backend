import { EstadoRecogida } from '../../shared/enums/recogida-estado.enum';

export class Recogida {
  constructor(
    public readonly id: number,
    public readonly lugar: string,
    public readonly fecha: Date,
    public readonly hora: string,
    public readonly estado: EstadoRecogida,
    public readonly idSolicitud: string,
    public readonly idConductor: string | null,
  ) {}

  estaPendiente(): boolean {
    return this.estado === EstadoRecogida.PENDIENTE;
  }

  estaRealizada(): boolean {
    return this.estado === EstadoRecogida.REALIZADA;
  }

  marcarComoRealizada(conductorId: string): Recogida {
    if (!this.estaPendiente()) {
      throw new Error('La recogida ya fue realizada');
    }
    return new Recogida(
      this.id,
      this.lugar,
      this.fecha,
      this.hora,
      EstadoRecogida.REALIZADA,
      this.idSolicitud,
      conductorId,
    );
  }

  esDeConductor(conductorId: string): boolean {
    return this.idConductor === conductorId;
  }
}