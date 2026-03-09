import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import authService from '../../services/authService';
import type { TotalCalendarLeave, MonthlyLeave } from '../../types/leave';
import type { Holiday } from '../../types/holiday';
import { fetchHolidays, fetchMonthlyCalendar, fetchTotalCalendar } from './TotalCalendar.data';

export const useTotalCalendarState = ({
  open,
  embedded,
  initialSelectedDate,
  onDateSelected,
}: {
  open: boolean;
  embedded: boolean;
  initialSelectedDate?: Date;
  onDateSelected?: (date: Date) => void;
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(initialSelectedDate || new Date());
  const [currentCalendarDate, setCurrentCalendarDate] = useState(dayjs(selectedDate));
  const [selectedDateDetails, setSelectedDateDetails] = useState<any[]>([]);
  const [selectedHolidayName, setSelectedHolidayName] = useState<string | null>(null);

  const [isMyVacationView, setIsMyVacationView] = useState(true);
  const [selectedDepartments, setSelectedDepartments] = useState<Set<string>>(new Set());
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());

  const [totalCalendarLeaves, setTotalCalendarLeaves] = useState<TotalCalendarLeave[]>([]);
  const [departmentEmployees, setDepartmentEmployees] = useState<Map<string, string[]>>(new Map());
  const [isDepartmentDataLoading, setIsDepartmentDataLoading] = useState(false);

  const [myMonthlyLeaves, setMyMonthlyLeaves] = useState<MonthlyLeave[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  const [isDetailPanelVisible, setIsDetailPanelVisible] = useState(false);

  const [detailPage, setDetailPage] = useState(1);
  const detailItemsPerPage = 5;

  const [yearMonthDialogOpen, setYearMonthDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentCalendarDate.year());
  const [selectedMonth, setSelectedMonth] = useState(currentCalendarDate.month() + 1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open || embedded) {
      loadMonthlyCalendarData(currentCalendarDate);
      loadMonthlyHolidays(currentCalendarDate);
      if (!isMyVacationView) {
        loadDepartmentCalendarData(currentCalendarDate);
      }
    }
  }, [open, embedded]);

  useEffect(() => {
    if (open || embedded) {
      loadMonthlyCalendarData(currentCalendarDate);
      loadMonthlyHolidays(currentCalendarDate);
      if (!isMyVacationView) {
        loadDepartmentCalendarData(currentCalendarDate);
      }
    }
  }, [currentCalendarDate, isMyVacationView]);

  useEffect(() => {
    setSelectedHolidayName(getHolidayName(selectedDate));
  }, [selectedDate, holidays]);

  const loadMonthlyCalendarData = async (monthDate: dayjs.Dayjs) => {
    try {
      setLoading(true);
      setError(null);

      const user = authService.getCurrentUser();
      if (!user) return;

      const month = monthDate.format('YYYY-MM');
      const response = await fetchMonthlyCalendar(user.userId, month, user.name || '');

      if (response.monthlyLeaves) {
        setMyMonthlyLeaves(response.monthlyLeaves);
        updateSelectedDateDetails(selectedDate, response.monthlyLeaves, totalCalendarLeaves);
      }
    } catch (err) {
      console.error('월별 휴가 조회 실패:', err);
      setError('휴가 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartmentCalendarData = async (monthDate: dayjs.Dayjs) => {
    try {
      setIsDepartmentDataLoading(true);

      const month = monthDate.format('YYYY-MM');
      const user = authService.getCurrentUser();
      const response = await fetchTotalCalendar(month, user?.name || '');

      if (response.monthlyLeaves) {
        setTotalCalendarLeaves(response.monthlyLeaves);

        const deptMap = new Map<string, Set<string>>();
        response.monthlyLeaves.forEach((leave: TotalCalendarLeave) => {
          if (!deptMap.has(leave.department)) {
            deptMap.set(leave.department, new Set());
          }
          deptMap.get(leave.department)!.add(leave.name);
        });

        const deptEmployeesMap = new Map<string, string[]>();
        deptMap.forEach((employees, dept) => {
          deptEmployeesMap.set(dept, Array.from(employees));
        });

        setDepartmentEmployees(deptEmployeesMap);
        updateSelectedDateDetails(selectedDate, myMonthlyLeaves, response.monthlyLeaves);
      }
    } catch (err) {
      console.error('부서 휴가 현황 조회 실패:', err);
      setError('부서 휴가 현황을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsDepartmentDataLoading(false);
    }
  };

  const loadMonthlyHolidays = async (monthDate: dayjs.Dayjs) => {
    try {
      const response = await fetchHolidays(monthDate.year(), monthDate.month() + 1);
      if (response?.holidays) {
        setHolidays(response.holidays);
      }
    } catch (err) {
      console.error('공휴일 조회 실패:', err);
    }
  };

  const getHolidayName = (date: Date) => {
    const holiday = holidays.find((item) => dayjs(item.locDate).isSame(dayjs(date), 'day'));
    return holiday ? holiday.dateName : null;
  };

  const handlePrevMonth = () => {
    const prevDate = currentCalendarDate.subtract(1, 'month');
    setCurrentCalendarDate(prevDate);
  };

  const handleNextMonth = () => {
    const nextDate = currentCalendarDate.add(1, 'month');
    setCurrentCalendarDate(nextDate);
  };

  const handleGoToToday = () => {
    const today = dayjs();
    setCurrentCalendarDate(today);
    setSelectedDate(today.toDate());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setDetailPage(1); // 날짜 변경 시 페이지를 1로 초기화
    updateSelectedDateDetails(date, myMonthlyLeaves, totalCalendarLeaves);
    if (!isMyVacationView && (selectedDepartments.size > 0 || selectedEmployees.size > 0)) {
      setIsDetailPanelVisible(true);
    }
    onDateSelected?.(date);
  };

  const handleYearMonthClick = () => {
    setSelectedYear(currentCalendarDate.year());
    setSelectedMonth(currentCalendarDate.month() + 1);
    setYearMonthDialogOpen(true);
  };

  const handleYearMonthConfirm = () => {
    const newDate = dayjs(`${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`);
    setCurrentCalendarDate(newDate);
    setYearMonthDialogOpen(false);
  };

  const handleYearMonthCancel = () => {
    setYearMonthDialogOpen(false);
  };

  const updateSelectedDateDetails = (
    date: Date,
    monthlyLeaves: MonthlyLeave[],
    totalLeaves: TotalCalendarLeave[]
  ) => {
    const dateDayjs = dayjs(date);
    const holidayName = getHolidayName(date);
    let details: any[] = [];

    if (isMyVacationView) {
      details = monthlyLeaves.filter((leave) => {
        const startDate = dayjs(leave.startDate);
        const endDate = dayjs(leave.endDate);
        return dateDayjs.isBetween(startDate, endDate, 'day', '[]');
      }).map((leave) => ({
        ...leave,
        vacationType: (leave as any).leaveType || (leave as any).leave_type || (leave as any).vacationType,
      }));
    } else {
      if (selectedDepartments.size === 0 && selectedEmployees.size === 0) {
        details = [];
        if (holidayName) {
          details.unshift({
            isHoliday: true,
            holidayName,
          });
        }
        setSelectedDateDetails(details);
        setSelectedHolidayName(holidayName);
        return;
      }
      details = totalLeaves.filter((leave) => {
        const employeeKey = `${leave.name}|${leave.department}`;
        if (selectedDepartments.size > 0 && !selectedDepartments.has(leave.department)) return false;
        if (selectedEmployees.size > 0 && !selectedEmployees.has(employeeKey)) return false;

        const startDate = dayjs(leave.startDate);
        const endDate = dayjs(leave.endDate);
        return dateDayjs.isBetween(startDate, endDate, 'day', '[]');
      }).map((leave) => ({
        ...leave,
        employeeName: (leave as any).employeeName || (leave as any).name,
        vacationType: (leave as any).leaveType || (leave as any).leave_type || (leave as any).vacationType,
      }));

      const statusPriority: Record<string, number> = {
        APPROVED: 1,
        REQUESTED: 2,
        CANCEL_REQUESTED: 3,
        REJECTED: 4,
        CANCELLED: 5,
      };

      details.sort((a, b) => {
        const priorityA = statusPriority[a.status?.toUpperCase() || ''] || 5;
        const priorityB = statusPriority[b.status?.toUpperCase() || ''] || 5;
        return priorityA - priorityB;
      });
    }

    if (holidayName) {
      details.unshift({
        isHoliday: true,
        holidayName,
      });
    }

    setSelectedDateDetails(details);
    setSelectedHolidayName(holidayName);
  };

  const handleViewModeChange = (isMyVacation: boolean) => {
    setIsMyVacationView(isMyVacation);
    setSelectedDepartments(new Set());
    setSelectedEmployees(new Set());

    if (!isMyVacation) {
      loadDepartmentCalendarData(currentCalendarDate);
    }

    updateSelectedDateDetails(selectedDate, myMonthlyLeaves, totalCalendarLeaves);
  };

  const toggleDepartmentSelection = (deptName: string) => {
    const newSelectedDepartments = new Set(selectedDepartments);
    const newSelectedEmployees = new Set(selectedEmployees);
    const employees = departmentEmployees.get(deptName) || [];

    if (newSelectedDepartments.has(deptName)) {
      newSelectedDepartments.delete(deptName);
      employees.forEach((employee) => {
        newSelectedEmployees.delete(`${employee}|${deptName}`);
      });
    } else {
      newSelectedDepartments.add(deptName);
      employees.forEach((employee) => {
        newSelectedEmployees.add(`${employee}|${deptName}`);
      });
    }

    setSelectedDepartments(newSelectedDepartments);
    setSelectedEmployees(newSelectedEmployees);
    updateSelectedDateDetails(selectedDate, myMonthlyLeaves, totalCalendarLeaves);
  };

  const toggleDepartmentExpansion = (deptName: string) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(deptName)) {
      newExpanded.delete(deptName);
    } else {
      newExpanded.add(deptName);
    }
    setExpandedDepartments(newExpanded);
  };

  const toggleEmployeeSelection = (employeeName: string, department: string) => {
    const newSelectedEmployees = new Set(selectedEmployees);
    const employeeKey = `${employeeName}|${department}`;

    if (newSelectedEmployees.has(employeeKey)) {
      newSelectedEmployees.delete(employeeKey);
    } else {
      newSelectedEmployees.add(employeeKey);
    }

    const employees = departmentEmployees.get(department) || [];
    const deptEmployeesSelected = employees.every((employee) =>
      newSelectedEmployees.has(`${employee}|${department}`)
    );

    const newSelectedDepartments = new Set(selectedDepartments);
    if (deptEmployeesSelected) {
      newSelectedDepartments.add(department);
    } else {
      newSelectedDepartments.delete(department);
    }

    setSelectedEmployees(newSelectedEmployees);
    setSelectedDepartments(newSelectedDepartments);
    updateSelectedDateDetails(selectedDate, myMonthlyLeaves, totalCalendarLeaves);
  };

  const handleSelectAll = () => {
    const allDepartments = new Set(departmentEmployees.keys());
    const allEmployees = new Set<string>();

    departmentEmployees.forEach((employees, dept) => {
      employees.forEach((employee) => {
        allEmployees.add(`${employee}|${dept}`);
      });
    });

    setSelectedDepartments(allDepartments);
    setSelectedEmployees(allEmployees);
    updateSelectedDateDetails(selectedDate, myMonthlyLeaves, totalCalendarLeaves);
  };

  const handleSelectNone = () => {
    setSelectedDepartments(new Set());
    setSelectedEmployees(new Set());
    updateSelectedDateDetails(selectedDate, myMonthlyLeaves, totalCalendarLeaves);
  };

  const generateCalendarDays = (monthDate: dayjs.Dayjs) => {
    const startOfMonth = monthDate.startOf('month');
    const endOfMonth = monthDate.endOf('month');
    const startOfWeek = startOfMonth.startOf('week');
    const endOfWeek = endOfMonth.endOf('week');

    const days = [];
    let currentDay = startOfWeek;

    while (currentDay.isBefore(endOfWeek) || currentDay.isSame(endOfWeek, 'day')) {
      const dayDate = currentDay.toDate();
      const isCurrentMonth = currentDay.isSame(monthDate, 'month');
      const isToday = currentDay.isSame(dayjs(), 'day');

      const dayLeaves = isMyVacationView
        ? myMonthlyLeaves.filter((leave) => {
            const startDate = dayjs(leave.startDate);
            const endDate = dayjs(leave.endDate);
            return currentDay.isBetween(startDate, endDate, 'day', '[]');
          })
        : (selectedDepartments.size === 0 && selectedEmployees.size === 0)
          ? []
          : totalCalendarLeaves.filter((leave) => {
              if (selectedDepartments.size > 0 && !selectedDepartments.has(leave.department)) return false;
              if (selectedEmployees.size > 0 && !selectedEmployees.has(`${leave.name}|${leave.department}`)) return false;

              const startDate = dayjs(leave.startDate);
              const endDate = dayjs(leave.endDate);
              return currentDay.isBetween(startDate, endDate, 'day', '[]');
            });

      const holidayName = getHolidayName(dayDate);

      days.push({
        date: dayDate,
        isCurrentMonth,
        isToday,
        isHoliday: holidayName,
        leaves: dayLeaves,
      });

      currentDay = currentDay.add(1, 'day');
    }

    return days;
  };

  const getPaginatedDetails = () => {
    const startIndex = (detailPage - 1) * detailItemsPerPage;
    const endIndex = startIndex + detailItemsPerPage;
    return selectedDateDetails.slice(startIndex, endIndex);
  };

  const getDetailTotalPages = () => {
    return Math.ceil(selectedDateDetails.length / detailItemsPerPage);
  };

  return {
    state: {
      selectedDate,
      currentCalendarDate,
      selectedDateDetails,
      selectedHolidayName,
      isMyVacationView,
      selectedDepartments,
      selectedEmployees,
      expandedDepartments,
      totalCalendarLeaves,
      departmentEmployees,
      isDepartmentDataLoading,
      myMonthlyLeaves,
      holidays,
      isDetailPanelVisible,
      detailPage,
      detailItemsPerPage,
      yearMonthDialogOpen,
      selectedYear,
      selectedMonth,
      loading,
      error,
    },
    derived: {
      getHolidayName,
      generateCalendarDays,
      getPaginatedDetails,
      getDetailTotalPages,
    },
    actions: {
      setSelectedDate,
      setCurrentCalendarDate,
      setIsDetailPanelVisible,
      setDetailPage,
      setYearMonthDialogOpen,
      setSelectedYear,
      setSelectedMonth,
      handlePrevMonth,
      handleNextMonth,
      handleGoToToday,
      handleDateClick,
      handleYearMonthClick,
      handleYearMonthConfirm,
      handleYearMonthCancel,
      handleViewModeChange,
      toggleDepartmentSelection,
      toggleDepartmentExpansion,
      toggleEmployeeSelection,
      handleSelectAll,
      handleSelectNone,
    },
  };
};

export type TotalCalendarStateHook = ReturnType<typeof useTotalCalendarState>;
