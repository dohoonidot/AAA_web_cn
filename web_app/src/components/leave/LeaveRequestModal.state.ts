import { useCallback, useEffect, useState } from 'react';
import authService from '../../services/authService';
import leaveService from '../../services/leaveService';
import { createLogger } from '../../utils/logger';
import type { LeaveStatus } from '../../types/leave';

const logger = createLogger('LeaveRequestModal');

interface ApprovalLineData {
  approverName: string;
  approverId: string;
  approvalSeq: number;
}

interface CcPersonData {
  name: string;
  userId: string;
  department: string;
}

interface LeaveStatusData {
  leaveType: string;
  totalDays: number;
  remainDays: number;
}

export const useLeaveRequestModalState = ({
  open,
  onClose,
  onSubmit,
  leaveStatusList: propLeaveStatusList,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  leaveStatusList?: LeaveStatus[];
}) => {
  const user = authService.getCurrentUser();

  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [approvalLine, setApprovalLine] = useState<ApprovalLineData[]>([]);
  const [ccList, setCcList] = useState<CcPersonData[]>([]);
  const [isLeaveBalanceExpanded, setIsLeaveBalanceExpanded] = useState(true);
  const [isSequentialApproval, setIsSequentialApproval] = useState(false);

  const [useNextYear, setUseNextYear] = useState(false);
  const [halfDay, setHalfDay] = useState(false);
  const [halfDayPeriod, setHalfDayPeriod] = useState<'AM' | 'PM'>('AM');
  const [userName, setUserName] = useState('');
  const [leaveStatusList, setLeaveStatusList] = useState<LeaveStatusData[]>([]);
  const [nextYearLeaveTypes, setNextYearLeaveTypes] = useState<string[]>([]);
  const [nextYearLeaveStatus, setNextYearLeaveStatus] = useState<
    Array<{ leaveType: string; totalDays: number; remainDays: number }>
  >([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isApproverModalOpen, setIsApproverModalOpen] = useState(false);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);

  const loadInitialData = useCallback(async () => {
    if (!user?.userId) return;

    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser?.name) {
        setUserName(currentUser.name);
      } else {
        logger.warn('사용자 정보 없음, userId 사용:', user.userId);
        setUserName(user.userId);
      }

      try {
        const approvalLineData = await leaveService.loadApprovalLine(user.userId);

        if (approvalLineData.approvalLine && approvalLineData.approvalLine.length > 0) {
          logger.dev('저장된 결재라인 불러옴:', approvalLineData.approvalLine);
          const loadedApprovalLine: ApprovalLineData[] = approvalLineData.approvalLine.map((item) => ({
            approverName: item.approverName,
            approverId: item.approverId,
            approvalSeq: item.approvalSeq,
          }));
          setApprovalLine(loadedApprovalLine);
        }

        if (approvalLineData.ccList && approvalLineData.ccList.length > 0) {
          logger.dev('저장된 참조자 불러옴:', approvalLineData.ccList);
          const loadedCcList: CcPersonData[] = approvalLineData.ccList.map((item) => ({
            name: item.name,
            userId: item.userId,
            department: '',
          }));
          setCcList(loadedCcList);
        }
      } catch (error) {
        logger.dev('저장된 결재라인 없음 (사용자가 직접 선택)');
      }

      if (propLeaveStatusList && propLeaveStatusList.length > 0) {
        logger.dev('props에서 받은 휴가 현황 사용:', propLeaveStatusList);
        const convertedData: LeaveStatusData[] = propLeaveStatusList.map((item: any) => ({
          leaveType: item.leaveType || item.leave_type,
          totalDays: item.totalDays || item.total_days,
          remainDays: item.remainDays || item.remain_days,
        }));
        setLeaveStatusList(convertedData);
      } else {
        try {
          const leaveManagementData = await leaveService.getLeaveManagement(user.userId);
          if (leaveManagementData.leaveStatus) {
            logger.dev('API에서 조회한 휴가 현황 사용:', leaveManagementData.leaveStatus);
            const leaveStatusData = leaveManagementData.leaveStatus.map((item) => ({
              leaveType: item.leaveType,
              totalDays: item.totalDays,
              remainDays: item.remainDays,
            }));
            setLeaveStatusList(leaveStatusData);
          }
        } catch (error) {
          logger.error('휴가 현황 조회 실패:', error);
        }
      }

      setIsDataLoaded(true);
    } catch (error) {
      logger.error('초기 데이터 로드 실패:', error);
      setIsDataLoaded(true);
    }
  }, [propLeaveStatusList, user?.userId]);

  useEffect(() => {
    if (open && user && !isDataLoaded) {
      logger.dev('모달 열림');
      loadInitialData();
    }
  }, [isDataLoaded, loadInitialData, open, user]);

  useEffect(() => {
    if (!open) {
      setIsDataLoaded(false);
    }
  }, [open]);

  const handleApproverConfirm = (selectedApproverIds: string[], selectedApprovers: any[]) => {
    logger.dev('선택된 승인자 IDs:', selectedApproverIds);
    logger.dev('선택된 승인자 정보:', selectedApprovers);
    const approvalLineData: ApprovalLineData[] = selectedApprovers.map((approver, index) => ({
      approverName: approver.approverName,
      approverId: approver.approverId,
      approvalSeq: index + 1,
    }));
    setApprovalLine(approvalLineData);
    setIsApproverModalOpen(false);
  };

  const handleReferenceConfirm = (selectedReferences: any[]) => {
    logger.dev('선택된 참조자:', selectedReferences);
    const ccListData: CcPersonData[] = selectedReferences.map((ref) => ({
      name: ref.name,
      userId: ref.userId || ref.user_id || '',
      department: ref.department,
    }));
    setCcList(ccListData);
    setIsReferenceModalOpen(false);
  };

  const handleSaveApprovalLine = async () => {
    if (!user?.userId) {
      alert('사용자 정보를 찾을 수 없습니다.');
      return;
    }

    if (!approvalLine || approvalLine.length === 0) {
      alert('승인자를 선택해주세요.');
      return;
    }

    try {
      const requestApprovalLine = approvalLine.map((item, index, arr) => ({
        approverId: item.approverId,
        nextApproverId: index < arr.length - 1 ? arr[index + 1].approverId : '',
        approvalSeq: index + 1,
        approverName: item.approverName,
      }));

      const requestCcList = (ccList || []).map((item) => ({
        name: item.name,
        userId: item.userId || '',
        department: item.department || '',
        jobPosition: '',
      }));

      const result = await leaveService.saveApprovalLine({
        userId: user.userId,
        approvalLine: requestApprovalLine,
        ccList: requestCcList,
      });

      if (result.error) {
        alert(`결재라인 저장 실패: ${result.error}`);
      } else {
        alert('결재라인이 저장되었습니다.');
      }
    } catch (error: any) {
      logger.error('결재라인 저장 실패:', error);
      alert(`결재라인 저장 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const handleNextYearCheckbox = async (checked: boolean) => {
    setUseNextYear(checked);

    if (checked && user?.userId) {
      try {
        const nextYearData = await leaveService.getNextYearLeaveStatus(user.userId);
        logger.dev('내년 정기휴가 조회:', nextYearData);

        const leaveStatusData = nextYearData.leave_status || nextYearData.leaveStatus;
        if (leaveStatusData && leaveStatusData.length > 0) {
          const statusWithDays = leaveStatusData.map((item: any) => ({
            leaveType: item.leave_type || item.leaveType,
            totalDays: item.total_days || item.totalDays,
            remainDays: item.remain_days || item.remainDays,
          }));
          setNextYearLeaveStatus(statusWithDays);

          const leaveTypes = statusWithDays.map((item: any) => item.leaveType);
          setNextYearLeaveTypes(leaveTypes);
        }
      } catch (error) {
        logger.error('내년 정기휴가 조회 실패:', error);
      }
    } else {
      setNextYearLeaveTypes([]);
      setNextYearLeaveStatus([]);
    }
  };

  const handleSubmit = async (reasonOverride?: string) => {
    if (!user?.userId) {
      alert('사용자 정보를 찾을 수 없습니다.');
      return;
    }

    if (!leaveType) {
      alert('휴가 종류를 선택해주세요.');
      return;
    }

    if (!startDate || !endDate) {
      alert('시작일과 종료일을 선택해주세요.');
      return;
    }

    if (!approvalLine || approvalLine.length === 0) {
      alert('승인자를 선택해주세요.');
      return;
    }

    try {
      setIsLoading(true);

      const formatDateForApi = (dateStr: string): string => {
        // 로컬 시간을 ISO 형식으로 변환 (타임존 변환 없음)
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
      };

      const getHalfDaySlotValue = (): string => {
        if (halfDay && halfDayPeriod === 'AM') return 'AM';
        if (halfDay && halfDayPeriod === 'PM') return 'PM';
        return 'ALL';
      };

      const apiApprovalLine = approvalLine.map((item, index, arr) => ({
        approverId: item.approverId,
        nextApproverId: index < arr.length - 1 ? arr[index + 1].approverId : '',
        approvalSeq: index + 1,
        approverName: item.approverName,
      }));

      const request = {
        userId: user.userId,
        leaveType,
        startDate: formatDateForApi(startDate),
        endDate: formatDateForApi(endDate),
        approvalLine: apiApprovalLine,
        ccList: ccList.map((cc) => ({
          name: cc.name,
          department: cc.department || '',
          userId: cc.userId || (cc as any).user_id || '',
        })),
        reason: (reasonOverride ?? reason).trim(),
        halfDaySlot: getHalfDaySlotValue(),
        isNextYear: useNextYear ? 1 : 0,
      };

      await leaveService.submitLeaveRequest(request);
      alert('휴가 신청이 완료되었습니다.');
      handleClose();
      onSubmit();
    } catch (error: any) {
      logger.error('휴가 신청 실패:', error);
      alert(`휴가 신청 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setLeaveType('');
    setStartDate('');
    setEndDate('');
    setReason('');
    setUseNextYear(false);
    setHalfDay(false);
    setHalfDayPeriod('AM');
    setIsDataLoaded(false);
    onClose();
  };

  const toggleLeaveBalance = () => {
    setIsLeaveBalanceExpanded(!isLeaveBalanceExpanded);
  };

  return {
    state: {
      leaveType,
      startDate,
      endDate,
      reason,
      approvalLine,
      ccList,
      isLeaveBalanceExpanded,
      isSequentialApproval,
      useNextYear,
      halfDay,
      halfDayPeriod,
      userName,
      leaveStatusList,
      nextYearLeaveTypes,
      nextYearLeaveStatus,
      isDataLoaded,
      isLoading,
      isApproverModalOpen,
      isReferenceModalOpen,
    },
    actions: {
      setLeaveType,
      setStartDate,
      setEndDate,
      setReason,
      setApprovalLine,
      setCcList,
      setIsLeaveBalanceExpanded,
      setIsSequentialApproval,
      setUseNextYear,
      setHalfDay,
      setHalfDayPeriod,
      setIsApproverModalOpen,
      setIsReferenceModalOpen,
      handleApproverConfirm,
      handleReferenceConfirm,
      handleSaveApprovalLine,
      handleNextYearCheckbox,
      handleSubmit,
      handleClose,
      toggleLeaveBalance,
    },
  };
};

export type LeaveRequestModalStateHook = ReturnType<typeof useLeaveRequestModalState>;
