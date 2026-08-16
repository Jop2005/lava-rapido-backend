import { 
  Injectable, 
  Inject, 
  ConflictException, 
  BadRequestException, 
  NotFoundException 
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Solicitud, LineaSolicitud } from '../../domain/solicitud/solicitud.entity';
import { ISolicitudRepository } from '../../domain/solicitud/solicitud.repository.interface';
import { IUsuarioRepository } from '../../domain/usuario/usuario.repository.interface';
import { IRecogidaRepository } from '../../domain/recogida/recogida.repository.interface';
import { IEntregaRepository } from '../../domain/entrega/entrega.repository.interface';
import { IEmailService, EmailSolicitudData, EmailCambioEstadoData } from '../../domain/notificacion/email.service.interface';
import { CrearSolicitudDto } from './dto/crear-solicitud.dto';
import { SolicitudResponseDto } from './dto/solicitud-response.dto';
import { EstadoSolicitud } from '../../shared/enums/estado-solicitud.enum';
import { EstadoRecogida } from '../../shared/enums/recogida-estado.enum';
import { EstadoEntrega } from '../../shared/enums/entrega-estado.enum';
import { Recogida } from '../../domain/recogida/recogida.entity';
import { Entrega } from '../../domain/entrega/entrega.entity';
import { StringHelper } from '../../shared/utils/string-helper.util';
import { IHistorialRepository } from '../../domain/historial/historial.repository.interface';

@Injectable()
export class SolicitudUseCase {
  constructor(
    @Inject('ISolicitudRepository')
    public readonly solicitudRepository: ISolicitudRepository,
    @Inject('IUsuarioRepository')
    public readonly usuarioRepository: IUsuarioRepository,
    @Inject('IRecogidaRepository')
    private readonly recogidaRepository: IRecogidaRepository,
    @Inject('IEntregaRepository')
    private readonly entregaRepository: IEntregaRepository,
    @Inject('IEmailService')
    private readonly emailService: IEmailService,
    private readonly prisma: PrismaService,
    @Inject('IHistorialRepository')
    private readonly historialRepo: IHistorialRepository,
  ) {}

  async crearSolicitud(clienteId: string, dto: CrearSolicitudDto): Promise<SolicitudResponseDto> {
    const cliente = await this.usuarioRepository.findById(clienteId);
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    const solicitudActiva = await this.solicitudRepository.findActivaByCliente(clienteId);
    if (solicitudActiva) {
      throw new ConflictException('Ya tienes una solicitud activa');
    }

    const tiposSolicitados = dto.lineas.map(linea => linea.tipoPrenda);
    const tiposExistentes = await this.prisma.tipoDePrenda.findMany({
      where: { tipo: { in: tiposSolicitados } }
    });

    const tiposExistentesSet = new Set(tiposExistentes.map(t => t.tipo));
    const tiposFaltantes = tiposSolicitados.filter(tipo => !tiposExistentesSet.has(tipo));
    
    if (tiposFaltantes.length > 0) {
      throw new BadRequestException(
        `Los siguientes tipos de prenda no existen en el catálogo: ${tiposFaltantes.join(', ')}`
      );
    }

    const ultimaSolicitud = await this.prisma.solicitud.findFirst({
      orderBy: { fechaCreacion: 'desc' },
      select: { codigoSeguimiento: true },
    });

    let numeroSecuencial = 1;
    if (ultimaSolicitud) {
      const partes = ultimaSolicitud.codigoSeguimiento.split('-');
      const ultimoNumero = parseInt(partes[partes.length - 1]);
      if (!isNaN(ultimoNumero)) {
        numeroSecuencial = ultimoNumero + 1;
      }
    }

    const codigoSeguimiento = StringHelper.generateCode('LAV', numeroSecuencial);

    const lineas: LineaSolicitud[] = dto.lineas.map((linea) => ({
      tipoPrenda: linea.tipoPrenda,
      cantidad: linea.cantidad,
    }));

    const solicitud = new Solicitud(
      codigoSeguimiento,
      new Date(),
      EstadoSolicitud.SOLICITADA,
      dto.tratamientoEspecial,
      clienteId,
      lineas,
    );

    const guardada = await this.solicitudRepository.save(solicitud);

    await this.historialRepo.registrarCambio(
      guardada.codigoSeguimiento,
      EstadoSolicitud.SOLICITADA,
      clienteId, 
      );

    const fechaRecogida = new Date(dto.fechaRecogida);
    const recogida = new Recogida(
      0,
      dto.lugarRecogida,
      fechaRecogida,
      dto.horaRecogida,
      EstadoRecogida.PENDIENTE,
      guardada.codigoSeguimiento,
      null,
    );
    await this.recogidaRepository.save(recogida);

    const fechaEntrega = new Date(fechaRecogida);
    fechaEntrega.setDate(fechaEntrega.getDate() + 1);
    
    const lugarEntrega = dto.lugarEntrega || dto.lugarRecogida;
    const entrega = new Entrega(
    0,
    lugarEntrega,
    fechaEntrega,
    EstadoEntrega.PENDIENTE,
    guardada.codigoSeguimiento,
    null,
    );
    await this.entregaRepository.save(entrega);

    const emailData: EmailSolicitudData = {
      codigoSeguimiento: guardada.codigoSeguimiento,
      clienteNombre: cliente.nombre,
      fechaCreacion: guardada.fechaCreacion,
      estado: guardada.estadoActual,
      lineas: guardada.lineas,
      tratamientoEspecial: guardada.tratamientoEspecial,
      lugarRecogida: dto.lugarRecogida,
      fechaRecogida: dto.fechaRecogida,
      horaRecogida: dto.horaRecogida,
      lugarEntrega: lugarEntrega,
      fechaEntrega: fechaEntrega.toISOString().split('T')[0],
    };
    await this.emailService.enviarConfirmacionSolicitud(cliente.correo, emailData);

    return this.toResponseDto(guardada);
  }

