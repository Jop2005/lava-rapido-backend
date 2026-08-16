import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UploadService } from './shared/services/upload.service';
import { UsuarioController } from './infrastructure/usuario/usuario.controller';
import { AuthController } from './infrastructure/auth/auth.controller';
import { SolicitudController } from './infrastructure/solicitud/solicitud.controller';
import { UsuarioUseCase } from './application/usuario/usuario.use-case';
import { AuthUseCase } from './application/auth/auth.use-case';
import { SolicitudUseCase } from './application/solicitud/solicitud.use-case';
import { UsuarioPrismaRepository } from './infrastructure/usuario/usuario.prisma.repository';
import { SolicitudPrismaRepository } from './infrastructure/solicitud/solicitud.prisma.repository';
import { EmailMockService } from './infrastructure/notificacion/email-mock.service';
import { JwtStrategy } from './shared/strategies/jwt.strategy';
import { LocalStrategy } from './shared/strategies/local.strategy';
import { LoggerMiddleware } from './shared/middlewares/logger.middleware';
import { HelmetMiddleware } from './shared/middlewares/helmet.middleware';
import { TipoPrendaController } from './infrastructure/tipo-prenda/tipo-prenda.controller';
import { TipoPrendaUseCase } from './application/tipo-prenda/tipo-prenda.use-case';
import { TipoPrendaPrismaRepository } from './infrastructure/tipo-prenda/tipo-prenda.prisma.repository';
import { RecogidaController } from './infrastructure/recogida/recogida.controller';
import { RecogidaUseCase } from './application/recogida/recogida.use-case';
import { RecogidaPrismaRepository } from './infrastructure/recogida/recogida.prisma.repository';
import { EntregaController } from './infrastructure/entrega/entrega.controller';
import { EntregaUseCase } from './application/entrega/entrega.use-case';
import { EntregaPrismaRepository } from './infrastructure/entrega/entrega.prisma.repository';
import { HistorialController } from './infrastructure/historial/historial.controller';
import { HistorialUseCase } from './application/historial/historial.use-case';
import { HistorialPrismaRepository } from './infrastructure/historial/historial.prisma.repository';
import { DashboardController } from './infrastructure/dashboard/dashboard.controller';
import { DashboardUseCase } from './application/dashboard/dashboard.use-case';
import { SanitizeInterceptor } from './shared/interceptors/sanitize.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' 
        ? '.env.production' 
        : '.env',
    }),
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  ],
  controllers: [
    UsuarioController,
    AuthController,
    SolicitudController,
    TipoPrendaController,
    RecogidaController,
    EntregaController,
    HistorialController,
    DashboardController,
  ],
  providers: [
    UploadService,
    UsuarioUseCase,
    AuthUseCase,
    SolicitudUseCase,
    JwtStrategy,
    LocalStrategy,
    TipoPrendaUseCase,
    RecogidaUseCase,
    EntregaUseCase,
    HistorialUseCase,
    DashboardUseCase,
    SanitizeInterceptor,
    {
      provide: 'IUsuarioRepository',
      useClass: UsuarioPrismaRepository,
    },
    {
      provide: 'ISolicitudRepository',
      useClass: SolicitudPrismaRepository,
    },
    {
      provide: 'IEmailService',
      useClass: EmailMockService,
    },
    {
      provide: 'ITipoPrendaRepository',
      useClass: TipoPrendaPrismaRepository,
    },
    {
      provide: 'IRecogidaRepository',
      useClass: RecogidaPrismaRepository,
    },
    {
      provide: 'IEntregaRepository',
      useClass: EntregaPrismaRepository,
    },
    {
      provide: 'IHistorialRepository',
      useClass: HistorialPrismaRepository,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, HelmetMiddleware)
      .forRoutes('*');
  }
}