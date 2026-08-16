import { EstadoSolicitud } from '../../shared/enums/estado-solicitud.enum';

export class HistorialEstado {
  constructor(
    public readonly idSolicitud: string,
    public readonly fechaHora: Date,
    public readonly estado: EstadoSolicitud,
    public readonly idResponsable: string,
  ) {}
}