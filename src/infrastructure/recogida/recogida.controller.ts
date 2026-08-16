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
  Inject
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Rol } from '../../shared/enums/rol.enum';
import { RecogidaUseCase } from '../../application/recogida/recogida.use-case';
import { IRecogidaRepository } from '../../domain/recogida/recogida.repository.interface';
import { AsignarConductorDto } from '../../application/recogida/dto/asignar-conductor.dto';
import { RecogidaResponseDto } from '../../application/recogida/dto/recogida-response.dto';
import { IUsuarioRepository } from "../../domain/usuario/usuario.repository.interface";
import { Request } from 'express';

@Controller('recogidas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecogidaController {
  constructor(
    private readonly recogidaUseCase: RecogidaUseCase,
    @Inject('IRecogidaRepository')
    private readonly recogidaRepo: IRecogidaRepository,
    @Inject('IUsuarioRepository')
    private readonly usuarioRepo: IUsuarioRepository,
  ) {}

  // ==================== ADMIN ====================

  @Get()
  @Roles(Rol.ADMINISTRADOR)
  async listarTodas(): Promise<RecogidaResponseDto[]> {
    return await this.recogidaUseCase.listarTodas();
  }

  @Get(':id')
  @Roles(Rol.ADMINISTRADOR)
  async buscarPorId(@Param('id') id: string): Promise<RecogidaResponseDto> {
    const recogida = await this.recogidaRepo.findById(parseInt(id));
    if (!recogida) {
      throw new NotFoundException(`Recogida ${id} no encontrada`);
    }
    return recogida;
  }

  @Get('solicitud/:idSolicitud')
  @Roles(Rol.ADMINISTRADOR)
  async buscarPorSolicitud(@Param('idSolicitud') idSolicitud: string): Promise<RecogidaResponseDto> {
    return await this.recogidaUseCase.buscarPorSolicitud(idSolicitud);
  }

  @Put(':id/asignar')
  @Roles(Rol.ADMINISTRADOR)
  async asignarConductor(
    @Param('id') id: string,
    @Body() dto: AsignarConductorDto,
  ): Promise<RecogidaResponseDto> {
    const idConductor = dto.idConductor;
    const conductor = await this.usuarioRepo.findById(idConductor);
    if (!conductor) {
      throw new NotFoundException(`Conductor ${idConductor} no encontrada`);
    }
    return await this.recogidaUseCase.asignarConductor(parseInt(id), idConductor);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(@Param('id') id: string): Promise<void> {
    await this.recogidaUseCase.eliminar(parseInt(id));
  }

  // ==================== CONDUCTOR ====================

  @Get('conductor/disponibles')
  @Roles(Rol.CONDUCTOR)
  async listarDisponibles(): Promise<RecogidaResponseDto[]> {
    return await this.recogidaUseCase.listarDisponibles();
  }

  @Get('conductor/mis-recogidas')
  @Roles(Rol.CONDUCTOR)
  async listarMisRecogidas(@Req() req: Request): Promise<RecogidaResponseDto[]> {
    return await this.recogidaUseCase.listarPorConductor(req.user.id);
  }

  @Get('conductor/:id')
  @Roles(Rol.CONDUCTOR)
  async verRecogida(@Param('id') id: string, @Req() req: Request): Promise<RecogidaResponseDto> {
    const recogida = await this.recogidaRepo.findById(parseInt(id));
    if (!recogida) {
      throw new NotFoundException(`Recogida ${id} no encontrada`);
    }

    if (!recogida.esDeConductor(req.user.id)) {
      throw new ForbiddenException('No tienes permiso para ver esta recogida');
    }

    return recogida;
  }

  @Get('conductor/solicitud/:idSolicitud')
  @Roles(Rol.CONDUCTOR)
  async verRecogidaPorSolicitud(@Param('idSolicitud') idSolicitud: string, @Req() req: Request): Promise<RecogidaResponseDto> {
    const recogida = await this.recogidaUseCase.buscarPorSolicitud(idSolicitud);

    if (!recogida.esDeConductor(req.user.id)) {
      throw new ForbiddenException('No tienes permiso para ver esta recogida');
    }

    return recogida;
  }

  @Put('conductor/:id/realizar')
  @Roles(Rol.CONDUCTOR)
  async realizar(@Param('id') id: string, @Req() req: Request): Promise<RecogidaResponseDto> {
    const recogida = await this.recogidaRepo.findById(parseInt(id));
    if (!recogida) {
      throw new NotFoundException(`Recogida ${id} no encontrada`);
    }

    if (!recogida.esDeConductor(req.user.id)) {
      throw new ForbiddenException('No tienes permiso para realizar esta recogida');
    }

    return await this.recogidaUseCase.realizarRecogida(parseInt(id), req.user.id);
  }
}