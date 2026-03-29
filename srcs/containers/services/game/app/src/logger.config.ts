import * as winston from 'winston';

// Logstash sends logs to an ECS-mapped index shared with other services.
// ES already maps `event`, `service`, and `log` as nested objects (ECS standard).
// Sending them as plain strings causes a mapping conflict and rejects the document.
const ecsCompat = winston.format((info) => {
  if (typeof info.service === 'string') {
    info.service = { name: info.service };
  }
  if (typeof info.event === 'string') {
    info.event = { action: info.event };
  }
  if (typeof info.logger === 'string') {
    const logMeta =
      info.log && typeof info.log === 'object'
        ? (info.log as Record<string, unknown>)
        : {};
    info.log = { ...logMeta, logger: info.logger };
    delete info.logger;
  }
  return info;
});

export const winstonConfig: winston.LoggerOptions = {
  defaultMeta: {
    log: {
      logger: 'game_logger',
    },
  },
  format: winston.format.combine(
    ecsCompat(),
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: '/logs/game.log' }),
  ],
};
