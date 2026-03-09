import { useState } from 'react';
import authService from '../../services/authService';
import settingsService from '../../services/settingsService';
import { createLogger } from '../../utils/logger';

const logger = createLogger('PrivacyAgreementDialog');

export const usePrivacyAgreementDialogState = ({
  userId,
  onAgreed,
  onDisagreed,
  onClose,
  required = false,
  showAgreeButton = true,
  showDisagreeButton = true,
  showCancelButton = true,
}: {
  userId: string;
  onAgreed: () => void;
  onDisagreed?: () => void;
  onClose?: () => void;
  required?: boolean;
  showAgreeButton?: boolean;
  showDisagreeButton?: boolean;
  showCancelButton?: boolean;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAgreement = async (isAgreed: boolean) => {
    try {
      setLoading(true);
      setError(null);

      logger.dev('개인정보 동의 상태 업데이트:', { userId, isAgreed });
      const response = await settingsService.updatePrivacyAgreement(userId, isAgreed);

      logger.dev('개인정보 동의 상태 업데이트 응답:', response);

      if (response.success) {
        await authService.updatePrivacy(userId, isAgreed);

        logger.dev(`개인정보 동의 상태 업데이트 완료: ${isAgreed ? '동의함' : '동의안함'}`);

        if (isAgreed) {
          onAgreed();
        } else {
          if (onDisagreed) onDisagreed();
          else onAgreed();
        }
      } else {
        setError(response.error || '개인정보 동의 상태 업데이트에 실패했습니다.');
        setLoading(false);
      }
    } catch (err: any) {
      logger.error('개인정보 동의 상태 업데이트 실패:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          '개인정보 동의 상태 업데이트 중 오류가 발생했습니다.'
      );
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!required && onClose) {
      onClose();
    }
  };

  const cancelVisible = !required && !!onClose && showCancelButton;
  const disagreeVisible = showDisagreeButton;
  const agreeVisible = showAgreeButton;
  const hasAnyActions = cancelVisible || disagreeVisible || agreeVisible;

  return {
    state: {
      loading,
      error,
      cancelVisible,
      disagreeVisible,
      agreeVisible,
      hasAnyActions,
    },
    actions: {
      handleAgreement,
      handleClose,
    },
  };
};

export type PrivacyAgreementDialogStateHook = ReturnType<typeof usePrivacyAgreementDialogState>;
