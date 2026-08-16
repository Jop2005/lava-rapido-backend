import { TipoPrenda } from './tipo-prenda.entity';

export interface ITipoPrendaRepository {
  save(tipo: TipoPrenda): Promise<TipoPrenda>;
  findByTipo(tipo: string): Promise<TipoPrenda | null>;
  findAll(): Promise<TipoPrenda[]>;
  delete(tipo: string): Promise<void>;
  existeTipo(tipo: string): Promise<boolean>;
  tieneSolicitudes(tipo: string): Promise<boolean>;
}