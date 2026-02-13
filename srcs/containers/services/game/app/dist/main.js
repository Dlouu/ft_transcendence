"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const game_module_1 = require("./game/game.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(game_module_1.GameModule);
    app.useWebSocketAdapter(new platform_socket_io_1.IoAdapter(app));
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map