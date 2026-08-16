import { TipoDePrenda as PrismaTipoPrenda } from '@prisma/client';
import { TipoPrenda } from '../../domain/tipo-prenda/tipo-prenda.entity';

export class TipoPrendaMapper {
  static toDomain(prismaTipo: PrismaTipoPrenda): TipoPrenda {
    return new TipoPrenda(prismaTipo.tipo);
  }

  static toPrisma(tipo: TipoPrenda): any {
    return {
      tipo: tipo.tipo,
    };
  }
}