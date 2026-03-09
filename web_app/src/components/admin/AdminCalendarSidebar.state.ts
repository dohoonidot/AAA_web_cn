import { useState } from 'react';

export const useAdminCalendarSidebarState = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return {
    state: {
      modalOpen,
    },
    actions: {
      setModalOpen,
    },
  };
};

export type AdminCalendarSidebarStateHook = ReturnType<typeof useAdminCalendarSidebarState>;
