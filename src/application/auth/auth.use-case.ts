import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IUsuarioRepository } from '../../domain/usuario/usuario.repository.interface';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthUseCase {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(nombreUsuario: string, password: string): Promise<any> {
    const usuario = await this.usuarioRepository.findByNombreUsuario(nombreUsuario);
    if (!usuario) {
      return null;
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return null;
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

  async login(dto: LoginDto): Promise<{ access_token: string; usuario: any }> {
    const user = await this.validateUser(dto.nombreUsuario, dto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: user.id,
      nombreUsuario: user.nombreUsuario,
      rol: user.rol,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: user,
    };
  }
}