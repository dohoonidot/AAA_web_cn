import { useEffect, useState } from 'react';
import type { SyntheticEvent } from 'react';
import dayjs from 'dayjs';

export interface ApprovalRequest {
  id: string;
  title: string;
  type: string;
  content: string;
  amount?: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  submittedAt?: string;
  approvedAt?: string;
  approver?: string;
  comments?: string;
}

export const useApprovalPageState = () => {
  const [tabValue, setTabValue] = useState(0);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRequest, setEditingRequest] = useState<ApprovalRequest | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    content: '',
    amount: '',
  });

  const approvalTypes = [
    { value: 'purchase', label: '구매 요청' },
    { value: 'contract', label: '계약 승인' },
    { value: 'expense', label: '경비 지출' },
    { value: 'vacation', label: '휴가 신청' },
    { value: 'business', label: '출장 신청' },
    { value: 'other', label: '기타' },
  ];

  useEffect(() => {
    setApprovalRequests([
      {
        id: '1',
        title: '사무용품 구매 요청',
        type: 'purchase',
        content: '사무용품 구매를 위한 결재 요청입니다.',
        amount: 500000,
        status: 'approved',
        createdAt: '2024-01-10',
        submittedAt: '2024-01-10',
        approvedAt: '2024-01-12',
        approver: '김부장',
        comments: '승인합니다.',
      },
      {
        id: '2',
        title: '출장 신청',
        type: 'business',
        content: '고객사 방문을 위한 출장 신청입니다.',
        status: 'pending',
        createdAt: '2024-01-15',
        submittedAt: '2024-01-15',
      },
      {
        id: '3',
        title: '경비 지출 요청',
        type: 'expense',
        content: '회식비 지출 요청입니다.',
        amount: 200000,
        status: 'draft',
        createdAt: '2024-01-18',
      },
    ]);
  }, []);

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (request?: ApprovalRequest) => {
    if (request) {
      setEditingRequest(request);
      setFormData({
        title: request.title,
        type: request.type,
        content: request.content,
        amount: request.amount?.toString() || '',
      });
    } else {
      setEditingRequest(null);
      setFormData({
        title: '',
        type: '',
        content: '',
        amount: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRequest(null);
    setFormData({
      title: '',
      type: '',
      content: '',
      amount: '',
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.type || !formData.content) {
      return;
    }

    if (editingRequest) {
      setApprovalRequests(prev =>
        prev.map(req =>
          req.id === editingRequest.id
            ? {
                ...req,
                title: formData.title,
                type: formData.type,
                content: formData.content,
                amount: formData.amount ? parseInt(formData.amount) : undefined,
              }
            : req
        )
      );
    } else {
      const newRequest: ApprovalRequest = {
        id: Date.now().toString(),
        title: formData.title,
        type: formData.type,
        content: formData.content,
        amount: formData.amount ? parseInt(formData.amount) : undefined,
        status: 'draft',
        createdAt: dayjs().format('YYYY-MM-DD'),
      };
      setApprovalRequests(prev => [newRequest, ...prev]);
    }

    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    setApprovalRequests(prev => prev.filter(req => req.id !== id));
  };

  const handleSubmitApproval = (id: string) => {
    setApprovalRequests(prev =>
      prev.map(req =>
        req.id === id
          ? { ...req, status: 'pending', submittedAt: dayjs().format('YYYY-MM-DD') }
          : req
      )
    );
  };

  const handleApprove = (id: string) => {
    setApprovalRequests(prev =>
      prev.map(req =>
        req.id === id
          ? {
              ...req,
              status: 'approved',
              approvedAt: dayjs().format('YYYY-MM-DD'),
              approver: '김부장',
              comments: '승인합니다.'
            }
          : req
      )
    );
  };

  const handleReject = (id: string) => {
    setApprovalRequests(prev =>
      prev.map(req =>
        req.id === id
          ? {
              ...req,
              status: 'rejected',
              approvedAt: dayjs().format('YYYY-MM-DD'),
              approver: '김부장',
              comments: '거부합니다.'
            }
          : req
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return '승인';
      case 'rejected': return '거부';
      case 'pending': return '대기';
      default: return '임시저장';
    }
  };

  const getTypeLabel = (type: string) => {
    return approvalTypes.find(t => t.value === type)?.label || type;
  };

  const draftRequests = approvalRequests.filter(req => req.status === 'draft');
  const pendingRequests = approvalRequests.filter(req => req.status === 'pending');
  const approvedRequests = approvalRequests.filter(req => req.status === 'approved');
  const rejectedRequests = approvalRequests.filter(req => req.status === 'rejected');

  return {
    state: {
      tabValue,
      approvalRequests,
      openDialog,
      editingRequest,
      formData,
      approvalTypes,
      draftRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
    },
    actions: {
      setTabValue,
      setApprovalRequests,
      setOpenDialog,
      setEditingRequest,
      setFormData,
      handleTabChange,
      handleOpenDialog,
      handleCloseDialog,
      handleSubmit,
      handleDelete,
      handleSubmitApproval,
      handleApprove,
      handleReject,
      getStatusColor,
      getStatusLabel,
      getTypeLabel,
    },
  };
};

export type ApprovalPageStateHook = ReturnType<typeof useApprovalPageState>;
