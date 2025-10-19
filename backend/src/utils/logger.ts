import { createWriteStream } from 'fs';
import { join } from 'path';

interface LogLevel {
  ERROR: 0;
  WARN: 1;
  INFO: 2;
  DEBUG: 3;
}

const LOG_LEVELS: LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL as keyof LogLevel] || LOG_LEVELS.INFO;

class Logger {
  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  }

  private log(level: string, levelNum: number, message: string, meta?: any): void {
    if (levelNum <= currentLevel) {
      const formattedMessage = this.formatMessage(level, message, meta);
      console.log(formattedMessage);
      
      // Write to file in production
      if (process.env.NODE_ENV === 'production') {
        const logStream = createWriteStream(
          join(process.cwd(), 'logs', 'app.log'),
          { flags: 'a' }
        );
        logStream.write(formattedMessage + '\n');
        logStream.end();
      }
    }
  }

  error(message: string, meta?: any): void {
    this.log('ERROR', LOG_LEVELS.ERROR, message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log('WARN', LOG_LEVELS.WARN, message, meta);
  }

  info(message: string, meta?: any): void {
    this.log('INFO', LOG_LEVELS.INFO, message, meta);
  }

  debug(message: string, meta?: any): void {
    this.log('DEBUG', LOG_LEVELS.DEBUG, message, meta);
  }
}

export const logger = new Logger();
