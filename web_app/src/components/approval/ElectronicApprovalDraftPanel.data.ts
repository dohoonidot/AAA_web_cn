import leaveService from '../../services/leaveService';
import departmentService from '../../services/departmentService';
import type { EApprovalAttachment } from '../../types/eapproval';

export const fetchDepartments = () => departmentService.getDepartmentList();

export const loadApprovalLine = (userId: string, approvalType: string) =>
  leaveService.loadEApprovalLine(userId, approvalType);

export const saveApprovalLine = (payload: {
  userId: string;
  approvalType: string;
  approvalLine: Array<{
    approverId: string;
    approverName: string;
    approvalSeq: number;
    department?: string;
    jobPosition?: string;
  }>;
  ccList: Array<{ user_id: string; name: string }>;
}) => leaveService.saveEApprovalLine(payload);

export const submitLeaveGrantRequest = (payload: {
  userId: string;
  department: string;
  approvalDate: string;
  approvalType: string;
  approvalLine: Array<{
    approverId: string;
    approverName: string;
    approvalSeq: number;
    department?: string;
    jobPosition?: string;
  }>;
  title: string;
  leaveType: string;
  grantDays: number;
  reason: string;
  attachmentsList: EApprovalAttachment[];
  ccList: Array<{ user_id: string; name: string }>;
  files: File[];
  startDate?: string;
  endDate?: string;
}) => leaveService.submitLeaveGrantRequestMultipart(payload);
