import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  ForbiddenException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Rol } from '../../shared/enums/rol.enum';
import { EntregaUseCase } from '../../application/entrega/entrega.use-case';
import { IEntregaRepository } from '../../domain/entrega/entrega.repository.interface';
import { IUsuarioRepository } from '../../domain/usuario/usuario.repository.interface';
import { AsignarConductorDto } from '../../application/entrega/dto/asignar-conductor.dto';
import { EntregaResponseDto } from '../../application/entrega/dto/entrega-response.dto';
import { Request } from 'express';

@Controller('entregas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EntregaController {
  constructor(
    private readonly entregaUseCase: EntregaUseCase,
    @Inject('IEntregaRepository')
    private readonly entregaRepo: IEntregaRepository,
    @Inject('IUsuarioRepository')
    private readonly usuarioRepo: IUsuarioRepository,
  ) {}

  // ==================== ADMIN ====================

  @Get()
  @Roles(Rol.ADMINISTRADOR)
  async listarTodas(): Promise<EntregaResponseDto[]> {
    return await this.entregaUseCase.listarTodas();
  }

  @Get(':id')
  @Roles(Rol.ADMINISTRADOR)
  async buscarPorId(@Param('id') id: string): Promise<EntregaResponseDto> {
    const entrega = await this.entregaRepo.findById(parseInt(id));
    if (!entrega) {
      throw new NotFoundException(`Entrega ${id} no encontrada`);
    }
    return entrega;
  }

  @Get('solicitud/:idSolicitud')
  @Roles(Rol.ADMINISTRADOR)
  async buscarPorSolicitud(@Param('idSolicitud') idSolicitud: string): Promise<EntregaResponseDto> {
    return await this.entregaUseCase.buscarPorSolicitud(idSolicitud);
  }

  @Put(':id/asignar')
  @Roles(Rol.ADMINISTRADOR)
  async asignarConductor(
    @Param('id') id: string,
    @Body() dto: AsignarConductorDto,
  ): Promise<EntregaResponseDto> {
    const idConductor = dto.idConductor;
    const conductor = await this.usuarioRepo.findById(idConductor);
    if (!conductor) {
      throw new NotFoundException(`Conductor ${idConductor} no encontrado`);
    }
    return await this.entregaUseCase.asignarConductor(parseInt(id), idConductor);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(@Param('id') id: string): Promise<void> {
    await this.entregaUseCase.eliminar(parseInt(id));
  }

  // ==================== CONDUCTOR ====================

  @Get('conductor/disponibles')
  @Roles(Rol.CONDUCTOR)
  async listarDisponibles(): Promise<EntregaResponseDto[]> {
    return await this.entregaUseCase.listarDisponibles();
  }

  @Get('conductor/mis-entregas')
  @Roles(Rol.CONDUCTOR)
  async listarMisEntregas(@Req() req: Request): Promise<EntregaResponseDto[]> {
    return await this.entregaUseCase.listarPorConductor(req.user.id);
  }

  @Get('conductor/:id')
  @Roles(Rol.CONDUCTOR)
  async verEntrega(@Param('id') id: string, @Req() req: Request): Promise<EntregaResponseDto> {
    const entrega = await this.entregaRepo.findById(parseInt(id));
    if (!entrega) {
      throw new NotFoundException(`Entrega ${id} no encontrada`);
    }

    if (!entrega.esDeConductor(req.user.id)) {
      throw new ForbiddenException('No tienes permiso para ver esta entrega');
    }

    return entrega;
  }

  @Get('conductor/solicitud/:idSolicitud')
  @Roles(Rol.CONDUCTOR)
  async verEntregaPorSolicitud(@Param('idSolicitud') idSolicitud: string, @Req() req: Request): Promise<EntregaResponseDto> {
    const entrega = await this.entregaUseCase.buscarPorSolicitud(idSolicitud);

    if (!entrega.esDeConductor(req.user.id)) {
      throw new ForbiddenException('No tienes permiso para ver esta entrega');
    }

    return entrega;
  }

  @Put('conductor/:id/realizar')
  @Roles(Rol.CONDUCTOR)
  async realizar(@Param('id') id: string, @Req() req: Request): Promise<EntregaResponseDto> {
    const entrega = await this.entregaRepo.findById(parseInt(id));
    if (!entrega) {
      throw new NotFoundException(`Entrega ${id} no encontrada`);
    }

    if (!entrega.esDeConductor(req.user.id)) {
      throw new ForbiddenException('No tienes permiso para realizar esta entrega');
    }

    return await this.entregaUseCase.realizarEntrega(parseInt(id), req.user.id);
  }
}