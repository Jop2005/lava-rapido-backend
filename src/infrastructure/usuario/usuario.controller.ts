import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { UsuarioUseCase } from '../../application/usuario/usuario.use-case';
import { CrearUsuarioDto } from '../../application/usuario/dto/crear-usuario.dto';
import { UsuarioResponseDto } from '../../application/usuario/dto/usuario-response.dto';
import { ActualizarUsuarioDto } from '../../application/usuario/dto/actualizar-usuario.dto';
import { ActualizarUsuarioAdminDto } from '../../application/usuario/dto/actualizar-usuario-admin.dto';
import { CambiarContraseñaDto } from '../../application/usuario/dto/cambiar-contraseña.dto';
import { IdParamDto } from '../../application/usuario/dto/id-param.dto';
import { PaginacionUsuarioDto } from '../../application/usuario/dto/paginacion-usuario.dto';
import { RespuestaPaginadaDto } from '../../shared/dto/respuesta-paginada.dto';
import { UploadService } from '../../shared/services/upload.service';
import { Rol } from '../../shared/enums/rol.enum';
import { Request } from 'express';

@Controller('usuarios')
export class UsuarioController {
  constructor(
    private readonly usuarioUseCase: UsuarioUseCase,
    private readonly uploadService: UploadService,
  ) {}

  // ==================== PÚBLICO ====================

  @Public()
  @Post('cliente')
  @UseInterceptors(FileInterceptor('fotoPerfil', { storage: memoryStorage() }))
  @HttpCode(HttpStatus.CREATED)
  async crearCliente(
    @Body() dto: CrearUsuarioDto,
    @Req() req: Request,
  ): Promise<UsuarioResponseDto> {
    let fotoUrl = '/images/perfil-standar.jpeg';
    if ((req as any).file) {
      fotoUrl = await this.uploadService.guardarFoto((req as any).file, dto.id);
    }
    return await this.usuarioUseCase.crearCliente(dto, fotoUrl);
  }

  // ==================== ADMIN ====================

  @Post('empleado')
  @Roles(Rol.ADMINISTRADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('fotoPerfil', { storage: memoryStorage() }))
  @HttpCode(HttpStatus.CREATED)
  async crearEmpleado(
    @Body() dto: CrearUsuarioDto,
    @Req() req: Request,
  ): Promise<UsuarioResponseDto> {
    if (dto.rol === Rol.CLIENTE) {
      throw new ForbiddenException('El administrador no puede crear clientes');
    }
    let fotoUrl = '/images/perfil-standar.jpeg';
    if ((req as any).file) {
      fotoUrl = await this.uploadService.guardarFoto((req as any).file, dto.id);
    }
    return await this.usuarioUseCase.crearEmpleado(dto, fotoUrl);
  }

  @Get()
  @Roles(Rol.ADMINISTRADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async buscarTodos(
    @Query() paginacion: PaginacionUsuarioDto,
  ): Promise<RespuestaPaginadaDto<UsuarioResponseDto>> {
    const { pagina = 1, limite = 20, rol } = paginacion;
    const skip = (pagina - 1) * limite;

    const [usuarios, total] = await this.usuarioUseCase.buscarTodos({
      skip,
      take: limite,
      rol,
    });

    return {
      data: usuarios,
      meta: {
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      },
    };
  }

  @Get('admin/:id')
  @Roles(Rol.ADMINISTRADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async buscarPorIdAdmin(@Param() params: IdParamDto): Promise<UsuarioResponseDto> {
    return await this.usuarioUseCase.buscarPorId(params.id);
  }

  // ✅ ADMIN: Actualizar usuario
  @Put('admin/:id')
  @Roles(Rol.ADMINISTRADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async actualizarUsuarioAdmin(
    @Param() params: IdParamDto,
    @Body() dto: ActualizarUsuarioAdminDto,
    @Req() req: Request,
  ): Promise<UsuarioResponseDto> {
    const esMiPropioPerfil = params.id === req.user.id;
    const intentaCambiarRol = dto.rol !== undefined && dto.rol !== req.user.rol
    if (esMiPropioPerfil && intentaCambiarRol) {
      throw new ForbiddenException('No puedes cambiar tu propio rol');
    }
    return await this.usuarioUseCase.actualizarUsuarioAdmin(params.id, dto);
  }

  @Delete('empleado/:id')
  @Roles(Rol.ADMINISTRADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminarEmpleado(@Param() params: IdParamDto): Promise<void> {
    await this.usuarioUseCase.eliminarEmpleado(params.id);
  }

  @Delete('administrador/:id')
  @Roles(Rol.ADMINISTRADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminarAdministrador(@Param() params: IdParamDto): Promise<void> {
    await this.usuarioUseCase.eliminarAdministrador(params.id);
  }

  // ==================== USUARIO AUTENTICADO ====================

  @Get('perfil')
  @Roles(Rol.CLIENTE, Rol.CONDUCTOR, Rol.LAVANDERO, Rol.ADMINISTRADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async buscarMiPerfil(@Req() req: Request): Promise<UsuarioResponseDto> {
    return await this.usuarioUseCase.buscarPorId(req.user.id);
  }

  // ✅ Actualizar perfil propio
  @Put('perfil')
  @Roles(Rol.CLIENTE, Rol.CONDUCTOR, Rol.LAVANDERO, Rol.ADMINISTRADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async actualizarPerfil(
    @Body() dto: ActualizarUsuarioDto,
    @Req() req: Request,
  ): Promise<UsuarioResponseDto> {
    return await this.usuarioUseCase.actualizarPerfil(req.user.id, dto);
  }

  // ✅ Cambiar contraseña
  @Patch('perfil/password')
  @Roles(Rol.CLIENTE, Rol.CONDUCTOR, Rol.LAVANDERO, Rol.ADMINISTRADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async cambiarContraseña(
    @Body() dto: CambiarContraseñaDto,
    @Req() req: Request,
  ): Promise<void> {
    await this.usuarioUseCase.cambiarContraseña(req.user.id, dto);
  }

  // ✅ Actualizar foto de perfil
  @Patch('perfil/foto')
  @Roles(Rol.CLIENTE, Rol.CONDUCTOR, Rol.LAVANDERO, Rol.ADMINISTRADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('fotoPerfil', { storage: memoryStorage() }))
  async actualizarFotoPerfil(
    @Req() req: Request,
  ): Promise<UsuarioResponseDto> {
    const file = (req as any).file;
    if (!file) {
      throw new BadRequestException('No se envió ninguna foto');
    }
    const fotoUrl = await this.uploadService.guardarFoto(file, req.user.id);
    return await this.usuarioUseCase.actualizarFotoPerfil(req.user.id, fotoUrl);
  }

  // ==================== CLIENTE ====================

  @Get('cliente/:id')
  @Roles(Rol.CLIENTE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async buscarPorIdCliente(@Param() params: IdParamDto, @Req() req: Request): Promise<UsuarioResponseDto> {
    if (req.user.id !== params.id) {
      throw new ForbiddenException('No tienes permiso para ver este usuario');
    }
    return await this.usuarioUseCase.buscarPorId(params.id);
  }

  @Delete('cliente/:id')
  @Roles(Rol.CLIENTE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminarCliente(@Param() params: IdParamDto, @Req() req: Request): Promise<void> {
    if (req.user.id !== params.id) {
      throw new ForbiddenException('Solo puedes eliminar tu propia cuenta');
    }
    await this.usuarioUseCase.eliminarCliente(params.id);
  }
}