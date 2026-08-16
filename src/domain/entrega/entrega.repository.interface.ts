import { Entrega } from './entrega.entity';

export interface IEntregaRepository {
  save(entrega: Entrega): Promise<Entrega>;
  findById(id: number): Promise<Entrega | null>;
  findBySolicitud(idSolicitud: string): Promise<Entrega | null>;
  findAll(): Promise<Entrega[]>;
  findByConductor(conductorId: string): Promise<Entrega[]>;
  findDisponibles(): Promise<Entrega[]>;
  asignarConductor(id: number, conductorId: string): Promise<Entrega>;
  marcarRealizada(id: number, conductorId: string): Promise<Entrega>;
  delete(id: number): Promise<void>;
}