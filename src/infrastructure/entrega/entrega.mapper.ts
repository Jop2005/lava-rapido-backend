import { Entrega as PrismaEntrega } from '@prisma/client';
import { Entrega } from '../../domain/entrega/entrega.entity';
import { EstadoEntrega } from '../../shared/enums/entrega-estado.enum';

export class EntregaMapper {
  static toDomain(prismaEntrega: PrismaEntrega): Entrega {
    return new Entrega(
      prismaEntrega.id,
      prismaEntrega.lugar,
      prismaEntrega.fecha,
      prismaEntrega.estado as EstadoEntrega,
      prismaEntrega.idSolicitud,
      prismaEntrega.idConductor,
    );
  }

  static toPrisma(entrega: Entrega): any {
    return {
      lugar: entrega.lugar,
      fecha: entrega.fecha,
      estado: entrega.estado,
      idSolicitud: entrega.idSolicitud,
      idConductor: entrega.idConductor,
    };
  }
}