import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { GameModule } from "./game/game.module";

async function bootstrap() {
  const app = await NestFactory.create(GameModule);

  app.useWebSocketAdapter(new IoAdapter(app));

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();
