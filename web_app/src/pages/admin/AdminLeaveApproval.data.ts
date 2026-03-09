import leaveService from '../../services/leaveService';
import type { AdminManagementApiResponse } from '../../types/leave';
import type { HolidayResponse } from '../../types/holiday';

export const fetchAdminManagementData = async (approverId: string, month: string): Promise<AdminManagementApiResponse> => {
  return leaveService.getAdminManagementData({ approverId, month });
};

export const fetchAdminYearlyLeave = async (approverId: string, year: number) => {
  return leaveService.getAdminYearlyLeave({ approverId, year });
};

export const fetchAdminDeptCalendar = async (approverId: string, month: string) => {
  return leaveService.getAdminDeptCalendar({ approverId, month });
};

export const fetchHolidays = async (year: number, month: number): Promise<HolidayResponse> => {
  return leaveService.getHolidays(year, month);
};
