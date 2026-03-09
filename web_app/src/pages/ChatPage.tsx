import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar,
  Button,
  Avatar,
  IconButton,
  type MenuProps,
} from '@mui/material';
import { useEffect, useState, useCallback } from 'react';
import {
  Lock as LockIcon,
  Code as CodeIcon,
  Business as BusinessIcon,
  AutoAwesome as AutoAwesomeIcon,
  Chat as ChatIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Description as DescriptionIcon,
  BeachAccess as BeachAccessIcon,
  // EmojiEvents as EmojiEventsIcon,
  Menu as MenuIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DeleteSweep as DeleteSweepIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  HeadsetMic as HeadsetMicIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ARCHIVE_NAMES, ARCHIVE_TYPES, getArchiveIcon, getArchiveColor, getArchiveTag, getArchiveDescription, isDefaultArchive } from '../store/chatStore';
import { useThemeStore } from '../store/themeStore';
import authService from '../services/authService';
import chatService from '../services/chatService';
import ChatArea from '../components/chat/ChatArea';
import { NotificationButton } from '../components/common/NotificationPanel';
import { GiftButton } from '../components/common/GiftBox';
import { MobileOnly, DesktopOnly } from '../components/common/Responsive';
import type { Archive } from '../types';
import { useElectronicApprovalStore } from '../store/electronicApprovalStore';
import ChatPageModals from './ChatPage.modals';
import { useChatPageState } from './ChatPage.state';
import { useChannelIO } from '../hooks/useChannelIO';


const SIDEBAR_EXPANDED_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 84;
const SIDEBAR_COLLAPSE_STORAGE_KEY = 'chat_sidebar_collapsed';

