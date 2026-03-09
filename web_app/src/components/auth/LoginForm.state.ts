import { useEffect, useState } from 'react';
import authService from '../../services/authService';
import type { FormEvent } from 'react';

/** 로그인 아이디 고정 접미사 (입력값 앞에 사용자가 입력, 제출 시 이 접미사가 붙음) */
export const USER_ID_SUFFIX = '@aspnc.com';

export const useLoginFormState = ({
  onLoginSuccess,
  navigate,
  onLoadingChange,
}: {
  onLoginSuccess: () => void;
  navigate: (path: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}) => {
  /** 아이디 입력란에 보이는 값 = @aspnc.com 앞부분만 (사용자가 앞에서부터 타이핑) */
  const [userIdPrefix, setUserIdPrefix] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordChangeDialogOpen, setPasswordChangeDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string>('');

  /** API/다이얼로그용 전체 아이디 (prefix + @aspnc.com) */
  const fullUserId = userIdPrefix.trim() ? `${userIdPrefix.trim()}${USER_ID_SUFFIX}` : '';

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ user_id: fullUserId, password });

      console.log('🔐 [LoginForm] 로그인 응답:', response);
      console.log('🔐 [LoginForm] is_approver:', response.is_approver);

      if (response.status_code === 200) {
        if (response.is_agreed === 0) {
          setPendingUserId(fullUserId);
          setPrivacyDialogOpen(true);
        } else {
          sessionStorage.setItem('skip_refresh_once', '1');
          navigate('/chat');
          onLoginSuccess();
        }
      } else {
        setError('로그인에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyAgreed = () => {
    setPrivacyDialogOpen(false);
    setPendingUserId('');
    sessionStorage.setItem('skip_refresh_once', '1');
    navigate('/chat');
    onLoginSuccess();
  };

  const handlePrivacyDisagreed = async () => {
    setPrivacyDialogOpen(false);
    setPendingUserId('');
    sessionStorage.setItem('privacy_disagree_dismissed', '1');
    sessionStorage.setItem('skip_refresh_once', '1');
    navigate('/chat');
    onLoginSuccess();
  };


  return {
    state: {
      userIdPrefix,
      fullUserId,
      password,
      error,
      loading,
      showPassword,
      passwordChangeDialogOpen,
      privacyDialogOpen,
      pendingUserId,
    },
    actions: {
      setUserIdPrefix,
      setPassword,
      setError,
      setLoading,
      setShowPassword,
      setPasswordChangeDialogOpen,
      setPrivacyDialogOpen,
      setPendingUserId,
      handleSubmit,
      handlePrivacyAgreed,
      handlePrivacyDisagreed,
    },
  };
};

export type LoginFormStateHook = ReturnType<typeof useLoginFormState>;
