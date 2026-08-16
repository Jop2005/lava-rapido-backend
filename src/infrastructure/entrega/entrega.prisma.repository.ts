import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IEntregaRepository } from '../../domain/entrega/entrega.repository.interface';
import { Entrega } from '../../domain/entrega/entrega.entity';
import { EstadoEntrega } from '../../shared/enums/entrega-estado.enum';
import { EntregaMapper } from './entrega.mapper';

@Injectable()
export class EntregaPrismaRepository implements IEntregaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entrega: Entrega): Promise<Entrega> {
    const data = await this.prisma.entrega.create({
      data: EntregaMapper.toPrisma(entrega),
    });
    return EntregaMapper.toDomain(data);
  }

  async findById(id: number): Promise<Entrega | null> {
    const data = await this.prisma.entrega.findUnique({
      where: { id },
    });
    return data ? EntregaMapper.toDomain(data) : null;
  }

  async findBySolicitud(idSolicitud: string): Promise<Entrega | null> {
    const data = await this.prisma.entrega.findUnique({
      where: { idSolicitud },
    });
    return data ? EntregaMapper.toDomain(data) : null;
  }

  async findAll(): Promise<Entrega[]> {
    const data = await this.prisma.entrega.findMany({
      orderBy: { fecha: 'desc' },
    });
    return data.map(EntregaMapper.toDomain);
  }

  async findByConductor(conductorId: string): Promise<Entrega[]> {
    const data = await this.prisma.entrega.findMany({
      where: { idConductor: conductorId },
      orderBy: { fecha: 'desc' },
    });
    return data.map(EntregaMapper.toDomain);
  }

  async findDisponibles(): Promise<Entrega[]> {
    const data = await this.prisma.entrega.findMany({
      where: {
        estado: EstadoEntrega.PENDIENTE,
        idConductor: null,
      },
      orderBy: { fecha: 'asc' },
    });
    return data.map(EntregaMapper.toDomain);
  }

  async asignarConductor(id: number, conductorId: string): Promise<Entrega> {
    const data = await this.prisma.entrega.update({
      where: { id },
      data: { idConductor: conductorId },
    });
    return EntregaMapper.toDomain(data);
  }

  async marcarRealizada(id: number, conductorId: string): Promise<Entrega> {
    const data = await this.prisma.entrega.update({
      where: { id },
      data: {
        estado: EstadoEntrega.REALIZADA,
        idConductor: conductorId,
      },
    });
    return EntregaMapper.toDomain(data);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.entrega.delete({
      where: { id },
    });
  }
}