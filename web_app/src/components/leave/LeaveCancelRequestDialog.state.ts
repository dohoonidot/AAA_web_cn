import { useState } from 'react';
import leaveService from '../../services/leaveService';
import type { YearlyDetail } from '../../types/leave';

export const useLeaveCancelRequestDialogState = ({
  leave,
  userId,
  onClose,
  onSuccess,
}: {
  leave: YearlyDetail | null;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!leave) return;

    if (!reason.trim()) {
      setError('취소 사유를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await leaveService.requestLeaveCancel({
        id: leave.id,
        userId: userId,
        reason: reason.trim(),
      });

      if (result.error) {
        setError(result.error);
      } else {
        handleClose();
        onSuccess();
      }
    } catch (err: any) {
      console.error('휴가 취소 상신 실패:', err);
      setError(err.response?.data?.error || '휴가 취소 상신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setError(null);
    onClose();
  };

  return {
    state: {
      reason,
      loading,
      error,
    },
    actions: {
      setReason,
      setLoading,
      setError,
      handleSubmit,
      handleClose,
    },
  };
};

export type LeaveCancelRequestDialogStateHook = ReturnType<typeof useLeaveCancelRequestDialogState>;
