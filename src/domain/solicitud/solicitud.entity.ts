import { EstadoSolicitud } from '../../shared/enums/estado-solicitud.enum';
import { TratamientoEspecial } from '../../shared/enums/tratamiento-especial.enum';

export class LineaSolicitud {
  constructor(
    public readonly tipoPrenda: string,
    public readonly cantidad: number,
  ) {}
}

export class Solicitud {
  constructor(
    public readonly codigoSeguimiento: string,
    public readonly fechaCreacion: Date,
    public readonly estadoActual: EstadoSolicitud,
    public readonly tratamientoEspecial: TratamientoEspecial,
    public readonly idCliente: string,
    public readonly lineas: LineaSolicitud[],
  ) {}

  estaActiva(): boolean {
    return this.estadoActual === EstadoSolicitud.SOLICITADA || 
           this.estadoActual === EstadoSolicitud.EN_PROCESO;
  }

  estaCompletada(): boolean {
    return this.estadoActual === EstadoSolicitud.COMPLETADA;
  }

  puedePasarAEnProceso(): boolean {
    return this.estadoActual === EstadoSolicitud.SOLICITADA;
  }

  puedePasarACompletada(): boolean {
    return this.estadoActual === EstadoSolicitud.EN_PROCESO;
  }

  puedeSerEliminadaPorCliente(): boolean {
    return this.estadoActual === EstadoSolicitud.SOLICITADA;
  }
}