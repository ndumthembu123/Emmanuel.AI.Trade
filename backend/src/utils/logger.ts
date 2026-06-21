/**
 * Logger utility
 */
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

class Logger {
  private formatLog(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level}] ${message}${dataStr}`;
  }

  error(message: string, error?: any): void {
    console.error(this.formatLog(LOG_LEVELS.ERROR, message, error));
  }

  warn(message: string, data?: any): void {
    console.warn(this.formatLog(LOG_LEVELS.WARN, message, data));
  }

  info(message: string, data?: any): void {
    console.log(this.formatLog(LOG_LEVELS.INFO, message, data));
  }

  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatLog(LOG_LEVELS.DEBUG, message, data));
    }
  }
}

export const logger = new Logger();
