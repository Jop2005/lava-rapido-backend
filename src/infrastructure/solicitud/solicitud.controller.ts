import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { SolicitudUseCase } from '../../application/solicitud/solicitud.use-case';
import { CrearSolicitudDto } from '../../application/solicitud/dto/crear-solicitud.dto';
import { SolicitudResponseDto } from '../../application/solicitud/dto/solicitud-response.dto';
import { PaginacionDto } from '../../shared/dto/paginacion.dto';
import { RespuestaPaginadaDto } from '../../shared/dto/respuesta-paginada.dto';
import { EstadoSolicitud } from '../../shared/enums/estado-solicitud.enum';
import { Rol } from '../../shared/enums/rol.enum';
import { Request } from 'express';

@Controller('solicitudes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SolicitudController {
  constructor(private readonly solicitudUseCase: SolicitudUseCase) {}

  // ==================== CLIENTE ====================

  @Get('cliente/activa')
  @Roles(Rol.CLIENTE)
  async obtenerMiSolicitudActiva(
    @Req() req: Request,
  ): Promise<SolicitudResponseDto | null> {

    const result = await this.solicitudUseCase.obtenerSolicitudActiva(req.user.id);
    
    return result;
  }

  @Get('cliente/:id')
  @Roles(Rol.CLIENTE)
  async buscarPorIdCliente(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<SolicitudResponseDto> {
    
    const solicitud = await this.solicitudUseCase.solicitudRepository.findById(id);
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (solicitud.idCliente !== req.user.id) {
      throw new ForbiddenException('No tienes permiso para ver esta solicitud');
    }

    return this.solicitudUseCase.toResponseDto(solicitud);
  }

  @Get('cliente')
  @Roles(Rol.CLIENTE)
  async buscarMisSolicitudes(
    @Req() req: Request,
  ): Promise<SolicitudResponseDto[]> {
    
    return await this.solicitudUseCase.buscarPorCliente(req.user.id);
  }

  @Post()
  @Roles(Rol.CLIENTE)
  @HttpCode(HttpStatus.CREATED)
  async crearSolicitud(
    @Body() dto: CrearSolicitudDto,
    @Req() req: Request,
  ): Promise<SolicitudResponseDto> {
    
    return await this.solicitudUseCase.crearSolicitud(req.user.id, dto);
  }

  @Delete('cliente/:id')
  @Roles(Rol.CLIENTE)
  async eliminarSolicitudCliente(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<void> {
    
    const solicitud = await this.solicitudUseCase.solicitudRepository.findById(id);
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (solicitud.idCliente !== req.user.id) {
      throw new ForbiddenException('No tienes permiso para eliminar esta solicitud');
    }
    if (solicitud.estadoActual !== EstadoSolicitud.SOLICITADA) {
      throw new ForbiddenException('Solo puedes eliminar solicitudes en estado "Solicitada"');
    }

    await this.solicitudUseCase.eliminarSolicitud(id);
  }

  // ==================== ADMINISTRADOR ====================

  @Get(':id')
  @Roles(Rol.ADMINISTRADOR)
  async buscarPorIdAdmin(
    @Param('id') id: string,
  ): Promise<SolicitudResponseDto> {
    
    const solicitud = await this.solicitudUseCase.solicitudRepository.findById(id);
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    return this.solicitudUseCase.toResponseDto(solicitud);
  }

  @Get()
  @Roles(Rol.ADMINISTRADOR)
  async buscarTodos(
    @Query() paginacion: PaginacionDto,
    @Query('estado') estado?: EstadoSolicitud,
  ): Promise<RespuestaPaginadaDto<SolicitudResponseDto>> {
    
    const { pagina = 1, limite = 20 } = paginacion;
    const skip = (pagina - 1) * limite;

    const [solicitudes, total] = await this.solicitudUseCase.buscarTodos({
      skip,
      take: limite,
      estado,
    });

    return {
      data: solicitudes,
      meta: {
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      },
    };
  }

  @Get('admin/cliente/:clienteId')
  @Roles(Rol.ADMINISTRADOR)
  async buscarPorClienteAdmin(
    @Param('clienteId') clienteId: string,
  ): Promise<SolicitudResponseDto[]> {
    return await this.solicitudUseCase.buscarPorCliente(clienteId);
  }

  @Get('admin/cliente/:clienteId/activa')
  @Roles(Rol.ADMINISTRADOR)
  async obtenerSolicitudActivaAdmin(
    @Param('clienteId') clienteId: string,
  ): Promise<SolicitudResponseDto | null> {
    return await this.solicitudUseCase.obtenerSolicitudActiva(clienteId);
  }

  @Delete('admin/:id')
  @Roles(Rol.ADMINISTRADOR)
  async eliminarSolicitudAdmin(
    @Param('id') id: string,
  ): Promise<void> {
    await this.solicitudUseCase.eliminarSolicitud(id);
  }

  // ==================== LAVANDERO ====================

  @Put(':id/en-proceso')
  @Roles(Rol.LAVANDERO, Rol.ADMINISTRADOR)
  async cambiarAEnProceso(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<SolicitudResponseDto> {
    return await this.solicitudUseCase.cambiarAEnProceso(id, req.user.id);
  }

  // ==================== CONDUCTOR ====================

  @Put(':id/completada')
  @Roles(Rol.CONDUCTOR, Rol.ADMINISTRADOR)
  async cambiarACompletada(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<SolicitudResponseDto> {
    return await this.solicitudUseCase.cambiarACompletada(id, req.user.id);
  }

  // ==================== ADMIN (estado) ====================

  @Put(':id/estado')
  @Roles(Rol.ADMINISTRADOR)
  async cambiarEstadoAdmin(
    @Param('id') id: string,
    @Body('estado') estado: EstadoSolicitud,
    @Req() req: Request,
  ): Promise<SolicitudResponseDto> {
    return await this.solicitudUseCase.cambiarEstadoAdmin(id, estado, req.user.id);
  }
}