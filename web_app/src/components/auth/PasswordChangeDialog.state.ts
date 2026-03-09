import { useMemo, useState } from 'react';
import { API_BASE_URL } from '../../utils/apiConfig';

export const usePasswordChangeDialogState = ({
  onClose,
}: {
  onClose: () => void;
}) => {
  const [userId, setUserId] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateForm = useMemo(() => {
    return () => {
      if (!userId.trim()) {
        return '이메일을 입력해 주세요.';
      }
      if (!userId.includes('@')) {
        return '유효한 이메일 형식이 아닙니다.';
      }
      if (!currentPassword) {
        return '현재 비밀번호를 입력해 주세요.';
      }
      if (!newPassword) {
        return '새 비밀번호를 입력해 주세요.';
      }
      if (!confirmPassword) {
        return '새 비밀번호를 다시 입력해 주세요.';
      }
      if (newPassword !== confirmPassword) {
        return '새 비밀번호가 일치하지 않습니다.';
      }
      return null;
    };
  }, [confirmPassword, currentPassword, newPassword, userId]);

  const handleChangePassword = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/updatePassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user_id: userId.trim(),
          password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.status_code === 200) {
        setSuccess(true);
        setError(null);

        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setError('비밀번호 변경에 실패했습니다. 입력한 정보를 확인해주세요.');
      }
    } catch (err) {
      console.error('Password change error:', err);
      setError('서버 연결에 문제가 발생했습니다. 나중에 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;

    setUserId('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setError(null);
    setSuccess(false);
    setIsLoading(false);

    onClose();
  };

  return {
    state: {
      userId,
      currentPassword,
      newPassword,
      confirmPassword,
      showCurrentPassword,
      showNewPassword,
      showConfirmPassword,
      isLoading,
      error,
      success,
    },
    actions: {
      setUserId,
      setCurrentPassword,
      setNewPassword,
      setConfirmPassword,
      setShowCurrentPassword,
      setShowNewPassword,
      setShowConfirmPassword,
      setError,
      handleChangePassword,
      handleClose,
    },
  };
};

export type PasswordChangeDialogStateHook = ReturnType<typeof usePasswordChangeDialogState>;