export default function ChatPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px = 모바일
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme.name === 'Dark';
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(SIDEBAR_COLLAPSE_STORAGE_KEY) === '1';
  });
  // 각 기본 아카이브 타입의 하위 목록 펼침/접힘 상태
  const [expandedTypes, setExpandedTypes] = useState<Record<string, boolean>>({});
  const [createMenuAnchorEl, setCreateMenuAnchorEl] = useState<null | HTMLElement>(null);
  const toggleTypeExpanded = useCallback((type: string) => {
    setExpandedTypes(prev => ({ ...prev, [type]: !prev[type] }));
  }, []);
  const desktopSidebarWidth = isDesktopSidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;
  const isSidebarCollapsed = !isMobile && isDesktopSidebarCollapsed;
  const { openPanel: openElectronicApproval } = useElectronicApprovalStore();
  const { isOpen: isChannelIOOpen, openMessenger, closeMessenger } = useChannelIO();
  const navigate = useNavigate();
  const location = useLocation();

  const { state, actions } = useChatPageState();
  const {
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
    isDeletingArchive,
  } = state;
  const {
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
  } = actions;

  const handleAddChildArchiveAndExpand = async (archive: Archive) => {
    if (archive.archive_type) {
      setExpandedTypes((prev) => ({ ...prev, [archive.archive_type]: true }));
    }
    await handleAddChildArchive(archive);
    if (archive.archive_type) {
      requestAnimationFrame(() => {
        setExpandedTypes((prev) => ({ ...prev, [archive.archive_type]: true }));
      });
    }
  };

  const desktopSidebarHoverSx = !isMobile ? {
    border: '1px solid',
    borderColor: isDark ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.22)',
    transform: 'translateX(0) scale(1)',
    transformOrigin: 'left center',
    transition: 'background-color 180ms ease-out, border-color 180ms ease-out, box-shadow 220ms ease-out, transform 180ms ease-out, color 180ms ease-out',
    '&:hover': {
      backgroundColor: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(241, 245, 249, 0.9)',
      borderColor: isDark ? 'rgba(129, 140, 248, 0.34)' : 'rgba(99, 102, 241, 0.24)',
      boxShadow: isDark ? '0 10px 20px rgba(2,6,23,0.28)' : '0 8px 16px rgba(15,23,42,0.08)',
      transform: 'translateX(2px) scale(1.005)',
      '& .chatpage-sidebar-icon': {
        color: isDark ? '#BFDBFE' : '#3157E1',
        opacity: 1,
      },
      '& .chatpage-sidebar-label': {
        color: isDark ? '#E2E8F0' : '#1E3A8A',
        fontWeight: 600,
      },
      '& .chatpage-sidebar-hint': {
        color: isDark ? '#CBD5E1' : '#475569',
      },
    },
  } : {};
  const quickActionButtonSx = {
    color: isDark ? '#cbd5e1' : '#334155',
    border: '1px solid',
    borderColor: isDark ? 'rgba(148,163,184,0.28)' : 'rgba(148,163,184,0.35)',
    bgcolor: isDark ? 'rgba(30,41,59,0.62)' : 'rgba(248,250,252,0.9)',
    backdropFilter: 'blur(8px)',
    borderRadius: '10px',
    width: 34,
    height: 34,
    transition: 'all 160ms ease',
    '&:hover': {
      color: isDark ? '#e2e8f0' : '#1e293b',
      bgcolor: isDark ? 'rgba(51,65,85,0.82)' : 'rgba(241,245,249,0.95)',
      borderColor: isDark ? 'rgba(129,140,248,0.45)' : 'rgba(99,102,241,0.38)',
      transform: 'translateY(-1px)',
    },
  };
  const desktopSidebarDangerHoverSx = !isMobile ? {
    border: '1px solid transparent',
    transform: 'translateX(0) scale(1)',
    transformOrigin: 'left center',
    transition: 'background-color 180ms ease-out, border-color 180ms ease-out, box-shadow 220ms ease-out, transform 180ms ease-out, color 180ms ease-out',
    '&:hover': {
      backgroundColor: isDark ? 'rgba(255, 107, 107, 0.12)' : '#ffebee',
      borderColor: isDark ? 'rgba(255, 135, 135, 0.28)' : 'rgba(211, 47, 47, 0.18)',
      boxShadow: isDark ? '0 8px 14px rgba(0,0,0,0.18)' : '0 6px 12px rgba(211,47,47,0.08)',
      color: isDark ? '#ff8787' : '#b71c1c',
      transform: 'translateX(3px) scale(1.01)',
      '& .chatpage-sidebar-icon, & .chatpage-sidebar-label': {
        color: 'inherit',
        opacity: 1,
      },
    },
  } : {};


  // 아이콘 가져오기 - Flutter 스타일 (18px)
  const getIcon = (archive: Archive) => {
    const iconName = getArchiveIcon(archive);
    const colorByType: Record<string, string> = isDark
      ? {
        [ARCHIVE_TYPES.CODE]: '#34D399',
        [ARCHIVE_TYPES.SAP]: '#60A5FA',
        [ARCHIVE_TYPES.AI]: '#C084FC',
        [ARCHIVE_TYPES.COMPANY]: '#FBBF24',
      }
      : {
        [ARCHIVE_TYPES.CODE]: '#059669',
        [ARCHIVE_TYPES.SAP]: '#2563EB',
        [ARCHIVE_TYPES.AI]: '#7C3AED',
        [ARCHIVE_TYPES.COMPANY]: '#D97706',
      };
    const color = colorByType[archive.archive_type] ?? getArchiveColor(archive, isDark);

    const iconProps = {
      className: 'chatpage-sidebar-icon',
      sx: { color, fontSize: 20, opacity: 1 }
    };

    switch (iconName) {
      case 'code':
        return <CodeIcon {...iconProps} />;
      case 'business':
        return <BusinessIcon {...iconProps} />;
      case 'auto_awesome':
        return <AutoAwesomeIcon {...iconProps} />;
      case 'lock':
        return <LockIcon {...iconProps} />;
      default:
        return <ChatIcon {...iconProps} />;
    }
  };

  // 현재 사용자 정보
  const currentUser = authService.getCurrentUser();
  const createMenuOpen = Boolean(createMenuAnchorEl);

  const createNewChatArchive = async () => {
    const user = authService.getCurrentUser();
    if (!user) return;

    // 기존 아카이브 중 "new chat" 형식의 최대 번호 찾기
    const newChatNumbers = archives
      .map(a => {
        const exactMatch = a.archive_name.toLowerCase() === 'new chat';
        if (exactMatch) return 1;
        const match = a.archive_name.match(/^new chat (\d+)$/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => n > 0);

    const nextNumber = newChatNumbers.length > 0 ? Math.max(...newChatNumbers) + 1 : 1;
    const newArchiveName = nextNumber === 1 ? 'new chat' : `new chat ${nextNumber}`;

    const response = await chatService.createArchive(user.userId, '', '');
    await chatService.updateArchive(user.userId, response.archive.archive_id, newArchiveName);

    const freshArchives = await loadArchives();
    const newArchive = freshArchives.find(a => a.archive_id === response.archive.archive_id);
    if (newArchive) selectArchive(newArchive);
  };

  const handleCreateArchiveByOption = async (option: 'company' | 'code' | 'sap' | 'ai' | 'newchat') => {
    try {
      if (option === 'newchat') {
        await createNewChatArchive();
      } else {
        const sameTypeArchives = archives
          .filter(a => a.archive_type === option)
          .sort((a, b) => new Date(a.archive_time).getTime() - new Date(b.archive_time).getTime());

        const primary = sameTypeArchives[0];
        if (primary) {
          await handleAddChildArchiveAndExpand(primary);
        } else {
          // 예외적으로 primary가 없는 경우 직접 생성
          const user = authService.getCurrentUser();
          if (!user) return;
          const baseNameMap: Record<'company' | 'code' | 'sap' | 'ai', string> = {
            company: ARCHIVE_NAMES.WORK,
            code: ARCHIVE_NAMES.CODE,
            sap: ARCHIVE_NAMES.SAP,
            ai: ARCHIVE_NAMES.CHATBOT,
          };
          const response = await chatService.createArchive(user.userId, '', option);
          await chatService.updateArchive(user.userId, response.archive.archive_id, baseNameMap[option]);
          const freshArchives = await loadArchives();
          const created = freshArchives.find(a => a.archive_id === response.archive.archive_id);
          if (created) selectArchive(created);
        }
      }

      setCreateMenuAnchorEl(null);
      if (isMobile) setMobileMenuOpen(false);
    } catch (error) {
      console.error('아카이브 생성 실패:', error);
      setCreateMenuAnchorEl(null);
      alert('아카이브 생성에 실패했습니다.');
    }
  };

  const createMenuOrigin: NonNullable<MenuProps['anchorOrigin']> = { vertical: 'bottom', horizontal: 'right' };
  const createMenuTransform: NonNullable<MenuProps['transformOrigin']> = { vertical: 'top', horizontal: 'right' };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SIDEBAR_COLLAPSE_STORAGE_KEY, isDesktopSidebarCollapsed ? '1' : '0');
    }
  }, [isDesktopSidebarCollapsed]);

  // 현재 선택된 아카이브 타입 그룹은 자동으로 펼쳐 둔다.
  useEffect(() => {
    if (!currentArchive?.archive_type) return;
    const type = currentArchive.archive_type;
    if (![ARCHIVE_TYPES.COMPANY, ARCHIVE_TYPES.CODE, ARCHIVE_TYPES.SAP, ARCHIVE_TYPES.AI].includes(type as any)) return;
    setExpandedTypes((prev) => ({ ...prev, [type]: true }));
  }, [archives, currentArchive]);

  // Channel.io 데스크톱 외부 클릭 닫기 처리
  useEffect(() => {
    if (isMobile || !isChannelIOOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      // 섀도우 돔이나 특정 클래스 구조 감지를 통해 이루어질 수 있으나,
      // 가장 단순하고 확실한 방법으로 '본문' 클릭 시 닫히도록 하되 button 클릭 시는 제외 (캡처 방지)
      const target = event.target as HTMLElement;

      // 문의 버튼인 경우 무시 (토글 충돌 방지)
      if (target.closest('.channel-io-inquiry-btn')) return;

      // Channel.io 위젯 컨테이너인지 확인 (클래스명 보수적 매칭)
      if (target.closest('#ch-plugin') || target.closest('.ch-messenger')) return;

      closeMessenger();
    };

    // 타임아웃을 주어 openMessenger 동작 직후 바로 닫히지 않도록 함
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMobile, isChannelIOOpen, closeMessenger]);

  // 사이드바 콘텐츠 (Desktop/Mobile 공통) - MobileMainLayout 스타일로 통일
  const sidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* 사용자 정보 헤더 - MobileMainLayout 스타일 */}
      <Box
        sx={{
          p: 1.5,
          bgcolor: 'transparent',
          color: colorScheme.sidebarTextColor,
          borderBottom: `1px solid ${colorScheme.textFieldBorderColor}`,
        }}
      >
        {isSidebarCollapsed ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            <Tooltip title="사이드바 펼치기" placement="right">
              <IconButton
                size="small"
                onClick={() => setIsDesktopSidebarCollapsed(false)}
                sx={{
                  ...quickActionButtonSx,
                }}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Avatar sx={{
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e3f2fd',
              color: colorScheme.primaryColor,
              width: 36,
              height: 36
            }}>
              <ChatIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%'
                }}
              >
                {currentUser?.userId || '사용자'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.72,
                  fontSize: '0.68rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 600,
                }}
              >
                ASPN AI Agent
              </Typography>
            </Box>
          </Box>
        )}
        {!isSidebarCollapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
            {/* 검색 버튼 */}
            <Tooltip title="대화 내용 검색" placement="right">
              <IconButton
                onClick={() => {
                  setSearchDialogOpen(true);
                  if (isMobile) setMobileMenuOpen(false);
                }}
                size="small"
                sx={quickActionButtonSx}
              >
                <SearchIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            {/* 새 채팅방 버튼 */}
            <Tooltip title="새 채팅방 만들기" placement="right">
              <IconButton
                onClick={(e) => setCreateMenuAnchorEl(e.currentTarget)}
                size="small"
                sx={quickActionButtonSx}
              >
                <AddIcon sx={{ fontSize: 19 }} />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={createMenuAnchorEl}
              open={createMenuOpen}
              onClose={() => setCreateMenuAnchorEl(null)}
              anchorOrigin={createMenuOrigin}
              transformOrigin={createMenuTransform}
              slotProps={{
                paper: {
                  sx: {
                    mt: 0.5,
                    minWidth: 210,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(148,163,184,0.22)' : 'rgba(148,163,184,0.28)',
                    bgcolor: isDark ? 'rgba(15,23,42,0.88)' : 'rgba(255,255,255,0.96)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: isDark
                      ? '0 14px 30px rgba(2,6,23,0.45)'
                      : '0 12px 24px rgba(15,23,42,0.14)',
                    '& .MuiMenuItem-root': {
                      borderRadius: 1.25,
                      mx: 0.5,
                      my: 0.25,
                      minHeight: 34,
                      px: 1.1,
                      fontSize: '0.82rem',
                      color: colorScheme.sidebarTextColor,
                    },
                    '& .MuiMenuItem-root:hover': {
                      bgcolor: isDark ? 'rgba(51,65,85,0.6)' : 'rgba(241,245,249,0.95)',
                    },
                    '& .MuiListItemIcon-root': {
                      minWidth: 28,
                      color: isDark ? '#cbd5e1' : '#475569',
                    },
                  },
                },
              }}
            >
              <MenuItem onClick={() => handleCreateArchiveByOption('company')}>
                <ListItemIcon><LockIcon fontSize="small" /></ListItemIcon>
                <ListItemText>사내업무 추가</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleCreateArchiveByOption('code')}>
                <ListItemIcon><CodeIcon fontSize="small" /></ListItemIcon>
                <ListItemText>코딩어시스턴트 추가</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleCreateArchiveByOption('sap')}>
                <ListItemIcon><BusinessIcon fontSize="small" /></ListItemIcon>
                <ListItemText>SAP어시스턴트 추가</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleCreateArchiveByOption('ai')}>
                <ListItemIcon><AutoAwesomeIcon fontSize="small" /></ListItemIcon>
                <ListItemText>AI Chatbot 추가</ListItemText>
              </MenuItem>
              <Divider sx={{ my: 0.3, mx: 1, borderColor: isDark ? 'rgba(148,163,184,0.2)' : 'rgba(148,163,184,0.3)' }} />
              <MenuItem onClick={() => handleCreateArchiveByOption('newchat')}>
                <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
                <ListItemText>뉴챗 추가</ListItemText>
              </MenuItem>
            </Menu>
            {/* 일괄 삭제 버튼 */}
            <Tooltip title="커스텀 아카이브 일괄 삭제" placement="right">
              <IconButton
                onClick={() => {
                  setBulkDeleteDialogOpen(true);
                  if (isMobile) setMobileMenuOpen(false);
                }}
                size="small"
                sx={{
                  ...quickActionButtonSx,
                  color: isDark ? '#fda4af' : '#b91c1c',
                  '&:hover': {
                    color: isDark ? '#fecdd3' : '#991b1b',
                    bgcolor: isDark ? 'rgba(51,65,85,0.75)' : 'rgba(241,245,249,0.95)',
                    borderColor: isDark ? 'rgba(251,113,133,0.45)' : 'rgba(239,68,68,0.38)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                <DeleteSweepIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            {!isMobile && (
              <Tooltip title="사이드바 접기" placement="right">
                <IconButton
                  size="small"
                  onClick={() => setIsDesktopSidebarCollapsed(true)}
                  sx={{
                    ...quickActionButtonSx,
                  }}
                >
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>

      <Divider sx={{ borderColor: colorScheme.textFieldBorderColor }} />

      {/* 채팅방 목록 */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 1, minHeight: 0 }}>
        <List sx={{ py: 0.5 }}>
          {(() => {
            // archives를 타입별로 그룹핑
            const defaultTypes = [ARCHIVE_TYPES.COMPANY, ARCHIVE_TYPES.CODE, ARCHIVE_TYPES.SAP, ARCHIVE_TYPES.AI];
            const defaultMenuNames: Record<string, string> = {
              [ARCHIVE_TYPES.COMPANY]: ARCHIVE_NAMES.WORK,
              [ARCHIVE_TYPES.CODE]: ARCHIVE_NAMES.CODE,
              [ARCHIVE_TYPES.SAP]: ARCHIVE_NAMES.SAP,
              [ARCHIVE_TYPES.AI]: ARCHIVE_NAMES.CHATBOT,
            };
            const groupedDefault: Record<string, Archive[]> = {};
            const customList: Archive[] = [];
            for (const a of archives) {
              if (defaultTypes.includes(a.archive_type as any)) {
                if (!groupedDefault[a.archive_type]) groupedDefault[a.archive_type] = [];
                groupedDefault[a.archive_type].push(a);
              } else {
                customList.push(a);
              }
            }

            const renderArchiveItem = (
              archive: Archive,
              role: 'child' | 'custom' = 'custom'
            ) => {
              const isChild = role === 'child';
              const isSelected = currentArchive?.archive_id === archive.archive_id;
              const color = getArchiveColor(archive, isDark);
              const tag = getArchiveTag(archive);
              const displayTag = tag;
              const description = getArchiveDescription(archive);
              const iconSize = 28;

              return (
                <Box key={archive.archive_id}>
                  <Tooltip
                    title={description || ''}
                    placement="right"
                    arrow
                    enterDelay={600}
                    disableHoverListener={!description || isSidebarCollapsed}
                  >
                    <ListItemButton
                      selected={isSelected}
                      onClick={() => { if (isMobile) setMobileMenuOpen(false); selectArchive(archive); }}
                      component="div"
                      sx={{
                        borderRadius: isChild ? 1.8 : 2.5,
                        mb: isChild ? 0.3 : 0.68,
                        color: colorScheme.sidebarTextColor,
                        pr: isSidebarCollapsed ? 1 : 6,
                        pl: isChild ? 2.4 : undefined,
                        py: isChild ? 0.2 : undefined,
                        minHeight: isChild ? 30 : undefined,
                        ml: 0,
                        ...(isChild ? {} : desktopSidebarHoverSx),
                        ...(isChild ? {
                          border: '1px solid transparent',
                          boxShadow: 'none',
                          bgcolor: 'transparent',
                        } : {}),
                        '&.Mui-selected': {
                          bgcolor: isDark ? 'rgba(59,130,246,0.16)' : 'rgba(99,102,241,0.12)',
                          color: colorScheme.primaryColor,
                          borderColor: isChild ? 'transparent' : (isDark ? 'rgba(96,165,250,0.30)' : 'rgba(99,102,241,0.28)'),
                          '&:hover': { bgcolor: isDark ? 'rgba(59,130,246,0.22)' : 'rgba(99,102,241,0.16)' },
                          '& .MuiListItemIcon-root': { color: colorScheme.primaryColor },
                          '& .chatpage-sidebar-label': { color: colorScheme.primaryColor, fontWeight: 600 },
                        },
                        '&:hover': {
                          backgroundColor: isDark ? 'rgba(51,65,85,0.5)' : 'rgba(241,245,249,0.9)',
                          borderColor: isDark ? 'rgba(96,165,250,0.28)' : 'rgba(99,102,241,0.24)',
                          boxShadow: isChild
                            ? 'none'
                            : (isDark ? '0 10px 20px rgba(2,6,23,0.28)' : '0 8px 16px rgba(15,23,42,0.08)'),
                          transform: isMobile ? 'none' : isChild ? 'translateX(1px)' : 'translateX(2px) scale(1.005)',
                          '& .chatpage-sidebar-icon': { color: isDark ? '#BFDBFE' : '#3157E1', opacity: 1 },
                          '& .chatpage-sidebar-label': { color: isDark ? '#E2E8F0' : '#1E3A8A', fontWeight: 600 },
                          '& .menu-icon-button': { opacity: 1, visibility: 'visible' },
                        },
                        '& .menu-icon-button': { opacity: 0, visibility: 'hidden', transition: 'opacity 0.2s ease, visibility 0.2s ease' },
                        '&.Mui-selected .menu-icon-button': { opacity: 1, visibility: 'visible' },
                      }}
                    >
                      {!isChild && (
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Box sx={{
                            width: iconSize, height: iconSize, borderRadius: '9px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: isSelected
                              ? (isDark ? 'rgba(99,102,241,0.24)' : 'rgba(99,102,241,0.14)')
                              : (isDark ? 'rgba(148,163,184,0.20)' : 'rgba(148,163,184,0.22)'),
                            border: '1px solid',
                            borderColor: isSelected
                              ? (isDark ? 'rgba(129,140,248,0.38)' : 'rgba(99,102,241,0.30)')
                              : (isDark ? 'rgba(148,163,184,0.28)' : 'rgba(148,163,184,0.26)'),
                            transition: 'all 180ms ease',
                          }}>
                            {getIcon(archive)}
                          </Box>
                        </ListItemIcon>
                      )}
                      {!isSidebarCollapsed && (
                        <ListItemText primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="body2" className="chatpage-sidebar-label" sx={{
                              fontWeight: isSelected ? (isChild ? 500 : 600) : 400,
                              fontSize: isChild ? '0.72rem' : '0.82rem',
                              flex: 1,
                              color: isSelected
                                ? colorScheme.primaryColor
                                : (isDark ? '#E5E7EB' : '#1F2937'),
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {archive.archive_name}
                            </Typography>
                            {!isChild && displayTag && (
                              <Chip label={displayTag} size="small" sx={{
                                height: 20, fontSize: '0.62rem', fontWeight: 700,
                                bgcolor: isDark ? `${color}24` : `${color}22`, color,
                                borderRadius: '999px', border: '1px solid',
                                borderColor: isDark ? `${color}4D` : `${color}44`,
                                '& .MuiChip-label': { px: 0.8, py: 0.25 },
                              }} />
                            )}
                          </Box>
                        } />
                      )}
                      {!isSidebarCollapsed && (
                        <Tooltip title="채팅방 메뉴" placement="right">
                          <IconButton className="menu-icon-button" size="small"
                            onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, archive, role); }}
                            sx={{
                              position: 'absolute',
                              right: isChild ? 6 : 8,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: colorScheme.hintTextColor,
                              p: isChild ? 0.35 : 0.5,
                            }}
                            id={`archive-menu-button-${archive.archive_id}`}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </ListItemButton>
                  </Tooltip>
                </Box>
              );
            };

            return (
              <>
                {/* 기본 타입 메뉴 그룹 (타입은 고정, 하위 아카이브는 가변) */}
                {defaultTypes.map(type => {
                  const group = (groupedDefault[type] || []).sort((a, b) => (
                    new Date(a.archive_time).getTime() - new Date(b.archive_time).getTime()
                  ));
                  const hasChildren = group.length > 0;
                  const isExpanded = !!expandedTypes[type];
                  const menuTitle = defaultMenuNames[type];
                  const menuIconArchive: Archive = {
                    archive_id: `menu-${type}`,
                    archive_name: menuTitle,
                    archive_time: new Date(0).toISOString(),
                    archive_type: type,
                  };

                  return (
                    <Box key={type} sx={{ mb: isExpanded ? 0.42 : 0.28 }}>
                      {/* 고정 메뉴 헤더 */}
                      <Box sx={{ position: 'relative' }}>
                        <ListItemButton
                          component="div"
                          onClick={() => {
                            if (hasChildren) {
                              const firstArchive = group[0];
                              if (firstArchive) {
                                if (isMobile) setMobileMenuOpen(false);
                                selectArchive(firstArchive);
                              }
                            } else {
                              void handleCreateArchiveByOption(type as 'company' | 'code' | 'sap' | 'ai');
                            }
                          }}
                          sx={{
                            borderRadius: 2.5,
                            mb: 0.55,
                            color: colorScheme.sidebarTextColor,
                            pl: 2.7,
                            pr: isSidebarCollapsed ? 1 : 5.2,
                            ...desktopSidebarHoverSx,
                            '& .menu-icon-button': { opacity: 0, visibility: 'hidden', transition: 'opacity 0.2s ease, visibility 0.2s ease' },
                            '&:hover .menu-icon-button': { opacity: 1, visibility: 'visible' },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Box sx={{
                              width: 28, height: 28, borderRadius: '9px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              bgcolor: isDark ? 'rgba(148,163,184,0.20)' : 'rgba(148,163,184,0.22)',
                              border: '1px solid',
                              borderColor: isDark ? 'rgba(148,163,184,0.28)' : 'rgba(148,163,184,0.26)',
                              transition: 'all 180ms ease',
                            }}>
                              {getIcon(menuIconArchive)}
                            </Box>
                          </ListItemIcon>
                          {!isSidebarCollapsed && (
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pr: 0.2 }}>
                                  <Typography
                                    variant="body2"
                                    className="chatpage-sidebar-label"
                                    sx={{
                                      fontWeight: 600,
                                      fontSize: '0.82rem',
                                      flex: 1,
                                      color: isDark ? '#E5E7EB' : '#1F2937',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {menuTitle}
                                  </Typography>
                                  <Chip
                                    label={group.length}
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.60rem',
                                      fontWeight: 700,
                                      bgcolor: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(148,163,184,0.16)',
                                      color: isDark ? '#E2E8F0' : '#334155',
                                      borderRadius: '999px',
                                      '& .MuiChip-label': { px: 0.7, py: 0.2 },
                                    }}
                                  />
                                </Box>
                              }
                            />
                          )}
                        </ListItemButton>
                        {!isSidebarCollapsed && (
                          <>
                            <Tooltip title={isExpanded ? '접기' : '펼치기'} placement="right">
                              <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); toggleTypeExpanded(type); }}
                                sx={{
                                  position: 'absolute', left: -2, top: '50%', transform: 'translateY(-50%)',
                                  width: 22, height: 22, p: 0,
                                  color: colorScheme.hintTextColor,
                                  zIndex: 1,
                                  transition: 'transform 0.2s',
                                  '& svg': { fontSize: 12, transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' },
                                }}
                              >
                                <ChevronRightIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={`${menuTitle} 추가`} placement="right">
                              <IconButton
                                className="menu-icon-button"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleCreateArchiveByOption(type as 'company' | 'code' | 'sap' | 'ai');
                                }}
                                sx={{
                                  position: 'absolute',
                                  right: 6,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  color: colorScheme.hintTextColor,
                                  p: 0.5,
                                }}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>

                      {/* 하위 아카이브들 */}
                      {isExpanded && !isSidebarCollapsed && hasChildren && (
                        <Box sx={{
                          ml: 1.7,
                          pl: 0.8,
                          borderLeft: `1px solid ${isDark ? 'rgba(148,163,184,0.15)' : 'rgba(148,163,184,0.25)'}`,
                          mb: 0.35,
                        }}>
                          {group.map(child => renderArchiveItem(child, 'child'))}
                        </Box>
                      )}
                    </Box>
                  );
                })}

                {/* 구분선 (커스텀 아카이브 있을 때) */}
                {customList.length > 0 && (
                  <Divider sx={{ my: 1, mx: 1, borderColor: colorScheme.textFieldBorderColor }} />
                )}

                {/* 커스텀 아카이브 (flat list) */}
                {customList.map(archive => renderArchiveItem(archive, 'custom'))}
              </>
            );
          })()}
        </List>
      </Box>

      {/* 하단 고정 영역 (업무 메뉴 + 하단 메뉴) */}
      <Box sx={{ flexShrink: 0 }}>
        <Divider sx={{ mx: 2, borderColor: colorScheme.textFieldBorderColor }} />

        {/* 업무 메뉴 섹션 - MobileMainLayout 스타일 */}
        {!isSidebarCollapsed && (
          <Box sx={{ px: 2, py: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: colorScheme.hintTextColor,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              업무
            </Typography>
          </Box>
        )}
        <List sx={{ px: 1 }}>
          {/* 전자결재 메뉴 (임시 숨김) */}
          {/* <ListItemButton
            onClick={() => {
              navigate('/approval');
              if (isMobile) setMobileMenuOpen(false);
            }}
            selected={location.pathname === '/approval'}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: colorScheme.sidebarTextColor,
              '&.Mui-selected': {
                backgroundColor: isDark ? 'rgba(79, 195, 247, 0.15)' : '#e3f2fd',
                color: colorScheme.primaryColor,
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(79, 195, 247, 0.25)' : '#bbdefb',
                },
                '& .MuiListItemIcon-root': {
                  color: colorScheme.primaryColor,
                },
              },
              '&:hover': {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
              },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === '/approval' ? colorScheme.primaryColor : colorScheme.hintTextColor }}>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText
              primary="전자결재"
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: location.pathname === '/approval' ? 600 : 400,
              }}
            />
          </ListItemButton> */}

          {/* 휴가관리 */}
          <ListItemButton
            onClick={() => {
              navigate('/leave');
              if (isMobile) setMobileMenuOpen(false);
            }}
            selected={location.pathname === '/leave'}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: colorScheme.sidebarTextColor,
              ...desktopSidebarHoverSx,
              '&.Mui-selected': {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e3f2fd',
                color: colorScheme.primaryColor,
                borderColor: 'transparent',
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#bbdefb',
                  boxShadow: isDark ? '0 8px 14px rgba(0,0,0,0.16)' : '0 6px 12px rgba(25,118,210,0.08)',
                  transform: isMobile ? 'none' : 'translateX(2px) scale(1.005)',
                },
                '& .MuiListItemIcon-root': {
                  color: colorScheme.primaryColor,
                },
                '& .chatpage-sidebar-label': {
                  color: colorScheme.primaryColor,
                  fontWeight: 600,
                },
              },
            }}
          >
            <ListItemIcon className="chatpage-sidebar-icon" sx={{ color: location.pathname === '/leave' ? colorScheme.primaryColor : colorScheme.hintTextColor }}>
              <BeachAccessIcon />
            </ListItemIcon>
            <ListItemText
              primary={isSidebarCollapsed ? '' : '휴가 관리'}
              primaryTypographyProps={{
                className: 'chatpage-sidebar-label',
                fontSize: '0.9rem',
                color: location.pathname === '/leave' ? colorScheme.primaryColor : colorScheme.sidebarTextColor,
                fontWeight: location.pathname === '/leave' ? 600 : 400,
              }}
            />
          </ListItemButton>

        </List>

        <Divider sx={{ mx: 2, borderColor: colorScheme.textFieldBorderColor }} />

        {/* 하단 메뉴 - MobileMainLayout 스타일 */}
        <List sx={{ px: 1 }}>
          <ListItemButton
            onClick={() => {
              navigate('/settings');
              if (isMobile) setMobileMenuOpen(false);
            }}
            selected={location.pathname === '/settings'}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: colorScheme.sidebarTextColor,
              ...desktopSidebarHoverSx,
              '&.Mui-selected': {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e3f2fd',
                color: colorScheme.primaryColor,
                borderColor: 'transparent',
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#bbdefb',
                  boxShadow: isDark ? '0 8px 14px rgba(0,0,0,0.16)' : '0 6px 12px rgba(25,118,210,0.08)',
                  transform: isMobile ? 'none' : 'translateX(2px) scale(1.005)',
                },
                '& .MuiListItemIcon-root': {
                  color: colorScheme.primaryColor,
                },
                '& .chatpage-sidebar-label': {
                  color: colorScheme.primaryColor,
                  fontWeight: 600,
                },
              },
            }}
          >
            <ListItemIcon className="chatpage-sidebar-icon" sx={{ color: location.pathname === '/settings' ? colorScheme.primaryColor : colorScheme.hintTextColor }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText
              primary={isSidebarCollapsed ? '' : '설정'}
              primaryTypographyProps={{
                className: 'chatpage-sidebar-label',
                fontSize: '0.9rem',
                color: location.pathname === '/settings' ? colorScheme.primaryColor : colorScheme.sidebarTextColor,
                fontWeight: location.pathname === '/settings' ? 600 : 400,
              }}
            />
          </ListItemButton>

          <ListItemButton
            onClick={() => {
              setHelpDialogOpen(true);
              if (isMobile) setMobileMenuOpen(false);
            }}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: colorScheme.sidebarTextColor,
              ...desktopSidebarHoverSx,
            }}
          >
            <ListItemIcon className="chatpage-sidebar-icon" sx={{ color: colorScheme.hintTextColor }}>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText
              primary={isSidebarCollapsed ? '' : '도움말'}
              primaryTypographyProps={{
                className: 'chatpage-sidebar-label',
                fontSize: '0.9rem',
                color: colorScheme.sidebarTextColor,
              }}
            />
          </ListItemButton>

          <ListItemButton
            onClick={() => {
              authService.logout();
              if (isMobile) setMobileMenuOpen(false);
            }}
            sx={{
              borderRadius: 2,
              color: isDark ? '#ff6b6b' : '#d32f2f',
              ...desktopSidebarDangerHoverSx,
            }}
          >
            <ListItemIcon className="chatpage-sidebar-icon" sx={{ color: 'inherit' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary={isSidebarCollapsed ? '' : '로그아웃'}
              primaryTypographyProps={{ className: 'chatpage-sidebar-label', fontSize: '0.9rem' }}
            />
          </ListItemButton>

          {/* 사내AI 공모전 메뉴 (임시 숨김) */}
          {/* <ListItemButton
            onClick={() => {
              navigate('/contest');
              if (isMobile) setMobileMenuOpen(false);
            }}
            selected={location.pathname === '/contest'}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: colorScheme.sidebarTextColor,
              '&.Mui-selected': {
                backgroundColor: isDark ? 'rgba(79, 195, 247, 0.15)' : '#e3f2fd',
                color: colorScheme.primaryColor,
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(79, 195, 247, 0.25)' : '#bbdefb',
                },
                '& .MuiListItemIcon-root': {
                  color: colorScheme.primaryColor,
                },
              },
              '&:hover': {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
              },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === '/contest' ? colorScheme.primaryColor : colorScheme.hintTextColor }}>
              <EmojiEventsIcon />
            </ListItemIcon>
            <ListItemText
              primary="사내AI 공모전"
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: location.pathname === '/contest' ? 600 : 400,
              }}
            />
          </ListItemButton> */}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        // Mobile: position fixed prevents iOS Safari from scrolling the document
        // when the keyboard opens, which would push messages above the viewport.
        // On iOS, fixed elements are positioned relative to the visual viewport
        // (above the keyboard), so bottom:0 always stays at the top of the keyboard.
        // On Android Chrome (interactive-widget=resizes-content), the viewport
        // itself shrinks, so fixed bottom:0 also stays at the keyboard top.
        position: { xs: 'fixed', md: 'relative' },
        top: { xs: 0, md: 'auto' },
        left: { xs: 0, md: 'auto' },
        right: { xs: 0, md: 'auto' },
        bottom: { xs: 0, md: 'auto' },
        height: { xs: 'auto', md: '100vh' },
        width: { xs: 'auto', md: '100%' },
        overflow: 'hidden',
      }}
    >
      {/* 모바일 상단 헤더 (모바일에서만 표시) */}
      <MobileOnly>
        <AppBar
          position="fixed"
          sx={{
            background: `linear-gradient(90deg, ${colorScheme.appBarGradientStart}, ${colorScheme.appBarGradientEnd})`,
            flexShrink: 0,
            zIndex: (theme) => theme.zIndex.drawer + 1,
            // Safe Area handling for top
            pt: 'var(--sat)',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          <Toolbar variant="dense" sx={{ minHeight: { xs: 48 } }}>
            <Tooltip title="메뉴 열기" placement="bottom">
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setMobileMenuOpen(true)}
                sx={{ mr: 2, color: colorScheme.appBarTextColor }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontSize: '1rem', color: colorScheme.appBarTextColor }}>
              {currentArchive?.archive_name || 'ASPN AI Agent'}
            </Typography>
            <Tooltip title="선물함" placement="bottom">
              <Box component="span" sx={{ display: 'inline-flex' }}>
                <GiftButton onDark={isDark} />
              </Box>
            </Tooltip>
            <Tooltip title="전자결재" placement="bottom">
              <IconButton
                onClick={() => openElectronicApproval()}
                sx={{
                  mr: 1,
                  color: isDark ? 'rgba(255,255,255,0.92)' : 'rgba(51,65,85,0.8)',
                  bgcolor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.05)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.13)',
                  transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(255,255,255,0.24)' : 'rgba(0,0,0,0.1)',
                    transform: 'scale(1.12)',
                    boxShadow: isDark ? '0 0 14px rgba(255,255,255,0.2)' : '0 0 12px rgba(0,0,0,0.1)',
                    borderColor: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.22)',
                  },
                  '&:active': { transform: 'scale(0.95)' },
                }}
              >
                <DescriptionIcon />
              </IconButton>
            </Tooltip>
            {currentUser && (
              <Tooltip title="알림함" placement="bottom">
                <Box component="span" sx={{ display: 'inline-flex' }}>
                  <NotificationButton onDark={isDark} />
                </Box>
              </Tooltip>
            )}
            <Button
              size="small"
              onClick={openMessenger}
              startIcon={<HeadsetMicIcon sx={{ fontSize: '16px !important' }} />}
              sx={{
                ml: 1,
                px: 1.5,
                py: 0.5,
                minWidth: 'auto',
                whiteSpace: 'nowrap',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                color: '#fff',
                border: 'none',
                boxShadow: '0 0 0 0 rgba(139,92,246,0.4)',
                transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
                  transform: 'scale(1.06)',
                  boxShadow: '0 4px 15px rgba(139,92,246,0.55)',
                },
                '&:active': {
                  transform: 'scale(0.97)',
                },
                '@keyframes pulse-glow': {
                  '0%, 100%': { boxShadow: '0 0 0 0 rgba(139,92,246,0.4)' },
                  '50%': { boxShadow: '0 0 0 5px rgba(139,92,246,0)' },
                },
                animation: 'pulse-glow 2.5s ease-in-out infinite',
              }}
            >
              1:1 문의
            </Button>
          </Toolbar>
        </AppBar>
      </MobileOnly>

      {/* 데스크톱 상단 버튼들 (우측 상단 고정) */}
      <DesktopOnly>
        <Box
          sx={{
            position: 'fixed',
            top: 12,
            right: 16,
            zIndex: (theme) => theme.zIndex.appBar,
            display: 'flex',
            gap: 1,
          }}
        >
          <Tooltip title="선물함" placement="bottom">
            <Box component="span" sx={{ display: 'inline-flex' }}>
              <GiftButton onDark={isDark} />
            </Box>
          </Tooltip>
          <Tooltip title="전자결재" placement="bottom">
            <IconButton
              onClick={() => openElectronicApproval()}
              sx={{
                color: isDark ? 'rgba(226,232,240,0.85)' : 'rgba(51,65,85,0.8)',
                bgcolor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
                transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.09)',
                  transform: 'scale(1.12)',
                  boxShadow: isDark
                    ? '0 0 12px rgba(255,255,255,0.1)'
                    : '0 0 12px rgba(0,0,0,0.12)',
                  borderColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.18)',
                },
                '&:active': { transform: 'scale(0.95)' },
              }}
            >
              <DescriptionIcon />
            </IconButton>
          </Tooltip>
          {currentUser && (
            <Tooltip title="알림함" placement="bottom">
              <Box component="span" sx={{ display: 'inline-flex' }}>
                <NotificationButton onDark={isDark} />
              </Box>
            </Tooltip>
          )}
          <Button
            className="channel-io-inquiry-btn"
            size="small"
            onClick={openMessenger}
            startIcon={<HeadsetMicIcon sx={{ fontSize: '16px !important' }} />}
            sx={{
              ml: 1,
              px: 1.8,
              py: 0.65,
              minWidth: 'auto',
              whiteSpace: 'nowrap',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.03em',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 2px 8px rgba(139,92,246,0.35)',
              transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
                transform: 'translateY(-1px) scale(1.05)',
                boxShadow: '0 6px 20px rgba(139,92,246,0.5)',
              },
              '&:active': {
                transform: 'translateY(0) scale(0.97)',
                boxShadow: '0 2px 6px rgba(139,92,246,0.3)',
              },
              '@keyframes pulse-glow-desk': {
                '0%, 100%': { boxShadow: '0 2px 8px rgba(139,92,246,0.35)' },
                '50%': { boxShadow: '0 2px 18px rgba(139,92,246,0.6)' },
              },
              animation: 'pulse-glow-desk 2.5s ease-in-out infinite',
            }}
          >
            1:1 문의
          </Button>
        </Box>
      </DesktopOnly>

      {/* 메인 콘텐츠 영역 (사이드바 + 채팅 영역) */}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          width: '100%',
          height: {
            xs: '100%', // Mobile: outer Box is now position:fixed so 100% = full visual viewport
            md: '100vh',
          },
          pt: {
            xs: 'calc(48px + var(--sat))',
            md: 0,
          },
        }}
      >
        {/* 사이드바 - Desktop: permanent, Mobile: temporary - Flutter 스타일 */}
        < MobileOnly >
          <Drawer
            variant="temporary"
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            ModalProps={{
              keepMounted: true, // 모바일에서 성능 향상
            }}
            sx={{
              '& .MuiDrawer-paper': {
                width: SIDEBAR_EXPANDED_WIDTH,
                boxSizing: 'border-box',
                bgcolor: colorScheme.sidebarBackgroundColor,
                backgroundImage: isDark
                  ? 'linear-gradient(180deg, rgba(31,41,55,0.98), rgba(17,24,39,0.98))'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.98))',
                borderRight: `1px solid ${colorScheme.textFieldBorderColor}`,
                // Safe area padding for the drawer content if needed
                pl: 'var(--sal)',
                boxShadow: isDark
                  ? '8px 0 28px rgba(2,6,23,0.32)'
                  : '8px 0 28px rgba(15,23,42,0.08)',
              },
            }}
          >
            {sidebarContent}
          </Drawer>
        </MobileOnly >

        <DesktopOnly>
          <Drawer
            variant="permanent"
            open={true}
            sx={{
              width: desktopSidebarWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: desktopSidebarWidth,
                boxSizing: 'border-box',
                bgcolor: colorScheme.sidebarBackgroundColor,
                backgroundImage: isDark
                  ? 'linear-gradient(180deg, rgba(31,41,55,0.98), rgba(17,24,39,0.98))'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.98))',
                borderRight: `1px solid ${colorScheme.textFieldBorderColor}`,
                position: 'relative',
                height: 'var(--app-height)',
                transition: 'width 220ms ease',
                boxShadow: isDark
                  ? '8px 0 28px rgba(2,6,23,0.32)'
                  : '8px 0 28px rgba(15,23,42,0.08)',
              },
            }}
          >
            {sidebarContent}
          </Drawer>
        </DesktopOnly>

        {/* 메인 채팅 영역 */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: {
              xs: '100%', // 모바일: 전체 너비
              md: `calc(100% - ${desktopSidebarWidth}px)`, // 데스크톱: 사이드바 제외
            },
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ChatArea />
        </Box>
      </Box >

      <ChatPageModals
        searchDialogOpen={searchDialogOpen}
        setSearchDialogOpen={setSearchDialogOpen}
        helpDialogOpen={helpDialogOpen}
        setHelpDialogOpen={setHelpDialogOpen}
        anchorEl={anchorEl}
        handleMenuClose={handleMenuClose}
        selectedArchive={selectedArchive}
        selectedArchiveRole={selectedArchiveRole}
        setSelectedArchive={setSelectedArchive}
        handleRenameClick={handleRenameClick}
        handleDeleteClick={handleDeleteClick}
        renameDialogOpen={renameDialogOpen}
        setRenameDialogOpen={setRenameDialogOpen}
        newName={newName}
        setNewName={setNewName}
        handleRenameSubmit={handleRenameSubmit}
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        handleDeleteConfirm={handleDeleteConfirm}
        isDeletingArchive={isDeletingArchive}
        bulkDeleteDialogOpen={bulkDeleteDialogOpen}
        setBulkDeleteDialogOpen={setBulkDeleteDialogOpen}
        handleBulkDelete={handleBulkDelete}
        archives={archives}
        selectArchive={selectArchive}
        snackbar={snackbar}
        setSnackbar={setSnackbar}
      />

      {/* ChannelIO 열려있을 때 X 닫기 버튼 오버레이 */}
      {
        isChannelIOOpen && (
          <Box
            sx={{
              position: 'fixed',
              bottom: { xs: 106, md: 96 },
              right: { xs: 12, md: 92 },
              zIndex: 99999,
            }}
          >
            <Tooltip title="문의 창 닫기" placement="left">
              <IconButton
                onClick={closeMessenger}
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.95)',
                  color: isDark ? '#fff' : '#333',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  width: 32,
                  height: 32,
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(50,50,50,0.95)' : 'rgba(240,240,240,0.98)',
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )
      }

    </Box >
  );
}
