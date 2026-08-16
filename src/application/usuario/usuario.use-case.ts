import { Injectable, Inject, ConflictException, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Usuario } from '../../domain/usuario/usuario.entity';
import { IUsuarioRepository } from '../../domain/usuario/usuario.repository.interface';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { UsuarioResponseDto } from './dto/usuario-response.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { ActualizarUsuarioAdminDto } from './dto/actualizar-usuario-admin.dto'
import { CambiarContraseñaDto } from './dto/cambiar-contraseña.dto';
import { StringHelper } from '../../shared/utils/string-helper.util';
import { Rol } from '../../shared/enums/rol.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioUseCase {
  constructor(
    @Inject('IUsuarioRepository')
    public readonly usuarioRepository: IUsuarioRepository, 
  ) {}

  async crearCliente(dto: CrearUsuarioDto, fotoUrl: string): Promise<UsuarioResponseDto> {
    return this.crearUsuario(dto, fotoUrl);
  }

  async crearEmpleado(dto: CrearUsuarioDto, fotoUrl: string): Promise<UsuarioResponseDto> {
    return this.crearUsuario(dto, fotoUrl);
  }

  private async crearUsuario(dto: CrearUsuarioDto, fotoUrl: string): Promise<UsuarioResponseDto> {
    const existeId = await this.usuarioRepository.findById(dto.id)
    if (existeId) {
      throw new ConflictException('La cedula ya está registrada');
    }
    
    const existeCorreo = await this.usuarioRepository.findByCorreo(dto.correo);
    if (existeCorreo) {
      throw new ConflictException('El correo ya está registrado');
    }

    const existeUsuario = await this.usuarioRepository.findByNombreUsuario(dto.nombreUsuario);
    if (existeUsuario) {
      throw new ConflictException('El nombre de usuario ya está registrado');
    }

    const fechaNacimiento = new Date(dto.fechaNacimiento);
    const usuarioTemp = new Usuario(
      dto.id,
      dto.nombreUsuario,
      '',
      dto.nombre,
      fechaNacimiento,
      dto.correo,
      dto.fotoPerfil || null,
      dto.rol,
    );

    if (!usuarioTemp.esMayorDeEdad()) {
      throw new BadRequestException('El usuario debe ser mayor de edad');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const usuario = new Usuario(
      dto.id,
      dto.nombreUsuario,
      hashedPassword,
      StringHelper.capitalize(dto.nombre),
      fechaNacimiento,
      dto.correo,
      fotoUrl,
      dto.rol,
    );

    const guardado = await this.usuarioRepository.save(usuario);

    return {
      id: guardado.id,
      nombreUsuario: guardado.nombreUsuario,
      nombre: guardado.nombre,
      correo: guardado.correo,
      fotoPerfil: guardado.fotoPerfil,
      rol: guardado.rol,
    };
  }

  async buscarTodos(params: { skip: number; take: number; rol?: Rol }): Promise<[UsuarioResponseDto[], number]> {
    const [usuarios, total] = await this.usuarioRepository.findAll(params);

    const dtos = usuarios.map((usuario) => ({
      id: usuario.id,
      nombreUsuario: usuario.nombreUsuario,
      nombre: usuario.nombre,
      correo: usuario.correo,
      fotoPerfil: usuario.fotoPerfil,
      rol: usuario.rol,
    }));

    return [dtos, total];
  }

  async buscarPorId(id: string): Promise<UsuarioResponseDto> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return {
      id: usuario.id,
      nombreUsuario: usuario.nombreUsuario,
      nombre: usuario.nombre,
      correo: usuario.correo,
      fotoPerfil: usuario.fotoPerfil,
      rol: usuario.rol,
    };
  }

  // ✅ ACTUALIZAR PERFIL (propio)
  async actualizarPerfil(id: string, dto: ActualizarUsuarioDto): Promise<UsuarioResponseDto> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (dto.nombreUsuario && dto.nombreUsuario !== usuario.nombreUsuario) {
      const existe = await this.usuarioRepository.findByNombreUsuario(dto.nombreUsuario);
      if (existe) {
        throw new ConflictException('El nombre de usuario ya está registrado');
      }
    }

    if (dto.correo && dto.correo !== usuario.correo) {
      const existe = await this.usuarioRepository.findByCorreo(dto.correo);
      if (existe) {
        throw new ConflictException('El correo ya está registrado');
      }
    }

    const usuarioActualizado = new Usuario(
      usuario.id,
      dto.nombreUsuario || usuario.nombreUsuario,
      usuario.password,
      dto.nombre ? StringHelper.capitalize(dto.nombre) : usuario.nombre,
      usuario.fechaNacimiento,
      dto.correo || usuario.correo,
      usuario.fotoPerfil,
      usuario.rol,
    );

    await this.usuarioRepository.update(usuarioActualizado);
    return this.buscarPorId(id);
  }

  // ✅ CAMBIAR CONTRASEÑA
  async cambiarContraseña(id: string, dto: CambiarContraseñaDto): Promise<void> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const passwordValido = await bcrypt.compare(dto.contraseñaActual, usuario.password);
    if (!passwordValido) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    if (dto.nuevaContraseña !== dto.confirmarContraseña) {
      throw new BadRequestException('La nueva contraseña y la confirmación no coinciden');
    }

    const hashedPassword = await bcrypt.hash(dto.nuevaContraseña, 10);
    await this.usuarioRepository.updatePassword(id, hashedPassword);
  }

  // ✅ ACTUALIZAR FOTO DE PERFIL
  async actualizarFotoPerfil(id: string, fotoUrl: string): Promise<UsuarioResponseDto> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.usuarioRepository.updateFoto(id, fotoUrl);
    return this.buscarPorId(id);
  }

  // ✅ ACTUALIZAR USUARIO (ADMIN)
  async actualizarUsuarioAdmin(id: string, dto: ActualizarUsuarioAdminDto): Promise<UsuarioResponseDto> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const usuarioActualizado = new Usuario(
      usuario.id,
      usuario.nombreUsuario,
      usuario.password,
      dto.nombre ? StringHelper.capitalize(dto.nombre) : usuario.nombre,
      usuario.fechaNacimiento,
      dto.correo || usuario.correo,
      usuario.fotoPerfil,
      dto.rol || usuario.rol,
    );

    await this.usuarioRepository.update(usuarioActualizado);
    return this.buscarPorId(id);
  }

  async eliminarCliente(id: string): Promise<void> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException('Cliente no encontrado');
    }
    if (!usuario.esCliente()) {
      throw new NotFoundException('Cliente no encontrado');
    }
    await this.usuarioRepository.delete(id);
  }

  async eliminarEmpleado(id: string): Promise<void> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException('Empleado no encontrado');
    }
    if (!usuario.esLavandero() && !usuario.esConductor()) {
      throw new NotFoundException('Empleado no encontrado');
    }
    await this.usuarioRepository.delete(id);
  }

  async eliminarAdministrador(id: string): Promise<void> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException('Administrador no encontrado');
    }
    if (!usuario.esAdministrador()) {
      throw new NotFoundException('Administrador no encontrado');
    }
    const totalAdmins = await this.usuarioRepository.countByRol(Rol.ADMINISTRADOR);
    if (totalAdmins <= 1) {
      throw new BadRequestException('No se puede eliminar el único administrador del sistema');
    }
    await this.usuarioRepository.delete(id);
  }
}