import { IS_LOGGER_READY } from '../config/env.config';

/**
 * 민감 정보 마스킹 (배포용에서만 사용)
 */
function maskSensitiveData(data: any): any {
  if (typeof data === 'string') {
    // userId 패턴 마스킹 (이메일 형식)
    return data.replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '***@$2');
  }

  if (Array.isArray(data)) {
    return data.map(maskSensitiveData);
  }

  if (typeof data === 'object' && data !== null) {
    const masked: any = {};
    for (const [key, value] of Object.entries(data)) {
      // 민감 필드 마스킹
      if (['userId', 'user_id', 'session_id', 'sessionId', 'token', 'password'].includes(key)) {
        masked[key] = '***';
      } else if (['name', 'email', 'phone'].includes(key)) {
        masked[key] = typeof value === 'string' ? '***' : value;
      } else {
        masked[key] = maskSensitiveData(value);
      }
    }
    return masked;
  }

  return data;
}

/**
 * Logger 클래스
 */
class Logger {
  constructor(private module: string) {}

  /**
   * 개발용 로그 (IS_LOGGER_READY가 false일 때만 출력)
   * 개발 모드에서는 민감 정보 포함 모든 데이터를 그대로 출력
   */
  dev(message: string, ...args: any[]): void {
    if (!IS_LOGGER_READY) {
      console.log(`[${this.module}] ${message}`, ...args);
    }
  }

  /**
   * 에러 로그 (IS_LOGGER_READY가 false일 때만 출력)
   */
  error(message: string, error?: any): void {
    if (!IS_LOGGER_READY) {
      console.error(`[${this.module}] ERROR: ${message}`, error);
    }
  }

  /**
   * 경고 로그 (IS_LOGGER_READY가 false일 때만 출력)
   */
  warn(message: string, ...args: any[]): void {
    if (!IS_LOGGER_READY) {
      console.warn(`[${this.module}] WARN: ${message}`, ...args);
    }
  }

  /**
   * API 요청 로그 (IS_LOGGER_READY가 false일 때만 출력)
   */
  apiRequest(method: string, url: string, data?: any): void {
    if (!IS_LOGGER_READY) {
      console.log(`[${this.module}] 📤 ${method} ${url}`, data || '');
    }
  }

  /**
   * API 응답 로그 (IS_LOGGER_READY가 false일 때만 출력)
   */
  apiResponse(method: string, url: string, status: number, data?: any): void {
    if (!IS_LOGGER_READY) {
      console.log(`[${this.module}] 📥 ${method} ${url} ${status}`, data || '');
    }
  }
}

/**
 * Logger 인스턴스 생성 함수
 */
export function createLogger(module: string): Logger {
  return new Logger(module);
}

/**
 * 전역 로거 (간단한 용도)
 */
export const logger = {
  /**
   * 개발용 로그 (IS_LOGGER_READY가 false일 때만 출력)
   */
  dev: (message: string, ...args: any[]) => {
    if (!IS_LOGGER_READY) {
      console.log(message, ...args);
    }
  },

  /**
   * 에러 로그 (IS_LOGGER_READY가 false일 때만 출력)
   */
  error: (message: string, error?: any) => {
    if (!IS_LOGGER_READY) {
      console.error(`ERROR: ${message}`, error);
    }
  },

  /**
   * 경고 로그 (IS_LOGGER_READY가 false일 때만 출력)
   */
  warn: (message: string, ...args: any[]) => {
    if (!IS_LOGGER_READY) {
      console.warn(`WARN: ${message}`, ...args);
    }
  },
};
