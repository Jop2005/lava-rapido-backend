import { Injectable, Logger } from '@nestjs/common';
import { IEmailService, EmailSolicitudData, EmailCambioEstadoData } from '../../domain/notificacion/email.service.interface';

@Injectable()
export class EmailMockService implements IEmailService {
  private readonly logger = new Logger(EmailMockService.name);

  async enviarConfirmacionSolicitud(destinatario: string, datos: EmailSolicitudData): Promise<void> {
    await this.simularDelay();
    const mensaje = this.formatearConfirmacionSolicitud(destinatario, datos);
    this.logger.log(`📧 ${mensaje}`);
    return Promise.resolve();
  }

  async enviarCambioEstado(destinatario: string, datos: EmailCambioEstadoData): Promise<void> {
    await this.simularDelay();
    const mensaje = this.formatearCambioEstado(destinatario, datos);
    this.logger.log(`📧 ${mensaje}`);
    return Promise.resolve();
  }

  async enviarNotificacionGenerica(destinatario: string, asunto: string, mensaje: string): Promise<void> {
    await this.simularDelay();
    const correoMock = `
┌─────────────────────────────────────────────────────────────┐
│ 📧 CORREO MOCK - NOTIFICACIÓN GENÉRICA                    │
├─────────────────────────────────────────────────────────────┤
│ Para: ${destinatario}                                      │
│ Asunto: ${asunto}                                          │
├─────────────────────────────────────────────────────────────┤
│ ${mensaje}                                                 │
├─────────────────────────────────────────────────────────────┤
│ 📅 ${new Date().toLocaleString()}                          │
└─────────────────────────────────────────────────────────────┘
    `;
    this.logger.log(`📧 ${correoMock}`);
    return Promise.resolve();
  }

  private async simularDelay(): Promise<void> {
    //  Reducir delay de 100-300ms a 10-50ms
    const delay = Math.floor(Math.random() * 40) + 10;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  private formatearConfirmacionSolicitud(destinatario: string, datos: EmailSolicitudData): string {
    const lineasTexto = datos.lineas
      .map(l => `  • ${l.cantidad}x ${l.tipoPrenda}`)
      .join('\n');

    return `
┌─────────────────────────────────────────────────────────────┐
│ 📧 CORREO MOCK - CONFIRMACIÓN DE SOLICITUD                │
├─────────────────────────────────────────────────────────────┤
│ Para: ${destinatario}                                      │
│ Asunto: Confirmación de solicitud LavaRápido              │
├─────────────────────────────────────────────────────────────┤
│ Hola ${datos.clienteNombre},                               │
│                                                             │
│ Tu solicitud ha sido creada exitosamente.                  │
│                                                             │
│ 📋 Detalles de la solicitud:                               │
│   Código: ${datos.codigoSeguimiento}                       │
│   Fecha: ${datos.fechaCreacion.toLocaleString()}           │
│   Estado: ${datos.estado}                                  │
│   Tratamiento: ${datos.tratamientoEspecial}                │
│                                                             │
│ 👕 Prendas:                                                │
│ ${lineasTexto}                                              │
│                                                             │
│ 📦 RECOGIDA:                                               │
│   Lugar: ${datos.lugarRecogida}                            │
│   Fecha: ${datos.fechaRecogida}                            │
│   Hora: ${datos.horaRecogida}                              │
│                                                             │
│ 📦 ENTREGA:                                                │
│   Lugar: ${datos.lugarEntrega}                             │
│   Fecha: ${datos.fechaEntrega} (24h después)              │
│                                                             │
│ 📌 Próximos pasos:                                         │
│   1. Un conductor recogerá tu ropa                         │
│   2. El lavandero procesará tu solicitud                   │
│   3. Recibirás notificaciones de cada cambio de estado    │
│                                                             │
│ 🔗 https://lavarapido.com/seguimiento/${datos.codigoSeguimiento} │
│                                                             │
│ ¡Gracias por usar LavaRápido!                              │
├─────────────────────────────────────────────────────────────┤
│ 📅 ${new Date().toLocaleString()}                          │
└─────────────────────────────────────────────────────────────┘
    `;
  }

  private formatearCambioEstado(destinatario: string, datos: EmailCambioEstadoData): string {
    const emojis: Record<string, string> = {
      SOLICITADA: '📝',
      EN_PROCESO: '🔄',
      COMPLETADA: ''
    };

    const mensajes: Record<string, string> = {
      SOLICITADA: 'Tu solicitud ha sido creada',
      EN_PROCESO: 'Tu ropa está siendo lavada',
      COMPLETADA: 'Tu ropa está lista para ser entregada'
    };

    return `
┌─────────────────────────────────────────────────────────────┐
│ 📧 CORREO MOCK - ACTUALIZACIÓN DE ESTADO                  │
├─────────────────────────────────────────────────────────────┤
│ Para: ${destinatario}                                      │
│ Asunto: ${emojis[datos.estadoNuevo] || '📬'} Actualización de tu solicitud │
├─────────────────────────────────────────────────────────────┤
│ Hola ${datos.clienteNombre},                               │
│                                                             │
│ ${emojis[datos.estadoNuevo] || '📬'} ${mensajes[datos.estadoNuevo] || 'Estado actualizado'} │
│                                                             │
│ 📋 Detalles:                                               │
│   Código: ${datos.codigoSeguimiento}                       │
│   Estado anterior: ${datos.estadoAnterior}                 │
│   Estado actual: ${datos.estadoNuevo}                    │
│   Fecha cambio: ${datos.fechaCambio.toLocaleString()}      │
│                                                             │
│ 🔗 https://lavarapido.com/seguimiento/${datos.codigoSeguimiento} │
│                                                             │
│ ¡Gracias por usar LavaRápido!                              │
├─────────────────────────────────────────────────────────────┤
│ 📅 ${new Date().toLocaleString()}                          │
└─────────────────────────────────────────────────────────────┘
    `;
  }
}