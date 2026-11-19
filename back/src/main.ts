import dns from 'node:dns';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';

async function bootstrap() {
  // Una URI mongodb+srv:// necesita resolver registros SRV, y algunos DNS
  // locales los rechazan. Se fijan servidores públicos antes de que
  // NestFactory.create abra la conexión a la base.
  dns.setServers(['8.8.8.8', '1.1.1.1']);

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // En Render los pedidos llegan a través de un proxy: sin esto, req.ip sería
  // la IP del proxy y el límite de pedidos se compartiría entre todos los
  // usuarios. Con 1 se toma la IP que agrega ese único salto en X-Forwarded-For.
  app.set('trust proxy', 1);

  // whitelist descarta las propiedades que no declara el DTO;
  // transform convierte el body y los query params a la clase y tipos del DTO.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // Retry-After se expone para que el front lea cuánto esperar después de un 429.
  app.enableCors({
    origin: config.getOrThrow<string>('FRONT_URL'),
    exposedHeaders: ['Retry-After'],
  });

  await app.listen(config.get<string>('PORT', '3000'));
}
await bootstrap();
