import { Module } from "@nestjs/common";
import { WinstonModule } from "nest-winston";
import { winstonConfig } from "./logger.config";
import { GameLoggerService } from "./logger.service";

@Module({
	imports: [WinstonModule.forRoot(winstonConfig)],
  providers: [GameLoggerService],
  exports: [GameLoggerService],
})
export class LoggerModule {}
