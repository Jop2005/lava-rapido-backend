import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IRecogidaRepository } from '../../domain/recogida/recogida.repository.interface';
import { Recogida } from '../../domain/recogida/recogida.entity';
import { EstadoRecogida } from '../../shared/enums/recogida-estado.enum';
import { RecogidaMapper } from './recogida.mapper';

@Injectable()
export class RecogidaPrismaRepository implements IRecogidaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(recogida: Recogida): Promise<Recogida> {
    const data = await this.prisma.recogida.create({
      data: RecogidaMapper.toPrisma(recogida),
    });
    return RecogidaMapper.toDomain(data);
  }

  async findById(id: number): Promise<Recogida | null> {
    const data = await this.prisma.recogida.findUnique({
      where: { id },
    });
    return data ? RecogidaMapper.toDomain(data) : null;
  }

  async findBySolicitud(idSolicitud: string): Promise<Recogida | null> {
    const data = await this.prisma.recogida.findUnique({
      where: { idSolicitud },
    });
    return data ? RecogidaMapper.toDomain(data) : null;
  }

  async findAll(): Promise<Recogida[]> {
    const data = await this.prisma.recogida.findMany({
      orderBy: { fecha: 'desc' },
    });
    return data.map(RecogidaMapper.toDomain);
  }

  async findByConductor(conductorId: string): Promise<Recogida[]> {
    const data = await this.prisma.recogida.findMany({
      where: { idConductor: conductorId },
      orderBy: { fecha: 'desc' },
    });
    return data.map(RecogidaMapper.toDomain);
  }

  async findDisponibles(): Promise<Recogida[]> {
    const data = await this.prisma.recogida.findMany({
      where: {
        estado: EstadoRecogida.PENDIENTE,
        idConductor: null,
      },
      orderBy: { fecha: 'asc' },
    });
    return data.map(RecogidaMapper.toDomain);
  }

  async asignarConductor(id: number, conductorId: string): Promise<Recogida> {
    const data = await this.prisma.recogida.update({
      where: { id },
      data: { idConductor: conductorId },
    });
    return RecogidaMapper.toDomain(data);
  }

  async marcarRealizada(id: number, conductorId: string): Promise<Recogida> {
    const data = await this.prisma.recogida.update({
      where: { id },
      data: {
        estado: EstadoRecogida.REALIZADA,
        idConductor: conductorId,
      },
    });
    return RecogidaMapper.toDomain(data);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.recogida.delete({
      where: { id },
    });
  }
}