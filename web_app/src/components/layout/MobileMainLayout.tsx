import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Chip,
  SwipeableDrawer,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Chat as ChatIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import ChatSidebar from '../chat/ChatSidebar';
import { GiftButton } from '../common/GiftBox';
import HelpDialog from '../common/HelpDialog';

import { useMobileMainLayoutState } from './MobileMainLayout.state';

const DRAWER_WIDTH = 280;

interface MobileMainLayoutProps {
  children: React.ReactNode;
  hideAppBar?: boolean; // 모바일 뷰에서 AppBar 숨김 여부
  hideSidebarOnDesktop?: boolean; // 데스크톱 뷰에서 사이드바 숨김 여부
  title?: string; // 앱바 타이틀
  showBackButton?: boolean; // 뒤로가기 버튼 표시 여부
  onBackClick?: () => void; // 뒤로가기 버튼 클릭 핸들러
  hideGiftButton?: boolean; // 앱바 선물함 버튼 숨김 여부
}

export default function MobileMainLayout({
  children,
  hideAppBar = false,
  hideSidebarOnDesktop = false,
  title,
  showBackButton = false,
  onBackClick,
  hideGiftButton = false,
}: MobileMainLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';
  const desktopSidebarHoverSx = !isMobile ? {
    border: '1px solid transparent',
    transform: 'translateX(0) scale(1)',
    transformOrigin: 'left center',
    transition: 'background-color 180ms ease-out, border-color 180ms ease-out, box-shadow 220ms ease-out, transform 180ms ease-out, color 180ms ease-out',
    '&:hover': {
      backgroundColor: isDark ? 'rgba(74, 108, 247, 0.10)' : 'rgba(74, 108, 247, 0.07)',
      borderColor: isDark ? 'rgba(129, 140, 248, 0.32)' : 'rgba(74, 108, 247, 0.2)',
      boxShadow: isDark
        ? '0 8px 14px rgba(0, 0, 0, 0.2)'
        : '0 6px 12px rgba(74, 108, 247, 0.08)',
      transform: 'translateX(3px) scale(1.01)',
      '& .sidebar-hover-icon': {
        color: isDark ? '#C7D2FE' : '#3157E1',
      },
      '& .sidebar-hover-label': {
        color: isDark ? '#EEF2FF' : '#1E3A8A',
        fontWeight: 600,
      },
    },
  } : {};
  const desktopSidebarDangerHoverSx = !isMobile ? {
    border: '1px solid transparent',
    transform: 'translateX(0) scale(1)',
    transformOrigin: 'left center',
    transition: 'background-color 180ms ease-out, border-color 180ms ease-out, box-shadow 220ms ease-out, transform 180ms ease-out, color 180ms ease-out',
    '&:hover': {
      backgroundColor: isDark ? 'rgba(255, 107, 107, 0.12)' : '#ffebee',
      borderColor: isDark ? 'rgba(255, 135, 135, 0.28)' : 'rgba(211, 47, 47, 0.18)',
      boxShadow: isDark
        ? '0 8px 14px rgba(0, 0, 0, 0.18)'
        : '0 6px 12px rgba(211, 47, 47, 0.08)',
      color: isDark ? '#ff8787' : '#b71c1c',
      transform: 'translateX(3px) scale(1.01)',
      '& .sidebar-hover-icon': {
        color: 'inherit',
      },
      '& .sidebar-hover-label': {
        color: 'inherit',
        fontWeight: 600,
      },
    },
  } : {};

  const { state, actions } = useMobileMainLayoutState({ isMobile });
  const { mobileOpen, helpDialogOpen, user, location, drawerRef, workMenuItems } = state;
  const {
    handleDrawerToggle,
    handleDrawerClose,
    handleMenuClick,
    handleLogout,
    setHelpDialogOpen,
  } = actions;

  const drawer = (
    <Box ref={drawerRef} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 사용자 정보 헤더 */}
      <Box
        sx={{
          p: 2,
          backgroundColor: isDark ? 'transparent' : '#f8f9fa',
          color: isDark ? '#E5E7EB' : '#333333',
          borderBottom: isDark ? '1px solid #374151' : '1px solid #e0e0e0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar sx={{ bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e3f2fd', color: isDark ? '#F8FAFC' : '#1976d2', width: 40, height: 40 }}>
            <ChatIcon sx={{ fontSize: 20 }} />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 'bold',
                fontSize: '1rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%'
              }}
            >
              {user?.userId || '사용자'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
              ASPN AI Agent
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ChatSidebar 컴포넌트 사용 */}
      <ChatSidebar
        isMobile={isMobile}
        onMobileMenuClose={() => handleDrawerClose()}
      />

      <Divider sx={{ mx: 2 }} />

      {/* 업무 메뉴 섹션 */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          업무
        </Typography>
      </Box>
      <List sx={{ px: 1 }}>
        {workMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleMenuClick(item.path)}
              selected={location.pathname === item.path}
              component="div"
              sx={{
                borderRadius: 2,
                mb: 0.5,
                ...desktopSidebarHoverSx,
                '&.Mui-selected': {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e3f2fd',
                  color: isDark ? '#F8FAFC' : '#1976d2',
                  borderColor: 'transparent',
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#bbdefb',
                    boxShadow: isDark
                      ? '0 8px 14px rgba(0, 0, 0, 0.16)'
                      : '0 6px 12px rgba(25, 118, 210, 0.08)',
                    transform: isMobile ? 'none' : 'translateX(2px) scale(1.005)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: isDark ? '#F8FAFC' : '#1976d2',
                  },
                },
              }}
            >
              <ListItemIcon
                className="sidebar-hover-icon"
                sx={{
                  color: location.pathname === item.path ? (isDark ? '#F8FAFC' : '#1976d2') : 'text.secondary',
                }}
              >
                {(() => {
                  const Icon = item.icon;
                  return <Icon />;
                })()}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  className: 'sidebar-hover-label',
                  fontSize: '0.9rem',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mx: 2 }} />

      {/* 하단 메뉴 */}
      <Box sx={{ flex: 1 }} />
      <List sx={{ px: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleMenuClick('/settings')}
            selected={location.pathname === '/settings'}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              ...desktopSidebarHoverSx,
              '&.Mui-selected': {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e3f2fd',
                color: isDark ? '#F8FAFC' : '#1976d2',
                borderColor: 'transparent',
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#bbdefb',
                  boxShadow: isDark
                    ? '0 8px 14px rgba(0, 0, 0, 0.16)'
                    : '0 6px 12px rgba(25, 118, 210, 0.08)',
                  transform: isMobile ? 'none' : 'translateX(2px) scale(1.005)',
                },
                '& .MuiListItemIcon-root': {
                  color: isDark ? '#F8FAFC' : '#1976d2',
                },
              },
            }}
          >
            <ListItemIcon
              className="sidebar-hover-icon"
              sx={{
                color: location.pathname === '/settings' ? (isDark ? '#F8FAFC' : '#1976d2') : 'text.secondary',
              }}
            >
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText
              primary="설정"
              primaryTypographyProps={{
                className: 'sidebar-hover-label',
                fontSize: '0.9rem',
                fontWeight: location.pathname === '/settings' ? 600 : 400,
              }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              setHelpDialogOpen(true);
              handleDrawerClose();
            }}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              ...desktopSidebarHoverSx,
            }}
          >
            <ListItemIcon className="sidebar-hover-icon" sx={{ color: 'text.secondary' }}>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText
              primary="도움말"
              primaryTypographyProps={{ className: 'sidebar-hover-label', fontSize: '0.9rem' }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            component="div"
            sx={{
              borderRadius: 2,
              color: isDark ? '#ff6b6b' : '#d32f2f',
              ...desktopSidebarDangerHoverSx,
            }}
          >
            <ListItemIcon className="sidebar-hover-icon" sx={{ color: 'inherit' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="로그아웃"
              primaryTypographyProps={{ className: 'sidebar-hover-label', fontSize: '0.9rem' }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: { xs: 'var(--app-height)', md: '100vh' } }}>
      {/* 앱바 - 모바일에서 hideAppBar가 true이면 숨김 */}
      {!(isMobile && hideAppBar) && (
        <AppBar
          position="fixed"
          sx={{
            width: { md: hideSidebarOnDesktop ? '100%' : `calc(100% - ${DRAWER_WIDTH}px)` },
            ml: { md: hideSidebarOnDesktop ? 0 : `${DRAWER_WIDTH}px` },
            backgroundColor: isDark ? '#0F172A' : 'white',
            color: isDark ? '#E5E7EB' : '#333333',
            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 1301, // 모바일 사이드바 z-index(1300)보다 높게 설정
          }}
        >
          <Toolbar>
            {showBackButton ? (
              <IconButton
                color="inherit"
                edge="start"
                onClick={onBackClick}
                sx={{ mr: 2 }}
              >
                <ArrowBackIcon />
              </IconButton>
            ) : (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              {title || 'ASPN AI Agent'}
            </Typography>
            {!hideGiftButton && <GiftButton onDark={isDark} />}
          </Toolbar>
        </AppBar>
      )}

      {/* 사이드바 */}
      <Box
        component="nav"
        sx={{
          width: { md: hideSidebarOnDesktop ? 0 : DRAWER_WIDTH },
          flexShrink: { md: 0 },
          display: { md: hideSidebarOnDesktop ? 'none' : 'block' }
        }}
      >
        {/* 모바일 드로어 */}
        <SwipeableDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerClose}
          onOpen={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
            disableAutoFocus: true,
            disableEnforceFocus: true,
            disableRestoreFocus: true,
            disablePortal: true,
            disableScrollLock: true,
            hideBackdrop: false,
            style: {
              zIndex: 1300,
              top: hideAppBar ? 0 : '64px',
            },
            // aria-hidden을 설정하지 않도록 함 (inert 속성 사용)
          }}
          BackdropProps={{
            invisible: false,
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              top: hideAppBar ? 0 : '64px', // hideAppBar에 따라 Backdrop도 위치 조정
            },
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              top: hideAppBar ? 0 : '64px', // hideAppBar가 true면 top 0, false면 앱바 아래
              height: hideAppBar ? 'var(--app-height)' : 'calc(var(--app-height) - 64px)', // hideAppBar에 따라 높이 조정
            },
            '& .MuiBackdrop-root': {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              top: hideAppBar ? 0 : '64px',
            },
          }}
        >
          {drawer}
        </SwipeableDrawer>

        {/* 데스크톱 드로어 */}
        {!hideSidebarOnDesktop && (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: DRAWER_WIDTH,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* 메인 콘텐츠 */}
      <Box
        component="main"
        inert={isMobile && mobileOpen ? true : undefined}
        sx={{
          flexGrow: 1,
          width: { md: hideSidebarOnDesktop ? '100%' : `calc(100% - ${DRAWER_WIDTH}px)` },
          // Mobile Optimization: Use dvh and handle safe areas
          height: {
            xs: 'var(--app-height)', // Mobile: dynamic viewport height with JS fallback
            md: '100vh',  // Desktop: standard viewport height
          },
          overflow: 'hidden',
          // 사이드바가 열릴 때 포커스 방지
          ...(isMobile && mobileOpen && {
            pointerEvents: 'none',
            userSelect: 'none',
            '& *': {
              pointerEvents: 'none !important',
            },
          }),
        }}
      >
        {/* 모바일에서 hideAppBar가 true이면 Toolbar 스페이서를 렌더링하지 않음 */}
        {!(isMobile && hideAppBar) && <Toolbar />}
        {/*
          Content box height calculation:
          - Mobile (hideAppBar): 100dvh - safe area top - safe area bottom
          - Mobile (showAppBar): 100dvh - 56px(toolbar) - safe area top - safe area bottom
          - Desktop: 100vh - 64px(toolbar)
        */}
        <Box
          sx={{
            height: isMobile
              ? hideAppBar
                ? 'calc(var(--app-height) - var(--sat) - var(--sab))'
                : 'calc(var(--app-height) - 56px - var(--sat) - var(--sab))'
              : 'calc(100vh - 64px)',
            overflow: 'auto', // Enable scrolling for content
            // Add padding for safe areas to prevent content from being hidden behind notches/home bars
            pt: isMobile && hideAppBar ? 'var(--sat)' : 0,
            pb: isMobile ? 'var(--sab)' : 0,
            pl: isMobile ? 'var(--sal)' : 0,
            pr: isMobile ? 'var(--sar)' : 0,
          }}
        >
          {children}
        </Box>
      </Box>

      {/* 도움말 다이얼로그 */}
      <HelpDialog
        open={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
      />
    </Box>
  );
}
