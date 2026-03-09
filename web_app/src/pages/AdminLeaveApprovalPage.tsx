import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  useMediaQuery,
  useTheme,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Drawer,
  Checkbox,
  Pagination,
  Stack,
  alpha,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Fullscreen as FullscreenIcon,
  Close as CloseIcon,
  Today as TodayIcon,
  CalendarMonth as CalendarMonthIcon,
  EventNote as EventNoteIcon,
  Menu as MenuIcon,
  PeopleAltOutlined as PeopleAltOutlinedIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  FilterList as FilterListIcon,
  FilterListOff as FilterListOffIcon,
  Refresh as RefreshIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useThemeStore } from '../store/themeStore';
import { AdminCalendarSidebar } from '../components/admin/AdminCalendarSidebar';
import {
  RenderReasonWithCancelHighlight,
  formatServerDateDots,
  formatServerDateMD,
  formatServerDateTime,
} from './admin/AdminLeaveApproval.shared';
import { useAdminLeaveApprovalState } from './admin/AdminLeaveApproval.state';
import AdminLeaveApprovalModals from './admin/AdminLeaveApproval.modals';
import authService from '../services/authService';


const AdminLeaveApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme.name === 'Dark';

  const currentUser = authService.getCurrentUser();
  const showTotalLeaveManage = currentUser?.adminRole === 0 || currentUser?.adminRole === 1;

  const { state, derived, actions } = useAdminLeaveApprovalState({ isMobile });
  const {
    currentTab,
    statusFilter,
    selectedYear,
    adminData,
    loading,
    error,
    showAdvancedFilters,
    departmentFilter,
    positionFilter,
    leaveTypeFilters,
    dateRangeFilter,
    nameSearchFilter,
    availableDepartments,
    availablePositions,
    availableLeaveTypes,
    approvalDialog,
    selectedLeave,
    approvalAction,
    rejectMessage,
    actionLoading,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    selectedDate,
    currentPage,
    itemsPerPage,
    currentCalendarDate,
    calendarLeaves,
    holidays,
    fullscreenModalOpen,
    modalCalendarDate,
    modalSelectedDate,
    modalCalendarLeaves,
    modalHolidays,
    sidebarExpanded,
    sidebarPinned,
    mobileDrawerOpen,
    yearMonthPickerOpen,
    departmentStatusModalOpen,
    detailModalOpen,
    selectedDetailLeave,
    isBatchMode,
    selectedItems,
    isBatchProcessing,
  } = state;

  const {
    hasActiveFilters,
    getActiveFiltersSummary,
    getStats,
    getFilteredLeaves,
    getPaginatedLeaves,
    totalPages,
    getLeavesForDate,
    getModalLeavesForDate,
    getSelectedDateDetails,
    generateCalendar,
    getHolidayName,
    getStatusColor,
    getStatusLabel,
  } = derived;

  const {
    setCurrentTab,
    setStatusFilter,
    setSelectedYear,
    setAdminData,
    setLoading,
    setError,
    setShowAdvancedFilters,
    setDepartmentFilter,
    setPositionFilter,
    setLeaveTypeFilters,
    setDateRangeFilter,
    setNameSearchFilter,
    setApprovalDialog,
    setSelectedLeave,
    setApprovalAction,
    setRejectMessage,
    setActionLoading,
    setSnackbarOpen,
    setSelectedDate,
    setCurrentPage,
    setCurrentCalendarDate,
    setCalendarLeaves,
    setFullscreenModalOpen,
    setModalCalendarDate,
    setModalSelectedDate,
    setModalCalendarLeaves,
    setSidebarExpanded,
    setSidebarPinned,
    setMobileDrawerOpen,
    setYearMonthPickerOpen,
    setDepartmentStatusModalOpen,
    setDetailModalOpen,
    setSelectedDetailLeave,
    setHolidays,
    setModalHolidays,
    resetFilters,
    handleTabChange,
    handleStatusFilter,
    handleDepartmentFilter,
    handlePositionFilter,
    toggleLeaveTypeFilter,
    handleDateRangeFilter,
    handleNameSearchFilter,
    handlePageChange,
    handleMonthChange,
    handleApprove,
    handleReject,
    handleBulkApprove,
    handleBulkReject,
    toggleBatchMode,
    toggleSelectAll,
    toggleItemSelection,
    batchApprove,
    batchReject,
    showBatchRejectDialog,
    loadAdminData,
    loadYearlyWaitingList,
    handleYearMonthConfirm,
  } = actions;

  // URL 쿼리 파라미터에서 leaveId 읽기 (알림함에서 이동 시 사용)
  const [searchParams, setSearchParams] = useSearchParams();

  // leaveId 쿼리 파라미터가 있으면 해당 건의 상세 모달 자동 열기
  React.useEffect(() => {
    const leaveIdParam = searchParams.get('leaveId');
    if (leaveIdParam && adminData && !loading) {
      const leaveId = Number(leaveIdParam);

      // waiting_leaves와 monthly_leaves에서 해당 ID 찾기
      const allLeaves = [
        ...(adminData.waiting_leaves || []),
        ...(adminData.monthly_leaves || []),
      ];

      const targetLeave = allLeaves.find((leave: any) => leave.id === leaveId);

      if (targetLeave) {
        console.log('[AdminLeaveApproval] URL 파라미터로 상세 모달 열기:', leaveId, targetLeave);
        setSelectedDetailLeave(targetLeave);
        setDetailModalOpen(true);

        // URL에서 쿼리 파라미터 제거 (뒤로가기 시 다시 열리지 않도록)
        searchParams.delete('leaveId');
        setSearchParams(searchParams, { replace: true });
      } else {
        console.warn('[AdminLeaveApproval] 해당 ID의 휴가를 찾을 수 없음:', leaveId);
      }
    }
  }, [searchParams, adminData, loading, setSelectedDetailLeave, setDetailModalOpen, setSearchParams]);

  const stats = getStats();
  const handleStatusCardClick = (status: 'REQUESTED' | 'APPROVED' | 'REJECTED') => {
    handleStatusFilter(status);
    setCurrentTab('all');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: { xs: 'var(--app-height)', md: '100vh' } }}>
        <CircularProgress />
      </Box>
    );
  }

  const selectedHolidayName = getHolidayName(selectedDate, holidays);
  const modalSelectedHolidayName = getHolidayName(modalSelectedDate, modalHolidays);
  const desktopPanelSx = {
    borderRadius: '18px',
    bgcolor: isDark ? 'rgba(15, 23, 42, 0.82)' : '#FFFFFF',
    border: isDark ? '1px solid rgba(148,163,184,0.14)' : '1px solid rgba(148,163,184,0.18)',
    boxShadow: isDark ? '0 10px 24px rgba(2,6,23,0.25)' : '0 10px 28px rgba(15,23,42,0.05)',
    backdropFilter: 'blur(6px)',
  } as const;
  const desktopSoftSx = {
    borderRadius: '12px',
    border: isDark ? '1px solid rgba(148,163,184,0.12)' : '1px solid #E2E8F0',
    bgcolor: isDark ? 'rgba(30,41,59,0.38)' : '#F8FAFC',
  } as const;
  const desktopScrollbarSx = {
    '&::-webkit-scrollbar': { width: '8px' },
    '&::-webkit-scrollbar-track': {
      background: isDark ? 'rgba(148,163,184,0.08)' : '#F1F5F9',
      borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: isDark ? '#475569' : '#94A3B8',
      borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: isDark ? '#64748B' : '#64748B',
    },
  } as const;

  return (
    <Box sx={{ height: { xs: 'var(--app-height)', md: '100vh' }, display: 'flex', flexDirection: 'column', bgcolor: colorScheme.backgroundColor, position: 'relative' }}>
      {/* 데스크톱 사이드바 */}
      {!isMobile && (
        <AdminCalendarSidebar
          isExpanded={sidebarExpanded}
          isPinned={sidebarPinned}
          onHover={() => setSidebarExpanded(true)}
          onExit={() => {
            if (!sidebarPinned) {
              setSidebarExpanded(false);
            }
          }}
          onPinToggle={() => {
            setSidebarPinned(!sidebarPinned);
            if (!sidebarPinned) {
              setSidebarExpanded(true);
            }
          }}
        />
      )}

      {/* 모바일 Drawer 사이드바 */}
      {isMobile && (
        <Drawer
          anchor="left"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: 285,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%)'
                : 'linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              p: 2,
              height: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    p: 0.5,
                    borderRadius: '6px',
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(100, 116, 139, 0.15)' : 'rgba(71, 85, 105, 0.08)',
                  }}
                >
                  <AdminPanelSettingsIcon
                    sx={{
                      color: theme.palette.mode === 'dark' ? '#94A3B8' : '#475569',
                      fontSize: 16,
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#495057',
                  }}
                >
                  관리자 메뉴
                </Typography>
              </Box>
              <IconButton
                onClick={() => setMobileDrawerOpen(false)}
                size="small"
                sx={{
                  color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : '#6C757D',
                }}
              >
                <CloseIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>

            <Button
              fullWidth
              variant="contained"
              startIcon={<PeopleAltOutlinedIcon sx={{ fontSize: 18 }} />}
              onClick={() => {
                setMobileDrawerOpen(false);
                setDepartmentStatusModalOpen(true);
              }}
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? '#334155' : '#475569',
                color: '#F8FAFC',
                py: 1.75,
                px: 1.5,
                borderRadius: '10px',
                textTransform: 'none',
                fontSize: '13.5px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 1px 3px rgba(0,0,0,0.4)'
                  : '0 1px 3px rgba(0,0,0,0.1)',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark' ? '#3E4C63' : '#334155',
                },
              }}
            >
              부서원 휴가 현황
            </Button>

            {showTotalLeaveManage && (
              <Button
                fullWidth
                variant="contained"
                startIcon={<OpenInNewIcon sx={{ fontSize: 18 }} />}
                onClick={() => {
                  setMobileDrawerOpen(false);
                  window.open('http://211.43.205.49:9988/pages/vacation-requests.html', '_blank');
                }}
                sx={{
                  mt: 1.5,
                  bgcolor: theme.palette.mode === 'dark' ? '#1E293B' : '#F1F5F9',
                  color: theme.palette.mode === 'dark' ? '#CBD5E1' : '#475569',
                  py: 1.75,
                  px: 1.5,
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  border: theme.palette.mode === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' ? '#283548' : '#E2E8F0',
                    boxShadow: 'none',
                  },
                }}
              >
                휴가총괄관리
              </Button>
            )}
          </Box>
        </Drawer>
      )}

      {/* AppBar */}
      <Box
        sx={{
          bgcolor: isDark ? '#1E293B' : '#FFFFFF',
          borderBottom: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
          boxShadow: isDark
            ? '0 1px 3px 0 rgba(0, 0, 0, 0.4)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
          px: isMobile ? 1 : 2,
          py: isMobile ? 1 : 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'nowrap',
          minHeight: isMobile ? '48px' : '56px',
          ml: !isMobile ? (sidebarExpanded ? '285px' : '50px') : 0,
          transition: 'margin-left 0.3s ease-in-out',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 0.5 : 1, flexShrink: 0 }}>
          {isMobile && (
            <IconButton
              onClick={() => setMobileDrawerOpen(true)}
              sx={{
                color: isDark ? '#94A3B8' : '#64748B',
                p: 0.5,
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' },
              }}
              size="small"
            >
              <MenuIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
            </IconButton>
          )}
          <IconButton
            onClick={() => navigate('/chat')}
            sx={{
              color: isDark ? '#94A3B8' : '#64748B',
              p: isMobile ? 0.5 : 1,
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' },
            }}
            size="small"
          >
            <ArrowBackIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
          </IconButton>
          <Typography
            variant={isMobile ? 'body1' : 'h6'}
            sx={{
              fontWeight: 600,
              whiteSpace: 'nowrap',
              fontSize: isMobile ? '14px' : '1.1rem',
              color: isDark ? '#F1F5F9' : '#1E293B',
              letterSpacing: '-0.01em',
            }}
          >
            {isMobile ? '관리자' : '관리자 - 휴가 결재 관리'}
          </Typography>
        </Box>

        {/* 탭 버튼 */}
        <Box sx={{ display: 'flex', gap: isMobile ? 0.5 : 0.75, alignItems: 'center', flexShrink: 0 }}>
          {/* 휴가관리 버튼 */}
          <Button
            variant="text"
            size="small"
            startIcon={!isMobile ? <EventNoteIcon sx={{ fontSize: 16 }} /> : undefined}
            onClick={() => navigate('/leave', { state: { fromAdmin: true } })}
            sx={{
              color: isDark ? '#94A3B8' : '#64748B',
              mr: isMobile ? 0 : 0.5,
              px: isMobile ? 1 : 1.5,
              py: isMobile ? 0.25 : 0.5,
              minWidth: isMobile ? 'auto' : '64px',
              fontSize: isMobile ? '11px' : '13px',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                color: isDark ? '#F8FAFC' : '#1E293B',
              },
            }}
          >
            휴가관리
          </Button>
          <Button
            variant="text"
            size="small"
            onClick={() => handleTabChange('pending')}
            sx={{
              bgcolor: currentTab === 'pending'
                ? (isDark ? '#334155' : '#F1F5F9')
                : 'transparent',
              color: currentTab === 'pending'
                ? (isDark ? '#F8FAFC' : '#1E293B')
                : (isDark ? '#94A3B8' : '#64748B'),
              px: isMobile ? 1 : 1.5,
              py: isMobile ? 0.25 : 0.5,
              minWidth: isMobile ? 'auto' : '64px',
              fontSize: isMobile ? '11px' : '13px',
              fontWeight: currentTab === 'pending' ? 600 : 500,
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                color: isDark ? '#F8FAFC' : '#1E293B',
              },
            }}
          >
            {isMobile ? '대기' : '대기 중'}
          </Button>
          <Button
            variant="text"
            size="small"
            onClick={() => handleTabChange('all')}
            sx={{
              bgcolor: currentTab === 'all'
                ? (isDark ? '#334155' : '#F1F5F9')
                : 'transparent',
              color: currentTab === 'all'
                ? (isDark ? '#F8FAFC' : '#1E293B')
                : (isDark ? '#94A3B8' : '#64748B'),
              px: isMobile ? 1 : 1.5,
              py: isMobile ? 0.25 : 0.5,
              minWidth: isMobile ? 'auto' : '64px',
              fontSize: isMobile ? '11px' : '13px',
              fontWeight: currentTab === 'all' ? 600 : 500,
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                color: isDark ? '#F8FAFC' : '#1E293B',
              },
            }}
          >
            전체
          </Button>

        </Box>
      </Box>

      {/* 메인 컨텐츠 */}
      <Box sx={{
        flex: 1,
        overflow: 'auto',
        px: isMobile ? 1 : 2,
        pt: 2,
        pb: 0,
        ml: !isMobile ? (sidebarExpanded ? '285px' : '50px') : 0,
        transition: 'margin-left 0.3s ease-in-out'
      }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 통계 카드 */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row', mb: 3 }}>
          {/* 결재 대기 */}
          <Card
            sx={{
              flex: 1,
              cursor: 'pointer',
              bgcolor: colorScheme.surfaceColor,
              border: statusFilter === 'REQUESTED' ? '2px solid #475569' : `1px solid ${colorScheme.textFieldBorderColor}`,
            }}
            onClick={() => handleStatusCardClick('REQUESTED')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ScheduleIcon sx={{ color: '#FF8C00' }} />
                <Typography variant="subtitle2">결재 대기</Typography>
              </Box>
              <Typography variant="h4" sx={{ color: '#FF8C00', fontWeight: 700 }}>
                {stats.requested}
              </Typography>
            </CardContent>
          </Card>

          {/* 승인 완료 */}
          <Card
            sx={{
              flex: 1,
              cursor: 'pointer',
              bgcolor: colorScheme.surfaceColor,
              border: statusFilter === 'APPROVED' ? '2px solid #20C997' : `1px solid ${colorScheme.textFieldBorderColor}`,
            }}
            onClick={() => handleStatusCardClick('APPROVED')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircleIcon sx={{ color: '#20C997' }} />
                <Typography variant="subtitle2">승인 완료</Typography>
              </Box>
              <Typography variant="h4" sx={{ color: '#20C997', fontWeight: 700 }}>
                {stats.approved}
              </Typography>
            </CardContent>
          </Card>

          {/* 반려 처리 */}
          <Card
            sx={{
              flex: 1,
              cursor: 'pointer',
              bgcolor: colorScheme.surfaceColor,
              border: statusFilter === 'REJECTED' ? '2px solid #DC3545' : `1px solid ${colorScheme.textFieldBorderColor}`,
            }}
            onClick={() => handleStatusCardClick('REJECTED')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CancelIcon sx={{ color: '#DC3545' }} />
                <Typography variant="subtitle2">반려 처리</Typography>
              </Box>
              <Typography variant="h4" sx={{ color: '#DC3545', fontWeight: 700 }}>
                {stats.rejected}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* 메인 컨텐츠 영역 */}
        {isMobile ? (
          /* 모바일: 결재 목록만 표시 (세로 스크롤) */
          <Box sx={{
            flex: 1,
            overflow: 'auto',
            px: 2,
            pb: 2,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: isDark ? colorScheme.surfaceColor : '#f1f1f1',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: isDark ? '#475569' : '#94A3B8',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: isDark ? '#64748B' : '#64748B',
            },
          }}>
            <Card sx={{ borderRadius: '16px', mt: 2, bgcolor: colorScheme.surfaceColor }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* 일괄 작업 모드일 때 전체 선택 체크박스 */}
                    {isBatchMode && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox
                          checked={selectedItems.size === getPaginatedLeaves().length && getPaginatedLeaves().length > 0}
                          onChange={() => toggleSelectAll(getPaginatedLeaves())}
                          sx={{ p: 0 }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          전체 선택
                        </Typography>
                      </Box>
                    )}
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '16px' }}>
                      {currentTab === 'pending' ? '결재 대기 목록' : '전체 결재 목록'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <Select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value as number)}
                        sx={{ fontSize: '13px', height: '32px' }}
                      >
                        {[2026, 2025, 2024].map((year) => (
                          <MenuItem key={year} value={year}>
                            {year}년
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Chip
                      label={`${getFilteredLeaves().length}건 (${currentPage}/${totalPages})`}
                      color="primary"
                      size="small"
                      sx={{ fontSize: '11px' }}
                    />
                  </Box>
                </Box>


                {/* 결재 목록 - 스크롤 가능 */}
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  flex: 1,
                  overflowY: 'auto',
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '10px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#64748B',
                    borderRadius: '10px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: '#475569',
                  },
                }}>
                  {getPaginatedLeaves().length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Typography variant="h6" color="text.secondary">
                        {getFilteredLeaves().length === 0 ? '결재 대기 중인 항목이 없습니다' : '해당 페이지에 항목이 없습니다'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {getFilteredLeaves().length === 0 ? '새로운 휴가 신청이 있을 때 이곳에 표시됩니다' : '다른 페이지를 확인해주세요'}
                      </Typography>
                    </Box>
                  ) : (
                    getPaginatedLeaves().map((leave: any, index: number) => (
                      <Card
                        key={leave.id || `leave-batch-${index}`}
                        onClick={() => {
                          if (!isBatchMode) {
                            setSelectedDetailLeave(leave);
                            setDetailModalOpen(true);
                          }
                        }}
                        sx={{
                          borderRadius: '8px',
                          bgcolor: colorScheme.surfaceColor,
                          border: leave.status?.includes('REQUESTED')
                            ? (leave.isCancel === 1 ? '2px solid #E53E3E' : '1.5px solid #64748B')
                            : `1px solid ${colorScheme.textFieldBorderColor}`,
                          cursor: isBatchMode ? 'default' : 'pointer',
                          flexShrink: 0, // 요소 크기 고정 - 압축 방지
                          minHeight: 'fit-content', // 최소 높이를 내용에 맞게
                          '&:hover': {
                            boxShadow: isBatchMode ? 0 : 2,
                          },
                        }}
                      >
                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                          {/* 일괄 작업 모드일 때 체크박스 */}
                          {isBatchMode && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Checkbox
                                checked={selectedItems.has(leave.id)}
                                onChange={() => toggleItemSelection(leave.id)}
                                sx={{ p: 0 }}
                              />
                            </Box>
                          )}
                          {/* 첫 번째 줄: 상태 + 휴가일수 */}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Chip
                              label={getStatusLabel(leave)}
                              size="small"
                              sx={{
                                bgcolor: `${getStatusColor(leave.status)}22`,
                                color: getStatusColor(leave.status),
                                fontSize: '11px',
                                fontWeight: 600,
                              }}
                            />
                            <Chip
                              label={`${leave.leave_type}${leave.half_day_slot === 'AM' ? ' (오전반차)' :
                                leave.half_day_slot === 'PM' ? ' (오후반차)' :
                                  leave.half_day_slot === 'ALL' ? ' (종일연차)' : ''
                                }`}
                              size="small"
                              sx={{
                                bgcolor: '#64748B22',
                                color: '#64748B',
                              }}
                            />
                            {leave.half_day_slot && (
                              <Chip
                                label={leave.half_day_slot === 'AM' ? '오전 반차' : leave.half_day_slot === 'PM' ? '오후 반차' : leave.half_day_slot}
                                size="small"
                                sx={{
                                  bgcolor: '#FF8C0022',
                                  color: '#FF8C00',
                                  fontSize: '10px',
                                }}
                              />
                            )}
                            {leave.is_canceled === 1 && (
                              <Chip
                                label="취소 상신"
                                size="small"
                                sx={{
                                  bgcolor: '#FF8C0022',
                                  color: '#FF8C00',
                                  fontSize: '10px',
                                }}
                              />
                            )}
                            <Chip
                              label={`${leave.workdays_count}일`}
                              sx={{
                                bgcolor: '#64748B',
                                color: 'white',
                                fontWeight: 700,
                                ml: 'auto',
                              }}
                            />
                          </Box>

                          {/* 신청자 정보 */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, p: 1.5, bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8F9FA', borderRadius: '12px', border: `1px solid ${colorScheme.textFieldBorderColor}` }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: '#64748B22',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <PersonIcon sx={{ color: '#64748B', fontSize: 20 }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1" fontWeight={600}>
                                {leave.name}
                              </Typography>
                              <Typography variant="caption" sx={{ fontSize: '13px', color: isDark ? '#FFFFFF' : '#000000' }}>
                                {leave.department} | {leave.job_position}
                              </Typography>
                            </Box>
                          </Box>

                          {/* 기간 */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarTodayIcon sx={{ fontSize: 17, color: isDark ? '#FFFFFF' : '#000000' }} />
                              <Typography variant="caption" sx={{ fontSize: '13px', color: isDark ? '#FFFFFF' : '#000000' }}>
                                휴가 사용일 :
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {formatServerDateDots(leave.start_date)} - {formatServerDateDots(leave.end_date)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 3 }}>
                              <AccessTimeIcon sx={{ fontSize: 15, color: isDark ? '#FFFFFF' : '#000000' }} />
                              <Typography variant="caption" sx={{ fontSize: '15px', color: isDark ? '#FFFFFF' : '#000000' }}>
                                신청일 : {formatServerDateTime(leave.requested_date).slice(5)}
                              </Typography>
                            </Box>
                          </Box>

                          {/* 휴가 정보 */}
                          <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="caption" sx={{ fontSize: '13px', color: isDark ? '#FFFFFF' : '#000000' }}>
                                사용일:
                              </Typography>
                              <Typography variant="caption" sx={{ fontSize: '13px' }} fontWeight={600}>
                                {leave.workdays_count}일
                              </Typography>
                            </Box>
                            {leave.join_date && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="caption" sx={{ fontSize: '13px', color: isDark ? '#FFFFFF' : '#000000' }}>
                                  입사일:
                                </Typography>
                                <Typography variant="caption" sx={{ fontSize: '13px' }} fontWeight={600}>
                                  {dayjs(leave.join_date).format('YYYY.MM.DD')}
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          {/* 사유 */}
                          {leave.reason && (
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontSize: '13px', color: isDark ? '#FFFFFF' : '#000000' }}>
                                사유:
                              </Typography>
                              <RenderReasonWithCancelHighlight reason={leave.reason} maxLines={4} />
                            </Box>
                          )}

                          {/* 반려 사유 (있는 경우) */}
                          {leave.reject_message && (
                            <Box sx={{ mb: 1.5, p: 1, bgcolor: isDark ? 'rgba(220, 53, 69, 0.1)' : 'rgba(220, 53, 69, 0.08)', borderRadius: '8px', border: '1px solid rgba(220, 53, 69, 0.3)' }}>
                              <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, fontSize: '13px', color: '#DC3545' }}>
                                반려 사유:
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: isDark ? '#FFFFFF' : '#000000',
                                  fontSize: '15px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  wordBreak: 'break-word',
                                }}
                              >
                                {leave.reject_message}
                              </Typography>
                            </Box>
                          )}

                          {/* 승인/반려 버튼 */}
                          {leave.status && leave.status.toUpperCase().includes('REQUESTED') && (
                            <>
                              <Divider sx={{ my: 2 }} />
                              <Box sx={{ display: 'flex', gap: 1.5 }}>
                                {/* 취소 상신: 취소 승인 버튼만 */}
                                {leave.status.toUpperCase().includes('CANCEL') && (
                                  <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<CheckCircleIcon />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedLeave(leave);
                                      setApprovalAction('approve');
                                      setApprovalDialog(true);
                                    }}
                                    sx={{
                                      bgcolor: '#1cc88a',
                                      borderRadius: '12px',
                                      boxShadow: 'none',
                                      fontWeight: 600,
                                      '&:hover': { bgcolor: '#17a673', boxShadow: 'none' }
                                    }}
                                  >
                                    취소 승인
                                  </Button>
                                )}

                                {/* 일반 상신: 반려 + 승인 버튼 */}
                                {!leave.status.toUpperCase().includes('CANCEL') && (
                                  <>
                                    <Button
                                      variant="outlined"
                                      color="error"
                                      startIcon={<CancelIcon />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedLeave(leave);
                                        setApprovalAction('reject');
                                        setApprovalDialog(true);
                                      }}
                                      sx={{
                                        flex: 1,
                                        borderRadius: '12px',
                                        borderWidth: '1.5px',
                                        fontWeight: 600,
                                        '&:hover': { borderWidth: '1.5px', bgcolor: (theme) => alpha(theme.palette.error.main, 0.05) }
                                      }}
                                    >
                                      반려
                                    </Button>
                                    <Button
                                      variant="contained"
                                      startIcon={<CheckCircleIcon />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedLeave(leave);
                                        setApprovalAction('approve');
                                        setApprovalDialog(true);
                                      }}
                                      sx={{
                                        flex: 2,
                                        bgcolor: '#1cc88a',
                                        borderRadius: '12px',
                                        boxShadow: 'none',
                                        fontWeight: 600,
                                        '&:hover': { bgcolor: '#17a673', boxShadow: 'none' }
                                      }}
                                    >
                                      승인
                                    </Button>
                                  </>
                                )}
                              </Box>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Box>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Stack spacing={2}>
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(e, page) => handlePageChange(page)}
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

            {/* 모바일: 달력 영역 */}
            <Card
              sx={{
                borderRadius: '18px',
                mt: 2,
                bgcolor: isDark ? 'rgba(15, 23, 42, 0.88)' : colorScheme.surfaceColor,
                border: isDark ? '1px solid rgba(148,163,184,0.14)' : `1px solid ${colorScheme.textFieldBorderColor}`,
                boxShadow: isDark ? '0 14px 28px rgba(2,6,23,0.28)' : '0 10px 20px rgba(15,23,42,0.05)',
                backdropFilter: 'blur(6px)',
              }}
            >
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                {/* 달력 헤더 */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                    pb: 0.75,
                    borderBottom: isDark ? '1px solid rgba(148,163,184,0.14)' : `1px solid ${colorScheme.textFieldBorderColor}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        p: 0.75,
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, #64748B 0%, #475569 100%)',
                      }}
                    >
                      <CalendarTodayIcon sx={{ color: 'white', fontSize: 14 }} />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontSize: '15px', fontWeight: 600 }}>
                      부서원 휴가 일정
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setModalCalendarDate(new Date(currentCalendarDate));
                      setModalSelectedDate(new Date(selectedDate));
                      setModalCalendarLeaves([...calendarLeaves]);
                      setFullscreenModalOpen(true);
                    }}
                    sx={{
                      color: isDark ? '#CBD5E1' : '#64748B',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(100,116,139,0.16)' : '#64748B22',
                      },
                    }}
                  >
                    <FullscreenIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* 월 네비게이션 */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 0.75,
                    px: 0.75,
                    py: 0.35,
                    bgcolor: isDark ? 'rgba(30, 41, 59, 0.55)' : colorScheme.surfaceColor,
                    borderRadius: '10px',
                    border: isDark ? '1px solid rgba(148,163,184,0.16)' : '1px solid #E9ECEF',
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleMonthChange('prev')}
                    sx={{ color: isDark ? '#CBD5E1' : '#6C757D' }}
                  >
                    <ChevronLeftIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: isDark ? '#E2E8F0' : '#495057' }}>
                    {dayjs(currentCalendarDate).format('YYYY년 M월')}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleMonthChange('next')}
                    sx={{ color: isDark ? '#CBD5E1' : '#6C757D' }}
                  >
                    <ChevronRightIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* 요일 헤더 */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.45, mb: 0.45 }}>
                  {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                    <Box
                      key={day}
                      sx={{
                        textAlign: 'center',
                        py: 0.45,
                        fontSize: '10px',
                        fontWeight: 700,
                        color: index === 0 ? '#FB7185' : index === 6 ? '#60A5FA' : (isDark ? '#64748B' : '#9CA3AF'),
                      }}
                    >
                      {day}
                    </Box>
                  ))}
                </Box>

                {/* 달력 그리드 */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.45 }}>
                  {generateCalendar(currentCalendarDate).map((week, weekIndex) => (
                    <Box
                      key={weekIndex}
                      sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.45 }}
                    >
                      {week.map((date, dayIndex) => {
                        if (!date) return <Box key={dayIndex} />;

                        const isCurrentMonth = date.getMonth() === currentCalendarDate.getMonth();
                        const isToday =
                          date.getDate() === new Date().getDate() &&
                          date.getMonth() === new Date().getMonth() &&
                          date.getFullYear() === new Date().getFullYear();
                        const isSelected =
                          date.getDate() === selectedDate.getDate() &&
                          date.getMonth() === selectedDate.getMonth() &&
                          date.getFullYear() === selectedDate.getFullYear();
                        const dayLeaves = getLeavesForDate(date);
                        const hasLeave = dayLeaves.length > 0;
                        const namedLeaves = dayLeaves
                          .map((leave: any) => String(leave.name || '').trim())
                          .filter((name: string) => Boolean(name));
                        const firstName = namedLeaves[0] || '';
                        const extraCount = Math.max(namedLeaves.length - 1, 0);
                        const nameSummary = firstName ? `${firstName}${extraCount > 0 ? ` 외 ${extraCount}` : ''}` : '';
                        // 상태별 색상 결정 (APPROVED=초록, REQUESTED=주황)
                        const hasRequested = dayLeaves.some((l: any) => String(l.status || '').toUpperCase().includes('REQUESTED'));
                        const hasApproved = dayLeaves.some((l: any) => String(l.status || '').toUpperCase() === 'APPROVED');
                        const firstStatus = String(dayLeaves[0]?.status || '').trim().toUpperCase();
                        let nameColor = '#20C997';
                        if (firstStatus.includes('REQUESTED') || firstStatus === 'CANCEL_REQUESTED') nameColor = '#FF8C00';
                        else if (firstStatus === 'REJECTED') nameColor = '#DC3545';
                        else if (firstStatus === 'CANCELLED') nameColor = '#6C757D';
                        // 셀 배경색: 대기중 포함 시 주황, 승인만 있으면 초록
                        const cellBgColor = hasRequested
                          ? (isDark ? 'rgba(255,140,0,0.16)' : 'rgba(255,140,0,0.12)')
                          : (isDark ? 'rgba(16,185,129,0.16)' : '#20C99726');
                        const weekday = date.getDay();
                        const holidayName = getHolidayName(date, holidays);
                        const isHoliday = !!holidayName;

                        return (
                          <Box
                            key={dayIndex}
                            onClick={() => setSelectedDate(date)}
                            sx={{
                              aspectRatio: '1',
                              minHeight: '42px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              border: isSelected
                                ? '1px solid transparent'
                                : isDark
                                  ? '1px solid rgba(148,163,184,0.08)'
                                  : '1px solid rgba(226,232,240,0.8)',
                              bgcolor: isSelected
                                ? '#475569'
                                : isToday
                                  ? (isDark ? 'rgba(71,85,105,0.72)' : '#64748B80')
                                  : hasLeave && isCurrentMonth
                                    ? cellBgColor
                                    : (isDark ? 'rgba(15,23,42,0.32)' : 'transparent'),
                              '&:hover': {
                                bgcolor: isSelected ? '#475569' : (isDark ? 'rgba(71,85,105,0.25)' : '#64748B20'),
                              },
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: '11px',
                                fontWeight: isSelected || isToday ? 700 : 600,
                                mt: isHoliday && isCurrentMonth ? 0.8 : 0,
                                color: isSelected
                                  ? 'white'
                                  : !isCurrentMonth
                                    ? '#64748B'
                                    : isHoliday
                                      ? '#FB7185'
                                      : weekday === 0
                                        ? '#FB7185'
                                        : weekday === 6
                                          ? '#60A5FA'
                                          : (isDark ? '#E2E8F0' : '#495057'),
                              }}
                            >
                              {date.getDate()}
                            </Typography>
                            {isHoliday && isCurrentMonth && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 3,
                                  left: 3,
                                  right: 3,
                                  display: 'flex',
                                  justifyContent: 'center',
                                  pointerEvents: 'none',
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    maxWidth: '100%',
                                    px: 0.55,
                                    py: '1px',
                                    borderRadius: '999px',
                                    fontSize: '9px',
                                    lineHeight: 1.05,
                                    fontWeight: 700,
                                    color: isSelected ? 'rgba(255,255,255,0.92)' : (isDark ? '#FFE4EA' : '#9F1239'),
                                    bgcolor: isSelected
                                      ? 'rgba(255,255,255,0.16)'
                                      : (isDark ? 'rgba(251,113,133,0.14)' : 'rgba(251,113,133,0.10)'),
                                    border: isSelected
                                      ? '1px solid rgba(255,255,255,0.16)'
                                      : (isDark ? '1px solid rgba(251,113,133,0.20)' : '1px solid rgba(251,113,133,0.16)'),
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                  title={holidayName}
                                >
                                  {holidayName}
                                </Typography>
                              </Box>
                            )}
                            {nameSummary && isCurrentMonth && (
                              <Typography
                                sx={{
                                  position: 'absolute',
                                  left: 3,
                                  right: 3,
                                  bottom: 9,
                                  fontSize: 'clamp(8px, 0.65vw, 11px)',
                                  lineHeight: 1.05,
                                  fontWeight: 700,
                                  color: isDark ? nameColor : '#111111',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'center',
                                  pointerEvents: 'none',
                                }}
                                title={nameSummary}
                              >
                                {nameSummary}
                              </Typography>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  ))}
                </Box>

                {/* 선택된 날짜의 휴가 내역 */}
                {(selectedHolidayName || getLeavesForDate(selectedDate).length > 0) && (
                  <Box sx={{ mt: 1.5, pt: 1.5, borderTop: isDark ? '1px solid rgba(148,163,184,0.14)' : '1px solid #E9ECEF' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      {dayjs(selectedDate).format('M월 D일')} 휴가 내역
                    </Typography>
                    {selectedHolidayName && (
                      <Box
                        sx={{
                          mb: 1,
                          p: 1,
                          borderRadius: '10px',
                          bgcolor: isDark ? 'rgba(251, 113, 133, 0.08)' : 'rgba(251, 113, 133, 0.05)',
                          border: isDark ? '1px solid rgba(251, 113, 133, 0.16)' : '1px solid rgba(251, 113, 133, 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.75,
                        }}
                      >
                        <Chip
                          label="공휴일"
                          size="small"
                          sx={{
                            bgcolor: isDark ? 'rgba(251, 113, 133, 0.10)' : 'rgba(251, 113, 133, 0.07)',
                            color: isDark ? '#FDB4C0' : '#9F1239',
                            border: isDark ? '1px solid rgba(251, 113, 133, 0.16)' : '1px solid rgba(251, 113, 133, 0.12)',
                            fontSize: '11px',
                            fontWeight: 700,
                            height: 22,
                          }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {selectedHolidayName}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, maxHeight: 220, overflowY: 'auto', pr: 0.25 }}>
                      {getLeavesForDate(selectedDate).map((leave: any, index: number) => {
                        const department = leave.department;
                        const jobPosition = leave.job_position ?? leave.jobPosition;
                        const leaveType = leave.leave_type ?? leave.leaveType;
                        const startDate = leave.start_date ?? leave.startDate;
                        const endDate = leave.end_date ?? leave.endDate;
                        const workdays = leave.workdays_count ?? leave.workdaysCount ?? 0;
                        const leaveStatus = String(leave.status || '').trim().toUpperCase();
                        const isRequested = leaveStatus.includes('REQUESTED');
                        const statusLabel = isRequested ? '대기중' : '승인됨';
                        const statusColor = isRequested ? '#FF8C00' : '#20C997';

                        return (
                          <Box
                            key={index}
                            sx={{
                              p: 1,
                              borderRadius: '12px',
                              bgcolor: isDark ? 'rgba(30, 41, 59, 0.52)' : colorScheme.surfaceColor,
                              border: isDark ? '1px solid rgba(148,163,184,0.14)' : '1px solid #E9ECEF',
                              boxShadow: isDark ? 'none' : '0 6px 16px rgba(15,23,42,0.04)',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.25 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  flex: 1,
                                  minWidth: 0,
                                  color: isDark ? '#E2E8F0' : 'inherit',
                                }}
                              >
                                {leave.name}
                                {' · '}
                                {department}
                                {jobPosition ? ` · ${jobPosition}` : ''}
                                {' | '}
                                {leaveType}
                                {leave.half_day_slot === 'AM' && ' (오전반차)'}
                                {leave.half_day_slot === 'PM' && ' (오후반차)'}
                                {leave.half_day_slot === 'ALL' && ' (종일연차)'}
                                {' | '}
                                {formatServerDateMD(startDate)} ~ {formatServerDateMD(endDate)}
                                {workdays ? ` | ${workdays}일` : ''}
                              </Typography>
                              <Chip
                                label={statusLabel}
                                size="small"
                                sx={{
                                  ml: 0.5,
                                  flexShrink: 0,
                                  bgcolor: `${statusColor}22`,
                                  color: statusColor,
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  height: 20,
                                  '& .MuiChip-label': { px: 0.75 },
                                }}
                              />
                            </Box>
                            {leave.reason && (
                              <Typography variant="caption" sx={{ mt: 0.5, color: isDark ? '#94A3B8' : '#6C757D', display: 'block' }}>
                                사유: {leave.reason}
                              </Typography>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        ) : (
          /* 데스크톱: 50:50 분할 레이아웃 */
          <Box sx={{ display: 'flex', gap: 2, height: { xs: 'calc(var(--app-height) - 280px)', md: 'calc(100vh - 280px)' } }}>
            {/* 왼쪽: 결재 목록 (50%) */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Card sx={{ ...desktopPanelSx, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexShrink: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {currentTab === 'pending' ? '결재 대기 목록' : '전체 결재 목록'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormControl size="small" sx={{ minWidth: 100 }}>
                        <Select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value as number)}
                          sx={{ fontSize: '13px', height: '32px' }}
                        >
                          {[2026, 2025, 2024].map((year) => (
                            <MenuItem key={year} value={year}>
                              {year}년
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Chip
                        label={`${getFilteredLeaves().length}건 (${currentPage}/${totalPages}페이지)`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  </Box>

                  {/* 결재 목록 - 스크롤 가능 */}
                  <Box sx={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    pr: 1,
                    ...desktopScrollbarSx,
                  }}>
                    {getPaginatedLeaves().length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary">
                          {getFilteredLeaves().length === 0 ? '결재 대기 중인 항목이 없습니다' : '해당 페이지에 항목이 없습니다'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {getFilteredLeaves().length === 0 ? '새로운 휴가 신청이 있을 때 이곳에 표시됩니다' : '다른 페이지를 확인해주세요'}
                        </Typography>
                      </Box>
                    ) : (
                      getPaginatedLeaves().map((leave: any, index: number) => (
                        <Card
                          key={leave.id || `leave-${index}`}
                          onClick={() => {
                            setSelectedDetailLeave(leave);
                            setDetailModalOpen(true);
                          }}
                          sx={{
                            borderRadius: '14px',
                            bgcolor: isDark ? 'rgba(15, 23, 42, 0.42)' : '#FFFFFF',
                            border: leave.status?.includes('REQUESTED')
                              ? (isDark ? '1.5px solid rgba(148,163,184,0.45)' : '1.5px solid #94A3B8')
                              : `1px solid ${colorScheme.textFieldBorderColor}`,
                            cursor: 'pointer',
                            p: 0,
                            flexShrink: 0, // 요소 크기 고정 - 압축 방지
                            minHeight: 'fit-content', // 최소 높이를 내용에 맞게
                            boxShadow: isDark ? 'none' : '0 8px 18px rgba(15,23,42,0.04)',
                            transition: 'transform .2s ease, box-shadow .2s ease, border-color .2s ease',
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: isDark ? '0 10px 18px rgba(2,6,23,0.18)' : '0 12px 22px rgba(15,23,42,0.08)',
                            },
                          }}
                        >
                          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}> {/* padding 줄임 */}
                            {/* 상태 및 휴가 타입 */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                                <Chip
                                  label={getStatusLabel(leave)}
                                  size="small"
                                  sx={{
                                    bgcolor: `${getStatusColor(leave.status, leave.isCancel)}22`,
                                    color: getStatusColor(leave.status, leave.isCancel),
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    height: '20px',
                                    '& .MuiChip-label': { px: 0.5 },
                                  }}
                                />
                                <Chip
                                  label={`${leave.leave_type}${leave.half_day_slot === 'AM' ? ' (오전반차)' :
                                    leave.half_day_slot === 'PM' ? ' (오후반차)' :
                                      leave.half_day_slot === 'ALL' ? ' (종일연차)' : ''
                                    }`}
                                  size="small"
                                  sx={{
                                    bgcolor: '#64748B22',
                                    color: '#64748B',
                                    fontSize: '10px',
                                    height: '20px',
                                    '& .MuiChip-label': { px: 0.5 },
                                  }}
                                />
                                {leave.half_day_slot && (
                                  <Chip
                                    label={leave.half_day_slot === 'AM' ? '오전' : leave.half_day_slot === 'PM' ? '오후' : leave.half_day_slot}
                                    size="small"
                                    sx={{
                                      bgcolor: '#FF8C0022',
                                      color: '#FF8C00',
                                      fontSize: '9px',
                                      height: '18px',
                                      '& .MuiChip-label': { px: 0.3 },
                                    }}
                                  />
                                )}
                                {leave.is_canceled === 1 && (
                                  <Chip
                                    label="취소"
                                    size="small"
                                    sx={{
                                      bgcolor: '#FF8C0022',
                                      color: '#FF8C00',
                                      fontSize: '9px',
                                      height: '18px',
                                      '& .MuiChip-label': { px: 0.3 },
                                    }}
                                  />
                                )}
                              </Box>
                              <Chip
                                label={`${leave.workdays_count}일`}
                                sx={{
                                  bgcolor: '#64748B',
                                  color: 'white',
                                  fontWeight: 700,
                                  fontSize: '12px',
                                  height: '22px',
                                  '& .MuiChip-label': { px: 0.8 },
                                }}
                              />
                            </Box>

                            {/* 두 번째 줄: 신청자 + 기간 한 줄로 */}
                            <Box sx={{ ...desktopSoftSx, display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, px: 1, py: 0.75 }}>
                              {/* 신청자 정보 */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    bgcolor: '#64748B22',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <PersonIcon sx={{ color: '#64748B', fontSize: 14 }} />
                                </Box>
                                <Box>
                                  <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                    {leave.name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ fontSize: '11px', lineHeight: 1.2, color: isDark ? '#FFFFFF' : '#000000' }}>
                                    {leave.department} | {leave.job_position}
                                  </Typography>
                                </Box>
                              </Box>

                              {/* 기간 정보 */}
                              <Box sx={{ textAlign: 'right' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                  <Typography variant="caption" sx={{ fontSize: '11px', color: isDark ? '#FFFFFF' : '#000000' }}>
                                    휴가 사용일 :
                                  </Typography>
                                  <Typography variant="caption" fontWeight={600} sx={{ fontSize: '12px' }}>
                                    {formatServerDateMD(leave.start_date)}-{formatServerDateMD(leave.end_date)}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                  <Typography variant="caption" sx={{ fontSize: '12px', color: isDark ? '#FFFFFF' : '#000000' }}>
                                    신청일 : {formatServerDateTime(leave.requested_date).slice(5)}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>


                            {/* 세 번째 줄: 휴가 정보 + 사유 */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, px: 0.25 }}>
                              <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                                <Typography variant="caption" sx={{ fontSize: '11px', color: isDark ? '#FFFFFF' : '#000000' }}>
                                  사용:{leave.workdays_count}일
                                </Typography>
                                {leave.join_date && (
                                  <Typography variant="caption" sx={{ fontSize: '11px', color: isDark ? '#FFFFFF' : '#000000' }}>
                                    {dayjs(leave.join_date).format('YY.MM.DD')}입사
                                  </Typography>
                                )}
                              </Box>
                              {leave.reason && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: '11px',
                                    color: isDark ? '#FFFFFF' : '#000000',
                                    maxWidth: '120px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {leave.reason}
                                </Typography>
                              )}
                            </Box>

                            {/* 반려 사유 (있는 경우) */}
                            {leave.reject_message && (
                              <Box sx={{ p: 0.75, bgcolor: isDark ? 'rgba(220, 53, 69, 0.1)' : 'rgba(220, 53, 69, 0.06)', borderRadius: '10px', border: '1px solid rgba(220, 53, 69, 0.22)' }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: isDark ? '#FFFFFF' : '#000000',
                                    fontSize: '10px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: 'vertical',
                                    wordBreak: 'break-word',
                                  }}
                                >
                                  <Typography component="span" sx={{ fontWeight: 600, color: '#DC3545' }}>반려 사유:</Typography> {leave.reject_message}
                                </Typography>
                              </Box>
                            )}

                            {/* 승인/반려 버튼 */}
                            {leave.status && leave.status.toUpperCase().includes('REQUESTED') && (
                              <>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                  {/* 취소 상신: 취소 승인 버튼만 */}
                                  {leave.status.toUpperCase().includes('CANCEL') && (
                                    <Button
                                      fullWidth
                                      variant="contained"
                                      startIcon={<CheckCircleIcon />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedLeave(leave);
                                        setApprovalAction('approve');
                                        setApprovalDialog(true);
                                      }}
                                      sx={{
                                        bgcolor: '#1cc88a',
                                        borderRadius: '12px',
                                        boxShadow: 'none',
                                        fontWeight: 600,
                                        '&:hover': { bgcolor: '#17a673', boxShadow: 'none' }
                                      }}
                                    >
                                      취소 승인
                                    </Button>
                                  )}

                                  {/* 일반 상신: 반려 + 승인 버튼 */}
                                  {!leave.status.toUpperCase().includes('CANCEL') && (
                                    <>
                                      <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<CancelIcon />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedLeave(leave);
                                          setApprovalAction('reject');
                                          setApprovalDialog(true);
                                        }}
                                        sx={{
                                          flex: 1,
                                          borderRadius: '12px',
                                          borderWidth: '1.5px',
                                          fontWeight: 600,
                                          '&:hover': { borderWidth: '1.5px', bgcolor: (theme) => alpha(theme.palette.error.main, 0.05) }
                                        }}
                                      >
                                        반려
                                      </Button>
                                      <Button
                                        variant="contained"
                                        startIcon={<CheckCircleIcon />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedLeave(leave);
                                          setApprovalAction('approve');
                                          setApprovalDialog(true);
                                        }}
                                        sx={{
                                          flex: 2,
                                          bgcolor: '#1cc88a',
                                          borderRadius: '12px',
                                          boxShadow: 'none',
                                          fontWeight: 600,
                                          '&:hover': { bgcolor: '#17a673', boxShadow: 'none' }
                                        }}
                                      >
                                        승인
                                      </Button>
                                    </>
                                  )}
                                </Box>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </Box>

                  {/* 페이지네이션 */}
                  {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, flexShrink: 0 }}>
                      <Stack spacing={2}>
                        <Pagination
                          count={totalPages}
                          page={currentPage}
                          onChange={(e, page) => handlePageChange(page)}
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

            {/* 오른쪽: 달력 영역 (50%) - Flutter와 동일 */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
              {/* 달력 (60%) - 높이 조정 */}
              <Box sx={{ flex: 6, minHeight: 0, display: 'flex' }}>
                <Card sx={{ ...desktopPanelSx, width: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    {/* 달력 헤더 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, pb: 0.75, borderBottom: isDark ? '1px solid rgba(148,163,184,0.14)' : '1px solid #E2E8F0', flexShrink: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            p: 0.75,
                            borderRadius: '6px',
                            background: 'linear-gradient(135deg, #64748B 0%, #475569 100%)',
                          }}
                        >
                          <CalendarTodayIcon sx={{ color: 'white', fontSize: 14 }} />
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontSize: '15px', fontWeight: 600 }}>
                          부서원 휴가 일정
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setModalCalendarDate(new Date(currentCalendarDate));
                          setModalSelectedDate(new Date(selectedDate));
                          setModalCalendarLeaves([...calendarLeaves]);
                          setFullscreenModalOpen(true);
                        }}
                        sx={{
                          color: isDark ? '#94A3B8' : '#64748B',
                          '&:hover': {
                            bgcolor: isDark ? 'rgba(148,163,184,0.12)' : '#64748B22',
                          },
                        }}
                      >
                        <FullscreenIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* 월 네비게이션 */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 0.5,
                        px: 0.75,
                        py: 0.25,
                        ...desktopSoftSx,
                        borderRadius: '10px',
                        flexShrink: 0,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleMonthChange('prev')}
                        sx={{ color: isDark ? '#CBD5E1' : '#64748B' }}
                      >
                        <ChevronLeftIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: isDark ? '#E2E8F0' : '#334155' }}>
                        {dayjs(currentCalendarDate).format('YYYY년 M월')}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleMonthChange('next')}
                        sx={{ color: isDark ? '#CBD5E1' : '#64748B' }}
                      >
                        <ChevronRightIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* 요일 헤더 */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.4, mb: 0.4, flexShrink: 0 }}>
                      {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                        <Box
                          key={day}
                          sx={{
                            textAlign: 'center',
                            py: 0.5,
                            fontSize: '10px',
                            fontWeight: 700,
                            color: index === 0 ? (isDark ? '#F87171' : '#E53E3E') : index === 6 ? (isDark ? '#60A5FA' : '#3182CE') : (isDark ? '#64748B' : '#9CA3AF'),
                          }}
                        >
                          {day}
                        </Box>
                      ))}
                    </Box>

                    {/* 달력 그리드 */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.3, minHeight: 0 }}>
                      {generateCalendar(currentCalendarDate).map((week, weekIndex) => (
                        <Box
                          key={weekIndex}
                          sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.4, flex: 1, minHeight: 0 }}
                        >
                          {week.map((date, dayIndex) => {
                            if (!date) return <Box key={dayIndex} />;

                            const isCurrentMonth = date.getMonth() === currentCalendarDate.getMonth();
                            const isToday =
                              date.getDate() === new Date().getDate() &&
                              date.getMonth() === new Date().getMonth() &&
                              date.getFullYear() === new Date().getFullYear();
                            const isSelected =
                              date.getDate() === selectedDate.getDate() &&
                              date.getMonth() === selectedDate.getMonth() &&
                              date.getFullYear() === selectedDate.getFullYear();
                            const dayLeaves = getLeavesForDate(date);
                            const hasLeave = dayLeaves.length > 0;
                            const namedLeaves = dayLeaves
                              .map((leave: any) => String(leave.name || '').trim())
                              .filter((name: string) => Boolean(name));
                            const firstName = namedLeaves[0] || '';
                            const extraCount = Math.max(namedLeaves.length - 1, 0);
                            const nameSummary = firstName ? `${firstName}${extraCount > 0 ? ` 외 ${extraCount}` : ''}` : '';
                            const firstStatus = String(dayLeaves[0]?.status || '').trim().toUpperCase();
                            const dtHasRequested = dayLeaves.some((l: any) => String(l.status || '').toUpperCase().includes('REQUESTED'));
                            let nameColor = '#20C997';
                            if (firstStatus.includes('REQUESTED') || firstStatus === 'CANCEL_REQUESTED') nameColor = '#FF8C00';
                            else if (firstStatus === 'REJECTED') nameColor = '#DC3545';
                            else if (firstStatus === 'CANCELLED') nameColor = '#6C757D';
                            const dtCellBgColor = dtHasRequested
                              ? (isDark ? 'rgba(255,140,0,0.16)' : 'rgba(255,140,0,0.12)')
                              : (isDark ? 'rgba(32,201,151,0.18)' : 'rgba(32,201,151,0.12)');
                            const weekday = date.getDay();
                            const holidayName = getHolidayName(date, holidays);
                            const isHoliday = !!holidayName;

                            return (
                              <Box
                                key={dayIndex}
                                onClick={() => setSelectedDate(date)}
                                sx={{
                                  height: '100%',
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  minHeight: '28px',
                                  border: isSelected ? '1px solid transparent' : (isDark ? '1px solid rgba(148,163,184,0.06)' : '1px solid rgba(226,232,240,0.9)'),
                                  bgcolor: isSelected
                                    ? '#475569'
                                    : isToday
                                      ? (isDark ? 'rgba(71,85,105,0.7)' : 'rgba(100,116,139,0.2)')
                                      : hasLeave && isCurrentMonth
                                        ? dtCellBgColor
                                        : (isDark ? 'rgba(15,23,42,0.22)' : 'transparent'),
                                  '&:hover': {
                                    bgcolor: isSelected ? '#475569' : (isDark ? 'rgba(71,85,105,0.25)' : '#E2E8F0'),
                                  },
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: '10px',
                                    fontWeight: isSelected || isToday ? 700 : 500,
                                    mt: isHoliday && isCurrentMonth ? 0.75 : 0,
                                    color: isSelected
                                      ? 'white'
                                      : !isCurrentMonth
                                        ? (isDark ? '#334155' : '#CBD5E1')
                                        : isHoliday
                                          ? (isDark ? '#F87171' : '#E53E3E')
                                          : weekday === 0
                                            ? (isDark ? '#F87171' : '#E53E3E')
                                            : weekday === 6
                                              ? (isDark ? '#60A5FA' : '#3182CE')
                                              : (isDark ? '#CBD5E1' : '#374151'),
                                  }}
                                >
                                  {date.getDate()}
                                </Typography>
                                {isHoliday && isCurrentMonth && (
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: 2,
                                      left: 2,
                                      right: 2,
                                      display: 'flex',
                                      justifyContent: 'center',
                                      pointerEvents: 'none',
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        maxWidth: '100%',
                                        px: 0.5,
                                        py: '1px',
                                        borderRadius: '999px',
                                        fontSize: '8px',
                                        lineHeight: 1.05,
                                        fontWeight: 700,
                                        color: isSelected ? 'rgba(255,255,255,0.92)' : (isDark ? '#FFE4EA' : '#9F1239'),
                                        bgcolor: isSelected
                                          ? 'rgba(255,255,255,0.16)'
                                          : (isDark ? 'rgba(251,113,133,0.14)' : 'rgba(251,113,133,0.10)'),
                                        border: isSelected
                                          ? '1px solid rgba(255,255,255,0.16)'
                                          : (isDark ? '1px solid rgba(251,113,133,0.20)' : '1px solid rgba(251,113,133,0.16)'),
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                      title={holidayName}
                                    >
                                      {holidayName}
                                    </Typography>
                                  </Box>
                                )}
                                {nameSummary && isCurrentMonth && (
                                  <Typography
                                    sx={{
                                      position: 'absolute',
                                      left: 2,
                                      right: 2,
                                      bottom: 7,
                                      fontSize: 'clamp(7px, 0.6vw, 10px)',
                                      lineHeight: 1.05,
                                      fontWeight: 700,
                                      color: isDark ? nameColor : '#111111',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      textAlign: 'center',
                                      pointerEvents: 'none',
                                    }}
                                    title={nameSummary}
                                  >
                                    {nameSummary}
                                  </Typography>
                                )}
                              </Box>
                            );
                          })}
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* 선택된 날짜 상세 (40%) - 높이 조정 */}
              <Box sx={{ flex: 4, minHeight: 0, display: 'flex', pb: 0.5 }}>
                <Card sx={{ ...desktopPanelSx, width: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', p: 1.5, '&:last-child': { pb: 1.75 } }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, fontSize: '14px', flexShrink: 0 }}>
                      {dayjs(selectedDate).format('YYYY.MM.DD')} 휴가 내역
                    </Typography>

                    <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0, pr: 0.5, pb: 0.5, ...desktopScrollbarSx }}>
                      {selectedHolidayName && (
                        <Box
                          sx={{
                            mb: 1,
                            p: 1,
                            borderRadius: '6px',
                            bgcolor: isDark ? 'rgba(251, 113, 133, 0.08)' : 'rgba(251, 113, 133, 0.05)',
                            border: isDark ? '1px solid rgba(251, 113, 133, 0.16)' : '1px solid rgba(251, 113, 133, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                          }}
                        >
                          <Chip
                            label="공휴일"
                            size="small"
                            sx={{
                              bgcolor: isDark ? 'rgba(251, 113, 133, 0.10)' : 'rgba(251, 113, 133, 0.07)',
                              color: isDark ? '#FDB4C0' : '#9F1239',
                              border: isDark ? '1px solid rgba(251, 113, 133, 0.16)' : '1px solid rgba(251, 113, 133, 0.12)',
                              fontSize: '11px',
                              fontWeight: 700,
                              height: 22,
                            }}
                          />
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {selectedHolidayName}
                          </Typography>
                        </Box>
                      )}
                      {getSelectedDateDetails().length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            해당 날짜에 휴가 일정이 없습니다
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {getSelectedDateDetails().map((leave: any, index: number) => {
                            const department = leave.department;
                            const jobPosition = leave.job_position ?? leave.jobPosition;
                            const leaveType = leave.leave_type ?? leave.leaveType;
                            const startDate = leave.start_date ?? leave.startDate;
                            const endDate = leave.end_date ?? leave.endDate;
                            const workdays = leave.workdays_count ?? leave.workdaysCount ?? 0;
                            const dtLeaveStatus = String(leave.status || '').trim().toUpperCase();
                            const dtIsRequested = dtLeaveStatus.includes('REQUESTED');
                            const dtStatusLabel = dtIsRequested ? '대기중' : '승인됨';
                            const dtStatusColor = dtIsRequested ? '#FF8C00' : '#20C997';

                            return (
                              <Card
                                key={index}
                                sx={{ p: 1, ...desktopSoftSx, borderRadius: '10px' }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, overflow: 'hidden' }}>
                                  <PersonIcon sx={{ fontSize: 16, color: '#64748B', flexShrink: 0 }} />
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontWeight: 600,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      flex: 1,
                                      minWidth: 0,
                                    }}
                                  >
                                    {leave.name}
                                    {' · '}
                                    {department}
                                    {jobPosition ? ` · ${jobPosition}` : ''}
                                    {' | '}
                                    {leaveType}
                                    {leave.half_day_slot === 'AM' && ' (오전반차)'}
                                    {leave.half_day_slot === 'PM' && ' (오후반차)'}
                                    {leave.half_day_slot === 'ALL' && ' (종일연차)'}
                                    {' | '}
                                    {formatServerDateMD(startDate)} ~ {formatServerDateMD(endDate)}
                                    {workdays ? ` | ${workdays}일` : ''}
                                  </Typography>
                                  <Chip
                                    label={dtStatusLabel}
                                    size="small"
                                    sx={{
                                      flexShrink: 0,
                                      bgcolor: `${dtStatusColor}22`,
                                      color: dtStatusColor,
                                      fontSize: '10px',
                                      fontWeight: 700,
                                      height: 20,
                                      '& .MuiChip-label': { px: 0.75 },
                                    }}
                                  />
                                </Box>
                                {leave.reason && (
                                  <Typography variant="caption" sx={{ mt: 0.5, color: isDark ? '#94A3B8' : '#6C757D', display: 'block' }}>
                                    사유: {leave.reason}
                                  </Typography>
                                )}
                              </Card>
                            );
                          })}
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      <AdminLeaveApprovalModals
        state={state}
        derived={derived}
        actions={actions}
        theme={theme}
        isMobile={isMobile}
        isDark={isDark}
        colorScheme={colorScheme}
        modalSelectedHolidayName={modalSelectedHolidayName}
        onConfirmYearMonth={handleYearMonthConfirm}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default AdminLeaveApprovalPage;
