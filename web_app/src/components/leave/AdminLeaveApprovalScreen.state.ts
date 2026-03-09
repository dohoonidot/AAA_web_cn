import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import leaveService from '../../services/leaveService';
import authService from '../../services/authService';
import { createLogger } from '../../utils/logger';
import type { AdminWaitingLeave, AdminManagementApiResponse } from '../../types/leave';

const logger = createLogger('AdminLeaveApprovalScreen');

export const useAdminLeaveApprovalScreenState = () => {
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState<'pending' | 'all'>('pending');
  const [statusFilter, setStatusFilter] = useState<string | null>('REQUESTED');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [adminData, setAdminData] = useState<AdminManagementApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [approvalDialog, setApprovalDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<AdminWaitingLeave | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectMessage, setRejectMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedYear]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab, statusFilter, selectedYear]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = authService.getCurrentUser();
      if (!user) {
        setError('사용자 정보를 찾을 수 없습니다.');
        return;
      }

      const response = await leaveService.getAdminYearlyLeave({
        approverId: user.userId,
        year: selectedYear,
      });

      if (response.error) {
        setError(response.error);
      } else {
        const transformedData: AdminManagementApiResponse = {
          error: response.error ?? null,
          approval_status: (response.approval_status || []).map((s: any) => ({ status: s.status ?? '', count: s.count ?? 0 })),
          waiting_leaves: (response as any).waiting_leaves || response.yearly_details || [],
          monthly_leaves: [],
        };
        setAdminData(transformedData);
      }
    } catch (err: any) {
      logger.error('관리자 데이터 로드 실패:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedLeave) return;

    setActionLoading(true);
    try {
      const user = authService.getCurrentUser();
      if (!user) return;

      const isCancel = selectedLeave.isCancel === 1;

      if (isCancel) {
        await leaveService.processCancelApproval({
          id: selectedLeave.id,
          approverId: user.userId,
        });
      } else {
        await leaveService.processAdminApproval({
          id: selectedLeave.id,
          approverId: user.userId,
          isApproved: 'APPROVED',
        });
      }

      setApprovalDialog(false);
      setSelectedLeave(null);
      loadData();
    } catch (err: any) {
      logger.error('승인 처리 실패:', err);
      setError('승인 처리에 실패했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedLeave || !rejectMessage.trim()) {
      setError('반려 사유를 입력해주세요.');
      return;
    }

    setActionLoading(true);
    try {
      const user = authService.getCurrentUser();
      if (!user) return;

      const isCancel = selectedLeave.isCancel === 1;

      if (isCancel) {
        await leaveService.processCancelApproval({
          id: selectedLeave.id,
          approverId: user.userId,
        });
      } else {
        await leaveService.processAdminApproval({
          id: selectedLeave.id,
          approverId: user.userId,
          isApproved: 'REJECTED',
          rejectMessage: rejectMessage.trim(),
        });
      }

      setApprovalDialog(false);
      setSelectedLeave(null);
      setRejectMessage('');
      loadData();
    } catch (err: any) {
      logger.error('반려 처리 실패:', err);
      setError('반려 처리에 실패했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  return {
    state: {
      selectedTab,
      statusFilter,
      selectedYear,
      adminData,
      loading,
      error,
      currentPage,
      itemsPerPage,
      approvalDialog,
      selectedLeave,
      approvalAction,
      rejectMessage,
      actionLoading,
    },
    actions: {
      setSelectedTab,
      setStatusFilter,
      setSelectedYear,
      setAdminData,
      setLoading,
      setError,
      setCurrentPage,
      setApprovalDialog,
      setSelectedLeave,
      setApprovalAction,
      setRejectMessage,
      setActionLoading,
      loadData,
      handleApprove,
      handleReject,
      navigate,
    },
  };
};

export type AdminLeaveApprovalScreenStateHook = ReturnType<typeof useAdminLeaveApprovalScreenState>;
