import { Rol as PrismaRol } from '@prisma/client';

// Re-exportar el enum de Prisma como Rol
export type Rol = PrismaRol;
export const Rol = PrismaRol;