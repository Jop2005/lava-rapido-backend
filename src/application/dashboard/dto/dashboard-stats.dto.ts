export class SolicitudesPorEstadoDto {
  SOLICITADA: number;
  EN_PROCESO: number;
  COMPLETADA: number;
}

export class SolicitudesPorDiaDto {
  fecha: string;
  cantidad: number;
}

export class TopClienteDto {
  clienteId: string;
  nombre: string;
  totalSolicitudes: number;
}

export class DashboardStatsDto {
  totalSolicitudes: number;
  totalClientes: number;
  totalConductores: number;
  totalLavanderos: number;
  solicitudesPorEstado: SolicitudesPorEstadoDto;
  solicitudesPorDia: SolicitudesPorDiaDto[];
  topClientes: TopClienteDto[];
  tiempoPromedioProcesamiento: number; // en horas
}