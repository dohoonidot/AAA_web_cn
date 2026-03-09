/**
 * 배포 환경 설정
 *
 * 이 파일의 IS_PRODUCTION 값만 변경하면 모든 것이 자동으로 바뀝니다:
 * - true: 배포용 (8080 포트, 로그 제거)
 * - false: 개발용 (8060 포트, 로그 출력)
 */

// ============================================
// 🚀 배포 전에 이 값을 true로 변경하세요!
// ============================================
export const IS_PRODUCTION = false;

// ============================================
// 🔐 웹 전용 로그인(로그인/리프레시/로그아웃) 8080 적용 여부
// - true: 8080으로 호출 (구현 완료)
// - false: 8060으로 호출 (8080 구현되면 true로 변경 예정)
// ============================================
export const WEB_AUTH_8080_READY = IS_PRODUCTION;

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


// API URL (자동 결정)
export const API_BASE_URL = IS_PRODUCTION
  ? 'https://ai2great.com:8080'  // 배포용
  : 'https://ai2great.com:8060'; // 개발용

// 웹 전용 로그인 API URL (8080 구현 완료 여부에 따라 분기)
export const WEB_AUTH_API_BASE_URL = IS_PRODUCTION
  ? 'https://ai2great.com:8080'  // 배포용
  : 'https://ai2great.com:8060'; // 개발용

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
