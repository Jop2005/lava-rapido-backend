import { Rol } from '../shared/enums/rol.enum';

declare global {
  namespace Express {
    interface User {
      id: string;
      nombreUsuario: string;
      rol: Rol;
    }

    interface Request {
      user: User;
    }
  }
}