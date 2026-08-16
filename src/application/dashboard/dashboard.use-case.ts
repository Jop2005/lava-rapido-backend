// src/application/dashboard/dashboard.use-case.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DashboardStatsDto, SolicitudesPorEstadoDto, SolicitudesPorDiaDto, TopClienteDto } from './dto/dashboard-stats.dto';
import { EstadoSolicitud } from '../../shared/enums/estado-solicitud.enum';
import { Rol } from '../../shared/enums/rol.enum';
import { FechaUtil } from "../../shared/utils/fecha.util";

@Injectable()
export class DashboardUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerEstadisticas(): Promise<DashboardStatsDto> {
    const [
      totalSolicitudes,
      totalClientes,
      totalConductores,
      totalLavanderos,
      solicitudesPorEstado,
      solicitudesPorDia,
      topClientes,
      tiempoPromedioProcesamiento,
    ] = await Promise.all([
      this.obtenerTotalSolicitudes(),
      this.obtenerTotalClientes(),
      this.obtenerTotalConductores(),
      this.obtenerTotalLavanderos(),
      this.obtenerSolicitudesPorEstado(),
      this.obtenerSolicitudesPorDia(),
      this.obtenerTopClientes(),
      this.obtenerTiempoPromedioProcesamiento(),
    ]);

    return {
      totalSolicitudes,
      totalClientes,
      totalConductores,
      totalLavanderos,
      solicitudesPorEstado,
      solicitudesPorDia,
      topClientes,
      tiempoPromedioProcesamiento,
    };
  }

  private async obtenerTotalSolicitudes(): Promise<number> {
    return await this.prisma.solicitud.count();
  }

  private async obtenerTotalClientes(): Promise<number> {
    return await this.prisma.usuario.count({
      where: { rol: Rol.CLIENTE },
    });
  }

  private async obtenerTotalConductores(): Promise<number> {
    return await this.prisma.usuario.count({
      where: { rol: Rol.CONDUCTOR },
    });
  }

  private async obtenerTotalLavanderos(): Promise<number> {
    return await this.prisma.usuario.count({
      where: { rol: Rol.LAVANDERO },
    });
  }

  private async obtenerSolicitudesPorEstado(): Promise<SolicitudesPorEstadoDto> {
    const resultado = await this.prisma.solicitud.groupBy({
      by: ['estadoActual'],
      _count: {
        estadoActual: true,
      },
    });

    const porEstado: SolicitudesPorEstadoDto = {
      SOLICITADA: 0,
      EN_PROCESO: 0,
      COMPLETADA: 0,
    };

    resultado.forEach((item) => {
      const estado = item.estadoActual as EstadoSolicitud;
      porEstado[estado] = item._count.estadoActual;
    });

    return porEstado;
  }

  private async obtenerSolicitudesPorDia(): Promise<SolicitudesPorDiaDto[]> {
    const dias = FechaUtil.obtenerUltimosNDias(7);
    
    const mapa = new Map<string, number>();
    dias.forEach(dia => mapa.set(dia, 0));

    const fechaInicio = FechaUtil.toUTC(new Date(dias[0]));

    // ✅ OPTIMIZADO: Usar groupBy en la BD
    const solicitudes = await this.prisma.solicitud.groupBy({
      by: ['fechaCreacion'],
      where: {
        fechaCreacion: {
          gte: fechaInicio,
        },
      },
      _count: {
        fechaCreacion: true,
      },
      orderBy: {
        fechaCreacion: 'asc',
      },
    });

    solicitudes.forEach((item) => {
      const key = FechaUtil.formatearLocal(item.fechaCreacion);
      if (mapa.has(key)) {
        mapa.set(key, item._count.fechaCreacion);
      }
    });

    const resultado: SolicitudesPorDiaDto[] = [];
    for (const [fecha, cantidad] of mapa) {
      resultado.push({ fecha, cantidad });
    }

    return resultado;
  }

  private async obtenerTopClientes(): Promise<TopClienteDto[]> {
    const topClientes = await this.prisma.solicitud.groupBy({
      by: ['idCliente'],
      _count: {
        idCliente: true,
      },
      orderBy: {
        _count: {
          idCliente: 'desc',
        },
      },
      take: 5,
    });

    if (topClientes.length === 0) {
      return [];
    }

    // ✅ OPTIMIZADO: 1 sola consulta en lugar de N
    const ids = topClientes.map(item => item.idCliente);
    const clientes = await this.prisma.usuario.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        nombre: true,
      },
    });

    const clienteMap = new Map(clientes.map(c => [c.id, c.nombre]));

    return topClientes.map((item) => ({
      clienteId: item.idCliente,
      nombre: clienteMap.get(item.idCliente) || 'Desconocido',
      totalSolicitudes: item._count.idCliente,
    }));
  }

  private async obtenerTiempoPromedioProcesamiento(): Promise<number> {
    // ✅ OPTIMIZADO: Calcular en la BD con SQL
    const resultado = await this.prisma.$queryRaw<{ promedio_horas: number | null }[]>`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (max_h.fecha - min_h.fecha))) / 3600 as promedio_horas
      FROM "Solicitud" s
      JOIN (
        SELECT 
          "idSolicitud",
          MIN("fechaHora") as fecha,
          MAX("fechaHora") as fecha
        FROM "HistorialEstado"
        GROUP BY "idSolicitud"
      ) h ON s."codigoSeguimiento" = h."idSolicitud"
      WHERE s."estadoActual" = ${EstadoSolicitud.COMPLETADA}::"EstadoSolicitud"
    `;

    const promedio = resultado[0]?.promedio_horas || 0;
    return Math.round(promedio * 10) / 10;
  }
}