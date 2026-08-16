import { Rol } from '../../../shared/enums/rol.enum';

export class UsuarioResponseDto {
  id: string;
  nombreUsuario: string;
  nombre: string;
  correo: string;
  fotoPerfil: 
  string | null;
  rol: Rol;
}