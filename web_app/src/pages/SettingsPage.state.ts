import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import settingsService from '../services/settingsService';
import { useThemeStore, AppThemeMode } from '../store/themeStore';
import { createLogger } from '../utils/logger';

const logger = createLogger('SettingsPage');

export type ThemeMode = 'light' | 'dark' | 'system';

export const useSettingsPageState = () => {
  const navigate = useNavigate();
  const { themeMode: currentThemeMode, setThemeMode } = useThemeStore();
  const [notifications, setNotifications] = useState(true);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  const themeMode: ThemeMode = currentThemeMode === AppThemeMode.LIGHT
    ? 'light'
    : currentThemeMode === AppThemeMode.CODING_DARK
      ? 'dark'
      : 'system';

  useEffect(() => {
    loadUserInfo();
    loadPrivacyStatus();
  }, []);

  const loadUserInfo = async () => {
    try {
      const user = authService.getCurrentUser();
      if (user) {
        setUserInfo(user);
      }
    } catch (err) {
      logger.error('사용자 정보 로드 실패:', err);
    }
  };

  const loadPrivacyStatus = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) return;

      logger.dev('개인정보 동의 상태 확인:', user.userId);
      const response = await settingsService.checkPrivacyAgreement(user.userId);

      logger.dev('개인정보 동의 상태 응답:', response);
      setPrivacyAgreed(response.is_agreed === 1);
    } catch (err: any) {
      logger.error('개인정보 동의 상태 로드 실패:', err);
      logger.error('에러 상세:', err.response?.data);
    }
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      authService.logout();
      window.location.href = '/login';
    }
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    const appThemeMode = newTheme === 'light'
      ? AppThemeMode.LIGHT
      : newTheme === 'dark'
        ? AppThemeMode.CODING_DARK
        : AppThemeMode.SYSTEM;

    setThemeMode(appThemeMode);
    logger.dev('테마 변경:', newTheme);
  };

  const handleNotificationChange = (enabled: boolean) => {
    setNotifications(enabled);
    logger.dev('알림 설정 변경:', enabled);
  };

  return {
    state: {
      notifications,
      privacyAgreed,
      privacyDialogOpen,
      loading,
      error,
      userInfo,
      themeMode,
    },
    actions: {
      setNotifications,
      setPrivacyAgreed,
      setPrivacyDialogOpen,
      setLoading,
      setError,
      setUserInfo,
      handleLogout,
      handleThemeChange,
      handleNotificationChange,
      loadUserInfo,
      loadPrivacyStatus,
      navigate,
    },
  };
};

export type SettingsPageStateHook = ReturnType<typeof useSettingsPageState>;
