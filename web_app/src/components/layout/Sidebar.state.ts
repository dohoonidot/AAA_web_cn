import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import chatService from '../../services/chatService';
import { useChatStore } from '../../store/chatStore';
import type { Archive } from '../../types';

export const useSidebarState = ({ isOpen, onToggle, isMobileScreen }: { isOpen: boolean; onToggle: () => void; isMobileScreen: boolean }) => {
  const navigate = useNavigate();
  const archives = useChatStore((s) => s.archives);
  const currentArchive = useChatStore((s) => s.currentArchive);
  const setArchives = useChatStore((s) => s.setArchives);
  const setCurrentArchive = useChatStore((s) => s.setCurrentArchive);
  const setMessages = useChatStore((s) => s.setMessages);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['chat']));
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setUserInfo(user);
  }, []);

  useEffect(() => {
    if (isOpen && userInfo?.userId) {
      loadArchives();
    }
  }, [isOpen, userInfo]);

  const loadArchives = async () => {
    try {
      const archiveList = await chatService.getArchiveList(userInfo.userId);
      setArchives(archiveList);
    } catch (error) {
      console.error('아카이브 목록 로드 실패:', error);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleArchiveClick = async (archive: Archive) => {
    try {
      setIsLoading(true);
      setCurrentArchive(archive);

      const messages = await chatService.getArchiveDetail(archive.archive_id);
      setMessages(messages);

      navigate('/chat');
    } catch (error) {
      console.error('아카이브 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateArchive = async (archiveType: string, archiveName: string) => {
    try {
      setIsLoading(true);
      const response = await chatService.createArchive(userInfo.userId, archiveName, archiveType);
      await loadArchives();
      setCurrentArchive(response.archive);
      navigate('/chat');
    } catch (error) {
      console.error('아카이브 생성 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
    if (isMobileScreen) {
      onToggle();
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return {
    state: {
      archives,
      currentArchive,
      expandedSections,
      isLoading,
      userInfo,
    },
    actions: {
      setExpandedSections,
      setIsLoading,
      setUserInfo,
      loadArchives,
      toggleSection,
      handleArchiveClick,
      handleCreateArchive,
      handleMenuClick,
      handleLogout,
    },
    derived: {
      isApprover: userInfo?.isApprover || false,
    },
  };
};

export type SidebarStateHook = ReturnType<typeof useSidebarState>;
