import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ApprovalRequest } from './ApprovalPanel';

export const useApprovalPanelState = ({
  onClose,
}: {
  onClose: () => void;
}) => {
  const navigate = useNavigate();
  const [isPinned, setIsPinned] = useState(false);

  const handleRequestClick = (request: ApprovalRequest) => {
    navigate(`/approval/${request.id}`);
    if (!isPinned) {
      onClose();
    }
  };

  return {
    state: {
      isPinned,
    },
    actions: {
      setIsPinned,
      handleRequestClick,
    },
  };
};

export type ApprovalPanelStateHook = ReturnType<typeof useApprovalPanelState>;
