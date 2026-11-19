import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { minutes, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module.js';
import { PublicacionesModule } from './publicaciones/publicaciones.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGO_URI'),
      }),
    }),
    // Cada IP puede hacer hasta 100 pedidos por minuto a cada ruta; login y
    // registro bajan el límite con @Throttle. Pasado el límite, 429.
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: minutes(1), limit: 100 }],
      errorMessage: (_contexto, { timeToBlockExpire }) =>
        `Hiciste demasiados pedidos seguidos. Probá de nuevo en ${timeToBlockExpire} segundos`,
    }),
    AuthModule,
    UsuariosModule,
    PublicacionesModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
