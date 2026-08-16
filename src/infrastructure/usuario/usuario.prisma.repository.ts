import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IUsuarioRepository } from '../../domain/usuario/usuario.repository.interface';
import { Usuario } from '../../domain/usuario/usuario.entity';
import { UsuarioMapper } from './usuario.mapper';
import { Rol } from '../../shared/enums/rol.enum';

@Injectable()
export class UsuarioPrismaRepository implements IUsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(usuario: Usuario): Promise<Usuario> {
    const data = UsuarioMapper.toPrisma(usuario);
    const prismaUsuario = await this.prisma.usuario.create({ data });
    return UsuarioMapper.toDomain(prismaUsuario);
  }

  async update(usuario: Usuario): Promise<Usuario> {
    const data = UsuarioMapper.toPrisma(usuario);
    const prismaUsuario = await this.prisma.usuario.update({
      where: { id: usuario.id },
      data,
    });
    return UsuarioMapper.toDomain(prismaUsuario);
  }

  async updatePassword(id: string, password: string): Promise<void> {
    await this.prisma.usuario.update({
      where: { id },
      data: { contraseña: password },
    });
  }

  async updateFoto(id: string, fotoUrl: string): Promise<void> {
    await this.prisma.usuario.update({
      where: { id },
      data: { fotoPerfil: fotoUrl },
    });
  }

  async findById(id: string): Promise<Usuario | null> {
    const prismaUsuario = await this.prisma.usuario.findUnique({
      where: { id },
    });
    return prismaUsuario ? UsuarioMapper.toDomain(prismaUsuario) : null;
  }

  async findByCorreo(correo: string): Promise<Usuario | null> {
    const prismaUsuario = await this.prisma.usuario.findUnique({
      where: { correo },
    });
    return prismaUsuario ? UsuarioMapper.toDomain(prismaUsuario) : null;
  }

  async findByNombreUsuario(nombreUsuario: string): Promise<Usuario | null> {
    const prismaUsuario = await this.prisma.usuario.findUnique({
      where: { nombreUsuario },
    });
    return prismaUsuario ? UsuarioMapper.toDomain(prismaUsuario) : null;
  }

  async findAll(params: { skip: number; take: number; rol?: Rol }): Promise<[Usuario[], number]> {
    const where: any = {};
    if (params.rol) {
      where.rol = params.rol; 
    }

    const [usuarios, total] = await this.prisma.$transaction([
      this.prisma.usuario.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { fechaNacimiento: 'desc' },
      }),
      this.prisma.usuario.count({ where }),
    ]);

    return [usuarios.map((p) => UsuarioMapper.toDomain(p)), total];
  }

  async countByRol(rol: Rol): Promise<number> {
    return await this.prisma.usuario.count({
      where: { rol },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.usuario.delete({ where: { id } });
  }
}