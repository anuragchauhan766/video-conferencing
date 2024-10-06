import { createLogger, format, transports } from "winston";

const fileFormatter = format.printf(({ level, message, timestamp }) => {
  return `[${timestamp}] [${level}] ${message}`;
});

const consoleFormatter = format.printf(({ level, message, timestamp }) => {
  return `[${timestamp}] [${level}] ${message}`;
});

const logger = createLogger({
  level: "info",
});

if (process.env.NODE_ENV === "production") {
  // In production, log to files
  logger.add(
    new transports.File({
      filename: "error.log",
      level: "error",
      format: format.combine(
        format.timestamp({
          format: "YYYY-MM-DD hh:mm:ss A",
        }),
        fileFormatter,
      ),
    }),
  );
  logger.add(
    new transports.File({
      filename: "combined.log",
      format: format.combine(
        format.timestamp({
          format: "YYYY-MM-DD hh:mm:ss A",
        }),
        fileFormatter,
      ),
    }),
  );
}

// Always add console transport, but with colors only in development
logger.add(
  new transports.Console({
    format: format.combine(
      process.env.NODE_ENV !== "production"
        ? format.colorize({ all: true })
        : format.uncolorize(),
      format.timestamp({
        format: "YYYY-MM-DD hh:mm:ss A",
      }),
      consoleFormatter,
    ),
  }),
);

export default logger;
