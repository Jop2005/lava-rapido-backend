export interface EmailSolicitudData {
  codigoSeguimiento: string;
  clienteNombre: string;
  fechaCreacion: Date;
  estado: string;
  lineas: {
    tipoPrenda: string;
    cantidad: number;
  }[];
  tratamientoEspecial: string;
  lugarRecogida: string;
  fechaRecogida: string;
  horaRecogida: string;
  lugarEntrega: string;
  fechaEntrega: string;
}

export interface EmailCambioEstadoData {
  codigoSeguimiento: string;
  clienteNombre: string;
  estadoAnterior: string;
  estadoNuevo: string;
  fechaCambio: Date;
}

export interface IEmailService {
  enviarConfirmacionSolicitud(destinatario: string, datos: EmailSolicitudData): Promise<void>;
  enviarCambioEstado(destinatario: string, datos: EmailCambioEstadoData): Promise<void>;
  enviarNotificacionGenerica(destinatario: string, asunto: string, mensaje: string): Promise<void>;
}