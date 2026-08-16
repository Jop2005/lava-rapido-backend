import { Recogida as PrismaRecogida } from '@prisma/client';
import { Recogida } from '../../domain/recogida/recogida.entity';
import { EstadoRecogida } from '../../shared/enums/recogida-estado.enum';

export class RecogidaMapper {
  static toDomain(prismaRecogida: PrismaRecogida): Recogida {
    return new Recogida(
      prismaRecogida.id,
      prismaRecogida.lugar,
      prismaRecogida.fecha,
      prismaRecogida.hora,
      prismaRecogida.estado as EstadoRecogida,
      prismaRecogida.idSolicitud,
      prismaRecogida.idConductor,
    );
  }

  static toPrisma(recogida: Recogida): any {
    return {
      lugar: recogida.lugar,
      fecha: recogida.fecha,
      hora: recogida.hora,
      estado: recogida.estado,
      idSolicitud: recogida.idSolicitud,
      idConductor: recogida.idConductor,
    };
  }
}