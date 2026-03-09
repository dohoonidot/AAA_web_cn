import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import leaveService from '../../services/leaveService';
import authService from '../../services/authService';
import type { MonthlyLeave, CalendarDay } from '../../types/leave';
import type { Holiday } from '../../types/holiday';

interface PersonalCalendarStateParams {
  initialMonthlyLeaves: MonthlyLeave[];
  initialLoading: boolean;
  initialError: string | null;
  onMonthChange?: (month: string, leaves: MonthlyLeave[]) => void;
}

export const usePersonalCalendarState = ({
  initialMonthlyLeaves,
  initialLoading,
  initialError,
  onMonthChange,
}: PersonalCalendarStateParams) => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateDetails, setSelectedDateDetails] = useState<MonthlyLeave[]>([]);
  const [selectedHolidayName, setSelectedHolidayName] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [slidePanelOpen, setSlidePanelOpen] = useState(false);
  const [fullCalendarOpen, setFullCalendarOpen] = useState(false);

  const [monthlyLeaves, setMonthlyLeaves] = useState<MonthlyLeave[]>(initialMonthlyLeaves);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(initialError);
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    loadMonthlyCalendar();
    loadMonthlyHolidays();
  }, [currentDate]);

  useEffect(() => {
    if (initialMonthlyLeaves.length > 0) {
      setMonthlyLeaves(initialMonthlyLeaves);
    }
  }, [initialMonthlyLeaves]);

  useEffect(() => {
    if (selectedDate) {
      setSelectedHolidayName(getHolidayName(selectedDate));
    }
  }, [holidays, selectedDate]);

  const loadMonthlyCalendar = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = authService.getCurrentUser();
      if (!user) {
        setError('사용자 정보를 찾을 수 없습니다.');
        return;
      }

      const month = currentDate.format('YYYY-MM');
      console.log('월별 달력 데이터 로드:', month);

      const response = await leaveService.getMonthlyCalendar({
        userId: user.userId,
        month: month,
        name: user.name || '',
      });

      console.log('월별 달력 응답:', response);

      if (response.monthlyLeaves) {
        setMonthlyLeaves(response.monthlyLeaves);
        onMonthChange?.(month, response.monthlyLeaves);
      }
    } catch (err: any) {
      console.error('월별 달력 로드 실패:', err);
      setError(err.response?.data?.message || '월별 달력 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyHolidays = async () => {
    try {
      const response = await leaveService.getHolidays(currentDate.year(), currentDate.month() + 1);
      setHolidays(response.holidays || []);
    } catch (err: any) {
      console.error('공휴일 데이터 로드 실패:', err);
      setHolidays([]);
    }
  };

  const getHolidayName = (date: Date) => {
    const holiday = holidays.find((item) => dayjs(item.locDate).isSame(dayjs(date), 'day'));
    return holiday?.dateName || null;
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const startOfMonth = currentDate.startOf('month');
    const endOfMonth = currentDate.endOf('month');
    const startOfWeek = startOfMonth.startOf('week');
    const endOfWeek = endOfMonth.endOf('week');

    const days: CalendarDay[] = [];
    let currentDay = startOfWeek;

    while (currentDay.isBefore(endOfWeek) || currentDay.isSame(endOfWeek, 'day')) {
      const dayDate = currentDay.toDate();
      const isCurrentMonth = currentDay.isSame(currentDate, 'month');
      const isToday = currentDay.isSame(dayjs(), 'day');

      const dayLeaves = monthlyLeaves.filter(leave => {
        if (!leave.startDate || !leave.endDate) return false;

        const startDate = dayjs(leave.startDate).startOf('day');
        const endDate = dayjs(leave.endDate).startOf('day');
        const currentDayStart = currentDay.startOf('day');

        return (
          currentDayStart.isSame(startDate, 'day') ||
          currentDayStart.isSame(endDate, 'day') ||
          (currentDayStart.isAfter(startDate, 'day') && currentDayStart.isBefore(endDate, 'day'))
        );
      });

      // 취소된 건은 제외하고, 승인/대기/반려/취소대기 건은 모두 표시
      const visibleLeaves = dayLeaves.filter(l => {
        const status = l.status?.toUpperCase();
        return status === 'APPROVED' || status === 'REQUESTED' || status === 'PENDING' || status === 'REJECTED' || status === 'CANCEL_REQUESTED';
      });

      const holidayName = getHolidayName(dayDate);

      days.push({
        date: dayDate,
        isCurrentMonth,
        isToday,
        leaves: visibleLeaves,
        isHoliday: !!holidayName,
        holidayName,
      });

      currentDay = currentDay.add(1, 'day');
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const handlePrevMonth = () => {
    setCurrentDate(prev => prev.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => prev.add(1, 'month'));
  };

  const handleDateClick = (day: CalendarDay) => {
    setSelectedDate(day.date);
    setSelectedHolidayName(day.holidayName || null);

    const selectedDateDetails = monthlyLeaves.filter(leave => {
      if (!leave.startDate || !leave.endDate) return false;

      const startDate = dayjs(leave.startDate).startOf('day');
      const endDate = dayjs(leave.endDate).startOf('day');
      const clickedDate = dayjs(day.date).startOf('day');

      return (
        clickedDate.isSame(startDate, 'day') ||
        clickedDate.isSame(endDate, 'day') ||
        (clickedDate.isAfter(startDate, 'day') && clickedDate.isBefore(endDate, 'day'))
      );
    });

    if (selectedDateDetails.length > 0 || day.holidayName) {
      setSelectedDateDetails(selectedDateDetails);
      setSlidePanelOpen(true);
    } else {
      setSelectedDateDetails([]);
      setSlidePanelOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'REQUESTED':
      case 'PENDING':
      case 'CANCEL_REQUESTED':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'CANCELLED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      REQUESTED: '신청',
      APPROVED: '승인',
      REJECTED: '반려',
      PENDING: '대기중',
      CANCEL_REQUESTED: '취소 대기',
      CANCELLED: '취소됨',
    };
    return labels[status] || status;
  };

  return {
    state: {
      currentDate,
      selectedDate,
      selectedDateDetails,
      selectedHolidayName,
      detailDialogOpen,
      slidePanelOpen,
      fullCalendarOpen,
      monthlyLeaves,
      loading,
      error,
      holidays,
      calendarDays,
    },
    actions: {
      setCurrentDate,
      setSelectedDate,
      setSelectedDateDetails,
      setSelectedHolidayName,
      setDetailDialogOpen,
      setSlidePanelOpen,
      setFullCalendarOpen,
      setMonthlyLeaves,
      setLoading,
      setError,
      setHolidays,
      handlePrevMonth,
      handleNextMonth,
      handleDateClick,
    },
    derived: {
      getHolidayName,
      getStatusColor,
      getStatusLabel,
    },
  };
};

export type PersonalCalendarStateHook = ReturnType<typeof usePersonalCalendarState>;
