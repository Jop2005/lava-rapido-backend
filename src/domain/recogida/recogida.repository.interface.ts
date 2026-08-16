import { Recogida } from './recogida.entity';

export interface IRecogidaRepository {
  save(recogida: Recogida): Promise<Recogida>;
  findById(id: number): Promise<Recogida | null>;
  findBySolicitud(idSolicitud: string): Promise<Recogida | null>;
  findAll(): Promise<Recogida[]>;
  findByConductor(conductorId: string): Promise<Recogida[]>;
  findDisponibles(): Promise<Recogida[]>;
  asignarConductor(id: number, conductorId: string): Promise<Recogida>;
  marcarRealizada(id: number, conductorId: string): Promise<Recogida>;
  delete(id: number): Promise<void>;
}