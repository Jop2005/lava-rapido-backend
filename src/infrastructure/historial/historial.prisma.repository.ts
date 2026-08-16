import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IHistorialRepository } from '../../domain/historial/historial.repository.interface';
import { HistorialEstado } from '../../domain/historial/historial.entity';
import { HistorialMapper } from './historial.mapper';
import { EstadoSolicitud } from '../../shared/enums/estado-solicitud.enum';

@Injectable()
export class HistorialPrismaRepository implements IHistorialRepository {
  constructor(private readonly prisma: PrismaService) {}

  async registrarCambio(
    idSolicitud: string,
    estado: EstadoSolicitud,
    idResponsable: string,
  ): Promise<HistorialEstado> {
    const data = HistorialMapper.toPrisma(idSolicitud, estado, idResponsable);
    const prismaHistorial = await this.prisma.historialEstado.create({ data });
    return HistorialMapper.toDomain(prismaHistorial);
  }

  async findBySolicitud(idSolicitud: string): Promise<HistorialEstado[]> {
    const prismaHistorial = await this.prisma.historialEstado.findMany({
      where: { idSolicitud },
      orderBy: { fechaHora: 'asc' },
    });
    return prismaHistorial.map(HistorialMapper.toDomain);
  }

  async findByCliente(clienteId: string): Promise<HistorialEstado[]> {
    const prismaHistorial = await this.prisma.historialEstado.findMany({
      where: {
        solicitud: {
          idCliente: clienteId,
        },
      },
      orderBy: { fechaHora: 'asc' },
    });
    return prismaHistorial.map(HistorialMapper.toDomain);
  }

  async findByResponsable(responsableId: string): Promise<HistorialEstado[]> {
    const prismaHistorial = await this.prisma.historialEstado.findMany({
      where: { idResponsable: responsableId },
      orderBy: { fechaHora: 'desc' },
    });
    return prismaHistorial.map(HistorialMapper.toDomain);
  }

  async findAll(params: { skip: number; take: number }): Promise<[HistorialEstado[], number]> {
    const [historial, total] = await this.prisma.$transaction([
      this.prisma.historialEstado.findMany({
        skip: params.skip,
        take: params.take,
        orderBy: { fechaHora: 'desc' },
        include: {
          solicitud: true,
          responsable: true,
        },
      }),
      this.prisma.historialEstado.count(),
    ]);

    return [historial.map(HistorialMapper.toDomain), total];
  }
}