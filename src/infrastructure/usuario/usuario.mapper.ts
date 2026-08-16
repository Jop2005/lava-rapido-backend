import { Usuario } from '../../domain/usuario/usuario.entity';
import { Usuario as PrismaUsuario } from '@prisma/client';

export class UsuarioMapper {
  static toDomain(prismaUsuario: PrismaUsuario): Usuario {
    return new Usuario(
      prismaUsuario.id,
      prismaUsuario.nombreUsuario,
      prismaUsuario.contraseña,
      prismaUsuario.nombre,
      prismaUsuario.fechaNacimiento,
      prismaUsuario.correo,
      prismaUsuario.fotoPerfil,
      prismaUsuario.rol, 
    );
  }

  static toPrisma(usuario: Usuario): any {
    return {
      id: usuario.id,
      nombreUsuario: usuario.nombreUsuario,
      contraseña: usuario.password,
      nombre: usuario.nombre,
      fechaNacimiento: usuario.fechaNacimiento,
      correo: usuario.correo,
      fotoPerfil: usuario.fotoPerfil,
      rol: usuario.rol,
    };
  }
}