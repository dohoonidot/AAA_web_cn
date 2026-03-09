/**
 * Vacation Recommendation Popup UI 상수 및 스타일
 *
 * GPT 스타일의 모던한 UI를 위한 색상, 크기, 그림자 등 디자인 상수
 * Flutter vacation_ui_constants.dart와 동일
 */

// 색상 팔레트
export const VacationUIColors = {
  // 메인 그라데이션 (보라-분홍)
  primaryGradient: ['#667EEA', '#764BA2'],

  // 액센트 그라데이션 (진행률바용 - 3색상)
  accentGradient: ['#667EEA', '#764BA2', '#FA8BFF'],

  // Light 배경 그라데이션
  lightBackgroundGradient: ['#FAFAFA', '#FFFFFF', '#F5F5F7'],

  // Dark 배경 그라데이션
  darkBackgroundGradient: ['#1A1A1A', '#2D2D2D', '#242424'],

  // 카드 배경 (Light)
  lightCardGradient: ['#FFFFFF', '#FAFAFA'],

  // 카드 배경 (Dark)
  darkCardGradient: ['#3A3A3A', '#323232'],

  // 섹션별 색상
  analysisSectionGradient: ['#8B5CF6', '#6366F1'], // 보라색 - 사용자 경향 분석
  conflictSectionGradient: ['#FF6B6B', '#EE5A6F'], // 빨간색 - 팀 충돌 분석
  recommendSectionGradient: ['#10B981', '#059669'], // 녹색 - 추천 계획
};

// Border Radius 시스템
export const VacationUIRadius = {
  small: 12,
  medium: 16,
  large: 20,
  xLarge: 24,
};

// Spacing 시스템
export const VacationUISpacing = {
  paddingXL: 24,
  paddingXXL: 32,
  marginXL: 28,
  marginXXL: 32,
};

// BoxShadow 프리셋
export const VacationUIShadows = {
  // 모달 그림자 (플로팅 효과)
  modalShadow: (isDark: boolean) => isDark
    ? '0 20px 40px rgba(0, 0, 0, 0.6), 0 10px 20px rgba(0, 0, 0, 0.4)'
    : '0 20px 40px rgba(0, 0, 0, 0.08), 0 10px 20px rgba(0, 0, 0, 0.04)',

  // 카드 그림자 (elevated card)
  cardShadow: (isDark: boolean) => isDark
    ? '0 6px 24px rgba(0, 0, 0, 0.3), 0 3px 12px rgba(0, 0, 0, 0.05)'
    : '0 6px 24px rgba(102, 126, 234, 0.08), 0 3px 12px rgba(0, 0, 0, 0.05)',

  // 아이콘 글로우 효과
  iconGlowShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
};

// 테마별 색상
export const getThemeColors = (isDark: boolean) => ({
  // 배경
  background: isDark ? '#1A1A1A' : '#FAFAFA',
  cardBackground: isDark ? '#3A3A3A' : '#FFFFFF',

  // 텍스트
  textPrimary: isDark ? '#FFFFFF' : '#1E293B',
  textSecondary: isDark ? '#9CA3AF' : '#6B7280',
  textMuted: isDark ? '#6B7280' : '#9CA3AF',

  // 테두리
  border: isDark ? '#505050' : '#E9ECEF',
  borderLight: isDark ? 'rgba(80, 80, 80, 0.5)' : 'rgba(233, 236, 239, 0.5)',

  // 분리선
  divider: isDark ? '#3D3D3D' : '#E2E8F0',
});
