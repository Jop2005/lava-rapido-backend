import { Usuario } from './usuario.entity';
import { Rol } from '../../shared/enums/rol.enum';

export interface IUsuarioRepository {
  save(usuario: Usuario): Promise<Usuario>;
  update(usuario: Usuario): Promise<Usuario>;
  updatePassword(id: string, password: string): Promise<void>;
  updateFoto(id: string, fotoUrl: string): Promise<void>;
  findById(id: string): Promise<Usuario | null>;
  findByCorreo(correo: string): Promise<Usuario | null>;
  findByNombreUsuario(nombreUsuario: string): Promise<Usuario | null>;
  findAll(params: { skip: number; take: number; rol?: Rol }): Promise<[Usuario[], number]>;
  countByRol(rol: Rol): Promise<number>;
  delete(id: string): Promise<void>;
}