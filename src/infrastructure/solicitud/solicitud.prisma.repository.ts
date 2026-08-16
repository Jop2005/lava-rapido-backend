// src/infrastructure/solicitud/solicitud.prisma.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISolicitudRepository } from '../../domain/solicitud/solicitud.repository.interface';
import { Solicitud } from '../../domain/solicitud/solicitud.entity';
import { SolicitudMapper } from './solicitud.mapper';
import { EstadoSolicitud } from '../../shared/enums/estado-solicitud.enum';

@Injectable()
export class SolicitudPrismaRepository implements ISolicitudRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(solicitud: Solicitud): Promise<Solicitud> {
    const prismaSolicitud = await this.prisma.solicitud.create({
      data: {
        codigoSeguimiento: solicitud.codigoSeguimiento,
        fechaCreacion: solicitud.fechaCreacion,
        estadoActual: solicitud.estadoActual,
        tratamientoEspecial: solicitud.tratamientoEspecial,
        idCliente: solicitud.idCliente,
        lineas: {
          create: solicitud.lineas.map((linea) => ({
            tipoPrenda: linea.tipoPrenda,
            cantidad: linea.cantidad,
          })),
        },
      },
      include: {
        lineas: true,
      },
    });

    return SolicitudMapper.toDomain(prismaSolicitud);
  }

  async findById(id: string): Promise<Solicitud | null> {
    const prismaSolicitud = await this.prisma.solicitud.findUnique({
      where: { codigoSeguimiento: id },
      include: { lineas: true },
    });
    
    return prismaSolicitud ? SolicitudMapper.toDomain(prismaSolicitud) : null;
  }

  async findByCliente(clienteId: string): Promise<Solicitud[]> {
    const prismaSolicitudes = await this.prisma.solicitud.findMany({
      where: { idCliente: clienteId },
      include: { lineas: true },
      orderBy: { fechaCreacion: 'desc' },
    });
    
    return prismaSolicitudes.map((s) => SolicitudMapper.toDomain(s));
  }

  async findActivaByCliente(clienteId: string): Promise<Solicitud | null> {
    // ✅ OPTIMIZADO: Eliminar verificación extra de cliente
    const prismaSolicitud = await this.prisma.solicitud.findFirst({
      where: {
        idCliente: clienteId,
        estadoActual: {
          in: [EstadoSolicitud.SOLICITADA, EstadoSolicitud.EN_PROCESO],
        },
      },
      include: { lineas: true },
      orderBy: { fechaCreacion: 'desc' },
    });
    
    return prismaSolicitud ? SolicitudMapper.toDomain(prismaSolicitud) : null;
  }

  async findAll(params: { 
    skip: number; 
    take: number; 
    estado?: EstadoSolicitud 
  }): Promise<[Solicitud[], number]> {
    const where: any = {};
    if (params.estado) {
      where.estadoActual = params.estado;
    }

    const [solicitudes, total] = await this.prisma.$transaction([
      this.prisma.solicitud.findMany({
        where,
        skip: params.skip,
        take: params.take,
        include: { lineas: true },
        orderBy: { fechaCreacion: 'desc' },
      }),
      this.prisma.solicitud.count({ where }),
    ]);

    return [solicitudes.map((s) => SolicitudMapper.toDomain(s)), total];
  }

  async delete(id: string): Promise<void> {
    await this.prisma.solicitud.delete({
      where: { codigoSeguimiento: id },
    });
  }

  async updateEstado(id: string, estado: EstadoSolicitud): Promise<Solicitud> {
    const prismaSolicitud = await this.prisma.solicitud.update({
      where: { codigoSeguimiento: id },
      data: { estadoActual: estado },
      include: { lineas: true },
    });
    return SolicitudMapper.toDomain(prismaSolicitud);
  }

  // ✅ 1. Cambiar a EN_PROCESO con historial
  async updateEstadoConHistorial(
    id: string,
    estado: EstadoSolicitud,
    responsableId: string,
  ): Promise<Solicitud> {
    const prismaSolicitud = await this.prisma.$transaction(async (tx) => {
      // 1. Actualizar solicitud
      const updated = await tx.solicitud.update({
        where: { codigoSeguimiento: id },
        data: { estadoActual: estado },
        include: { lineas: true },
      });

      // 2. Registrar historial
      await tx.historialEstado.create({
        data: {
          idSolicitud: id,
          estado: estado,
          idResponsable: responsableId,
        },
      });

      return updated;
    });

    return SolicitudMapper.toDomain(prismaSolicitud);
  }

  async updateEstadoCompletadaConHistorial(
    id: string,
    responsableId: string,
  ): Promise<Solicitud> {
    const prismaSolicitud = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.solicitud.update({
        where: { codigoSeguimiento: id },
        data: { estadoActual: EstadoSolicitud.COMPLETADA },
        include: { lineas: true },
      });

      await tx.historialEstado.create({
        data: {
          idSolicitud: id,
          estado: EstadoSolicitud.COMPLETADA,
          idResponsable: responsableId,
        },
      });

      return updated;
    });

    return SolicitudMapper.toDomain(prismaSolicitud);
  }

  // ✅ 3. Cambiar estado por Admin con historial
  async updateEstadoAdminConHistorial(
    id: string,
    estado: EstadoSolicitud,
    responsableId: string,
  ): Promise<Solicitud> {
    const prismaSolicitud = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.solicitud.update({
        where: { codigoSeguimiento: id },
        data: { estadoActual: estado },
        include: { lineas: true },
      });

      await tx.historialEstado.create({
        data: {
          idSolicitud: id,
          estado: estado,
          idResponsable: responsableId,
        },
      });

      return updated;
    });

    return SolicitudMapper.toDomain(prismaSolicitud);
  }
}