import { HistorialEstado } from './historial.entity';
import { EstadoSolicitud } from '../../shared/enums/estado-solicitud.enum';

export interface IHistorialRepository {
  registrarCambio(idSolicitud: string, estado: EstadoSolicitud, idResponsable: string,): Promise<HistorialEstado>;
  findBySolicitud(idSolicitud: string): Promise<HistorialEstado[]>;
  findByCliente(clienteId: string): Promise<HistorialEstado[]>;
  findByResponsable(responsableId: string): Promise<HistorialEstado[]>;
  findAll(params: { skip: number; take: number }): Promise<[HistorialEstado[], number]>;
}