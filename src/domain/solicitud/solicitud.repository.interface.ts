import { Solicitud } from './solicitud.entity';
import { EstadoSolicitud } from '../../shared/enums/estado-solicitud.enum';

export interface ISolicitudRepository {
  save(solicitud: Solicitud): Promise<Solicitud>;
  findById(id: string): Promise<Solicitud | null>;
  findByCliente(clienteId: string): Promise<Solicitud[]>;
  findActivaByCliente(clienteId: string): Promise<Solicitud | null>;
  findAll(params: { skip: number; take: number; estado?: EstadoSolicitud }): Promise<[Solicitud[], number]>;
  updateEstado(id: string, estado: EstadoSolicitud): Promise<Solicitud>;
  delete(id: string): Promise<void>;
  updateEstadoConHistorial(id: string, estado: EstadoSolicitud, responsableId: string,): Promise<Solicitud>;
}