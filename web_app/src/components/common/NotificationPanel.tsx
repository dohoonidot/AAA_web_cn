/**
 * SSE 알림 모달 컴포넌트
 * 우측 상단에 배지 아이콘으로 표시되며, 클릭 시 알림 목록을 모달로 표시
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  IconButton,
  Box,
  Typography,
  List,
  ListItemText,
  ListItemButton,
  Button,
  Stack,
  Dialog,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import RefreshIcon from '@mui/icons-material/Refresh';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import { useNotificationStore, getFilteredNotifications } from '../../store/notificationStore';
import type { NotificationCategory } from '../../store/notificationStore';
import LeaveAnalyzeNotificationContent from '../leave/LeaveAnalyzeNotificationContent';
import { LeaveApprovalPanel } from '../leave/LeaveApprovalPanel';
import { formatDateTime, sanitizeNotificationPreview } from '../../utils/notificationHelpers';
import authService from '../../services/authService';
import { useNotificationPanelState } from './NotificationPanel.state';
import BirthdayPopup from './BirthdayPopup';
import GiftSelectionModal from './GiftSelectionModal';
import { GiftPanel } from './GiftBox';

/**
 * 알림 패널 아이콘 버튼
 * 헤더나 네비게이션 바에 배치
 */
export function NotificationButton({ onDark = true }: { onDark?: boolean }) {
  const { unreadCount, toggleNotificationPanel } = useNotificationStore();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const btnColor = onDark ? 'rgba(255,255,255,0.92)' : (isDark ? 'rgba(226,232,240,0.85)' : 'rgba(51,65,85,0.8)');
  const btnBg = onDark ? 'rgba(255,255,255,0.13)' : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)');
  const btnBorder = onDark ? 'rgba(255,255,255,0.25)' : (isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.13)');
  const hoverBg = onDark ? 'rgba(255,255,255,0.24)' : (isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)');
  const hoverBorder = onDark ? 'rgba(255,255,255,0.45)' : (isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.22)');
  const hoverGlow = onDark ? '0 0 14px rgba(255,255,255,0.18)' : (isDark ? '0 0 12px rgba(255,255,255,0.1)' : '0 0 12px rgba(0,0,0,0.1)');

  return (
    <IconButton
      onClick={toggleNotificationPanel}
      aria-label="알림"
      sx={{
        mr: 1,
        color: btnColor,
        bgcolor: btnBg,
        backdropFilter: 'blur(6px)',
        border: '1px solid',
        borderColor: btnBorder,
        transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
        '&:hover': {
          bgcolor: hoverBg,
          transform: 'scale(1.12)',
          boxShadow: hoverGlow,
          borderColor: hoverBorder,
        },
        '&:active': { transform: 'scale(0.95)' },
      }}
    >
      <Badge badgeContent={unreadCount} color="error">
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
}

/**
 * 알림함 모달 (Dialog)
 * App 컴포넌트에 배치
 */
