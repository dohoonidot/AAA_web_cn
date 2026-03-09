import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import leaveService from '../services/leaveService';
import authService from '../services/authService';
import { createLogger } from '../utils/logger';
import type { LeaveGrantRequestItem } from '../types/leave';

const logger = createLogger('LeaveGrantHistoryPage');

export const useLeaveGrantHistoryPageState = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<LeaveGrantRequestItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<LeaveGrantRequestItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        setError('로그인 정보가 없습니다.');
        return;
      }

      const response = await leaveService.getGrantRequestList(user.userId);

      if (response.error) {
        setError(response.error);
        setHistory([]);
      } else {
        const data = response.leaveGrants || [];
        setHistory(data);
      }
    } catch (error: any) {
      logger.error('Failed to fetch history:', error);
      setError('휴가 부여 내역을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const openAttachment = useCallback(async (attachment: any) => {
    try {
      let fileData = attachment;
      // 문자열인 경우 JSON 파싱 시도
      if (typeof fileData === 'string') {
        try {
          fileData = JSON.parse(fileData);
        } catch (e) {
          // 단순 문자열일 수도 있음 (파일명 등)
          logger.warn('Failed to parse attachment string, treating as is:', e);
        }
      }

      // 1. 이미 URL이 있는 경우
      let url = fileData.url || fileData.file_url;

      // 2. URL이 없고 파일 정보가 있는 경우 API 호출하여 URL 획득
      if (!url) {
        const fileName = fileData.file_name || fileData.name || fileData.filename;
        const prefix = fileData.prefix;

        if (fileName && prefix) {
          // leaveService에 getFileUrl 메서드가 있다면 호출
          if (typeof (leaveService as any).getFileUrl === 'function') {
            url = await (leaveService as any).getFileUrl({
              fileName,
              prefix,
              approvalType: 'hr_leave_grant',
              isDownload: 0
            });
          } else {
            logger.error('leaveService.getFileUrl 메서드를 찾을 수 없습니다.');
          }
        }
      }

      if (url) {
        window.open(url, '_blank');
      } else {
        alert('첨부파일 주소를 찾을 수 없거나 열 수 없는 파일입니다.');
      }
    } catch (err) {
      logger.error('Error opening attachment:', err);
      alert('첨부파일을 여는 중 오류가 발생했습니다.');
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    state: {
      loading,
      history,
      selectedItem,
      error,
    },
    actions: {
      setLoading,
      setHistory,
      setSelectedItem,
      setError,
      fetchHistory,
      navigate,
      openAttachment,
    },
  };
};

export type LeaveGrantHistoryPageStateHook = ReturnType<typeof useLeaveGrantHistoryPageState>;
