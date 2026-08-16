import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ITipoPrendaRepository } from '../../domain/tipo-prenda/tipo-prenda.repository.interface';
import { TipoPrenda } from '../../domain/tipo-prenda/tipo-prenda.entity';
import { TipoPrendaMapper } from './tipo-prenda.mapper';

@Injectable()
export class TipoPrendaPrismaRepository implements ITipoPrendaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(tipo: TipoPrenda): Promise<TipoPrenda> {
    const prismaTipo = await this.prisma.tipoDePrenda.create({
      data: {
        tipo: tipo.tipo,
      },
    });
    return TipoPrendaMapper.toDomain(prismaTipo);
  }

  async findByTipo(tipo: string): Promise<TipoPrenda | null> {
    const prismaTipo = await this.prisma.tipoDePrenda.findUnique({
      where: { tipo },
    });
    return prismaTipo ? TipoPrendaMapper.toDomain(prismaTipo) : null;
  }

  async findAll(): Promise<TipoPrenda[]> {
    const prismaTipos = await this.prisma.tipoDePrenda.findMany({
      orderBy: { tipo: 'asc' },
    });
    return prismaTipos.map((t) => TipoPrendaMapper.toDomain(t));
  }

  async delete(tipo: string): Promise<void> {
    await this.prisma.tipoDePrenda.delete({
      where: { tipo },
    });
  }

  async existeTipo(tipo: string): Promise<boolean> {
    const count = await this.prisma.tipoDePrenda.count({
      where: { tipo },
    });
    return count > 0;
  }

  async tieneSolicitudes(tipo: string): Promise<boolean> {
    const count = await this.prisma.lineaSolicitud.count({
      where: { tipoPrenda: tipo },
    });
    return count > 0;
  }
}