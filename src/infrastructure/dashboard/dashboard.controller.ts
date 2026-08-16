import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Rol } from '../../shared/enums/rol.enum';
import { DashboardUseCase } from '../../application/dashboard/dashboard.use-case';
import { DashboardStatsDto } from '../../application/dashboard/dto/dashboard-stats.dto';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardUseCase: DashboardUseCase) {}

  @Get('stats')
  @Roles(Rol.ADMINISTRADOR)
  async obtenerEstadisticas(): Promise<DashboardStatsDto> {
    return await this.dashboardUseCase.obtenerEstadisticas();
  }
}