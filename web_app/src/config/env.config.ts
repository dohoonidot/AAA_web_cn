/**
 * 배포 환경 설정
 *
 * 중국지사용 설정:
 * - API는 개발/운영 구분 없이 8180 단일 포트 사용
 * - 필요 시 VITE_API_URL로 호스트/도메인만 덮어쓸 수 있습니다.
 */

// ============================================
// 🚀 배포 전에 이 값을 true로 변경하세요!
// ============================================
export const IS_PRODUCTION = false;

export const WEB_AUTH_8080_READY = true;

// ============================================
// 📋 전자결재 결재종류 제한 설정
// true: '휴가 부여 상신'만 표시 (배포용)
// false: 모든 결재종류 표시 (개발용)
// ============================================
export const LIMIT_APPROVAL_TYPE = IS_PRODUCTION;

// ============================================
// 📝 로그 출력 제어 설정
// true: 로그 출력 안 함 (배포용)
// false: 로그 출력 (개발용)
// ============================================
export const IS_LOGGER_READY = IS_PRODUCTION;


const DEFAULT_API_BASE_URL = 'https://211.43.205.49:8180';

// API URL (중국지사 단일 API: 8180)
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) || DEFAULT_API_BASE_URL;

// 웹 전용 로그인 API URL도 동일 서버 사용
export const WEB_AUTH_API_BASE_URL = API_BASE_URL;

// 환경 정보
export const ENV_CONFIG = {
  IS_PRODUCTION,
  API_BASE_URL,
  WEB_AUTH_8080_READY,
  WEB_AUTH_API_BASE_URL,
  IS_LOGGER_READY,
  APP_NAME: 'ASPN AI Agent',
  APP_VERSION: '1.3.0',
} as const;
