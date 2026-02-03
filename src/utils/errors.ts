/**
 * Error handling and logging utilities
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

class Logger {
  private static isDev = process.env.NODE_ENV === 'development';

  static log(level: LogLevel, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        if (this.isDev) console.debug(logMessage, data);
        break;
      case LogLevel.INFO:
        console.info(logMessage, data);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, data);
        break;
      case LogLevel.ERROR:
        console.error(logMessage, data);
        break;
    }

    // Could be extended to send logs to external service
  }

  static debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  static info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  static warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  static error(message: string, error?: any): void {
    this.log(LogLevel.ERROR, message, error);
  }
}

/**
 * Custom error types for the application
 */
export class InsuranceError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'InsuranceError';
  }
}

export class ContractError extends InsuranceError {
  constructor(message: string, details?: any) {
    super('CONTRACT_ERROR', message, details);
    this.name = 'ContractError';
  }
}

export class WalletError extends InsuranceError {
  constructor(message: string, details?: any) {
    super('WALLET_ERROR', message, details);
    this.name = 'WalletError';
  }
}

export class ValidationError extends InsuranceError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

/**
 * Error handler utility
 */
export const handleError = (error: any): string => {
  Logger.error('Error occurred', error);

  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof WalletError) {
    return `Wallet Error: ${error.message}`;
  }

  if (error instanceof ContractError) {
    return `Contract Error: ${error.message}`;
  }

  // Handle ethers errors
  if (error?.code === 'INSUFFICIENT_FUNDS') {
    return 'Insufficient funds in wallet';
  }

  if (error?.code === 'CALL_EXCEPTION') {
    return 'Contract call failed';
  }

  if (error?.code === 'NETWORK_ERROR') {
    return 'Network connection error';
  }

  // Default error message
  return error?.message || 'An unexpected error occurred';
};

export default Logger;
