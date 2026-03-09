import leaveService from '../../services/leaveService';

export const fetchYearlyLeave = (userId: string, year: number) =>
  leaveService.getYearlyLeave({ userId, year });
