import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);
  const logger: Logger = new Logger('bootstrap', {timestamp: true});
  const PORT: number = 0|configService.get<number>('CHATAPP_SERVER_PORT', 3000);
  await app.listen(PORT);
  logger.log(`The App Running in Port ${PORT}`);
}
bootstrap();
