import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/apiConfig';
import authService from '../services/authService';
import { createLogger } from '../utils/logger';

const logger = createLogger('PasswordChangePage');

export const usePasswordChangePageState = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateForm = (): string | null => {
    if (!formData.currentPassword) {
      return '현재 비밀번호를 입력해주세요.';
    }

    if (!formData.newPassword) {
      return '새 비밀번호를 입력해주세요.';
    }

    if (formData.newPassword.length < 8) {
      return '새 비밀번호는 최소 8자 이상이어야 합니다.';
    }

    if (formData.newPassword === formData.currentPassword) {
      return '새 비밀번호는 현재 비밀번호와 달라야 합니다.';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return '새 비밀번호가 일치하지 않습니다.';
    }

    const hasUpperCase = /[A-Z]/.test(formData.newPassword);
    const hasLowerCase = /[a-z]/.test(formData.newPassword);
    const hasNumber = /[0-9]/.test(formData.newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword);

    const strength = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(
      Boolean
    ).length;

    if (strength < 3) {
      return '새 비밀번호는 대문자, 소문자, 숫자, 특수문자 중 최소 3가지를 포함해야 합니다.';
    }

    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        setError('로그인 정보가 없습니다. 다시 로그인해주세요.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/changePassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: currentUser.userId,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '비밀번호 변경에 실패했습니다.');
      }

      setSuccess(true);

      setTimeout(() => {
        authService.logout();
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      logger.error('Password change error:', err);
      setError(err.message || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const calculatePasswordStrength = (): {
    level: number;
    color: string;
    label: string;
  } => {
    if (!formData.newPassword) {
      return { level: 0, color: '#E5E7EB', label: '' };
    }

    const hasUpperCase = /[A-Z]/.test(formData.newPassword);
    const hasLowerCase = /[a-z]/.test(formData.newPassword);
    const hasNumber = /[0-9]/.test(formData.newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword);
    const isLongEnough = formData.newPassword.length >= 8;

    let level = 0;
    if (isLongEnough) level++;
    if (hasUpperCase) level++;
    if (hasLowerCase) level++;
    if (hasNumber) level++;
    if (hasSpecialChar) level++;

    if (level <= 2) {
      return { level: 1, color: '#DC2626', label: '약함' };
    } else if (level === 3) {
      return { level: 2, color: '#F59E0B', label: '보통' };
    } else if (level === 4) {
      return { level: 3, color: '#10B981', label: '강함' };
    } else {
      return { level: 4, color: '#059669', label: '매우 강함' };
    }
  };

  const passwordStrength = calculatePasswordStrength();

  return {
    state: {
      formData,
      showPassword,
      loading,
      error,
      success,
      passwordStrength,
    },
    actions: {
      setFormData,
      setShowPassword,
      setLoading,
      setError,
      setSuccess,
      handleSubmit,
      navigate,
    },
  };
};

export type PasswordChangePageStateHook = ReturnType<typeof usePasswordChangePageState>;
