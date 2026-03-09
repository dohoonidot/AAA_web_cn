import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';
import type { Archive } from '../../types';

export const useChatSidebarState = ({
  isMobile,
  onMobileMenuClose,
}: {
  isMobile: boolean;
  onMobileMenuClose?: () => void;
}) => {
  const navigate = useNavigate();
  const archives = useChatStore((s) => s.archives);
  const currentArchive = useChatStore((s) => s.currentArchive);
  const setCurrentArchive = useChatStore((s) => s.setCurrentArchive);
  const setMessages = useChatStore((s) => s.setMessages);
  const [isLoading, setIsLoading] = useState(false);

  const handleArchiveClick = async (archive: Archive) => {
    try {
      setIsLoading(true);
      setCurrentArchive(archive);

      navigate('/chat');

      if (isMobile && onMobileMenuClose) {
        onMobileMenuClose();
      }
    } catch (error) {
      console.error('아카이브 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
    if (isMobile && onMobileMenuClose) {
      onMobileMenuClose();
    }
  };

  return {
    state: {
      archives,
      currentArchive,
      isLoading,
    },
    actions: {
      setCurrentArchive,
      setMessages,
      handleArchiveClick,
      handleMenuClick,
    },
  };
};

export type ChatSidebarStateHook = ReturnType<typeof useChatSidebarState>;
