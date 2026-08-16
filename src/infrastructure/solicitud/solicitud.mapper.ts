// src/infrastructure/solicitud/solicitud.mapper.ts

import { Solicitud, LineaSolicitud } from '../../domain/solicitud/solicitud.entity';
import { 
  Solicitud as PrismaSolicitud, 
  LineaSolicitud as PrismaLineaSolicitud 
} from '@prisma/client';

export class SolicitudMapper {
  static toDomain(
    prismaSolicitud: PrismaSolicitud & { lineas: PrismaLineaSolicitud[] }
  ): Solicitud {
    const lineas: LineaSolicitud[] = prismaSolicitud.lineas.map((linea) => ({
      tipoPrenda: linea.tipoPrenda,
      cantidad: linea.cantidad,
    }));

    return new Solicitud(
      prismaSolicitud.codigoSeguimiento,
      prismaSolicitud.fechaCreacion,
      prismaSolicitud.estadoActual,
      prismaSolicitud.tratamientoEspecial,
      prismaSolicitud.idCliente,
      lineas,
    );
  }

  static toPrisma(solicitud: Solicitud): any {
    return {
      codigoSeguimiento: solicitud.codigoSeguimiento,
      fechaCreacion: solicitud.fechaCreacion,
      estadoActual: solicitud.estadoActual,
      tratamientoEspecial: solicitud.tratamientoEspecial,
      idCliente: solicitud.idCliente,
    };
  }
}