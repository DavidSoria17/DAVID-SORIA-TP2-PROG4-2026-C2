import dns from 'node:dns';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  // Una URI mongodb+srv:// necesita resolver registros SRV, y algunos DNS
  // locales los rechazan. Se fijan servidores públicos antes de que
  // NestFactory.create abra la conexión a la base.
  dns.setServers(['8.8.8.8', '1.1.1.1']);

  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // whitelist descarta las propiedades que no declara el DTO;
  // transform convierte el body y los query params a la clase y tipos del DTO.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: config.getOrThrow<string>('FRONT_URL') });

  await app.listen(config.get<string>('PORT', '3000'));
}
await bootstrap();
