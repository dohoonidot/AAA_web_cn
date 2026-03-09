import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Chip,
  Collapse,
  Divider,
  Button,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Business as BusinessIcon,
  Code as CodeIcon,
  Build as SapIcon,
  Description as ApprovalIcon,
  BeachAccess as LeaveIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import type { Archive } from '../../types';
import { useSidebarState } from './Sidebar.state';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

const SIDEBAR_WIDTH = 280;

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, isMobile = false }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('md'));

  const { state, actions, derived } = useSidebarState({ isOpen, onToggle, isMobileScreen });
  const { archives, currentArchive, expandedSections, isLoading, userInfo } = state;
  const {
    toggleSection,
    handleArchiveClick,
    handleCreateArchive,
    handleMenuClick,
    handleLogout,
  } = actions;
  const { isApprover } = derived;

  const menuItems = [
    {
      id: 'chat',
      label: '채팅',
      icon: <ChatIcon />,
      expandable: true,
      items: [
        {
          id: 'business',
          label: '사내업무',
          icon: <BusinessIcon />,
          type: '',
          onClick: () => handleCreateArchive('', '사내업무'),
        },
        {
          id: 'coding',
          label: '코딩어시스턴트',
          icon: <CodeIcon />,
          type: 'code',
          onClick: () => handleCreateArchive('code', '코딩어시스턴트'),
        },
        {
          id: 'sap',
          label: 'SAP 어시스턴트',
          icon: <SapIcon />,
          type: 'sap',
          onClick: () => handleCreateArchive('sap', 'SAP 어시스턴트'),
        },
        {
          id: 'ai-chatbot',
          label: 'AI Chatbot',
          icon: <ChatIcon />,
          type: '',
          onClick: () => handleCreateArchive('', 'AI Chatbot'),
        },
      ],
    },
    // 전자결재 메뉴 (임시 숨김)
    // {
    //   id: 'approval',
    //   label: '전자결재',
    //   icon: <ApprovalIcon />,
    //   path: '/approval',
    //   onClick: () => handleMenuClick('/approval'),
    // },
    {
      id: 'leave',
      label: '휴가관리',
      icon: <LeaveIcon />,
      // 승인자인 경우 관리자 휴가관리로 바로 이동
      path: isApprover ? '/admin-leave' : '/leave',
      onClick: () => handleMenuClick(isApprover ? '/admin-leave' : '/leave'),
    },
    {
      id: 'settings',
      label: '설정',
      icon: <SettingsIcon />,
      path: '/settings',
      onClick: () => handleMenuClick('/settings'),
    },
  ];

  const renderArchiveItem = (archive: Archive) => {
    const isSelected = currentArchive?.archive_id === archive.archive_id;

    return (
      <ListItem key={archive.archive_id} disablePadding>
        <ListItemButton
          selected={isSelected}
          onClick={() => handleArchiveClick(archive)}
          sx={{
            borderRadius: 1,
            mx: 1,
            mb: 0.5,
            '&.Mui-selected': {
              bgcolor: theme.palette.primary.main + '20',
              '&:hover': {
                bgcolor: theme.palette.primary.main + '30',
              },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            {getArchiveIcon(archive.archive_type)}
          </ListItemIcon>
          <ListItemText
            primary={archive.archive_name}
            primaryTypographyProps={{
              fontSize: '14px',
              fontWeight: isSelected ? 600 : 400,
              noWrap: true,
            }}
          />
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="수정">
              <IconButton size="small" onClick={(e) => {
                e.stopPropagation();
                // TODO: 아카이브 이름 수정 기능
              }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="삭제">
              <IconButton size="small" onClick={(e) => {
                e.stopPropagation();
                // TODO: 아카이브 삭제 기능
              }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </ListItemButton>
      </ListItem>
    );
  };

  const getArchiveIcon = (type: string) => {
    switch (type) {
      case 'code':
        return <CodeIcon fontSize="small" />;
      case 'sap':
        return <SapIcon fontSize="small" />;
      default:
        return <BusinessIcon fontSize="small" />;
    }
  };

  const sidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 */}
      <Box sx={{
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}>
        <Avatar sx={{ width: 32, height: 32 }}>
          <PersonIcon />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {userInfo?.name || '사용자'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {userInfo?.department || ''}
          </Typography>
        </Box>
        {isMobileScreen && (
          <IconButton onClick={onToggle}>
            <MenuIcon />
          </IconButton>
        )}
      </Box>

      {/* 메뉴 목록 */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        <List>
          {menuItems.map((menu) => (
            <React.Fragment key={menu.id}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={menu.expandable ? () => toggleSection(menu.id) : menu.onClick}
                  selected={location.pathname === menu.path}
                  sx={{
                    borderRadius: 1,
                    mx: 1,
                    mb: 0.5,
                  }}
                >
                  <ListItemIcon>
                    {menu.icon}
                  </ListItemIcon>
                  <ListItemText primary={menu.label} />
                  {menu.expandable && (
                    expandedSections.has(menu.id) ? <ExpandLess /> : <ExpandMore />
                  )}
                </ListItemButton>
              </ListItem>

              {/* 확장 가능한 섹션의 하위 메뉴 */}
              {menu.expandable && (
                <Collapse in={expandedSections.has(menu.id)} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {/* 아카이브 목록 */}
                    {menu.id === 'chat' && archives.map(renderArchiveItem)}

                    {/* 새 채팅 생성 버튼 */}
                    {menu.id === 'chat' && (
                      <>
                        <Divider sx={{ my: 1, mx: 2 }} />
                        <ListItem disablePadding>
                          <ListItemButton
                            onClick={() => handleCreateArchive('', '새 채팅')}
                            sx={{
                              borderRadius: 1,
                              mx: 1,
                              mb: 0.5,
                              bgcolor: theme.palette.primary.main + '10',
                            }}
                          >
                            <ListItemIcon>
                              <AddIcon />
                            </ListItemIcon>
                            <ListItemText primary="새 채팅" />
                          </ListItemButton>
                        </ListItem>
                      </>
                    )}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* 하단 액션들 */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ mb: 1 }}
        >
          로그아웃
        </Button>
      </Box>
    </Box>
  );

  if (isMobileScreen) {
    return (
      <Drawer
        anchor="left"
        open={isOpen}
        onClose={onToggle}
        ModalProps={{
          keepMounted: true,
        }}
        PaperProps={{
          sx: { width: SIDEBAR_WIDTH },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={isOpen}
      PaperProps={{
        sx: {
          width: SIDEBAR_WIDTH,
          borderRight: 1,
          borderColor: 'divider',
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  );
};

export default Sidebar;
