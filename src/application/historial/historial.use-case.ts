// src/application/historial/historial.use-case.ts

import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IHistorialRepository } from '../../domain/historial/historial.repository.interface';
import { HistorialResponseDto } from './dto/historial-response.dto';

@Injectable()
export class HistorialUseCase {
  constructor(
    @Inject('IHistorialRepository')
    private readonly historialRepo: IHistorialRepository,
    private readonly prisma: PrismaService,
  ) {}

  async registrarCambio(
    idSolicitud: string,
    estado: string,
    idResponsable: string,
  ): Promise<void> {
    await this.historialRepo.registrarCambio(idSolicitud, estado as any, idResponsable);
  }

  async obtenerHistorialSolicitud(idSolicitud: string): Promise<HistorialResponseDto[]> {
    const historial = await this.historialRepo.findBySolicitud(idSolicitud);
    if (historial.length === 0) {
      throw new NotFoundException(
        `No se encontró historial para la solicitud ${idSolicitud}`,
      );
    }
    return this.enriquecerConNombres(historial);
  }

  async obtenerHistorialCliente(clienteId: string): Promise<HistorialResponseDto[]> {
    const historial = await this.historialRepo.findByCliente(clienteId);
    if (historial.length === 0) {
      throw new NotFoundException(
        `No se encontró historial para el cliente ${clienteId}`,
      );
    }
    return this.enriquecerConNombres(historial);
  }

  async obtenerHistorialResponsable(responsableId: string): Promise<HistorialResponseDto[]> {
    const historial = await this.historialRepo.findByResponsable(responsableId);
    if (historial.length === 0) {
      throw new NotFoundException(
        `No se encontró historial para el responsable ${responsableId}`,
      );
    }
    return this.enriquecerConNombres(historial);
  }

  async obtenerTodos(params: { skip: number; take: number }): Promise<[HistorialResponseDto[], number]> {
    const [historial, total] = await this.historialRepo.findAll(params);
    const enriquecido = await this.enriquecerConNombres(historial);
    return [enriquecido, total];
  }

  private async enriquecerConNombres(
    historial: any[],
  ): Promise<HistorialResponseDto[]> {
    if (historial.length === 0) {
      return [];
    }

    // ✅ OPTIMIZADO: 1 sola consulta en lugar de N
    const ids = historial.map(item => item.idResponsable);
    const responsables = await this.prisma.usuario.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        nombre: true,
      },
    });

    const responsableMap = new Map(responsables.map(r => [r.id, r.nombre]));

    return historial.map((item) => ({
      idSolicitud: item.idSolicitud,
      fechaHora: item.fechaHora,
      estado: item.estado,
      idResponsable: item.idResponsable,
      nombreResponsable: responsableMap.get(item.idResponsable) || 'Desconocido',
    }));
  }
}