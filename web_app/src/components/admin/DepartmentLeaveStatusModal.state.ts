import { useEffect, useMemo, useState } from 'react';
import authService from '../../services/authService';
import leaveService from '../../services/leaveService';
import type { EmployeeLeaveStatus } from '../../types/leave';

export const useDepartmentLeaveStatusModalState = ({ open }: { open: boolean }) => {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<EmployeeLeaveStatus[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadLeaveStatusData();
    }
  }, [open]);

  const loadLeaveStatusData = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = authService.getCurrentUser();
      if (!user || !user.userId) {
        setError('사용자 정보를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      const response = await leaveService.getDepartmentLeaveStatus(user.userId);

      if (response.error) {
        setError(response.error);
      } else {
        setEmployees(response.employees);
      }
    } catch (err: any) {
      setError(err.message || '데이터 로딩 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const groupedEmployees = useMemo(() => {
    return employees.reduce((acc, employee) => {
      const key = `${employee.department}_${employee.name}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(employee);
      return acc;
    }, {} as Record<string, EmployeeLeaveStatus[]>);
  }, [employees]);

  return {
    state: {
      loading,
      employees,
      error,
      groupedEmployees,
    },
    actions: {
      setLoading,
      setEmployees,
      setError,
      loadLeaveStatusData,
    },
  };
};

export type DepartmentLeaveStatusModalStateHook = ReturnType<typeof useDepartmentLeaveStatusModalState>;
