import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  Select,
  MenuItem,
  Pagination,
  Stack,
  Badge,
} from '@mui/material';
import {
  Event as EventIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
  EditCalendar as EditCalendarIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Pending as PendingIcon,
  CalendarMonth as CalendarMonthIcon,
  ArrowBack as ArrowBackIcon,
  Fullscreen as FullscreenIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  PushPin as PushPinIcon,
  AutoAwesome as AutoAwesomeIcon,
  HelpOutline as HelpOutlineIcon,
  SmartToy as SmartToyIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
} from '@mui/icons-material';

import dayjs from 'dayjs';
import type {
  LeaveManagementData,
  LeaveStatus,
  YearlyDetail,
} from '../../types/leave';
import authService from '../../services/authService';
import PersonalCalendar from '../calendar/PersonalCalendar';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../store/themeStore';
import {
  useDesktopLeaveManagementState,
} from './DesktopLeaveManagement.state';
import type { ManagementTableRow } from './DesktopLeaveManagement.types';
import DesktopLeaveManagementModals from './DesktopLeaveManagement.modals';


interface DesktopLeaveManagementProps {
  leaveData: LeaveManagementData;
  onRefresh: () => void;
  waitingCount?: number;
}

export default function DesktopLeaveManagement({
  leaveData,
  onRefresh,
  waitingCount = 0,
}: DesktopLeaveManagementProps) {
  const navigate = useNavigate();
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme.name === 'Dark';
  const calendarSurface = isDark ? '#0B1120' : '#F8FAFC';
  const calendarBorder = isDark ? 'rgba(148, 163, 184, 0.2)' : '#E2E8F0';
  const calendarShadow = isDark
    ? '0 18px 32px rgba(0,0,0,0.35)'
    : '0 16px 30px rgba(15, 23, 42, 0.08)';

  // is_approver 확인
  const user = authService.getCurrentUser();
  const isApprover = user?.isApprover || false;

  // 디버깅
  console.log('📍 [DesktopLeaveManagement] user:', user);
  console.log('📍 [DesktopLeaveManagement] isApprover:', isApprover);

  const { state, derived, actions } = useDesktopLeaveManagementState({
    leaveData,
    onRefresh,
  });
  const {
    hideCanceled,
    selectedYear,
    sidebarOpen,
    sidebarPinned,
    currentPage,
    itemsPerPage,
    yearlyLoading,
    managementTableData,
    tableLoading,
  } = state;

  const {
    getFilteredYearlyDetails,
    getPaginatedYearlyDetails,
    filteredCount,
    totalPages,
    getStatusColor,
  } = derived;

  const {
    setAiModalOpen,
    setLeaveManualOpen,
    setLeaveAIManualOpen,
    setHideCanceled,
    setSelectedYear,
    setTotalCalendarOpen,
    setDetailPanelOpen,
    setSelectedLeaveDetail,
    setManagementTableDialogOpen,
    setSidebarOpen,
    setSidebarPinned,
    handleRequestDialogOpen,
    handlePageChange,
  } = actions;

  const getStatusIcon = (status: string) => {
    const colors = {
      approved: isDark ? '#34D399' : '#20C997',
      rejected: isDark ? '#F87171' : '#DC3545',
      requested: isDark ? '#FBBF24' : '#FF8C00',
      cancelRequested: isDark ? '#FCD34D' : '#F59E0B',
      cancelled: isDark ? '#9CA3AF' : '#9CA3AF',
      default: isDark ? '#9CA3AF' : '#6B7280',
    };

    switch (status) {
      case 'APPROVED':
        return <CheckCircleIcon sx={{ color: colors.approved, fontSize: 20 }} />;
      case 'REJECTED':
        return <CancelIcon sx={{ color: colors.rejected, fontSize: 20 }} />;
      case 'REQUESTED':
        return <PendingIcon sx={{ color: colors.requested, fontSize: 20 }} />;
      case 'CANCEL_REQUESTED':
        return <PendingIcon sx={{ color: colors.cancelRequested, fontSize: 20 }} />;
      case 'CANCELLED':
        return <CancelIcon sx={{ color: colors.cancelled, fontSize: 20 }} />;
      default:
        return <ScheduleIcon sx={{ color: colors.default, fontSize: 20 }} />;
    }
  };

  const parseLeaveReason = (reason?: string) => {
    if (!reason) return { cancelReason: '', mainReason: '' };
    const cancelPrefix = '취소사유:';
    const hasCancel = reason.includes(cancelPrefix);
    if (!hasCancel) {
      return { cancelReason: '', mainReason: reason.trim() };
    }
    const [beforeBreak, ...rest] = reason.split('\n\n\n');
    const cancelReason = beforeBreak.replace(cancelPrefix, '').trim();
    const mainReason = rest.join('\n\n\n').trim();
    return { cancelReason, mainReason };
  };

  const formatDateWithDay = (date: string) => dayjs(date).locale('ko').format('YYYY-MM-DD (ddd)');

  const getDateRangeLabel = (detail: YearlyDetail) => {
    const start = formatDateWithDay(detail.startDate);
    const end = formatDateWithDay(detail.endDate);
    return detail.startDate === detail.endDate ? start : `${start} ~ ${end}`;
  };

  const getHalfDayLabel = (detail: YearlyDetail) => {
    const slotRaw = (detail as any).halfDaySlot || (detail as any).half_day_slot;
    const slot = typeof slotRaw === 'string' ? slotRaw.trim().toUpperCase() : '';
    const totalDays = typeof detail.workdaysCount === 'number' ? detail.workdaysCount : detail.totalDays;
    if (totalDays !== 0.5) return '';
    if (slot === 'ALL') return '';
    if (slot === 'AM') return '오전반차';
    if (slot === 'PM') return '오후반차';
    return '반차';
  };

  const getUsedDaysLabel = (detail: YearlyDetail) => {
    const totalDays = typeof detail.workdaysCount === 'number' ? detail.workdaysCount : detail.totalDays;
    if (typeof totalDays !== 'number') return '';
    return `${totalDays}일`;
  };

  return (
    <Box sx={{ height: { xs: 'var(--app-height)', md: '100vh' }, display: 'flex', flexDirection: 'column', bgcolor: colorScheme.backgroundColor }}>
      {/* 사이드바와 메인 컨텐츠를 감싸는 컨테이너 */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 사이드바 */}
        <Box
          onMouseEnter={() => {
            if (!sidebarPinned) setSidebarOpen(true);
          }}
          onMouseLeave={() => {
            if (!sidebarPinned) setSidebarOpen(false);
          }}
          sx={{
            width: sidebarOpen ? 240 : 64,
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#F8FAFC',
            borderRight: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.04)',
            boxShadow: sidebarOpen
              ? (isDark ? '4px 0 15px -3px rgba(0, 0, 0, 0.5)' : '4px 0 15px -3px rgba(0, 0, 0, 0.05)')
              : 'none',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
            position: 'relative',
            zIndex: 1000,
          }}
        >
          {/* 사이드바 헤더 */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarOpen ? 'space-between' : 'center',
              borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
              minHeight: 64,
            }}
          >
            {sidebarOpen && (
              <Typography sx={{ fontSize: '12px', fontWeight: 700, color: colorScheme.hintTextColor, letterSpacing: '0.05em' }}>
                MENU
              </Typography>
            )}
            <IconButton
              onClick={() => {
                if (sidebarOpen) {
                  const newPinned = !sidebarPinned;
                  setSidebarPinned(newPinned);
                  if (!newPinned) {
                    // 고정을 해제할 때 즉시 닫히지 않고 영역을 벗어나면 닫히도록 하지만,
                    // 유저가 버튼으로 닫고 싶을 수도 있으므로 (옵션: setSidebarOpen(false))
                    // 일반적으로 Pin 버튼을 다시 누르면 고정 해제 상태가 됩니다.
                  }
                } else {
                  setSidebarOpen(true);
                  setSidebarPinned(true);
                }
              }}
              sx={{
                color: colorScheme.hintTextColor,
                '&:hover': { bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6' },
              }}
            >
              {sidebarOpen ? (
                <PushPinIcon
                  sx={{
                    fontSize: 20,
                    transform: sidebarPinned ? 'rotate(0deg)' : 'rotate(45deg)',
                    transition: 'transform 0.2s',
                  }}
                />
              ) : (
                <MenuIcon />
              )}
            </IconButton>
          </Box>

          {/* 사이드바 메뉴 */}
          <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
            {/* 전 사원 휴가 현황 메뉴 */}
            <Box
              onClick={() => navigate('/leave-all-vacation')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: sidebarOpen ? 1.5 : 1,
                py: 1.25,
                mx: sidebarOpen ? 1.5 : 0.5,
                my: 0.5,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: isDark ? '#94A3B8' : '#64748B',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                },
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
              }}
            >
              <CalendarMonthIcon sx={{ fontSize: 22, color: 'inherit' }} />
              {sidebarOpen && (
                <Typography
                  sx={{
                    ml: 1.5,
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'inherit',
                  }}
                >
                  전 사원 휴가 현황
                </Typography>
              )}
            </Box>

            {/* 휴가 부여 내역 메뉴 (신규 추가) */}
            <Box
              onClick={() => navigate('/leave-grant-history')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: sidebarOpen ? 1.5 : 1,
                py: 1.25,
                mx: sidebarOpen ? 1.5 : 0.5,
                my: 0.5,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: isDark ? '#94A3B8' : '#64748B',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                },
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
              }}
            >
              <AssignmentIcon sx={{ fontSize: 22, color: 'inherit' }} />
              {sidebarOpen && (
                <Typography
                  sx={{
                    ml: 1.5,
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'inherit',
                  }}
                >
                  휴가 부여 내역
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* 메인 컨텐츠 영역 */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* AppBar - Flutter 스타일 */}
          <Box
            sx={{
              bgcolor: colorScheme.surfaceColor,
              boxShadow: isDark
                ? '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.2)'
                : '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
              px: { xs: 2, md: 3 },
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 10,
              position: 'relative',
            }}
          >
            {/* 왼쪽: 뒤로가기 버튼 + 타이틀 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={() => navigate('/chat')}
                sx={{
                  color: colorScheme.textColor,
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '18px', color: colorScheme.textColor }}>
                휴가관리
              </Typography>
            </Box>

            {/* Toolbar Buttons - Tailwind 스타일로 통일 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'nowrap', minWidth: 0 }}>

              {/* 휴가관리 기능소개 버튼 */}
              <Button
                variant="text"
                startIcon={<PlayCircleOutlineIcon sx={{ fontSize: 18 }} />}
                onClick={() => window.open('https://docs.google.com/presentation/d/1VHfzX2s6cR55NlxVaQs-yMk3ARrC0eqE/edit?slide=id.p1#slide=id.p1', '_blank')}
                sx={{
                  color: isDark ? '#94A3B8' : '#475569',
                  fontSize: '13px',
                  fontWeight: 500,
                  textTransform: 'none',
                  borderRadius: '8px',
                  px: 1.5,
                  py: 0.75,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                  },
                }}
              >
                기능소개
              </Button>

              {/* 내 휴가계획 AI 추천 버튼 */}
              <Button
                variant="text"
                startIcon={<AutoAwesomeIcon sx={{ fontSize: 18, color: isDark ? '#FCD34D' : '#F59E0B' }} />}
                onClick={() => setAiModalOpen(true)}
                sx={{
                  color: isDark ? '#94A3B8' : '#475569',
                  fontSize: '13px',
                  fontWeight: 500,
                  textTransform: 'none',
                  borderRadius: '8px',
                  px: 1.5,
                  py: 0.75,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#FEF3C7',
                    color: isDark ? '#FCD34D' : '#D97706',
                  },
                }}
              >
                AI 휴가계획 추천
              </Button>

              {/* 취소건 숨김 버튼 */}
              <Button
                variant="text"
                startIcon={
                  hideCanceled ? (
                    <VisibilityIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <VisibilityOffIcon sx={{ fontSize: 18 }} />
                  )
                }
                onClick={() => setHideCanceled(!hideCanceled)}
                sx={{
                  color: isDark ? '#94A3B8' : '#475569',
                  fontSize: '13px',
                  fontWeight: 500,
                  textTransform: 'none',
                  borderRadius: '8px',
                  px: 1.5,
                  py: 0.75,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                  },
                }}
              >
                취소건 숨김
              </Button>

              {/* 관리자용 결재 버튼 - 승인자인 경우에만 표시 */}
              {isApprover && (
                <Badge
                  badgeContent={waitingCount}
                  color="error"
                  invisible={waitingCount === 0}
                  max={99}
                >
                  <Button
                    variant="text"
                    startIcon={<AdminPanelSettingsIcon sx={{ fontSize: 18 }} />}
                    onClick={() => {
                      navigate('/admin-leave', { replace: false });
                    }}
                    sx={{
                      color: isDark ? '#C4B5FD' : '#6D28D9',
                      fontSize: '13px',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: '8px',
                      px: 1.5,
                      py: 0.75,
                      transition: 'all 0.2s',
                      bgcolor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(109, 40, 217, 0.05)',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(109, 40, 217, 0.1)',
                        color: isDark ? '#DDD6FE' : '#5B21B6',
                      },
                      ml: 1, // 좀 떨어뜨리기
                    }}
                  >
                    관리자용 결재
                  </Button>
                </Badge>
              )}

              {/* 휴가 작성 버튼 (강조) */}
              <Button
                variant="contained"
                startIcon={<EditCalendarIcon sx={{ fontSize: 18 }} />}
                onClick={handleRequestDialogOpen}
                sx={{
                  bgcolor: isDark ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.10)',
                  color: isDark ? '#E2E8F0' : '#475569',
                  border: `1px solid ${isDark ? 'rgba(148,163,184,0.20)' : 'rgba(148,163,184,0.18)'}`,
                  fontSize: '13px',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: '8px',
                  px: 2,
                  py: 0.75,
                  ml: 1, // 다른 버튼들과의 약간의 간격
                  boxShadow: 'none',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(148,163,184,0.20)' : 'rgba(148,163,184,0.16)',
                    color: isDark ? '#F8FAFC' : '#334155',
                    transform: 'translateY(-1px)',
                    boxShadow: isDark ? '0 8px 18px rgba(2,6,23,0.18)' : '0 8px 18px rgba(15,23,42,0.08)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                }}
              >
                휴가 작성
              </Button>
            </Box>
          </Box>

          {/* Main Content - Flutter 레이아웃과 동일 */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%', minWidth: 0 }}>
              {/* 상단 영역: 내 휴가 현황 + 결재진행 현황 */}
              <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0, alignItems: 'stretch', minWidth: 0 }}>
                {/* 왼쪽: 내 휴가 현황 */}
                <Box sx={{ flex: '1 1 0', minWidth: 0, display: 'flex' }}>
                  <Box
                    sx={{
                      width: '100%',
                      borderRadius: '12px',
                      border: `1px solid ${isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.15)'}`,
                      bgcolor: isDark ? colorScheme.surfaceColor : 'rgba(59,130,246,0.04)',
                      p: 1.5,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1, flexShrink: 0 }}>
                      <EventIcon sx={{ fontSize: 13, color: isDark ? '#60A5FA' : '#3B82F6' }} />
                      <Typography sx={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#FFFFFF' : '#3B82F6', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        내 휴가 현황
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.75, flex: 1, alignItems: 'stretch' }}>
                      {leaveData.leaveStatus && leaveData.leaveStatus.length > 0 ? (
                        leaveData.leaveStatus.slice(0, 4).map((status: LeaveStatus, index: number) => (
                          <Box
                            key={index}
                            sx={{
                              flex: 1,
                              textAlign: 'center',
                              p: 1,
                              borderRadius: '8px',
                              bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)',
                              border: `1px solid ${calendarBorder}`,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography sx={{ fontSize: '10px', color: colorScheme.hintTextColor, mb: 0.25, fontWeight: 500 }}>
                              {(status as any).leave_type || status.leaveType || '휴가'}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: '16px',
                                fontWeight: 800,
                                color: isDark ? '#60A5FA' : '#3B82F6',
                                lineHeight: 1.1,
                              }}
                            >
                              {(status as any).remain_days ?? status.remainDays ?? 0}
                              <Typography component="span" sx={{ fontSize: '10px', ml: 0.25, fontWeight: 600 }}>
                                일
                              </Typography>
                            </Typography>
                            <Typography sx={{ fontSize: '9px', color: colorScheme.hintTextColor, mt: 0.25 }}>
                              / {(status as any).total_days ?? status.totalDays ?? 0}일
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography sx={{ fontSize: '12px', color: colorScheme.hintTextColor, textAlign: 'center', flex: 1, py: 1.5 }}>
                          휴가 정보 없음
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* 오른쪽: 결재진행 현황 */}
                <Box sx={{ flex: '1 1 0', minWidth: 0, display: 'flex' }}>
                  <Box
                    sx={{
                      width: '100%',
                      borderRadius: '12px',
                      border: `1px solid ${calendarBorder}`,
                      bgcolor: isDark ? colorScheme.surfaceColor : 'rgba(0,0,0,0.02)',
                      p: 1.5,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexShrink: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <AssignmentIcon sx={{ fontSize: 13, color: colorScheme.hintTextColor }} />
                        <Typography sx={{ fontSize: '11px', fontWeight: 700, color: colorScheme.textColor, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          결재 진행 현황
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '10px', color: colorScheme.textColor }}>
                        총 {(leaveData.approvalStatus?.requested || 0) + (leaveData.approvalStatus?.approved || 0) + (leaveData.approvalStatus?.rejected || 0)}건
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.75, flex: 1, alignItems: 'stretch' }}>
                      {[
                        { label: '대기중', value: leaveData.approvalStatus?.requested || 0, color: isDark ? '#FBBF24' : '#FF8C00' },
                        { label: '승인됨', value: leaveData.approvalStatus?.approved || 0, color: isDark ? '#34D399' : '#20C997' },
                        { label: '반려됨', value: leaveData.approvalStatus?.rejected || 0, color: isDark ? '#F87171' : '#DC3545' },
                      ].map((item) => (
                        <Box
                          key={item.label}
                          sx={{
                            flex: 1,
                            textAlign: 'center',
                            p: 1,
                            borderRadius: '8px',
                            bgcolor: isDark ? 'rgba(148,163,184,0.03)' : 'rgba(248,250,252,0.9)',
                            border: `1px solid ${isDark ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.18)'}`,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            transition: 'all 160ms ease-out',
                            '&:hover': {
                              bgcolor: isDark ? 'rgba(148,163,184,0.06)' : 'rgba(241,245,249,0.95)',
                            },
                          }}
                        >
                          <Typography sx={{ fontSize: '18px', fontWeight: 800, color: item.color, lineHeight: 1.1 }}>
                            {item.value}
                          </Typography>
                          <Typography sx={{ fontSize: '10px', color: colorScheme.hintTextColor, mt: 0.25, fontWeight: 500 }}>
                            {item.label}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* 하단 영역: 개인별 휴가 내역 + 달력/휴가 관리 대장 */}
              <Box sx={{ display: 'flex', gap: 1.5, flex: 1, minHeight: 0, minWidth: 0 }}>
                {/* 왼쪽: 개인별 휴가 내역 (50%) */}
                <Box sx={{ flex: '1 1 0', minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <Card sx={{ height: '100%', borderRadius: '16px', display: 'flex', flexDirection: 'column', bgcolor: colorScheme.surfaceColor, border: `1px solid ${colorScheme.textFieldBorderColor}` }}>
                    <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexShrink: 0, gap: 1, minWidth: 0 }}>
                        <Typography
                          noWrap
                          sx={{
                            fontSize: '16px',
                            fontWeight: 700,
                            color: colorScheme.textColor,
                            minWidth: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          개인별 휴가 내역
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'nowrap', minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                            <Typography sx={{ fontSize: '11px', fontWeight: 600, color: colorScheme.hintTextColor }}>
                              {filteredCount}건
                            </Typography>
                            {totalPages > 1 && (
                              <Box
                                sx={{
                                  px: 0.75,
                                  py: 0.2,
                                  borderRadius: '999px',
                                  bgcolor: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)',
                                  border: `1px solid ${isDark ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.2)'}`,
                                }}
                              >
                                <Typography sx={{ fontSize: '10px', fontWeight: 700, color: isDark ? '#60A5FA' : '#3B82F6' }}>
                                  {currentPage} / {totalPages}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          <FormControl size="small" sx={{ minWidth: 100, flexShrink: 0 }}>
                            <Select
                              value={selectedYear}
                              onChange={(e) => setSelectedYear(e.target.value as number)}
                              sx={{
                                fontSize: '13px',
                                bgcolor: colorScheme.surfaceColor,
                                color: colorScheme.textColor,
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: colorScheme.textFieldBorderColor,
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: colorScheme.textFieldBorderColor,
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: colorScheme.textFieldBorderColor,
                                },
                                '& .MuiSelect-icon': {
                                  color: colorScheme.textColor,
                                },
                              }}
                            >
                              {[2026, 2025, 2024].map((year) => (
                                <MenuItem
                                  key={year}
                                  value={year}
                                  sx={{
                                    color: colorScheme.textColor,
                                    bgcolor: colorScheme.surfaceColor,
                                    '&:hover': {
                                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                                    },
                                    '&.Mui-selected': {
                                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                                      '&:hover': {
                                        bgcolor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
                                      },
                                    },
                                  }}
                                >
                                  {year}년
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      </Box>

                      <Box sx={{ flex: 1, overflow: 'auto' }}>
                        {yearlyLoading ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={24} />
                          </Box>
                        ) : getPaginatedYearlyDetails().length > 0 ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {getPaginatedYearlyDetails().map((detail: YearlyDetail, index: number) => (
                              <Box
                                key={index}
                                sx={{
                                  p: 1.75,
                                  border: `1px solid ${calendarBorder}`,
                                  borderRadius: '14px',
                                  cursor: 'pointer',
                                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : calendarSurface,
                                  boxShadow: 'none',
                                  '&:hover': {
                                    bgcolor: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.08)',
                                  },
                                }}
                                onClick={() => {
                                  console.log('📝 개인별 휴가내역 상세 다이얼로그 데이터:', detail);
                                  setSelectedLeaveDetail(detail);
                                  setDetailPanelOpen(true);
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.25 }}>
                                  <Box sx={{ minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, minWidth: 0, mb: 0.35 }}>
                                      {getStatusIcon(detail.status)}
                                      <Typography
                                        noWrap
                                        sx={{
                                          fontSize: '14px',
                                          fontWeight: 600,
                                          color: isDark ? 'rgba(226, 232, 240, 0.9)' : colorScheme.textColor,
                                          minWidth: 0,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                        }}
                                      >
                                        {detail.leaveType}
                                      </Typography>
                                      {getHalfDayLabel(detail) && (
                                        <Typography
                                          noWrap
                                          sx={{
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            color: isDark ? 'rgba(226, 232, 240, 0.9)' : colorScheme.textColor,
                                            px: 0.75,
                                            py: 0.2,
                                            borderRadius: '999px',
                                            bgcolor: isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(15, 23, 42, 0.04)',
                                            border: `1px solid ${calendarBorder}`,
                                            flexShrink: 0,
                                          }}
                                        >
                                          {getHalfDayLabel(detail)}
                                        </Typography>
                                      )}
                                    </Box>
                                    <Typography
                                      noWrap
                                      sx={{
                                        fontSize: '12px',
                                        color: isDark ? 'rgba(226, 232, 240, 0.88)' : colorScheme.textColor,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                      }}
                                    >
                                      {getDateRangeLabel(detail)}
                                    </Typography>
                                    {(() => {
                                      const { cancelReason, mainReason } = parseLeaveReason(detail.reason);
                                      return (
                                        <>
                                          {cancelReason && (
                                            <Typography
                                              noWrap
                                              sx={{
                                                fontSize: '12px',
                                                color: isDark ? 'rgba(226, 232, 240, 0.88)' : colorScheme.textColor,
                                                mt: 0.45,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                              }}
                                            >
                                              취소사유: {cancelReason}
                                            </Typography>
                                          )}
                                          {mainReason && (
                                            <Typography
                                              noWrap
                                              sx={{
                                                fontSize: '12px',
                                                color: isDark ? 'rgba(226, 232, 240, 0.88)' : colorScheme.textColor,
                                                mt: cancelReason ? 0.25 : 0.45,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                              }}
                                            >
                                              사유: {mainReason}
                                            </Typography>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </Box>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.6 }}>
                                    <Chip
                                      label={
                                        detail.status === 'APPROVED' ? '승인' :
                                          detail.status === 'REJECTED' ? '반려' :
                                            detail.status === 'REQUESTED' ? '대기' :
                                              detail.status === 'CANCEL_REQUESTED' ? '취소 대기' :
                                                detail.status === 'CANCELLED' ? '취소' :
                                                  '대기'
                                      }
                                      size="small"
                                      sx={{
                                        bgcolor: `${getStatusColor(detail.status)}1A`,
                                        color: getStatusColor(detail.status),
                                        fontSize: '11px',
                                        height: 22,
                                        border: `1px solid ${getStatusColor(detail.status)}55`,
                                      }}
                                    />
                                    {getUsedDaysLabel(detail) && (
                                      <Chip
                                        label={`사용 ${getUsedDaysLabel(detail)}`}
                                        size="small"
                                        sx={{
                                          bgcolor: isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(15, 23, 42, 0.04)',
                                          color: isDark ? 'rgba(226, 232, 240, 0.9)' : colorScheme.textColor,
                                          fontSize: '11px',
                                          height: 22,
                                          border: `1px solid ${calendarBorder}`,
                                        }}
                                      />
                                    )}
                                  </Box>
                                </Box>
                                {detail.rejectMessage && (
                                  <Box sx={{
                                    mt: 1,
                                    px: 1,
                                    py: 0.5,
                                    bgcolor: isDark ? 'rgba(248, 113, 113, 0.1)' : 'rgba(248, 113, 113, 0.08)',
                                    borderRadius: '8px',
                                    border: `1px solid ${isDark ? 'rgba(248, 113, 113, 0.3)' : 'rgba(248, 113, 113, 0.2)'}`
                                  }}>
                                    <Typography
                                      noWrap
                                      sx={{
                                        fontSize: '10px',
                                        color: colorScheme.hintTextColor,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                      }}
                                    >
                                      <Typography component="span" sx={{ fontSize: '10px', fontWeight: 700, color: isDark ? '#F87171' : '#DC3545' }}>반려:</Typography> {detail.rejectMessage}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Box sx={{ textAlign: 'center', py: 4 }}>
                            <EventIcon sx={{ fontSize: 60, color: isDark ? '#4B5563' : '#E5E7EB', mb: 1 }} />
                            <Typography sx={{ color: colorScheme.hintTextColor }}>
                              {getFilteredYearlyDetails().length === 0 ? '휴가 내역이 없습니다' : '해당 페이지에 항목이 없습니다'}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* 페이지네이션 */}
                      {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, flexShrink: 0 }}>
                          <Stack spacing={2}>
                            <Pagination
                              count={totalPages}
                              page={currentPage}
                              onChange={(_e, page) => handlePageChange(page)}
                              color="primary"
                              size="small"
                              showFirstButton
                              showLastButton
                            />
                          </Stack>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Box>

                {/* 오른쪽: 달력 + 휴가 관리 대장 (50%) */}
                <Box sx={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: 0, minWidth: 0 }}>
                  {/* 위: 부서 휴가 일정 (55%) */}
                  <Box sx={{ flex: 5.5, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: isDark ? colorScheme.surfaceColor : calendarSurface,
                        border: `1px solid ${calendarBorder}`,
                        boxShadow: calendarShadow,
                      }}
                    >
                      <CardContent sx={{ p: 1, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, '&:last-child': { pb: 1 } }}>
                        <Box sx={{ flex: 1, overflow: 'hidden', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                          <PersonalCalendar
                            monthlyLeaves={leaveData.monthlyLeaves || []}
                            loading={false}
                            error={null}
                            onTotalCalendarOpen={() => setTotalCalendarOpen(true)}
                            title="부서 휴가 일정"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>

                  {/* 아래: 휴가 관리 대장 (45%) */}
                  <Box sx={{ flex: 4.5, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: isDark ? colorScheme.surfaceColor : calendarSurface,
                        border: `1px solid ${calendarBorder}`,
                        boxShadow: calendarShadow,
                      }}
                    >
                      <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexShrink: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: '10px',
                                bgcolor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.12)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <AssignmentIcon sx={{ fontSize: 16, color: '#3B82F6' }} />
                            </Box>
                            <Typography sx={{ fontSize: '16px', fontWeight: 700, color: colorScheme.textColor, letterSpacing: '-0.01em' }}>
                              휴가 관리 대장
                            </Typography>
                          </Box>
                          <IconButton
                            onClick={() => setManagementTableDialogOpen(true)}
                            size="small"
                            sx={{
                              p: 0.5,
                              border: `1px solid ${calendarBorder}`,
                              borderRadius: '10px',
                            }}
                            title="크게 보기"
                          >
                            <FullscreenIcon sx={{ fontSize: 18, color: colorScheme.textColor }} />
                          </IconButton>
                        </Box>
                        <Box sx={{
                          flex: 1,
                          overflow: 'auto',
                          '&::-webkit-scrollbar': {
                            width: '8px',
                            height: '8px',
                          },
                          '&::-webkit-scrollbar-track': {
                            bgcolor: isDark ? 'rgba(148, 163, 184, 0.12)' : '#E2E8F0',
                            borderRadius: '8px',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            bgcolor: isDark ? 'rgba(148, 163, 184, 0.5)' : '#94A3B8',
                            borderRadius: '8px',
                            '&:hover': {
                              bgcolor: isDark ? 'rgba(148, 163, 184, 0.7)' : '#64748B',
                            },
                          },
                        }}>
                          <TableContainer sx={{
                            maxHeight: '100%',
                            overflowX: 'auto',
                            '&::-webkit-scrollbar': {
                              width: '8px',
                              height: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                              bgcolor: isDark ? 'rgba(148, 163, 184, 0.12)' : '#E2E8F0',
                              borderRadius: '8px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              bgcolor: isDark ? 'rgba(148, 163, 184, 0.5)' : '#94A3B8',
                              borderRadius: '8px',
                              '&:hover': {
                                bgcolor: isDark ? 'rgba(148, 163, 184, 0.7)' : '#64748B',
                              },
                            },
                          }}>
                            <Table
                              size="small"
                              stickyHeader
                              sx={{
                                borderCollapse: 'separate',
                                minWidth: 800,
                                '& .MuiTableCell-root': {
                                  borderBottom: `1px solid ${calendarBorder}`,
                                },
                                '& .MuiTableRow-root:hover .MuiTableCell-root': {
                                  bgcolor: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.08)',
                                },
                              }}
                            >
                              <TableHead>
                                <TableRow>
                                  <TableCell
                                    sx={{
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      bgcolor: isDark ? 'rgba(15, 23, 42, 0.7)' : '#F8FAFC',
                                      color: isDark ? 'rgba(226, 232, 240, 0.9)' : colorScheme.textColor,
                                      px: 1,
                                      py: 1,
                                      borderRight: `1px solid ${calendarBorder}`,
                                      position: 'sticky',
                                      left: 0,
                                      zIndex: 3,
                                    }}
                                  >
                                    휴가종류
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      bgcolor: isDark ? 'rgba(15, 23, 42, 0.7)' : '#F8FAFC',
                                      color: isDark ? 'rgba(226, 232, 240, 0.9)' : colorScheme.textColor,
                                      px: 1,
                                      py: 1,
                                      borderRight: `1px solid ${calendarBorder}`,
                                      textAlign: 'center',
                                    }}
                                  >
                                    허용일수
                                  </TableCell>
                                  {/* 월별 사용 현황 헤더 - 각 월별로 개별 셀 사용 */}
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                                    <TableCell
                                      key={month}
                                      sx={{
                                        fontSize: '10px',
                                        fontWeight: 600,
                                        bgcolor: isDark ? 'rgba(15, 23, 42, 0.7)' : '#F8FAFC',
                                        color: colorScheme.hintTextColor,
                                        px: 0.5,
                                        py: 1,
                                        borderRight: month < 12 ? `1px solid ${calendarBorder}` : 'none',
                                        textAlign: 'center',
                                        minWidth: '40px',
                                        width: '40px',
                                      }}
                                    >
                                      {month}월
                                    </TableCell>
                                  ))}
                                  <TableCell
                                    sx={{
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      bgcolor: isDark ? 'rgba(15, 23, 42, 0.7)' : '#F8FAFC',
                                      color: isDark ? 'rgba(226, 232, 240, 0.9)' : colorScheme.textColor,
                                      px: 1,
                                      py: 1,
                                      textAlign: 'center',
                                    }}
                                  >
                                    사용일수
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      bgcolor: isDark ? 'rgba(15, 23, 42, 0.7)' : '#F8FAFC',
                                      color: isDark ? 'rgba(226, 232, 240, 0.9)' : colorScheme.textColor,
                                      px: 1,
                                      py: 1,
                                      textAlign: 'center',
                                    }}
                                  >
                                    남은일수
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {tableLoading ? (
                                  <TableRow>
                                    <TableCell colSpan={16} align="center" sx={{ py: 4 }}>
                                      <CircularProgress size={24} />
                                    </TableCell>
                                  </TableRow>
                                ) : managementTableData && managementTableData.length > 0 ? (
                                  managementTableData.map((row: ManagementTableRow, index: number) => {
                                    const allowedDays = row.allowedDays || 0;
                                    const totalUsed = row.totalUsed || 0;
                                    const remainDays = allowedDays - totalUsed;
                                    const usedByMonth = row.usedByMonth || Array(12).fill(0);

                                    return (
                                      <TableRow
                                        key={index}
                                        hover
                                        sx={{
                                          '&:hover': {
                                            bgcolor: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.08)',
                                            '& .sticky-cell': {
                                              bgcolor: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.08)',
                                            },
                                          },
                                        }}
                                      >
                                        <TableCell
                                          className="sticky-cell"
                                          sx={{
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            px: 1,
                                            py: 1,
                                            borderRight: `1px solid ${calendarBorder}`,
                                            position: 'sticky',
                                            left: 0,
                                            zIndex: 2,
                                            bgcolor: calendarSurface,
                                            color: isDark ? 'rgba(226, 232, 240, 0.9)' : colorScheme.textColor,
                                          }}
                                        >
                                          {row.leaveType || '-'}
                                        </TableCell>
                                        <TableCell
                                          sx={{
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            px: 1,
                                            py: 1,
                                            borderRight: `1px solid ${calendarBorder}`,
                                            textAlign: 'center',
                                            color: isDark ? 'rgba(226, 232, 240, 0.9)' : colorScheme.textColor,
                                          }}
                                        >
                                          {allowedDays > 0 ? allowedDays : '-'}
                                        </TableCell>
                                        {/* 월별 사용일수 */}
                                        {usedByMonth.map((days: number, monthIndex: number) => (
                                          <TableCell
                                            key={monthIndex}
                                            sx={{
                                              fontSize: '10px',
                                              fontWeight: 600,
                                              px: 0.5,
                                              py: 1,
                                              textAlign: 'center',
                                              borderRight: monthIndex < 11 ? `1px solid ${calendarBorder}` : 'none',
                                              color: days > 0
                                                ? (isDark ? 'rgba(226, 232, 240, 0.9)' : colorScheme.textColor)
                                                : colorScheme.hintTextColor,
                                              minWidth: '40px',
                                              width: '40px',
                                            }}
                                          >
                                            {days > 0 ? days : '-'}
                                          </TableCell>
                                        ))}
                                        <TableCell
                                          sx={{
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            px: 1,
                                            py: 1,
                                            borderRight: `1px solid ${calendarBorder}`,
                                            textAlign: 'center',
                                            color: isDark ? 'rgba(226, 232, 240, 0.9)' : colorScheme.textColor,
                                          }}
                                        >
                                          {totalUsed > 0 ? totalUsed : '-'}
                                        </TableCell>
                                        <TableCell
                                          sx={{
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            px: 1,
                                            py: 1,
                                            textAlign: 'center',
                                            color: remainDays > 0
                                              ? (isDark ? '#34D399' : '#059669')
                                              : (isDark ? '#F87171' : '#DC2626'),
                                          }}
                                        >
                                          {remainDays}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={16} align="center" sx={{ py: 4 }}>
                                      <Typography sx={{ fontSize: '12px', color: colorScheme.hintTextColor }}>
                                        데이터가 없습니다
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>


          <DesktopLeaveManagementModals
            state={state}
            actions={actions}
            colorScheme={colorScheme}
            isDark={isDark}
            leaveStatusList={leaveData.leaveStatus}
            userId={user?.userId || ''}
            onRefresh={onRefresh}
            getStatusIcon={getStatusIcon}
          />

        </Box>
      </Box>
    </Box>

  );
}
