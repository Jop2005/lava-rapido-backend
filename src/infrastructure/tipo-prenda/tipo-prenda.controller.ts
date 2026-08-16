import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { Rol } from '../../shared/enums/rol.enum';
import { TipoPrendaUseCase } from '../../application/tipo-prenda/tipo-prenda.use-case';
import { CrearTipoPrendaDto } from '../../application/tipo-prenda/dto/crear-tipo-prenda.dto';
import { ActualizarTipoPrendaDto } from '../../application/tipo-prenda/dto/actualizar-tipo-prenda.dto';
import { TipoPrendaResponseDto } from '../../application/tipo-prenda/dto/tipo-prenda-response.dto';

@Controller('tipos-prenda')
export class TipoPrendaController {
  constructor(private readonly tipoPrendaUseCase: TipoPrendaUseCase) {}

  // ==================== PÚBLICO ====================
  // Cualquier usuario puede ver los tipos de prenda
  @Get()
  @Public()
  async listarTipos(): Promise<TipoPrendaResponseDto[]> {
    return await this.tipoPrendaUseCase.listarTipos();
  }

  // ==================== ADMINISTRADOR ====================
  
  @Post()
  @Roles(Rol.ADMINISTRADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  async crearTipo(
    @Body() dto: CrearTipoPrendaDto,
  ): Promise<TipoPrendaResponseDto> {
    return await this.tipoPrendaUseCase.crearTipo(dto);
  }

  @Put(':tipo')
  @Roles(Rol.ADMINISTRADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async actualizarTipo(
    @Param('tipo') tipo: string,
    @Body() dto: ActualizarTipoPrendaDto,
  ): Promise<TipoPrendaResponseDto> {
    return await this.tipoPrendaUseCase.actualizarTipo(tipo, dto);
  }

  @Delete(':tipo')
  @Roles(Rol.ADMINISTRADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminarTipo(
    @Param('tipo') tipo: string,
  ): Promise<void> {
    await this.tipoPrendaUseCase.eliminarTipo(tipo);
  }
}