import { useCallback, useEffect, useMemo, useState } from 'react';
import leaveService from '../../services/leaveService';
import type { Approver } from '../../types/leave';

export const useApproverSelectionModalState = ({
  open,
  onClose,
  onConfirm,
  initialSelectedApproverIds = [],
  sequentialApproval = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedApproverIds: string[], selectedApprovers: Approver[]) => void;
  initialSelectedApproverIds?: string[];
  sequentialApproval?: boolean;
}) => {
  const [approverList, setApproverList] = useState<Approver[]>([]);
  const [selectedApproverIds, setSelectedApproverIds] = useState<Set<string>>(
    new Set(initialSelectedApproverIds)
  );
  const [selectedApproverOrder, setSelectedApproverOrder] = useState<string[]>(
    initialSelectedApproverIds
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  const loadApprovers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await leaveService.getApproverList();

      if (response.error) {
        setError(response.error);
      } else {
        setApproverList(response.approverList || []);
      }
    } catch (err: any) {
      console.error('승인자 목록 로드 실패:', err);
      setError('승인자 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setSelectedApproverIds(new Set(initialSelectedApproverIds));
      if (sequentialApproval) {
        setSelectedApproverOrder(initialSelectedApproverIds);
      }
      setSearchText('');
      loadApprovers();
    }
  }, [initialSelectedApproverIds, loadApprovers, open, sequentialApproval]);

  const handleToggleApprover = (approverId: string) => {
    const newSelected = new Set(selectedApproverIds);
    if (newSelected.has(approverId)) {
      newSelected.delete(approverId);
      if (sequentialApproval) {
        setSelectedApproverOrder((prev) => prev.filter((id) => id !== approverId));
      }
    } else {
      newSelected.add(approverId);
      if (sequentialApproval) {
        setSelectedApproverOrder((prev) => [...prev, approverId]);
      }
    }
    setSelectedApproverIds(newSelected);
  };

  const handleConfirm = () => {
    const resultIds = sequentialApproval
      ? selectedApproverOrder
      : Array.from(selectedApproverIds);

    const selectedApprovers = resultIds
      .map((id) => approverList.find((a) => a.approverId === id))
      .filter((a): a is Approver => a !== undefined);

    onConfirm(resultIds, selectedApprovers);
    onClose();
  };

  const filteredApprovers = useMemo(() => {
    if (!searchText.trim()) {
      return approverList;
    }

    const searchLower = searchText.toLowerCase();
    return approverList.filter((approver) => {
      return (
        approver.approverName.toLowerCase().includes(searchLower) ||
        approver.approverId.toLowerCase().includes(searchLower) ||
        approver.department.toLowerCase().includes(searchLower) ||
        approver.jobPosition.toLowerCase().includes(searchLower)
      );
    });
  }, [approverList, searchText]);

  return {
    state: {
      approverList,
      selectedApproverIds,
      selectedApproverOrder,
      isLoading,
      error,
      searchText,
      filteredApprovers,
    },
    actions: {
      setSearchText,
      loadApprovers,
      handleToggleApprover,
      handleConfirm,
    },
  };
};

export type ApproverSelectionModalStateHook = ReturnType<typeof useApproverSelectionModalState>;
