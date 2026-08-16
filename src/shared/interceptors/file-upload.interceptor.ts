// src/shared/interceptors/file-upload.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// @ts-ignore
const multer = require('multer');
import { Request } from 'express';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  private readonly upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      allowedTypes.includes(file.mimetype) 
        ? cb(null, true) 
        : cb(new BadRequestException('Solo JPG o PNG'), false);
    },
  }).single('fotoPerfil');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();

    return new Observable((observer) => {
      this.upload(req, null as any, (err) => {
        if (err) {
          observer.error(new BadRequestException(err.message));
          return;
        }
        next.handle().subscribe({
          next: (data) => observer.next(data),
          error: (error) => observer.error(error),
          complete: () => observer.complete(),
        });
      });
    });
  }
}