  async buscarPorCliente(clienteId: string): Promise<SolicitudResponseDto[]> {
    const cliente = await this.usuarioRepository.findById(clienteId);
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    const solicitudes = await this.solicitudRepository.findByCliente(clienteId);
    return solicitudes.map((s) => this.toResponseDto(s));
  }

  async buscarTodos(params: { 
    skip: number; 
    take: number; 
    estado?: EstadoSolicitud 
  }): Promise<[SolicitudResponseDto[], number]> {
    const [solicitudes, total] = await this.solicitudRepository.findAll(params);
    const dtos = solicitudes.map((s) => this.toResponseDto(s));
    return [dtos, total];
  }

  async cambiarAEnProceso(id: string, responsableId: string): Promise<SolicitudResponseDto> {
    const solicitud = await this.solicitudRepository.findById(id);
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (solicitud.estadoActual !== EstadoSolicitud.SOLICITADA) {
      throw new BadRequestException(
        `La solicitud debe estar en "Solicitada". Estado actual: ${solicitud.estadoActual}`
      );
    }

    const estadoAnterior = solicitud.estadoActual;

    // El repositorio maneja la transacción (update + historial)
    const actualizada = await this.solicitudRepository.updateEstadoConHistorial(
      id,
      EstadoSolicitud.EN_PROCESO,
      responsableId,
    );

    // Enviar correo en segundo plano
    const cliente = await this.usuarioRepository.findById(solicitud.idCliente);
    if (cliente) {
      const emailData: EmailCambioEstadoData = {
        codigoSeguimiento: actualizada.codigoSeguimiento,
        clienteNombre: cliente.nombre,
        estadoAnterior: estadoAnterior,
        estadoNuevo: actualizada.estadoActual,
        fechaCambio: new Date(),
      };
      this.emailService.enviarCambioEstado(cliente.correo, emailData);
    }

    return this.toResponseDto(actualizada);
  }

  async cambiarACompletada(id: string, responsableId: string): Promise<SolicitudResponseDto> {
    const solicitud = await this.solicitudRepository.findById(id);
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (solicitud.estadoActual !== EstadoSolicitud.EN_PROCESO) {
      throw new BadRequestException(
        `La solicitud debe estar en "En proceso". Estado actual: ${solicitud.estadoActual}`
      );
    }

    const estadoAnterior = solicitud.estadoActual;

    // El repositorio maneja la transacción (update + historial)
    const actualizada = await this.solicitudRepository.updateEstadoConHistorial(
      id,
      EstadoSolicitud.COMPLETADA,
      responsableId,
    );

    // Enviar correo en segundo plano
    const cliente = await this.usuarioRepository.findById(solicitud.idCliente);
    if (cliente) {
      const emailData: EmailCambioEstadoData = {
        codigoSeguimiento: actualizada.codigoSeguimiento,
        clienteNombre: cliente.nombre,
        estadoAnterior: estadoAnterior,
        estadoNuevo: actualizada.estadoActual,
        fechaCambio: new Date(),
      };
      this.emailService.enviarCambioEstado(cliente.correo, emailData);
    }

    return this.toResponseDto(actualizada);
  }

  async cambiarEstadoAdmin(
    id: string,
    estado: EstadoSolicitud,
    responsableId: string,
  ): Promise<SolicitudResponseDto> {
    const solicitud = await this.solicitudRepository.findById(id);
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    const estadoAnterior = solicitud.estadoActual;

    // El repositorio maneja la transacción (update + historial)
    const actualizada = await this.solicitudRepository.updateEstadoConHistorial(
      id,
      estado,
      responsableId,
    );

    // Enviar correo en segundo plano
    const cliente = await this.usuarioRepository.findById(solicitud.idCliente);
    if (cliente) {
      const emailData: EmailCambioEstadoData = {
        codigoSeguimiento: actualizada.codigoSeguimiento,
        clienteNombre: cliente.nombre,
        estadoAnterior: estadoAnterior,
        estadoNuevo: actualizada.estadoActual,
        fechaCambio: new Date(),
      };
      this.emailService.enviarCambioEstado(cliente.correo, emailData);
    }

    return this.toResponseDto(actualizada);
  }

  async eliminarSolicitud(id: string): Promise<void> {
    const solicitud = await this.solicitudRepository.findById(id);
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    
    if (solicitud.estadoActual === EstadoSolicitud.EN_PROCESO) {
      throw new BadRequestException('No se puede eliminar una solicitud en proceso');
    }
    
    if (solicitud.estadoActual === EstadoSolicitud.COMPLETADA) {
      throw new BadRequestException('No se puede eliminar una solicitud completada');
    }
    
    await this.solicitudRepository.delete(id);
  }

  async obtenerSolicitudActiva(clienteId: string): Promise<SolicitudResponseDto | null> {
    const solicitud = await this.solicitudRepository.findActivaByCliente(clienteId);
    return solicitud ? this.toResponseDto(solicitud) : null;
  }

  toResponseDto(solicitud: Solicitud): SolicitudResponseDto {
    return {
      codigoSeguimiento: solicitud.codigoSeguimiento,
      fechaCreacion: solicitud.fechaCreacion,
      estadoActual: solicitud.estadoActual,
      tratamientoEspecial: solicitud.tratamientoEspecial,
      idCliente: solicitud.idCliente,
      lineas: solicitud.lineas.map((linea) => ({
        tipoPrenda: linea.tipoPrenda,
        cantidad: linea.cantidad,
      })),
    };
  }
}