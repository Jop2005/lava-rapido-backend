import { Rol } from '../../shared/enums/rol.enum';
import { esMayorDeEdad } from '../../shared/utils/edad.util';

export class Usuario {
  constructor(
    public readonly id: string,
    public readonly nombreUsuario: string,
    public readonly password: string,
    public readonly nombre: string,
    public readonly fechaNacimiento: Date,
    public readonly correo: string,
    public readonly fotoPerfil: string | null,
    public readonly rol: Rol,
  ) {}

  esMayorDeEdad(): boolean {
    return esMayorDeEdad(this.fechaNacimiento);
  }

  esAdministrador(): boolean {
    return this.rol === Rol.ADMINISTRADOR;
  }

  esCliente(): boolean {
    return this.rol === Rol.CLIENTE;
  }

  esLavandero(): boolean {
    return this.rol === Rol.LAVANDERO;
  }

  esConductor(): boolean {
    return this.rol === Rol.CONDUCTOR;
  }

  esEmpleado(): boolean {
    return this.rol === Rol.ADMINISTRADOR || 
           this.rol === Rol.LAVANDERO || 
           this.rol === Rol.CONDUCTOR;
  }
}