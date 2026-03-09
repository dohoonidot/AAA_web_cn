import { useEffect, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, SyntheticEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import authService from '../services/authService';
import leaveService from '../services/leaveService';
import { createLogger } from '../utils/logger';
import type { LeaveManagementData, LeaveCancelRequest, ApprovalStatus } from '../types/leave';

const logger = createLogger('LeaveManagementPage');

export const useLeaveManagementPageState = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();

  const fromAdmin = (location.state as any)?.fromAdmin || false;
  const isApprover = user?.isApprover || false;

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaveData, setLeaveData] = useState<LeaveManagementData | null>(null);
  const [waitingCount, setWaitingCount] = useState(0);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [yearlyLeaves, setYearlyLeaves] = useState<any[]>([]);
  const [yearlyLoading, setYearlyLoading] = useState(false);

  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [cancelRequestModalOpen, setCancelRequestModalOpen] = useState(false);
  const [cancelRequestLeave, setCancelRequestLeave] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [cancelReasonDialogOpen, setCancelReasonDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [recommendationOpen, setRecommendationOpen] = useState(false);
  const [hideCanceled, setHideCanceled] = useState(false);
  const [leaveManualOpen, setLeaveManualOpen] = useState(false);
  const [leaveAIManualOpen, setLeaveAIManualOpen] = useState(false);

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);

  useEffect(() => {
    if (isApprover && !fromAdmin) {
      logger.dev('승인자이므로 관리자 화면으로 리다이렉트');
      navigate('/admin-leave', { replace: true });
    }
  }, [isApprover, fromAdmin, navigate]);

  useEffect(() => {
    loadLeaveData();
  }, []);

  // 연도 변경 시 연도별 휴가 데이터 로드
  useEffect(() => {
    loadYearlyLeaveData(selectedYear);
  }, [selectedYear]);

  const loadYearlyLeaveData = async (year: number) => {
    try {
      setYearlyLoading(true);
      const currentUser = authService.getCurrentUser();
      if (!currentUser) return;

      logger.dev('연도별 휴가 내역 조회:', year);
      const response = await leaveService.getYearlyLeave({ userId: currentUser.userId, year });
      logger.dev('연도별 휴가 내역 응답:', response);

      if (response && response.yearlyDetails) {
        setYearlyLeaves(response.yearlyDetails);
      } else {
        // API 응답이 없으면 기존 monthlyLeaves에서 연도로 필터링
        if (leaveData?.monthlyLeaves) {
          const filtered = leaveData.monthlyLeaves.filter((leave: any) => {
            const leaveYear = dayjs(leave.start_date || leave.startDate).year();
            return leaveYear === year;
          });
          setYearlyLeaves(filtered);
        } else {
          setYearlyLeaves([]);
        }
      }
    } catch (err) {
      logger.error('연도별 휴가 내역 조회 실패:', err);
      // 실패 시 기존 데이터에서 필터링
      if (leaveData?.monthlyLeaves) {
        const filtered = leaveData.monthlyLeaves.filter((leave: any) => {
          const leaveYear = dayjs(leave.start_date || leave.startDate).year();
          return leaveYear === year;
        });
        setYearlyLeaves(filtered);
      } else {
        setYearlyLeaves([]);
      }
    } finally {
      setYearlyLoading(false);
    }
  };

  const loadLeaveData = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        setError('사용자 정보를 찾을 수 없습니다.');
        return;
      }

      logger.dev('휴가관리 데이터 로드 시작:', currentUser.userId);

      const data = await leaveService.getLeaveManagement(currentUser.userId) as any;
      logger.dev('휴가관리 데이터 응답 (전체):', data);
      logger.dev('응답 타입:', typeof data);
      logger.dev('응답 키들:', Object.keys(data || {}));

      logger.dev('data.leave_status:', data.leave_status);
      logger.dev('data.approval_status:', data.approval_status);
      logger.dev('data.yearly_whole_status:', data.yearly_whole_status);
      logger.dev('data.monthly_leaves:', data.monthly_leaves);
      logger.dev('data.yearly_details:', data.yearly_details);

      logger.dev('data.leaveStatus:', data.leaveStatus);
      logger.dev('data.approvalStatus:', data.approvalStatus);
      logger.dev('data.yearlyWholeStatus:', data.yearlyWholeStatus);
      logger.dev('data.monthlyLeaves:', data.monthlyLeaves);
      logger.dev('data.yearlyDetails:', data.yearlyDetails);

      const actualLeaveStatus = data.leave_status || data.leaveStatus || [];
      const actualApprovalStatus = data.approval_status || data.approvalStatus;
      const actualYearlyDetails = data.yearly_details || data.yearlyDetails || [];
      const actualYearlyWholeStatus = data.yearly_whole_status || data.yearlyWholeStatus || [];
      const actualMonthlyLeaves = data.monthly_leaves || data.monthlyLeaves || [];

      const normalizeDate = (value: any): string => {
        if (!value) return '';
        const text = String(value);
        if (text.includes('T')) return text.split('T')[0];
        if (text.includes(' ')) return text.split(' ')[0];
        return text;
      };

      const resolveLeaveId = (leave: any): number | undefined => {
        const directId = leave?.id ?? leave?.leave_id ?? leave?.leaveId;
        if (directId) return Number(directId);

        const leaveStart = normalizeDate(leave?.start_date || leave?.startDate || '');
        const leaveEnd = normalizeDate(leave?.end_date || leave?.endDate || '');
        const leaveType = String(leave?.leave_type || leave?.leaveType || '').trim();
        const leaveReason = String(leave?.reason || '').trim();
        const leaveStatus = String(leave?.status || '').toUpperCase();

        const matched = (actualYearlyDetails || []).find((detail: any) => {
          const detailStart = normalizeDate(detail?.start_date || detail?.startDate || '');
          const detailEnd = normalizeDate(detail?.end_date || detail?.endDate || '');
          const detailType = String(detail?.leave_type || detail?.leaveType || '').trim();
          const detailReason = String(detail?.reason || '').trim();
          const detailStatus = String(detail?.status || '').toUpperCase();

          if (leaveStart && detailStart && leaveStart !== detailStart) return false;
          if (leaveEnd && detailEnd && leaveEnd !== detailEnd) return false;
          if (leaveType && detailType && leaveType !== detailType) return false;
          if (leaveStatus && detailStatus && leaveStatus !== detailStatus) return false;
          if (leaveReason && detailReason && leaveReason !== detailReason) return false;
          return true;
        });

        const matchedId = matched?.id ?? matched?.leave_id ?? matched?.leaveId;
        return matchedId ? Number(matchedId) : undefined;
      };

      const actualMonthlyLeavesWithId = actualMonthlyLeaves.map((leave: any) => {
        const resolvedId = resolveLeaveId(leave);
        return resolvedId ? { ...leave, id: resolvedId } : leave;
      });

      logger.dev('실제 데이터 매핑 결과:');
      logger.dev('actualLeaveStatus:', actualLeaveStatus);
      logger.dev('actualApprovalStatus:', actualApprovalStatus);
      logger.dev('actualYearlyDetails:', actualYearlyDetails);
      logger.dev('actualYearlyWholeStatus:', actualYearlyWholeStatus);
      logger.dev('actualMonthlyLeaves:', actualMonthlyLeaves);

      let approvalStatus: ApprovalStatus;
      if (Array.isArray(actualApprovalStatus)) {
        const statusArray = actualApprovalStatus as any[];
        approvalStatus = {
          requested: statusArray.find(item => item.status === 'REQUESTED')?.count || 0,
          approved: statusArray.find(item => item.status === 'APPROVED')?.count || 0,
          rejected: statusArray.find(item => item.status === 'REJECTED')?.count || 0,
        };
      } else if (actualApprovalStatus && typeof actualApprovalStatus === 'object') {
        approvalStatus = {
          requested: (actualApprovalStatus as any).REQUESTED || 0,
          approved: (actualApprovalStatus as any).APPROVED || 0,
          rejected: (actualApprovalStatus as any).REJECTED || 0,
        };
      } else {
        approvalStatus = { requested: 0, approved: 0, rejected: 0 };
      }

      const safeData: LeaveManagementData = {
        leaveStatus: actualLeaveStatus,
        approvalStatus: approvalStatus,
        yearlyDetails: actualYearlyDetails,
        yearlyWholeStatus: actualYearlyWholeStatus,
        monthlyLeaves: actualMonthlyLeavesWithId,
      };

      setLeaveData(safeData);

      logger.dev('휴가관리 데이터 로드 완료 - leaveStatus:', safeData.leaveStatus);

      // 초기 yearlyLeaves 설정 - 현재 연도 데이터로 필터링
      const currentYearLeaves = actualMonthlyLeavesWithId.filter((leave: any) => {
        const leaveYear = dayjs(leave.start_date || leave.startDate).year();
        return leaveYear === selectedYear;
      });
      setYearlyLeaves(currentYearLeaves);
      logger.dev('초기 연도별 휴가 내역 설정:', currentYearLeaves.length, '건');

      if (currentUser && currentUser.userId) {
        try {
          logger.dev('[LeaveManagementPage] 대기 건수 조회 시작, userId:', currentUser.userId);
          const count = await leaveService.getWaitingLeavesCount(currentUser.userId);
          logger.dev('[LeaveManagementPage] 대기 건수 조회 완료:', count);
          setWaitingCount(count);
          logger.dev('[LeaveManagementPage] waitingCount state 설정 완료:', count);
        } catch (err) {
          logger.error('[LeaveManagementPage] 대기 건수 조회 실패:', err);
          setWaitingCount(0);
        }
      }

    } catch (err: any) {
      logger.error('휴가관리 데이터 로드 실패:', err);
      logger.error('에러 상세:', err.response?.data);
      setError(err.response?.data?.message || err.message || '휴가관리 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: ReactMouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRequestDialogOpen = () => {
    setRequestDialogOpen(true);
  };

  const handleRequestDialogClose = () => {
    setRequestDialogOpen(false);
  };

  const handleOpenCancelDialog = () => {
    setCancelReasonDialogOpen(true);
  };

  const handleDetailModalCancelRequest = async () => {
    if (!user?.userId) {
      alert('사용자 정보를 찾을 수 없습니다.');
      return;
    }

    if (!selectedLeave?.id) {
      alert('휴가 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      const response = await leaveService.requestLeaveCancel({
        id: selectedLeave.id,
        userId: user.userId,
        reason: cancelReason.trim(),
      });

      if (response.error) {
        alert(`취소 상신 실패: ${response.error}`);
        return;
      }

      alert('휴가 취소 상신이 완료되었습니다.');
      setCancelReasonDialogOpen(false);
      setDetailModalOpen(false);
      setCancelReason('');
      loadLeaveData();
    } catch (error: any) {
      alert(`취소 상신 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const handleCancelRequest = async () => {
    if (!cancelRequestLeave) return;

    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        setError('사용자 정보를 찾을 수 없습니다.');
        return;
      }

      const cancelRequest: LeaveCancelRequest = {
        id: cancelRequestLeave.id,
        userId: currentUser.userId,
      };

      const response = await leaveService.cancelLeaveRequestNew(cancelRequest);

      if (response.error) {
        setError(`취소 상신 실패: ${response.error}`);
        return;
      }

      loadLeaveData();
      setCancelRequestModalOpen(false);
      setCancelRequestLeave(null);
      setError(null);
      alert('취소 상신이 완료되었습니다.');
    } catch (error: any) {
      logger.error('취소 상신 실패:', error);
      setError(error.message || '취소 상신에 실패했습니다.');
    }
  };

  return {
    state: {
      user,
      fromAdmin,
      isApprover,
      tabValue,
      loading,
      error,
      leaveData,
      waitingCount,
      selectedYear,
      yearlyLeaves,
      yearlyLoading,
      requestDialogOpen,
      cancelRequestModalOpen,
      cancelRequestLeave,
      detailModalOpen,
      selectedLeave,
      cancelReasonDialogOpen,
      cancelReason,
      recommendationOpen,
      hideCanceled,
      leaveManualOpen,
      leaveAIManualOpen,
      menuAnchorEl,
      menuOpen,
    },
    actions: {
      setTabValue,
      setLoading,
      setError,
      setLeaveData,
      setWaitingCount,
      setSelectedYear,
      setYearlyLeaves,
      setYearlyLoading,
      setRequestDialogOpen,
      setCancelRequestModalOpen,
      setCancelRequestLeave,
      setDetailModalOpen,
      setSelectedLeave,
      setCancelReasonDialogOpen,
      setCancelReason,
      setRecommendationOpen,
      setHideCanceled,
      setLeaveManualOpen,
      setLeaveAIManualOpen,
      setMenuAnchorEl,
      loadLeaveData,
      loadYearlyLeaveData,
      handleMenuOpen,
      handleMenuClose,
      handleTabChange,
      handleRequestDialogOpen,
      handleRequestDialogClose,
      handleOpenCancelDialog,
      handleDetailModalCancelRequest,
      handleCancelRequest,
    },
  };
};

export type LeaveManagementPageStateHook = ReturnType<typeof useLeaveManagementPageState>;