export function NotificationPanel() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const panelBg = isDark ? '#0F172A' : '#F8FAFC';
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const canGrantLeave = currentUser?.adminRole === 0 || currentUser?.adminRole === 1;
  const panelSurface = isDark ? '#111827' : 'white';
  const panelBorder = isDark ? '#334155' : '#E2E8F0';
  const { state, actions } = useNotificationPanelState();
  const {
    isNotificationPanelOpen,
    notifications,
    paginatedNotifications,
    unreadCount,
    selectedNotification,
    notificationModalOpen,
    birthdayPopup,
    giftSelectionOpen,
    selectedBirthdayNotification,
    giftPanelOpen,
    isLeaveApprovalPanelOpen,
    selectedLeaveApproval,
    // 페이지네이션
    currentPage,
    totalPages,
    pageSize,
    // 카테고리
    selectedCategory,
  } = state;
  const {
    markAllAsRead,
    refreshNotificationMessages,
    handleClose,
    handleNotificationClick,
    handleDelete,
    handleNavigateToLink,
    handleCloseModal,
    handleCloseBirthdayPopup,
    handleGoGiftFromBirthday,
    handleCloseGiftSelection,
    handleOpenGiftPanel,
    handleCloseGiftPanel,
    closeLeaveApprovalPanel,
    loadAlertsFromApi,
    // 페이지네이션
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
    // 카테고리
    setSelectedCategory,
  } = actions;
  const currentUserId = authService.getCurrentUser()?.userId || '';

  const filteredNotifications = getFilteredNotifications(notifications, selectedCategory);

  const formatReceivedAt = (value?: string) => {
    if (!value) return '-';
    return formatDateTime(value);
  };

  const birthdayBrandImages = [
    '/assets/images/baemin.png',
    '/assets/images/sinsaegae.png',
    '/assets/images/cu.png',
    '/assets/images/gs25.png',
    '/assets/images/emart.png',
  ];
  const birthdayAlertId =
    selectedBirthdayNotification && !Number.isNaN(Number(selectedBirthdayNotification.id))
      ? Number(selectedBirthdayNotification.id)
      : undefined;

  return (
    <>
      {/* 알림함 모달 */}
      <Dialog
        open={isNotificationPanelOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: panelBg,
            borderRadius: '20px',
            height: '80vh',
            maxHeight: '80vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: isDark
              ? '0 24px 48px rgba(0,0,0,0.5)'
              : '0 24px 48px rgba(15,23,42,0.12)',
          },
        }}
      >
        {/* 상단 액센트 바 */}
        <Box
          sx={{
            height: 4,
            flexShrink: 0,
            background: 'linear-gradient(90deg, #6366F1 0%, #818CF8 50%, #A5B4FC 100%)',
          }}
        />

        {/* 헤더 */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            flexShrink: 0,
            bgcolor: isDark ? '#1E293B' : '#FFFFFF',
            borderBottom: `1px solid ${panelBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-60%',
              width: '60%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.06), transparent)',
              '@keyframes notifSweep': {
                from: { left: '-60%' },
                to: { left: '120%' },
              },
              animation: 'notifSweep 3s ease-in-out 0.5s infinite',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, zIndex: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <NotificationsIcon sx={{ fontSize: 20, color: '#6366F1' }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  color: '#6366F1',
                  fontWeight: 700,
                  fontSize: '10px',
                  letterSpacing: '0.08em',
                  lineHeight: 1,
                  mb: 0.4,
                }}
              >
                NOTIFICATIONS
              </Typography>
              <Typography
                sx={{
                  color: isDark ? '#F1F5F9' : '#1E293B',
                  fontWeight: 700,
                  fontSize: '1rem',
                  lineHeight: 1.2,
                }}
              >
                알림함
              </Typography>
            </Box>
            {filteredNotifications.length > 0 && (
              <Box
                sx={{
                  px: 1,
                  py: 0.3,
                  borderRadius: '6px',
                  bgcolor: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)',
                  border: `1px solid ${isDark ? 'rgba(99,102,241,0.25)' : '#C7D2FE'}`,
                }}
              >
                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#6366F1' }}>
                  {filteredNotifications.length}개
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, zIndex: 1 }}>
            <IconButton
              size="small"
              onClick={() => {
                const userId = authService.getCurrentUser()?.userId;
                if (userId) {
                  loadAlertsFromApi(userId).catch((err) => {
                    console.error('[NotificationPanel] 새로고침 실패:', err);
                  });
                }
              }}
              sx={{
                color: isDark ? '#94A3B8' : '#64748B',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{
                color: isDark ? '#94A3B8' : '#64748B',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* 카테고리 탭 */}
        <Box sx={{ borderBottom: 1, borderColor: panelBorder, bgcolor: panelSurface, flexShrink: 0 }}>
          <Tabs
            value={selectedCategory}
            onChange={(_, newValue) => setSelectedCategory(newValue as NotificationCategory)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 48,
              '& .MuiTab-root': {
                minHeight: 48,
                fontWeight: 600,
                fontSize: '0.875rem',
                color: isDark ? 'grey.400' : 'text.secondary',
                '&.Mui-selected': {
                  color: isDark ? 'primary.light' : 'primary.main',
                },
              },
            }}
          >
            {['전체', '휴가', '전자결재', '생일', '명절', '기타'].map((cat) => (
              <Tab key={cat} label={cat} value={cat} />
            ))}
          </Tabs>
        </Box>

        {/* 추가 액션 버튼 (모두 읽음) */}
        {filteredNotifications.length > 0 && (
          <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: panelBorder, bgcolor: panelSurface, flexShrink: 0 }}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              {unreadCount > 0 && (
                <Button
                  size="small"
                  startIcon={<DoneAllIcon />}
                  onClick={markAllAsRead}
                >
                  모두 읽음
                </Button>
              )}
            </Stack>
          </Box>
        )}

        {/* 알림 목록 */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
            p: 2,
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: isDark ? '#334155' : '#CBD5E1',
              borderRadius: '3px',
              '&:hover': { bgcolor: isDark ? '#475569' : '#94A3B8' },
            },
          }}
        >
          {filteredNotifications.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                color: isDark ? 'grey.400' : 'text.secondary',
              }}
            >
              <NotificationsIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
              <Typography variant="h6" gutterBottom>
                알림이 없습니다
              </Typography>
              <Typography variant="body2">
                새로운 알림이 도착하면 여기에 표시됩니다
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {paginatedNotifications.map((notification, index) => {
                const globalIndex = (currentPage - 1) * pageSize + index;
                const notificationNumber = filteredNotifications.length - globalIndex;
                const isGiftEvent = notification.type === 'birthday' || notification.queue_name.startsWith('birthday') || notification.type === 'event';
                const isGiftArrival = notification.type === 'gift' || notification.type === 'gift_arrival' || notification.queue_name.startsWith('gift.');

                return (
                  <React.Fragment key={notification.id}>
                    <ListItemButton
                      onClick={() =>
                        handleNotificationClick(notification.id, notification.link)
                      }
                      sx={{
                        borderRadius: '16px',
                        mb: 1.5,
                        p: 2,
                        bgcolor: notification.read
                          ? (isDark ? 'rgba(255, 255, 255, 0.02)' : 'white')
                          : (isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.04)'),
                        border: '1px solid',
                        borderColor: notification.read
                          ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)')
                          : (isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'),
                        boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.02)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          bgcolor: notification.read
                            ? (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.02)')
                            : (isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)'),
                          transform: 'translateY(-2px)',
                          boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.05)',
                        },
                      }}
                    >
                      {/* 번호 표시 */}
                      <Box
                        sx={{
                          minWidth: 28,
                          height: 28,
                          borderRadius: '6px',
                          bgcolor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(29, 68, 135, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 1.5,
                          alignSelf: 'flex-start',
                          mt: 0.4,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            color: isDark ? 'primary.light' : 'primary.main',
                          }}
                        >
                          {notificationNumber}
                        </Typography>
                      </Box>

                      {isGiftEvent ? (
                        <Box
                          sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.25,
                            p: 1.5,
                            borderRadius: '12px',
                            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                            border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E2E8F0',
                          }}
                        >
                          {/* 타입 배지 + 시간 */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            {!notification.read && (
                              <FiberManualRecordIcon sx={{ fontSize: 7, color: 'primary.main' }} />
                            )}
                            <Box
                              sx={{
                                px: 0.75,
                                py: 0.2,
                                borderRadius: '4px',
                                bgcolor: notification.type === 'birthday'
                                  ? (isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.1)')
                                  : (isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)'),
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  letterSpacing: '0.06em',
                                  color: notification.type === 'birthday' ? '#F59E0B' : '#6366F1',
                                }}
                              >
                                {notification.type === 'event' ? 'EVENT' : 'BIRTHDAY'}
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: isDark ? 'grey.500' : '#94A3B8', ml: 'auto' }}>
                              {formatReceivedAt(notification.receivedAt)}
                            </Typography>
                          </Box>

                          {/* 제목 */}
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700, color: isDark ? '#F1F5F9' : '#1E293B', fontSize: '13px' }}
                          >
                            {notification.type === 'event' ? '이벤트 당첨 알림 🏆' : '생일 축하 알림 🎂'}
                          </Typography>

                          {/* 메시지 */}
                          <Typography
                            variant="body2"
                            sx={{
                              color: isDark ? '#CBD5E1' : '#475569',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.6,
                              fontSize: '12.5px',
                            }}
                          >
                            {notification.message || '행복한 하루 되세요!'}
                          </Typography>

                          {/* 브랜드 이미지 */}
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {birthdayBrandImages.map((src) => (
                              <Box
                                key={src}
                                component="img"
                                src={src}
                                alt="gift-brand"
                                sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '6px',
                                  objectFit: 'cover',
                                  bgcolor: 'white',
                                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                                }}
                              />
                            ))}
                          </Box>

                          {/* CTA 버튼 */}
                          <Box>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGoGiftFromBirthday(notification);
                              }}
                              sx={{
                                bgcolor: isDark ? '#334155' : '#1E293B',
                                color: '#F8FAFC',
                                fontSize: '12px',
                                fontWeight: 600,
                                textTransform: 'none',
                                borderRadius: '7px',
                                px: 1.75,
                                py: 0.6,
                                boxShadow: 'none',
                                '&:hover': {
                                  bgcolor: isDark ? '#475569' : '#334155',
                                  boxShadow: 'none',
                                },
                              }}
                            >
                              선물 받기
                            </Button>
                          </Box>
                        </Box>
                      ) : isGiftArrival ? (
                        <Box
                          sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.25,
                            p: 1.5,
                            borderRadius: '12px',
                            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFBEB',
                            border: isDark ? '1px solid rgba(245,158,11,0.15)' : '1px solid #FDE68A',
                          }}
                        >
                          {/* GIFT 배지 + 시간 */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            {!notification.read && (
                              <FiberManualRecordIcon sx={{ fontSize: 7, color: '#F59E0B' }} />
                            )}
                            <Box
                              sx={{
                                px: 0.75,
                                py: 0.2,
                                borderRadius: '4px',
                                bgcolor: isDark ? 'rgba(245,158,11,0.18)' : 'rgba(245,158,11,0.12)',
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  letterSpacing: '0.06em',
                                  color: '#F59E0B',
                                }}
                              >
                                GIFT
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: isDark ? 'grey.500' : '#94A3B8', ml: 'auto' }}>
                              {formatReceivedAt(notification.receivedAt)}
                            </Typography>
                          </Box>

                          {/* 제목 */}
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700, color: isDark ? '#F1F5F9' : '#1E293B', fontSize: '13px' }}
                          >
                            선물 도착 알림 🎁
                          </Typography>

                          {/* 메시지 */}
                          <Typography
                            variant="body2"
                            sx={{
                              color: isDark ? '#CBD5E1' : '#475569',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.6,
                              fontSize: '12.5px',
                            }}
                          >
                            {notification.message || '새로운 선물이 도착했습니다.'}
                          </Typography>

                          {/* 선물함 보기 버튼 */}
                          <Box>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenGiftPanel();
                              }}
                              sx={{
                                bgcolor: isDark ? '#334155' : '#1E293B',
                                color: '#F8FAFC',
                                fontSize: '12px',
                                fontWeight: 600,
                                textTransform: 'none',
                                borderRadius: '7px',
                                px: 1.75,
                                py: 0.6,
                                boxShadow: 'none',
                                '&:hover': {
                                  bgcolor: isDark ? '#475569' : '#334155',
                                  boxShadow: 'none',
                                },
                              }}
                            >
                              선물함 보기
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mb: 0.5,
                              }}
                            >
                              {!notification.read && (
                                <FiberManualRecordIcon
                                  sx={{ fontSize: 8, color: 'primary.main' }}
                                />
                              )}
                              <Typography variant="subtitle2" fontWeight="bold" component="span">
                                {notification.title}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography
                                variant="body2"
                                color={isDark ? 'grey.200' : 'text.primary'}
                                component="span"
                                sx={{ mb: 0.5, display: 'block' }}
                              >
                                {sanitizeNotificationPreview(notification.message, 120)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" component="span">
                                {formatReceivedAt(notification.receivedAt)}
                              </Typography>
                            </>
                          }
                        />
                      )}
                      <IconButton
                        size="small"
                        onClick={(e) => handleDelete(notification.id, e)}
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemButton>
                    {index < paginatedNotifications.length - 1 && null}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </Box>

        {/* 페이지네이션 UI */}
        {filteredNotifications.length > 0 && totalPages > 1 && (
          <Box
            sx={{
              p: 1.5,
              flexShrink: 0,
              borderTop: `1px solid ${panelBorder}`,
              bgcolor: panelSurface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
            }}
          >
            <IconButton
              size="small"
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              sx={{ color: isDark ? 'grey.400' : 'text.secondary' }}
            >
              <FirstPageIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              sx={{ color: isDark ? 'grey.400' : 'text.secondary' }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Typography
              variant="body2"
              sx={{
                mx: 1.5,
                fontWeight: 500,
                color: isDark ? 'grey.300' : 'text.primary',
                minWidth: '80px',
                textAlign: 'center',
              }}
            >
              {currentPage} / {totalPages}
            </Typography>
            <IconButton
              size="small"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              sx={{ color: isDark ? 'grey.400' : 'text.secondary' }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              sx={{ color: isDark ? 'grey.400' : 'text.secondary' }}
            >
              <LastPageIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Dialog>

      <BirthdayPopup
        open={birthdayPopup.open}
        message={birthdayPopup.message}
        title={birthdayPopup.title}
        type={birthdayPopup.type}
        onClose={handleCloseBirthdayPopup}
        onGoGift={() => handleGoGiftFromBirthday(selectedBirthdayNotification || undefined)}
      />

      <GiftSelectionModal
        open={giftSelectionOpen}
        onClose={handleCloseGiftSelection}
        alertId={birthdayAlertId}
        queueName={selectedBirthdayNotification?.queue_name || 'birthday'}
      />

      <GiftPanel
        open={giftPanelOpen}
        onClose={handleCloseGiftPanel}
        onGiftCountChange={() => { }}
      />

      {/* 알림 상세 모달 */}
      {(() => {
        const n = selectedNotification;
        const type = n?.type || '';
        const queueName = n?.queue_name || '';
        const isGift = type === 'gift' || type === 'gift_arrival' || queueName.startsWith('gift');
        const isEapproval = type.startsWith('eapproval');
        const isLeave = type.startsWith('leave');

        const accentGradient = isGift
          ? 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 50%, #FCD34D 100%)'
          : isEapproval
            ? 'linear-gradient(90deg, #6366F1 0%, #818CF8 50%, #A5B4FC 100%)'
            : isLeave
              ? 'linear-gradient(90deg, #10B981 0%, #34D399 50%, #6EE7B7 100%)'
              : 'linear-gradient(90deg, #0EA5E9 0%, #38BDF8 50%, #7DD3FC 100%)';

        const accentColor = isGift ? '#F59E0B' : isEapproval ? '#818CF8' : isLeave ? '#10B981' : '#38BDF8';
        const iconBg = isGift
          ? 'rgba(245,158,11,0.18)'
          : isEapproval
            ? 'rgba(99,102,241,0.18)'
            : isLeave
              ? 'rgba(16,185,129,0.18)'
              : 'rgba(14,165,233,0.18)';
        const icon = isGift ? '🎁' : isEapproval ? '📋' : isLeave ? '🌿' : '🔔';
        const typeLabel = isGift ? 'GIFT' : isEapproval ? '전자결재' : isLeave ? '휴가' : 'NOTICE';
        const cardBg = isGift
          ? (isDark ? 'rgba(245,158,11,0.07)' : 'rgba(245,158,11,0.05)')
          : isEapproval
            ? (isDark ? 'rgba(99,102,241,0.07)' : 'rgba(99,102,241,0.05)')
            : isLeave
              ? (isDark ? 'rgba(16,185,129,0.07)' : 'rgba(16,185,129,0.05)')
              : (isDark ? 'rgba(14,165,233,0.07)' : 'rgba(14,165,233,0.05)');
        const cardBorder = isGift
          ? (isDark ? 'rgba(245,158,11,0.22)' : '#FDE68A')
          : isEapproval
            ? (isDark ? 'rgba(99,102,241,0.22)' : '#C7D2FE')
            : isLeave
              ? (isDark ? 'rgba(16,185,129,0.22)' : '#A7F3D0')
              : (isDark ? 'rgba(14,165,233,0.22)' : '#BAE6FD');
        const actionBtnBg = isEapproval ? '#6366F1' : isDark ? '#334155' : '#1E293B';
        const actionBtnHover = isEapproval ? '#4F46E5' : isDark ? '#475569' : '#334155';

        return (
          <Dialog
            open={notificationModalOpen}
            onClose={handleCloseModal}
            maxWidth="sm"
            fullWidth
            sx={{ zIndex: (theme) => theme.zIndex.modal + 10 }}
            PaperProps={{
              sx: {
                bgcolor: panelBg,
                borderRadius: '20px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '85vh',
                boxShadow: isDark
                  ? '0 24px 48px rgba(0,0,0,0.5)'
                  : '0 24px 48px rgba(15,23,42,0.12)',
              },
            }}
          >
            {/* 상단 액센트 바 */}
            <Box sx={{ height: 4, flexShrink: 0, background: accentGradient }} />

            {/* 헤더 */}
            <Box
              sx={{
                px: 3,
                pt: 2.5,
                pb: 2,
                flexShrink: 0,
                bgcolor: isDark ? '#1E293B' : '#1E293B',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0, left: '-60%', width: '60%', height: '100%',
                  background: `linear-gradient(90deg, transparent, ${accentColor}18, transparent)`,
                  '@keyframes detailSweep': { from: { left: '-60%' }, to: { left: '120%' } },
                  animation: 'detailSweep 3s ease-in-out 0.5s infinite',
                },
              }}
            >
              <Box
                sx={{
                  width: 44, height: 44, borderRadius: '12px',
                  bgcolor: iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0, zIndex: 1,
                }}
              >
                {icon}
              </Box>
              <Box sx={{ flex: 1, zIndex: 1 }}>
                <Typography
                  sx={{ color: accentColor, fontWeight: 700, fontSize: '10px', letterSpacing: '0.1em', mb: 0.5 }}
                >
                  {typeLabel}
                </Typography>
                <Typography
                  sx={{ color: '#F8FAFC', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em', lineHeight: 1.3 }}
                >
                  {n?.title || '알림'}
                </Typography>
              </Box>
              <IconButton
                onClick={handleCloseModal}
                sx={{
                  color: 'rgba(255,255,255,0.6)', zIndex: 1,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* 본문 */}
            <Box
              sx={{
                px: 3, py: 2.5,
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: isDark ? '#334155' : '#CBD5E1',
                  borderRadius: '3px',
                  '&:hover': { bgcolor: isDark ? '#475569' : '#94A3B8' },
                },
              }}
            >
              {/* 내용 카드 */}
              <Box
                sx={{
                  p: 2, borderRadius: '12px',
                  bgcolor: cardBg,
                  border: `1px solid ${cardBorder}`,
                }}
              >
                <Typography
                  sx={{ fontSize: '11px', fontWeight: 700, color: accentColor, letterSpacing: '0.06em', mb: 0.75 }}
                >
                  알림 내용
                </Typography>
                {n?.queue_name === 'leave.analyze' ? (
                  <LeaveAnalyzeNotificationContent
                    message={n?.message || ''}
                    isDark={isDark}
                  />
                ) : (
                  <Typography
                    sx={{ fontSize: '14px', color: isDark ? '#E2E8F0' : '#334155', lineHeight: 1.75 }}
                  >
                    {n?.message || '새로운 알림이 있습니다.'}
                  </Typography>
                )}
              </Box>

              {/* 수신일시 */}
              <Box
                sx={{
                  px: 2, py: 1.25, borderRadius: '8px',
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9'}`,
                  display: 'flex', alignItems: 'center',
                }}
              >
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#64748B' : '#94A3B8' }}>
                  수신일시
                </Typography>
                <Typography sx={{ fontSize: '12px', color: isDark ? '#94A3B8' : '#64748B', ml: 'auto' }}>
                  {formatReceivedAt(n?.receivedAt)}
                </Typography>
              </Box>
            </Box>

            {/* 액션 버튼 */}
            <Box
              sx={{
                px: 3, pb: 2.5, pt: 1.5,
                flexShrink: 0,
                display: 'flex', gap: 1, justifyContent: 'flex-end',
                borderTop: `1px solid ${isDark ? '#334155' : '#F1F5F9'}`,
              }}
            >
              <Button
                onClick={handleCloseModal}
                sx={{
                  color: isDark ? '#94A3B8' : '#64748B',
                  fontWeight: 500, fontSize: '13px',
                  textTransform: 'none', borderRadius: '8px', px: 2, py: 0.75,
                  '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' },
                }}
              >
                닫기
              </Button>
              {isEapproval && canGrantLeave && (
                <Button
                  onClick={() => { handleCloseModal(); window.open('http://211.43.205.49:9988/pages/vacation-requests.html', '_blank'); }}
                  variant="contained"
                  startIcon={<BeachAccessIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    bgcolor: '#10B981', color: '#fff',
                    fontWeight: 600, fontSize: '13px',
                    textTransform: 'none', borderRadius: '8px', px: 2.5, py: 0.75,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#059669', boxShadow: 'none' },
                  }}
                >
                  휴가 부여
                </Button>
              )}
              {isGift ? (
                <Button
                  onClick={handleOpenGiftPanel}
                  variant="contained"
                  startIcon={<CardGiftcardIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    bgcolor: actionBtnBg, color: '#F8FAFC',
                    fontWeight: 600, fontSize: '13px',
                    textTransform: 'none', borderRadius: '8px', px: 2.5, py: 0.75,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: actionBtnHover, boxShadow: 'none' },
                  }}
                >
                  선물함으로 이동
                </Button>
              ) : n?.link ? (
                <Button
                  onClick={() => handleNavigateToLink(n.link!)}
                  variant="contained"
                  sx={{
                    bgcolor: actionBtnBg, color: '#F8FAFC',
                    fontWeight: 600, fontSize: '13px',
                    textTransform: 'none', borderRadius: '8px', px: 2.5, py: 0.75,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: actionBtnHover, boxShadow: 'none' },
                  }}
                >
                  페이지로 이동
                </Button>
              ) : null}
            </Box>
          </Dialog>
        );
      })()}

      {/* 휴가 결재 패널 */}
      <LeaveApprovalPanel
        open={isLeaveApprovalPanelOpen}
        onClose={closeLeaveApprovalPanel}
        leaveData={selectedLeaveApproval}
        approverId={currentUserId}
        onApprovalComplete={() => {
          const userId = authService.getCurrentUser()?.userId || '';
          if (userId) loadAlertsFromApi(userId);
        }}
      />
    </>
  );
}
