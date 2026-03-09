import { useCallback, useEffect, useState } from 'react';
import authService from '../../services/authService';
import leaveService from '../../services/leaveService';
import { useLeaveRequestDraftStore } from '../../store/leaveRequestDraftStore';
import { createLogger } from '../../utils/logger';
import type { ApprovalLineData, CcPersonData, LeaveStatusData } from '../../types/leaveRequest';

const logger = createLogger('LeaveRequestDraftPanel');

export const useLeaveRequestDraftPanelState = () => {
  const user = authService.getCurrentUser();
  const {
    isOpen,
    isLoading,
    formData,
    closePanel,
    updateFormData,
    isLeaveBalanceExpanded,
    toggleLeaveBalance,
    isSequentialApproval,
    setSequentialApproval,
    setApprovalLine,
    setCcList,
  } = useLeaveRequestDraftStore();

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

  const [isApproverModalOpen, setIsApproverModalOpen] = useState(false);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);

  const normalizeHalfDaySlot = (value?: string): 'ALL' | 'AM' | 'PM' => {
    if (value === 'AM' || value === 'PM' || value === 'ALL') return value;
    return 'ALL';
  };

  useEffect(() => {
    if (!formData) return;
    const slot = normalizeHalfDaySlot((formData as any).halfDaySlot || (formData as any).half_day_slot);
    if (slot === 'AM' || slot === 'PM') {
      setHalfDay(true);
      setHalfDayPeriod(slot);
    } else {
      setHalfDay(false);
      setHalfDayPeriod('AM');
    }
  }, [formData]);

  const loadInitialData = useCallback(async () => {
    if (!user?.userId || !formData) return;

    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser?.name) {
        setUserName(currentUser.name);
      } else {
        logger.warn('[Leave Draft Panel] 사용자 정보 없음, userId 사용:', user.userId);
        setUserName(user.userId);
      }

      if (formData.approvalLine && formData.approvalLine.length > 0) {
        logger.dev('[Leave Draft Panel] 채팅 트리거로부터 받은 결재라인 사용:', formData.approvalLine);
        setApprovalLine(formData.approvalLine);
      } else {
        try {
          const approvalLineData = await leaveService.loadApprovalLine(user.userId);

          if (approvalLineData.approvalLine && approvalLineData.approvalLine.length > 0) {
            logger.dev('[Leave Draft Panel] 저장된 결재라인 불러옴:', approvalLineData.approvalLine);
            const approvalLine: ApprovalLineData[] = approvalLineData.approvalLine.map((item) => ({
              approverName: item.approverName,
              approverId: item.approverId,
              approvalSeq: item.approvalSeq,
            }));
            setApprovalLine(approvalLine);
          }
        } catch (error) {
          logger.dev('[Leave Draft Panel] 저장된 결재라인 없음 (사용자가 직접 선택)');
        }
      }

      if (formData.ccList && formData.ccList.length > 0) {
        logger.dev('[Leave Draft Panel] 채팅 트리거로부터 받은 참조자 사용:', formData.ccList);
        setCcList(formData.ccList);
      } else {
        try {
          const approvalLineData = await leaveService.loadApprovalLine(user.userId);

          if (approvalLineData.ccList && approvalLineData.ccList.length > 0) {
            logger.dev('[Leave Draft Panel] 저장된 참조자 불러옴:', approvalLineData.ccList);
            const ccList: CcPersonData[] = approvalLineData.ccList.map((item) => ({
              name: item.name,
              userId: item.userId,
              department: '',
            }));
            setCcList(ccList);
          }
        } catch (error) {
          logger.dev('[Leave Draft Panel] 저장된 참조자 없음');
        }
      }

      if (formData.leaveStatus && formData.leaveStatus.length > 0) {
        logger.dev('[Leave Draft Panel] formData에서 받은 휴가 현황 사용:', formData.leaveStatus);
        setLeaveStatusList(formData.leaveStatus);
      } else {
        try {
          const leaveManagementData = await leaveService.getLeaveManagement(user.userId);
          if (leaveManagementData.leaveStatus) {
            logger.dev('[Leave Draft Panel] API에서 조회한 휴가 현황 사용:', leaveManagementData.leaveStatus);
            const leaveStatusData = leaveManagementData.leaveStatus.map((item) => ({
              leaveType: item.leaveType,
              totalDays: item.totalDays,
              remainDays: item.remainDays,
            }));
            setLeaveStatusList(leaveStatusData);
            updateFormData({ leaveStatus: leaveStatusData });
          }
        } catch (error) {
          logger.error('[Leave Draft Panel] 휴가 현황 조회 실패:', error);
        }
      }

      setIsDataLoaded(true);
    } catch (error) {
      logger.error('[Leave Draft Panel] 초기 데이터 로드 실패:', error);
      setIsDataLoaded(true);
    }
  }, [formData, updateFormData, user?.userId, setApprovalLine, setCcList]);

  useEffect(() => {
    if (isOpen && user && !isDataLoaded) {
      logger.dev('[Leave Draft Panel] 패널 열림:', formData);
      loadInitialData();
    }
  }, [formData, isDataLoaded, isOpen, loadInitialData, user]);

  useEffect(() => {
    if (!isOpen) {
      setIsDataLoaded(false);
    }
  }, [isOpen]);

  const handleApproverConfirm = (selectedApproverIds: string[], selectedApprovers: any[]) => {
    logger.dev('[Leave Draft Panel] 선택된 승인자 IDs:', selectedApproverIds);
    logger.dev('[Leave Draft Panel] 선택된 승인자 정보:', selectedApprovers);
    const approvalLine: ApprovalLineData[] = selectedApprovers.map((approver, index) => ({
      approverName: approver.approverName,
      approverId: approver.approverId,
      approvalSeq: index + 1,
    }));
    updateFormData({ approvalLine });
    setIsApproverModalOpen(false);
  };

  const handleReferenceConfirm = (selectedReferences: any[]) => {
    logger.dev('[Leave Draft Panel] 선택된 참조자:', selectedReferences);
    const ccList: CcPersonData[] = selectedReferences.map((ref) => ({
      name: ref.name,
      userId: ref.userId || ref.user_id || '',
      department: ref.department,
    }));
    updateFormData({ ccList });
    setIsReferenceModalOpen(false);
  };

  const handleSaveApprovalLine = async () => {
    if (!user?.userId) {
      alert('사용자 정보를 찾을 수 없습니다.');
      return;
    }

    if (!formData || !formData.approvalLine || formData.approvalLine.length === 0) {
      alert('승인자를 선택해주세요.');
      return;
    }

    try {
      logger.dev('[Leave Draft Panel] 결재라인 저장 시작:', {
        approvalLine: formData.approvalLine,
        ccList: formData.ccList,
        isSequentialApproval,
      });

      const approvalLine = formData.approvalLine.map((item, index, arr) => ({
        approverId: item.approverId,
        nextApproverId: index < arr.length - 1 ? arr[index + 1].approverId : '',
        approvalSeq: index + 1,
        approverName: item.approverName,
      }));

      const normalizeCcList = (list: typeof formData.ccList) => {
        const normalized: Array<{ name: string; userId: string; department?: string; jobPosition?: string }> = [];
        const seen = new Set<string>();
        let dropped = 0;

        (list || []).forEach((item) => {
          const userId = String(item.userId || (item as any).user_id || '').trim();
          const name = String(item.name || '').trim();
          if (!userId || !name) {
            dropped += 1;
            return;
          }
          if (seen.has(userId)) return;
          seen.add(userId);
          normalized.push({
            name,
            userId,
            department: item.department || '',
            jobPosition: '',
          });
        });

        return { normalized, dropped };
      };

      const { normalized: ccList, dropped } = normalizeCcList(formData.ccList);

      const result = await leaveService.saveApprovalLine({
        userId: user.userId,
        approvalLine,
        ccList,
      });

      if (result.error) {
        alert(`결재라인 저장 실패: ${result.error}`);
      } else {
        alert(
          dropped > 0
            ? `결재라인이 저장되었습니다. (사번 없는 참조자 ${dropped}명 제외)`
            : '결재라인이 저장되었습니다.'
        );
      }
    } catch (error: any) {
      logger.error('[Leave Draft Panel] 결재라인 저장 실패:', error);
      alert(`결재라인 저장 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const handleSubmit = async (reasonOverride?: string) => {
    if (!user?.userId) {
      alert('사용자 정보를 찾을 수 없습니다.');
      return;
    }

    if (!formData) return;

    if (!formData.leaveType) {
      alert('휴가 종류를 선택해주세요.');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      alert('시작일과 종료일을 선택해주세요.');
      return;
    }

    if (!formData.approvalLine || formData.approvalLine.length === 0) {
      alert('승인자를 선택해주세요.');
      return;
    }

    try {
      logger.dev('[Leave Draft Panel] 휴가 신청 시작:', formData);

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

      const apiApprovalLine = formData.approvalLine.map((item, index, arr) => ({
        approverId: item.approverId,
        nextApproverId: index < arr.length - 1 ? arr[index + 1].approverId : '',
        approvalSeq: index + 1,
        approverName: item.approverName,
      }));

      const request = {
        userId: user.userId,
        leaveType: formData.leaveType,
        startDate: formatDateForApi(formData.startDate),
        endDate: formatDateForApi(formData.endDate),
        approvalLine: apiApprovalLine,
        ccList: (() => {
          const normalized: Array<{ name: string; department: string; userId: string }> = [];
          const seen = new Set<string>();
          (formData.ccList || []).forEach((cc) => {
            const userId = String(cc.userId || (cc as any).user_id || '').trim();
            const name = String(cc.name || '').trim();
            if (!userId || !name) return;
            if (seen.has(userId)) return;
            seen.add(userId);
            normalized.push({
              name,
              department: cc.department || '',
              userId,
            });
          });
          return normalized;
        })(),
        reason: (reasonOverride ?? formData.reason).trim(),
        halfDaySlot: getHalfDaySlotValue(),
        isNextYear: useNextYear ? 1 : 0,
      };

      logger.dev('[Leave Draft Panel] API 요청 데이터:', request);

      await leaveService.submitLeaveRequest(request);
      alert('휴가 신청이 완료되었습니다.');
      closePanel();
    } catch (error: any) {
      logger.error('[Leave Draft Panel] 휴가 신청 실패:', error);
      alert(`휴가 신청 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const handleNextYearCheckbox = async (checked: boolean) => {
    setUseNextYear(checked);
    updateFormData({ useNextYearLeave: checked });

    if (checked && user?.userId) {
      try {
        const nextYearData = await leaveService.getNextYearLeaveStatus(user.userId);
        logger.dev('[Leave Draft Panel] 내년 정기휴가 조회:', nextYearData);

        const leaveStatusData = nextYearData.leave_status || nextYearData.leaveStatus;
        if (leaveStatusData && leaveStatusData.length > 0) {
          const statusWithDays = leaveStatusData.map((item: any) => ({
            leaveType: item.leave_type || item.leaveType,
            totalDays: item.total_days || item.totalDays,
            remainDays: item.remain_days || item.remainDays,
          }));
          logger.dev('[Leave Draft Panel] 내년 휴가 현황 설정:', statusWithDays);
          setNextYearLeaveStatus(statusWithDays);

          const leaveTypes = statusWithDays.map((item: any) => item.leaveType);
          setNextYearLeaveTypes(leaveTypes);
        }
      } catch (error) {
        logger.error('[Leave Draft Panel] 내년 정기휴가 조회 실패:', error);
      }
    } else {
      setNextYearLeaveTypes([]);
      setNextYearLeaveStatus([]);
    }
  };

  return {
    state: {
      isOpen,
      isLoading,
      formData,
      isLeaveBalanceExpanded,
      isSequentialApproval,
      useNextYear,
      halfDay,
      halfDayPeriod,
      userName,
      leaveStatusList,
      nextYearLeaveTypes,
      nextYearLeaveStatus,
      isApproverModalOpen,
      isReferenceModalOpen,
    },
    actions: {
      closePanel,
      updateFormData,
      toggleLeaveBalance,
      setSequentialApproval,
      setApprovalLine,
      setCcList,
      setUseNextYear,
      setHalfDay,
      setHalfDayPeriod,
      setIsApproverModalOpen,
      setIsReferenceModalOpen,
      handleApproverConfirm,
      handleReferenceConfirm,
      handleSaveApprovalLine,
      handleSubmit,
      handleNextYearCheckbox,
    },
  };
};

export type LeaveRequestDraftPanelStateHook = ReturnType<typeof useLeaveRequestDraftPanelState>;
