import { HistorialEstado as PrismaHistorial } from '@prisma/client';
import { HistorialEstado } from '../../domain/historial/historial.entity';
import { EstadoSolicitud } from '../../shared/enums/estado-solicitud.enum';

export class HistorialMapper {
  static toDomain(prismaHistorial: PrismaHistorial): HistorialEstado {
    return new HistorialEstado(
      prismaHistorial.idSolicitud,
      prismaHistorial.fechaHora,
      prismaHistorial.estado as EstadoSolicitud,
      prismaHistorial.idResponsable,
    );
  }

  static toPrisma(
    idSolicitud: string,
    estado: EstadoSolicitud,
    idResponsable: string,
  ): any {
    return {
      idSolicitud,
      estado,
      idResponsable,
    };
  }
}