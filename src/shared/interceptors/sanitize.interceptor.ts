import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // ✅ SOLO sanitizar el body (es mutable)
    if (request.body && typeof request.body === 'object') {
      request.body = this.sanitizeObject(request.body);
    }

    // ✅ NO tocar query (readonly)
    // ✅ NO tocar params (readonly)

    return next.handle();
  }

  private sanitizeObject(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    // Array
    if (Array.isArray(obj)) {
      return obj.map((item) =>
        typeof item === 'string' ? this.sanitizeString(item) : this.sanitizeObject(item)
      );
    }

    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map((item) =>
          typeof item === 'string' ? this.sanitizeString(item) : this.sanitizeObject(item)
        );
      } else if (value && typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private sanitizeString(value: string): string {
    // ✅ Eliminar scripts
    let sanitized = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // ✅ Eliminar atributos on* (onclick, onload, etc.)
    sanitized = sanitized.replace(/\s*on\w+="[^"]*"/gi, '');
    sanitized = sanitized.replace(/\s*on\w+='[^']*'/gi, '');
    
    // ✅ Eliminar tags HTML peligrosos
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    
    // ✅ Eliminar caracteres de control
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // ✅ Eliminar espacios extras
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
    
    return sanitized;
  }
}