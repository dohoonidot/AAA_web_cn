import { useEffect, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import type { Archive } from '../types';
import { useChatStore, ARCHIVE_NAMES, ARCHIVE_TYPES, getArchiveIcon, getArchiveColor, getArchiveTag, getArchiveDescription, isDefaultArchive } from '../store/chatStore';
import authService from '../services/authService';
import chatService from '../services/chatService';
const DEBUG_TRACE = false;
const debugLog = (...args: unknown[]) => {
  if (!DEBUG_TRACE) return;
  console.log(...args);
};

export const useChatPageState = () => {
  const archives = useChatStore((s) => s.archives);
  const currentArchive = useChatStore((s) => s.currentArchive);
  const setArchives = useChatStore((s) => s.setArchives);
  const setCurrentArchive = useChatStore((s) => s.setCurrentArchive);
  const setMessages = useChatStore((s) => s.setMessages);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedArchive, setSelectedArchive] = useState<Archive | null>(null);
  // 'child' = 기본 타입 하위, 'custom' = 커스텀
  const [selectedArchiveRole, setSelectedArchiveRole] = useState<'child' | 'custom'>('custom');
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAddingChildArchive, setIsAddingChildArchive] = useState(false);
  const [isDeletingArchive, setIsDeletingArchive] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      if (isInitialized) return;
      await loadArchives();
      if (isMounted) setIsInitialized(true);
    };

    initialize();

    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    debugLog('ChatPage: currentArchive 변경됨:', currentArchive?.archive_name);
  }, [currentArchive]);

  useEffect(() => {
    if (deleteDialogOpen) {
      debugLog('💎 삭제 다이얼로그 열림, selectedArchive:', selectedArchive);
    }
  }, [deleteDialogOpen, selectedArchive]);

  // ─── 아카이브 로드 ──────────────────────────────────────────────────────────
  const loadArchives = async () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      console.warn('사용자 정보가 없습니다.');
      return [] as Archive[];
    }

    try {
      debugLog('아카이브 로드 시작:', currentUser.userId);
      const archiveList = await chatService.getArchiveList(currentUser.userId);

      const uniqueArchives = archiveList.filter((archive, index, self) =>
        index === self.findIndex((a) => a.archive_id === archive.archive_id)
      );

      // ── 타입 기반 정렬: 기본 타입(오래된 순) → 커스텀(최신 순) ──────────
      const defaultOrder: Record<string, number> = {
        [ARCHIVE_TYPES.COMPANY]: 1,
        [ARCHIVE_TYPES.CODE]:    2,
        [ARCHIVE_TYPES.SAP]:     3,
        [ARCHIVE_TYPES.AI]:      4,
      };

      const sorted = [...uniqueArchives].sort((a, b) => {
        const orderA = defaultOrder[a.archive_type] ?? 5;
        const orderB = defaultOrder[b.archive_type] ?? 5;
        if (orderA !== orderB) return orderA - orderB;
        // 같은 타입끼리: 기본 타입은 오래된 순(primary 먼저), 커스텀은 최신 순
        if (orderA < 5) {
          return new Date(a.archive_time).getTime() - new Date(b.archive_time).getTime();
        }
        return new Date(b.archive_time).getTime() - new Date(a.archive_time).getTime();
      });

      debugLog('📋 전체 아카이브 수:', sorted.length);
      setArchives(sorted);

      if (sorted.length > 0 && !currentArchive) {
        const workArchive = sorted.find(a => a.archive_type === ARCHIVE_TYPES.COMPANY);
        selectArchive(workArchive ?? sorted[0]);
      }

      return sorted;
    } catch (error: any) {
      console.error('Failed to load archives:', error);
      return [] as Archive[];
    }
  };

  // ─── 대화 추가 (기본 아카이브 하위) ────────────────────────────────────────
  const handleAddChildArchive = async (parentArchive: Archive) => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || isAddingChildArchive) return;

    setIsAddingChildArchive(true);
    try {
      const archiveType = parentArchive.archive_type;
      // 현재 store의 같은 타입 아카이브 수로 번호 부여
      const currentArchives = useChatStore.getState().archives;
      const sameTypeCount = currentArchives.filter(a => a.archive_type === archiveType).length;
      const newName = `${parentArchive.archive_name} ${sameTypeCount + 1}`;

      const res = await chatService.createArchive(currentUser.userId, '', archiveType);
      await chatService.updateArchive(currentUser.userId, res.archive.archive_id, newName);
      const newArchive: Archive = {
        ...res.archive,
        archive_name: newName,
        archive_type: archiveType,
      };

      debugLog(`✅ 하위 아카이브 생성: ${newName}`);

      // 전체 재조회(loadArchives) 대신 로컬 목록을 즉시 갱신해 체감 속도 개선
      const defaultOrder: Record<string, number> = {
        [ARCHIVE_TYPES.COMPANY]: 1,
        [ARCHIVE_TYPES.CODE]: 2,
        [ARCHIVE_TYPES.SAP]: 3,
        [ARCHIVE_TYPES.AI]: 4,
      };
      const nextArchives = [...currentArchives, newArchive].sort((a, b) => {
        const orderA = defaultOrder[a.archive_type] ?? 5;
        const orderB = defaultOrder[b.archive_type] ?? 5;
        if (orderA !== orderB) return orderA - orderB;
        if (orderA < 5) {
          return new Date(a.archive_time).getTime() - new Date(b.archive_time).getTime();
        }
        return new Date(b.archive_time).getTime() - new Date(a.archive_time).getTime();
      });
      setArchives(nextArchives);

      // 생성된 하위 아카이브를 즉시 선택
      setCurrentArchive(newArchive);
      useChatStore.getState().setStreaming(false);
      setMessages([]);

      setSnackbar({ open: true, message: `'${newName}' 대화가 추가되었습니다.`, severity: 'success' });
    } catch (e) {
      console.error('하위 아카이브 생성 실패:', e);
      setSnackbar({ open: true, message: '대화 추가에 실패했습니다.', severity: 'error' });
    } finally {
      setIsAddingChildArchive(false);
    }
  };

  // ─── 아카이브 선택 ──────────────────────────────────────────────────────────
  const selectArchive = async (archive: Archive) => {
    debugLog('selectArchive:', archive.archive_name, archive.archive_id);
    setCurrentArchive(archive);
    useChatStore.getState().setStreaming(false);
    try {
      const messages = await chatService.getArchiveDetail(archive.archive_id);
      setMessages(messages);
    } catch {
      setMessages([]);
    }
  };

  // ─── 컨텍스트 메뉴 ─────────────────────────────────────────────────────────
  const handleMenuOpen = (
    event: ReactMouseEvent<HTMLElement>,
    archive: Archive,
    role: 'child' | 'custom' = 'custom'
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedArchive(archive);
    setSelectedArchiveRole(role);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleRenameClick = () => {
    if (!selectedArchive) { setAnchorEl(null); return; }
    const archiveToRename = selectedArchive;
    setAnchorEl(null);
    setTimeout(() => {
      setSelectedArchive(archiveToRename);
      setNewName(archiveToRename.archive_name);
      setRenameDialogOpen(true);
    }, 350);
  };

  const handleRenameSubmit = async () => {
    if (!selectedArchive || !newName.trim()) return;

    const restrictedNames = Object.values(ARCHIVE_NAMES);
    if (restrictedNames.includes(newName.trim() as any)) {
      setSnackbar({ open: true, message: `"${newName}"는 기본 아카이브 이름으로 사용할 수 없습니다.`, severity: 'error' });
      return;
    }

    try {
      const user = authService.getCurrentUser();
      if (user) {
        await chatService.updateArchive(user.userId, selectedArchive.archive_id, newName.trim());
        await loadArchives();
        setSnackbar({ open: true, message: '아카이브 이름이 변경되었습니다.', severity: 'success' });
      }
    } catch (error: any) {
      setSnackbar({ open: true, message: error?.response?.data?.message || '아카이브 이름 변경에 실패했습니다.', severity: 'error' });
      return;
    }
    setRenameDialogOpen(false);
    setSelectedArchive(null);
  };

  const handleDeleteClick = () => {
    if (!selectedArchive) { setAnchorEl(null); return; }
    setAnchorEl(null);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedArchive || isDeletingArchive) return;
    setIsDeletingArchive(true);
    try {
      const deletedArchiveId = selectedArchive.archive_id;
      const wasCurrentArchive = currentArchive?.archive_id === deletedArchiveId;

      await chatService.deleteArchive(deletedArchiveId);

      // 전체 재조회 대신 로컬 목록 즉시 갱신으로 삭제 체감 개선
      const currentArchives = useChatStore.getState().archives;
      const nextArchives = currentArchives.filter((a) => a.archive_id !== deletedArchiveId);
      setArchives(nextArchives);

      if (wasCurrentArchive) {
        if (nextArchives.length > 0) {
          const workArchive = nextArchives.find((a) => a.archive_type === ARCHIVE_TYPES.COMPANY);
          void selectArchive(workArchive ?? nextArchives[0]);
        } else {
          setCurrentArchive(null);
          setMessages([]);
        }
      }

      setSnackbar({ open: true, message: '아카이브가 삭제되었습니다.', severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: error?.response?.data?.message || '아카이브 삭제에 실패했습니다.', severity: 'error' });
    } finally {
      setIsDeletingArchive(false);
      setDeleteDialogOpen(false);
      setSelectedArchive(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const customArchives = archives.filter(archive => !isDefaultArchive(archive));
      if (customArchives.length === 0) {
        setSnackbar({ open: true, message: '삭제할 커스텀 아카이브가 없습니다.', severity: 'info' });
        return;
      }

      let successCount = 0;
      let failCount = 0;
      for (const archive of customArchives) {
        try {
          await chatService.deleteArchive(archive.archive_id);
          successCount++;
        } catch { failCount++; }
      }

      const freshArchives = await loadArchives();
      const currentStillExists = freshArchives.some(a => a.archive_id === currentArchive?.archive_id);
      if (!currentStillExists && freshArchives.length > 0) {
        const workArchive = freshArchives.find(a => a.archive_type === ARCHIVE_TYPES.COMPANY);
        selectArchive(workArchive ?? freshArchives[0]);
      }

      setSnackbar({
        open: true,
        message: `${successCount}개의 아카이브가 삭제되었습니다.${failCount > 0 ? ` (${failCount}개 실패)` : ''}`,
        severity: successCount > 0 ? 'success' : 'error',
      });
    } catch {
      setSnackbar({ open: true, message: '아카이브 일괄 삭제에 실패했습니다.', severity: 'error' });
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  return {
    state: {
      archives,
      currentArchive,
      mobileMenuOpen,
      searchDialogOpen,
      helpDialogOpen,
      anchorEl,
      selectedArchive,
      selectedArchiveRole,
      renameDialogOpen,
      deleteDialogOpen,
      bulkDeleteDialogOpen,
      newName,
      snackbar,
      isAddingChildArchive,
      isDeletingArchive,
    },
    actions: {
      setArchives,
      setCurrentArchive,
      setMessages,
      setMobileMenuOpen,
      setSearchDialogOpen,
      setHelpDialogOpen,
      setAnchorEl,
      setSelectedArchive,
      setRenameDialogOpen,
      setDeleteDialogOpen,
      setBulkDeleteDialogOpen,
      setNewName,
      setSnackbar,
      loadArchives,
      selectArchive,
      handleMenuOpen,
      handleMenuClose,
      handleRenameClick,
      handleRenameSubmit,
      handleDeleteClick,
      handleDeleteConfirm,
      handleBulkDelete,
      handleAddChildArchive,
    },
    shared: {
      getArchiveIcon,
      getArchiveColor,
      getArchiveTag,
      getArchiveDescription,
      isDefaultArchive,
    },
  };
};

export type ChatPageStateHook = ReturnType<typeof useChatPageState>;
