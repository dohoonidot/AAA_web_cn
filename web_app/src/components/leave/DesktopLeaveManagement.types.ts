import type { Dayjs } from 'dayjs';
import type { YearlyDetail } from '../../types/leave';

export type ManagementTableRow = {
  leaveType: string;
  allowedDays: number;
  usedByMonth: number[];
  totalUsed: number;
};

export type ExtendedYearlyDetail = YearlyDetail & {
  originalReason?: string;
};

export type LeaveRequestFormState = {
  leaveType: string;
  startDate: Dayjs;
  endDate: Dayjs;
  reason: string;
  halfDaySlot: string;
  approverIds: string[];
  ccList: Array<{ name: string; department: string }>;
  useHalfDay: boolean;
  useNextYearLeave: boolean;
};
