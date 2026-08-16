import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Rol } from '../../shared/enums/rol.enum';
import { HistorialUseCase } from '../../application/historial/historial.use-case';
import { HistorialResponseDto } from '../../application/historial/dto/historial-response.dto';
import { PaginacionDto } from '../../shared/dto/paginacion.dto';
import { RespuestaPaginadaDto } from '../../shared/dto/respuesta-paginada.dto';
import { Request } from 'express';

@Controller('historial')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HistorialController {
  constructor(private readonly historialUseCase: HistorialUseCase) {}

  // ==================== ADMIN ====================

  @Get()
  @Roles(Rol.ADMINISTRADOR)
  async obtenerTodos(
    @Query() paginacion: PaginacionDto,
  ): Promise<RespuestaPaginadaDto<HistorialResponseDto>> {
    const { pagina = 1, limite = 20 } = paginacion;
    const skip = (pagina - 1) * limite;

    const [historial, total] = await this.historialUseCase.obtenerTodos({
      skip,
      take: limite,
    });

    return {
      data: historial,
      meta: {
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      },
    };
  }

  @Get('solicitud/:idSolicitud')
  @Roles(Rol.ADMINISTRADOR)
  async obtenerHistorialSolicitud(
    @Param('idSolicitud') idSolicitud: string,
  ): Promise<HistorialResponseDto[]> {
    return await this.historialUseCase.obtenerHistorialSolicitud(idSolicitud);
  }

  @Get('responsable/:responsableId')
  @Roles(Rol.ADMINISTRADOR)
  async obtenerHistorialResponsable(
    @Param('responsableId') responsableId: string,
  ): Promise<HistorialResponseDto[]> {
    return await this.historialUseCase.obtenerHistorialResponsable(responsableId);
  }

  // ==================== CLIENTE ====================

  // ✅ Ruta más específica PRIMERO
  @Get('cliente/mi-historial')
  @Roles(Rol.CLIENTE)
  async obtenerMiHistorial(@Req() req: Request): Promise<HistorialResponseDto[]> {
    return await this.historialUseCase.obtenerHistorialCliente(req.user.id);
  }

  // ✅ Ruta con parámetro DESPUÉS
  @Get('cliente/:clienteId')
  @Roles(Rol.ADMINISTRADOR)
  async obtenerHistorialCliente(
    @Param('clienteId') clienteId: string,
  ): Promise<HistorialResponseDto[]> {
    return await this.historialUseCase.obtenerHistorialCliente(clienteId);
  }
}