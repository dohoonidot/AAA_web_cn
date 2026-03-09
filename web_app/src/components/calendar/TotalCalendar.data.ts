import leaveService from '../../services/leaveService';

export const fetchMonthlyCalendar = (userId: string, month: string, name?: string) =>
  leaveService.getMonthlyCalendar({ userId, month, name });

export const fetchTotalCalendar = (month: string, name?: string) =>
  leaveService.getTotalCalendar(month, name);

export const fetchHolidays = (year: number, month: number) =>
  leaveService.getHolidays(year, month);
