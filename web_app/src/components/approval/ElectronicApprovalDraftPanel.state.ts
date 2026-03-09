import { useEffect, useState } from 'react';
import authService from '../../services/authService';
import { useElectronicApprovalStore } from '../../store/electronicApprovalStore';
import type { EApprovalAttachment, EApprovalCcPerson, EApprovalDraftData } from '../../types/eapproval';
import { LIMIT_APPROVAL_TYPE } from '../../config/env.config';
import {
  APPROVAL_TYPES_ALL,
  APPROVAL_TYPES_PROD,
  getApprovalTypeLabel,
  getApprovalTypeValue,
} from './ElectronicApprovalDraftPanel.shared';
import {
  fetchDepartments,
  loadApprovalLine,
  saveApprovalLine,
  submitLeaveGrantRequest,
} from './ElectronicApprovalDraftPanel.data';

export const useElectronicApprovalDraftState = () => {
  const user = authService.getCurrentUser();
  const {
    isOpen,
    isLoading,
    pendingData,
    closePanel,
    setLoading,
    clearPendingData,
  } = useElectronicApprovalStore();

  const [approvalType, setApprovalType] = useState('');
  const [draftingDepartment, setDraftingDepartment] = useState('');
  const [isCustomDepartment, setIsCustomDepartment] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(false);
  const [retentionPeriod, setRetentionPeriod] = useState('영구');
  const [draftingDate, setDraftingDate] = useState(new Date().toISOString().slice(0, 10));
  const [documentTitle, setDocumentTitle] = useState('');
  const [content, setContent] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [grantDays, setGrantDays] = useState('');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [approvers, setApprovers] = useState<Array<{
    approverId: string;
    approverName: string;
    approvalSeq: number;
    department?: string;
    jobPosition?: string;
  }>>([]);
  const [ccList, setCcList] = useState<EApprovalCcPerson[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [chatAttachments, setChatAttachments] = useState<EApprovalAttachment[]>([]);
  const [isApproverModalOpen, setIsApproverModalOpen] = useState(false);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [isSequentialApproval, setIsSequentialApproval] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const normalizeCcList = (list: Array<EApprovalCcPerson & { userId?: string }>) => {
    const normalized: Array<{ user_id: string; name: string }> = [];
    const seen = new Set<string>();
    let dropped = 0;

    list.forEach((item) => {
      const userId = (item.user_id || item.userId || '').trim();
      const name = (item.name || '').trim();
      if (!userId || !name) {
        dropped += 1;
        return;
      }
      if (seen.has(userId)) return;
      seen.add(userId);
      normalized.push({ user_id: userId, name });
    });

    return { normalized, dropped };
  };

  const approvalOptions = LIMIT_APPROVAL_TYPE ? APPROVAL_TYPES_PROD : APPROVAL_TYPES_ALL;

  useEffect(() => {
    if (!isOpen) {
      clearPendingData();
      return;
    }

    const init = async (data?: EApprovalDraftData | null) => {
      setLoading(true);
      setIsDepartmentsLoading(true);
      try {
        const deptList = await fetchDepartments();
        setDepartments(deptList || []);
        setIsDepartmentsLoading(false);

        const initialApprovalType = getApprovalTypeLabel(data?.approval_type) || '휴가 부여 상신';
        const resolvedApprovalType = LIMIT_APPROVAL_TYPE && initialApprovalType !== '휴가 부여 상신'
          ? '휴가 부여 상신'
          : initialApprovalType;
        setApprovalType(resolvedApprovalType);
        setDraftingDepartment(data?.department || '');
        setDocumentTitle(data?.title || '');
        setContent(data?.content || '');
        setLeaveType(data?.leave_type || '');
        setGrantDays(data?.grant_days ? String(data.grant_days) : '');
        setReason(data?.reason || '');
        setStartDate(data?.start_date || '');
        setEndDate(data?.end_date || '');
        setChatAttachments(data?.attachments_list || []);

        if (data?.approval_line && data.approval_line.length > 0) {
          setApprovers(
            data.approval_line.map((item, index) => ({
              approverId: item.approver_id || item.approver_id || '',
              approverName: item.approver_name || item.approver_name || '',
              approvalSeq: item.approval_seq || item.approval_seq || index + 1,
              department: item.department,
              jobPosition: item.job_position || item.job_position,
            }))
          );
        } else if (user?.userId) {
          const saved = await loadApprovalLine(user.userId, 'hr_leave_grant');
          setApprovers(saved.approvalLine || []);
          setCcList(saved.ccList || []);
        }

        if (data?.cc_list && data.cc_list.length > 0) {
          setCcList(data.cc_list);
        }
      } finally {
        setLoading(false);
        setIsDepartmentsLoading(false);
      }
    };

    init(pendingData);
  }, [isOpen, pendingData, user?.userId, approvalOptions, clearPendingData, setLoading]);

  const handleAttachmentSelect = (files: FileList | null) => {
    if (!files) return;
    setAttachments((prev) => [...prev, ...Array.from(files)]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveChatAttachment = (index: number) => {
    setChatAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApproverConfirm = (_ids: string[], selectedApprovers: any[]) => {
    const next = selectedApprovers.map((approver, index) => ({
      approverId: approver.approverId,
      approverName: approver.approverName,
      approvalSeq: index + 1,
      department: approver.department,
      jobPosition: approver.jobPosition,
    }));
    setApprovers(next);
    setIsApproverModalOpen(false);
  };

  const handleSaveApprovalLine = async () => {
    if (!user?.userId || approvers.length === 0) return;
    try {
      const { normalized, dropped } = normalizeCcList(ccList as Array<EApprovalCcPerson & { userId?: string }>);
      await saveApprovalLine({
        userId: user.userId,
        approvalType: 'hr_leave_grant',
        approvalLine: approvers.map((item) => ({
          approverId: item.approverId,
          approverName: item.approverName,
          approvalSeq: item.approvalSeq,
          department: item.department,
          jobPosition: item.jobPosition,
        })),
        ccList: normalized,
      });
      setSnackbarSeverity('success');
      setSnackbarMessage(
        dropped > 0
          ? `결재라인이 저장되었습니다. (사번 없는 참조자 ${dropped}명 제외)`
          : '결재라인이 저장되었습니다.'
      );
      setSnackbarOpen(true);
    } catch (error: any) {
      setSnackbarSeverity('error');
      setSnackbarMessage(error?.message || '결재라인 저장에 실패했습니다.');
      setSnackbarOpen(true);
    }
  };

  const handleSubmit = async () => {
    if (!draftingDepartment.trim() || !approvalType) {
      alert('기안부서와 결재 종류를 입력해주세요.');
      return;
    }
    if (!documentTitle.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (approvers.length === 0) {
      alert('승인자를 선택해주세요.');
      return;
    }

    const confirmed = window.confirm('전자결재를 상신하시겠습니까?');
    if (!confirmed) return;

    setLoading(true);
    try {
      if (approvalType === '휴가 부여 상신') {
        if (!leaveType) {
          alert('휴가 종류를 선택해주세요.');
          return;
        }
        const grant = Number(grantDays || 0);
        if (!grant) {
          alert('휴가 부여 일수를 입력해주세요.');
          return;
        }

        const now = new Date();
        const pad2 = (value: number) => String(value).padStart(2, '0');
        // Match Flutter behavior: local time string without milliseconds, then append 'Z'
        const approvalDate =
          `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}` +
          `T${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}Z`;

        const requestPayload = {
          userId: user?.userId || '',
          department: draftingDepartment,
          approvalDate,
          approvalType: getApprovalTypeValue(approvalType),
          approvalLine: approvers.map((item) => ({
            approverId: item.approverId,
            approverName: item.approverName,
            approvalSeq: item.approvalSeq,
            department: item.department,
            jobPosition: item.jobPosition,
          })),
          title: documentTitle,
          leaveType,
          grantDays: grant,
          reason: reason || '',
          attachmentsList: chatAttachments,
          ccList: normalizeCcList(ccList as Array<EApprovalCcPerson & { userId?: string }>).normalized,
          files: attachments,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        };
        await submitLeaveGrantRequest(requestPayload);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      closePanel();
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    if (isDepartmentsLoading) return;
    setIsDepartmentsLoading(true);
    try {
      const deptList = await fetchDepartments();
      setDepartments(deptList || []);
    } finally {
      setIsDepartmentsLoading(false);
    }
  };

  const handleReset = () => {
    setDraftingDepartment('');
    setIsCustomDepartment(false);
    setRetentionPeriod('영구');
    setDraftingDate(new Date().toISOString().slice(0, 10));
    setDocumentTitle('');
    setContent('');
    setLeaveType('');
    setGrantDays('');
    setReason('');
    setAttachments([]);
    setChatAttachments([]);
  };

  return {
    state: {
      user,
      isOpen,
      isLoading,
      approvalType,
      draftingDepartment,
      isCustomDepartment,
      departments,
      isDepartmentsLoading,
      retentionPeriod,
      draftingDate,
      documentTitle,
      content,
      leaveType,
      grantDays,
      reason,
      approvers,
      ccList,
      attachments,
      chatAttachments,
      isApproverModalOpen,
      isReferenceModalOpen,
      isSequentialApproval,
      snackbarOpen,
      snackbarMessage,
      snackbarSeverity,
    },
    derived: {
      approvalOptions,
    },
    actions: {
      closePanel,
      setApprovalType,
      setDraftingDepartment,
      setIsCustomDepartment,
      loadDepartments,
      setRetentionPeriod,
      setDraftingDate,
      setDocumentTitle,
      setContent,
      setLeaveType,
      setGrantDays,
      setReason,
      setApprovers,
      setCcList,
      setAttachments,
      setChatAttachments,
      setIsApproverModalOpen,
      setIsReferenceModalOpen,
      setIsSequentialApproval,
      setSnackbarOpen,
      setSnackbarMessage,
      setSnackbarSeverity,
      handleAttachmentSelect,
      handleRemoveAttachment,
      handleRemoveChatAttachment,
      handleApproverConfirm,
      handleSaveApprovalLine,
      handleSubmit,
      handleReset,
    },
  };
};

export type ElectronicApprovalDraftStateHook = ReturnType<typeof useElectronicApprovalDraftState>;
