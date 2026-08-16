export class LoginResponseDto {
  access_token: string;
  usuario: {
    id: string;
    nombreUsuario: string;
    nombre: string;
    correo: string;
    fotoPerfil: string | null;
    rol: string;
  };
}