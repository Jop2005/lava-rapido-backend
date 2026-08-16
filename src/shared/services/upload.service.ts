import { Injectable, BadRequestException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadService {
  private readonly uploadPath = path.join(process.cwd(), 'images');

  constructor() {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async guardarFoto(file: any, idUsuario: string): Promise<string> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      return '/images/perfil-standar.jpeg';
    }

    const cleanId = idUsuario.replace(/[^a-zA-Z0-9]/g, '');
    const extension = path.extname(file.originalname) || '.jpg';
    const nombreArchivo = `usuario-${cleanId}-${Date.now()}${extension}`;
    const rutaCompleta = path.join(this.uploadPath, nombreArchivo);

    try {
      fs.writeFileSync(rutaCompleta, file.buffer);
    } catch (error) {
      throw new BadRequestException('Error al guardar la foto');
    }

    return `/images/${nombreArchivo}`;
  }

  async eliminarFoto(nombreArchivo: string): Promise<void> {
    if (!nombreArchivo || nombreArchivo.includes('perfil-standar')) {
      return;
    }

    const rutaCompleta = path.join(this.uploadPath, path.basename(nombreArchivo));
    if (fs.existsSync(rutaCompleta)) {
      try {
        fs.unlinkSync(rutaCompleta);
      } catch (error) {
        // Silenciar error al eliminar
      }
    }
  }
}