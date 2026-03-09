import React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Alert,
  Card,
  Chip,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  Select,
  Pagination,
  type SelectChangeEvent,
} from '@mui/material';
import {
  Event as EventIcon,
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  ArrowBack as ArrowBackIcon,
  AutoAwesome as AutoAwesomeIcon,
  MoreVert as MoreVertIcon,
  Assignment as AssignmentIcon,
  HelpOutline as HelpOutlineIcon,
  SmartToy as SmartToyIcon,
  Close as CloseIcon,
  AccessTime as TimeIcon,
  Description as DescriptionIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import DesktopLeaveManagement from '../components/leave/DesktopLeaveManagement';
import TotalCalendar from '../components/calendar/TotalCalendar';
import LeaveRequestModal from '../components/leave/LeaveRequestModal';
import VacationRecommendationModal from '../components/leave/VacationRecommendationModal';

import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { useLeaveManagementPageState } from './LeaveManagementPage.state';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`leave-tabpanel-${index}`}
      aria-labelledby={`leave-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function LeaveManagementPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px = 모바일
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme.name === 'Dark';
  const calendarSurface = isDark ? '#0B1120' : '#F8FAFC';
  const calendarBorder = isDark ? 'rgba(148, 163, 184, 0.2)' : '#E2E8F0';
  const calendarShadow = isDark ? '0 18px 32px rgba(0,0,0,0.35)' : '0 16px 30px rgba(15, 23, 42, 0.08)';
  const [mobilePage, setMobilePage] = React.useState(1);

  const { state, actions } = useLeaveManagementPageState();
  const {
    user,
    isApprover,
    tabValue,
    loading,
    error,
    leaveData,
    waitingCount,
    selectedYear,
    yearlyLeaves,
    yearlyLoading,
    requestDialogOpen,
    cancelRequestModalOpen,
    cancelRequestLeave,
    detailModalOpen,
    selectedLeave,
    cancelReasonDialogOpen,
    cancelReason,
    recommendationOpen,
    hideCanceled,

    menuAnchorEl,
    menuOpen,
  } = state;
  const {
    setRequestDialogOpen,
    setCancelRequestModalOpen,
    setCancelRequestLeave,
    setDetailModalOpen,
    setSelectedLeave,
    setCancelReasonDialogOpen,
    setCancelReason,
    setRecommendationOpen,
    setSelectedYear,
    setHideCanceled,

    loadLeaveData,
    handleMenuOpen,
    handleMenuClose,
    handleTabChange,
    handleRequestDialogOpen,
    handleRequestDialogClose,
    handleOpenCancelDialog,
    handleDetailModalCancelRequest,
    handleCancelRequest,
  } = actions;
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'REJECTED':
        return <CancelIcon sx={{ color: 'error.main' }} />;
      case 'REQUESTED':
        return <PendingIcon sx={{ color: 'warning.main' }} />;
      case 'CANCEL_REQUESTED':
        return <PendingIcon sx={{ color: 'warning.main' }} />;
      case 'CANCELLED':
        return <CancelIcon sx={{ color: 'grey.500' }} />;
      default:
        return <PendingIcon sx={{ color: 'grey.500' }} />;
    }
  };

  React.useEffect(() => {
    setMobilePage(1);
  }, [selectedYear, hideCanceled, yearlyLeaves]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '#20C997';
      case 'REJECTED':
        return '#DC3545';
      case 'REQUESTED':
        return '#FF8C00';
      case 'CANCEL_REQUESTED':
        return '#F59E0B';
      case 'CANCELLED':
        return '#94A3B8';
      default:
        return '#94A3B8';
    }
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY-MM-DD');
  };

  const calculateDays = (startDate: string, endDate: string) => {
    return dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
  };

  const getLeaveSortTime = (leave: any) => {
    const raw =
      leave?.requested_date ??
      leave?.requestedDate ??
      leave?.request_date ??
      leave?.requestDate ??
      leave?.start_date ??
      leave?.startDate ??
      '';
    const text = String(raw).trim();
    if (!text) return 0;

    if (/^\d{8}$/.test(text)) {
      const normalized = `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
      return dayjs(normalized).valueOf();
    }

    const normalized = text.replace(/\./g, '-').replace(/\//g, '-');
    const parsed = dayjs(normalized);
    if (parsed.isValid()) return parsed.valueOf();

    const isoParsed = dayjs(normalized.replace(' ', 'T'));
    return isoParsed.isValid() ? isoParsed.valueOf() : 0;
  };


  // 데스크톱 UI
  if (!isMobile) {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: { xs: 'var(--app-height)', md: '100vh' } }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: { xs: 'var(--app-height)', md: '100vh' }, p: 3 }}>
          <Alert severity="error" sx={{ maxWidth: 600 }}>
            {error}
            <Button onClick={loadLeaveData} sx={{ mt: 2 }}>
              다시 시도
            </Button>
          </Alert>
        </Box>
      );
    }

    if (leaveData) {
      return <DesktopLeaveManagement leaveData={leaveData} onRefresh={loadLeaveData} waitingCount={waitingCount} />;
    }

    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: { xs: 'var(--app-height)', md: '100vh' } }}>
        <Typography>휴가 관리 데이터를 불러오는 중...</Typography>
      </Box>
    );
  }

  // 모바일 UI
  return (
    <Container maxWidth="md" sx={{ py: 0, height: 'var(--app-height)', overflow: 'auto', paddingBottom: 'max(env(safe-area-inset-bottom), 80px)', bgcolor: isDark ? '#0A0F1A' : '#F1F5F9' }}>
        <Box sx={{ borderRadius: 0, bgcolor: calendarSurface, border: `1px solid ${calendarBorder}`, minHeight: '100%' }}>

          {/* 헤더 */}
          <Box
            sx={{
              px: 2,
              py: 2,
              bgcolor: isDark ? '#0B1120' : '#F8FAFC',
              borderBottom: `1px solid ${calendarBorder}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconButton
                  onClick={() => navigate('/chat')}
                  size="small"
                  sx={{
                    color: colorScheme.textColor,
                    border: `1px solid ${calendarBorder}`,
                    borderRadius: '10px',
                    '&:hover': { bgcolor: isDark ? 'rgba(59,130,246,0.12)' : '#EFF6FF' },
                  }}
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      bgcolor: isDark ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <EventIcon sx={{ fontSize: 20, color: isDark ? '#E2E8F0' : '#475569' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '17px', fontWeight: 700, color: colorScheme.textColor, lineHeight: 1.2 }}>
                      휴가 관리
                    </Typography>
                    {user?.name && (
                      <Typography sx={{ fontSize: '11px', color: colorScheme.hintTextColor }}>
                        {user.name}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* 메뉴 버튼 */}
              <Badge badgeContent={isApprover ? waitingCount : 0} color="error" invisible={!isApprover || waitingCount === 0} max={99}>
                <IconButton
                  onClick={handleMenuOpen}
                  size="small"
                  sx={{
                    color: colorScheme.textColor,
                    border: `1px solid ${calendarBorder}`,
                    borderRadius: '10px',
                    '&:hover': { bgcolor: isDark ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.08)' },
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Badge>
              <Menu
                anchorEl={menuAnchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    borderRadius: '12px',
                    bgcolor: calendarSurface,
                    border: `1px solid ${calendarBorder}`,
                    boxShadow: calendarShadow,
                  },
                }}
              >
                <MenuItem onClick={() => { handleMenuClose(); handleRequestDialogOpen(); }}>
                  <ListItemIcon><AddIcon sx={{ color: isDark ? '#E2E8F0' : '#475569' }} /></ListItemIcon>
                  <ListItemText primaryTypographyProps={{ sx: { color: colorScheme.textColor, fontSize: '14px' } }} primary="휴가 신청" />
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); setRecommendationOpen(true); }}>
                  <ListItemIcon><AutoAwesomeIcon sx={{ color: isDark ? '#CBD5E1' : '#64748B' }} /></ListItemIcon>
                  <ListItemText primaryTypographyProps={{ sx: { color: colorScheme.textColor, fontSize: '14px' } }} primary="AI 휴가계획 추천" />
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); navigate('/leave-grant-history'); }}>
                  <ListItemIcon><AssignmentIcon sx={{ color: isDark ? '#E2E8F0' : '#475569' }} /></ListItemIcon>
                  <ListItemText primaryTypographyProps={{ sx: { color: colorScheme.textColor, fontSize: '14px' } }} primary="휴가 부여 내역" />
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); navigate('/leave-all-vacation'); }}>
                  <ListItemIcon><CalendarIcon sx={{ color: isDark ? '#E2E8F0' : '#475569' }} /></ListItemIcon>
                  <ListItemText primaryTypographyProps={{ sx: { color: colorScheme.textColor, fontSize: '14px' } }} primary="전 사원 휴가 현황" />
                </MenuItem>
                {isApprover && (
                  <MenuItem onClick={() => { handleMenuClose(); navigate('/admin-leave', { replace: false }); }}>
                    <ListItemIcon>
                      <Badge badgeContent={waitingCount} color="error" invisible={waitingCount === 0} max={99}>
                        <AdminPanelSettingsIcon sx={{ color: isDark ? '#CBD5E1' : '#64748B' }} />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText primaryTypographyProps={{ sx: { color: colorScheme.textColor, fontSize: '14px' } }} primary="관리자 휴가관리" />
                  </MenuItem>
                )}
              </Menu>
            </Box>
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ m: 3 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && leaveData && (
            <>
              {/* 휴가 현황 요약 */}
              <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>

                {/* 내 휴가 현황 */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    bgcolor: isDark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.04)',
                    border: `1px solid ${isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.15)'}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                    <CalendarIcon sx={{ fontSize: 15, color: isDark ? '#60A5FA' : '#3B82F6' }} />
                    <Typography sx={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#60A5FA' : '#3B82F6', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      내 휴가 현황
                    </Typography>
                  </Box>
                  {leaveData.leaveStatus && leaveData.leaveStatus.length > 0 ? (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {leaveData.leaveStatus.map((status, index) => (
                        <Box
                          key={index}
                          sx={{
                            flex: '1 1 calc(50% - 4px)',
                            minWidth: 0,
                            p: 1.5,
                            borderRadius: '10px',
                            bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)',
                            border: `1px solid ${calendarBorder}`,
                            textAlign: 'center',
                          }}
                        >
                          <Typography sx={{ fontSize: '11px', color: colorScheme.hintTextColor, mb: 0.5 }}>
                            {(status as any).leave_type || status.leaveType || '휴가'}
                          </Typography>
                          <Typography sx={{ fontSize: '22px', fontWeight: 800, color: isDark ? '#60A5FA' : '#3B82F6', lineHeight: 1.1 }}>
                            {(status as any).remain_days ?? status.remainDays ?? 0}
                          </Typography>
                          <Typography sx={{ fontSize: '10px', color: colorScheme.hintTextColor }}>
                            / {(status as any).total_days ?? status.totalDays ?? 0}일
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: '13px', color: colorScheme.hintTextColor, textAlign: 'center', py: 1 }}>
                      휴가 잔여량 정보가 없습니다
                    </Typography>
                  )}
                </Box>

                {/* 결재진행 현황 */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${calendarBorder}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                    <EventIcon sx={{ fontSize: 15, color: colorScheme.hintTextColor }} />
                    <Typography sx={{ fontSize: '11px', fontWeight: 700, color: colorScheme.hintTextColor, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      결재진행 현황
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {[
                      { label: '대기중', value: leaveData.approvalStatus?.requested || 0, color: isDark ? '#FBBF24' : '#FF8C00' },
                      { label: '승인됨', value: leaveData.approvalStatus?.approved || 0, color: isDark ? '#34D399' : '#20C997' },
                      { label: '반려됨', value: leaveData.approvalStatus?.rejected || 0, color: isDark ? '#F87171' : '#DC3545' },
                    ].map((item) => (
                      <Box
                        key={item.label}
                        sx={{
                          flex: 1,
                          p: 1.5,
                          borderRadius: '10px',
                          bgcolor: isDark ? 'rgba(148,163,184,0.03)' : 'rgba(248,250,252,0.9)',
                          border: `1px solid ${isDark ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.18)'}`,
                          textAlign: 'center',
                          transition: 'all 160ms ease-out',
                          '&:hover': {
                            bgcolor: isDark ? 'rgba(148,163,184,0.06)' : 'rgba(241,245,249,0.95)',
                          },
                        }}
                      >
                        <Typography sx={{ fontSize: '22px', fontWeight: 800, color: item.color, lineHeight: 1.1 }}>
                          {item.value}
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: colorScheme.hintTextColor, mt: 0.25 }}>
                          {item.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>

              {/* 탭: 휴가내역 / 달력 */}
              <Box sx={{ borderBottom: `1px solid ${calendarBorder}`, px: 2 }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{
                    '& .MuiTab-root': {
                      fontSize: '13px',
                      fontWeight: 600,
                      color: colorScheme.hintTextColor,
                      minHeight: 44,
                    },
                    '& .Mui-selected': { color: isDark ? '#60A5FA' : '#3B82F6' },
                    '& .MuiTabs-indicator': { bgcolor: isDark ? '#60A5FA' : '#3B82F6', height: 2, borderRadius: '2px 2px 0 0' },
                  }}
                >
                  <Tab label="휴가내역" icon={<EventIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
                  <Tab label="달력" icon={<CalendarIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
                </Tabs>
              </Box>

              {/* 휴가내역 탭 */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  {/* 연도 선택 드롭다운 */}
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <Select
                      value={selectedYear}
                      onChange={(e: SelectChangeEvent<number>) => setSelectedYear(e.target.value as number)}
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
                          borderColor: colorScheme.primaryColor,
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
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setHideCanceled(!hideCanceled)}
                    sx={{ fontSize: 12, borderRadius: 999 }}
                  >
                    {hideCanceled ? '취소건 숨김 해제' : '취소건 숨김'}
                  </Button>
                </Box>

                {yearlyLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : !yearlyLeaves || yearlyLeaves.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <EventIcon sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: colorScheme.textColor }}>
                      {selectedYear}년 휴가 내역이 없습니다
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {(() => {
                      const filtered = [...yearlyLeaves]
                        .filter((leave: any) => !hideCanceled || leave.status !== 'CANCELLED')
                        .sort((a: any, b: any) => getLeaveSortTime(b) - getLeaveSortTime(a));
                      const itemsPerPage = 10;
                      const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
                      const pageStart = (mobilePage - 1) * itemsPerPage;
                      const pageItems = isMobile ? filtered.slice(pageStart, pageStart + itemsPerPage) : filtered;

                      return (
                        <>
                          {pageItems.map((leave: any, index) => (
                            <Box
                              key={index}
                              sx={{
                                p: 1.75,
                                border: `1px solid ${calendarBorder}`,
                                borderRadius: '14px',
                                cursor: 'pointer',
                                bgcolor: calendarSurface,
                                boxShadow: calendarShadow,
                                '&:hover': { bgcolor: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.08)' },
                              }}
                              onClick={() => {
                                setSelectedLeave(leave);
                                setDetailModalOpen(true);
                              }}
                            >
                              {/* 상단: 아이콘 + 타입 + 반차뱃지 + 상태칩 */}
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {getStatusIcon(leave.status)}
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                                    <Typography sx={{ fontWeight: 600, fontSize: '15px', color: colorScheme.textColor }}>
                                      {leave.leave_type || leave.leaveType}
                                    </Typography>
                                    {(leave.half_day_slot || leave.halfDaySlot) && (leave.half_day_slot || leave.halfDaySlot) !== 'ALL' && (
                                      <Typography
                                        sx={{
                                          fontSize: '11px',
                                          fontWeight: 700,
                                          color: colorScheme.textColor,
                                          px: 0.75,
                                          py: 0.2,
                                          borderRadius: '999px',
                                          bgcolor: isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(15, 23, 42, 0.04)',
                                          border: `1px solid ${calendarBorder}`,
                                          flexShrink: 0,
                                        }}
                                      >
                                        {(leave.half_day_slot || leave.halfDaySlot) === 'AM' ? '오전반차' : '오후반차'}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                                <Chip
                                  label={
                                    leave.status === 'APPROVED' ? '승인' :
                                      leave.status === 'REJECTED' ? '반려' :
                                        leave.status === 'CANCELLED' ? '취소' :
                                          leave.status === 'CANCEL_REQUESTED' ? '취소대기' :
                                            '대기'
                                  }
                                  size="small"
                                  sx={{
                                    color: getStatusColor(leave.status),
                                    fontSize: '11px',
                                    height: 22,
                                    border: `1px solid ${getStatusColor(leave.status)}55`,
                                    bgcolor: `${getStatusColor(leave.status)}1A`,
                                    fontWeight: 600,
                                  }}
                                />
                              </Box>
                              {/* 날짜 */}
                              <Typography sx={{ fontSize: '13px', color: colorScheme.hintTextColor, mb: 0.5 }}>
                                {formatDate(leave.start_date || leave.startDate)} ~ {formatDate(leave.end_date || leave.endDate)}
                                {(leave.half_day_slot || leave.halfDaySlot) === 'ALL' && (
                                  <span style={{ marginLeft: 6 }}>(종일)</span>
                                )}
                              </Typography>
                              {/* 사용일수 + 신청일 */}
                              <Box sx={{ display: 'flex', gap: 2 }}>
                                <Typography sx={{ fontSize: '12px', color: colorScheme.hintTextColor }}>
                                  사용 {leave.workdays_count ?? leave.workdaysCount ?? calculateDays(leave.start_date || leave.startDate, leave.end_date || leave.endDate)}일
                                </Typography>
                                {(leave.requested_date || leave.requestedDate) && (
                                  <Typography sx={{ fontSize: '12px', color: colorScheme.hintTextColor }}>
                                    신청 {dayjs(leave.requested_date || leave.requestedDate).format('YYYY.MM.DD')}
                                  </Typography>
                                )}
                              </Box>
                              {/* 반려사유 */}
                              {leave.reject_message && (
                                <Box sx={{ mt: 1, p: 1, bgcolor: isDark ? 'rgba(248,113,113,0.1)' : 'rgba(248,113,113,0.08)', borderRadius: '10px', border: `1px solid ${isDark ? 'rgba(248,113,113,0.3)' : 'rgba(248,113,113,0.2)'}` }}>
                                  <Typography sx={{ fontSize: '12px', color: colorScheme.textColor }}>
                                    반려: {leave.reject_message}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          ))}
                          {isMobile && totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
                              <Pagination
                                count={totalPages}
                                page={mobilePage}
                                onChange={(_, page) => setMobilePage(page)}
                                size="small"
                                color="primary"
                                siblingCount={0}
                                boundaryCount={1}
                                sx={{
                                  '& .MuiPaginationItem-root': {
                                    fontSize: '0.75rem',
                                    minWidth: '28px',
                                    height: '28px',
                                  },
                                }}
                              />
                            </Box>
                          )}
                        </>
                      );
                    })()}
                  </Box>
                )}
              </TabPanel>

              {/* 달력 탭 */}
              <TabPanel value={tabValue} index={1}>
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: isMobile ? 'auto' : 'calc(100vh - 400px)',
                  minHeight: isMobile ? 'auto' : '600px',
                  overflow: isMobile ? 'visible' : 'hidden'
                }}>
                  <TotalCalendar open={true} onClose={() => { }} embedded={true} />
                </Box>
              </TabPanel>
            </>
          )}
        </Box>

        {/* 취소 상신 확인 모달 */}
        <Dialog
          open={cancelRequestModalOpen}
          onClose={() => setCancelRequestModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              취소 상신 확인
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pb: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ mb: 2, color: colorScheme.textColor }}>
                다음 휴가를 취소하시겠습니까?
              </Typography>
              {cancelRequestLeave && (
                <Paper elevation={0} sx={{ p: 2, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${calendarBorder}`, borderRadius: '12px' }}>
                  <Typography sx={{ fontSize: '14px', fontWeight: 600, color: colorScheme.textColor, mb: 1 }}>
                    {cancelRequestLeave.leave_type || cancelRequestLeave.leaveType}
                  </Typography>
                  <Typography sx={{ fontSize: '13px', color: colorScheme.hintTextColor, mb: 1 }}>
                    {formatDate(cancelRequestLeave.start_date || cancelRequestLeave.startDate)} ~ {formatDate(cancelRequestLeave.end_date || cancelRequestLeave.endDate)}
                    <span style={{ marginLeft: 8, fontWeight: 600 }}>
                      ({calculateDays(cancelRequestLeave.start_date || cancelRequestLeave.startDate, cancelRequestLeave.end_date || cancelRequestLeave.endDate)}일)
                    </span>
                  </Typography>
                  <Typography sx={{ fontSize: '13px', color: colorScheme.hintTextColor }}>
                    {cancelRequestLeave.reason}
                  </Typography>
                </Paper>
              )}
            </Box>
            <Alert severity="warning" sx={{ mb: 2 }}>
              취소 상신 후 승인이 완료되면 해당 휴가는 취소됩니다.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => {
                setCancelRequestModalOpen(false);
                setCancelRequestLeave(null);
              }}
              variant="outlined"
            >
              취소
            </Button>
            <Button
              onClick={handleCancelRequest}
              variant="contained"
              color="warning"
              startIcon={<CancelIcon />}
            >
              취소 상신
            </Button>
          </DialogActions>
        </Dialog>

        {/* 휴가 신청 모달 */}
        <LeaveRequestModal
          open={requestDialogOpen}
          onClose={handleRequestDialogClose}
          onSubmit={loadLeaveData}
          userId={user?.userId || ''}
          leaveStatusList={leaveData?.leaveStatus || []}
        />

        <VacationRecommendationModal
          open={recommendationOpen}
          onClose={() => setRecommendationOpen(false)}
          userId={user?.userId || ''}
          year={selectedYear}
        />



        {/* 휴가 취소 사유 입력 다이얼로그 */}
        <Dialog
          open={cancelReasonDialogOpen}
          onClose={() => {
            setCancelReasonDialogOpen(false);
            setCancelReason('');
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CancelIcon sx={{ fontSize: 28, color: '#E53E3E' }} />
              <Typography sx={{ fontSize: 18, fontWeight: 600, color: colorScheme.textColor }}>
                휴가 취소 상신
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: colorScheme.textColor, mb: 2 }}>
              취소 사유를 입력해주세요:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={cancelReason}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCancelReason(e.target.value)}
              placeholder="취소 사유를 입력하세요"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: 14,
                  bgcolor: '#F9FAFB',
                },
              }}
            />
            <Typography sx={{ fontSize: 11, color: colorScheme.hintTextColor, mt: 1 }}>
              ※ 취소 상신 후 결재자의 승인이 필요합니다.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              onClick={() => {
                setCancelReasonDialogOpen(false);
                setCancelReason('');
              }}
              variant="outlined"
              sx={{ fontWeight: 600 }}
            >
              취소
            </Button>
            <Button
              onClick={handleDetailModalCancelRequest}
              variant="contained"
              color="error"
              sx={{ fontWeight: 600 }}
            >
              취소 상신
            </Button>
          </DialogActions>
        </Dialog>

        {/* 휴가 상세 모달 */}
        <Dialog
          open={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: isDark ? '#0F172A' : '#FFFFFF',
              borderRadius: '18px',
              overflow: 'hidden',
              border: `1px solid ${calendarBorder}`,
              boxShadow: isDark ? '0 24px 48px rgba(0,0,0,0.45)' : '0 24px 48px rgba(15, 23, 42, 0.18)',
            },
          }}
        >
          {selectedLeave && (
            <>
              {/* 헤더 */}
              <Box
                sx={{
                  bgcolor: isDark ? '#0B1120' : '#F8FAFC',
                  borderBottom: `1px solid ${calendarBorder}`,
                  px: 3,
                  py: 2.25,
                  position: 'relative',
                }}
              >
                <IconButton
                  onClick={() => setDetailModalOpen(false)}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: colorScheme.textColor,
                    border: `1px solid ${calendarBorder}`,
                    borderRadius: '10px',
                    '&:hover': { bgcolor: isDark ? 'rgba(59,130,246,0.12)' : '#EFF6FF' },
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      bgcolor: isDark ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {getStatusIcon(selectedLeave.status)}
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Typography sx={{ color: colorScheme.textColor, fontSize: '18px', fontWeight: 700 }}>
                        {selectedLeave.leave_type || selectedLeave.leaveType}
                      </Typography>
                      {(selectedLeave.half_day_slot || selectedLeave.halfDaySlot) && (selectedLeave.half_day_slot || selectedLeave.halfDaySlot) !== 'ALL' && (
                        <Typography
                          sx={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: colorScheme.textColor,
                            px: 0.75,
                            py: 0.2,
                            borderRadius: '999px',
                            bgcolor: isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(15, 23, 42, 0.04)',
                            border: `1px solid ${calendarBorder}`,
                          }}
                        >
                          {(selectedLeave.half_day_slot || selectedLeave.halfDaySlot) === 'AM' ? '오전반차' : '오후반차'}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={
                        selectedLeave.status === 'APPROVED' ? '승인 완료' :
                          selectedLeave.status === 'REJECTED' ? '반려됨' :
                            selectedLeave.status === 'REQUESTED' ? '승인 대기' :
                              selectedLeave.status === 'CANCEL_REQUESTED' ? '취소 대기' :
                                selectedLeave.status === 'CANCELLED' ? '취소됨' : '대기'
                      }
                      size="small"
                      sx={{
                        mt: 0.5,
                        bgcolor: 'rgba(59,130,246,0.12)',
                        color: '#3B82F6',
                        fontWeight: 700,
                        fontSize: '11px',
                        border: '1px solid rgba(59,130,246,0.35)',
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              <DialogContent sx={{ p: 2.5, bgcolor: isDark ? '#0F172A' : '#FFFFFF' }}>
                {/* 기간 카드 */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    mb: 2,
                    borderRadius: '12px',
                    bgcolor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                    border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <CalendarIcon sx={{ fontSize: 20, color: isDark ? '#60A5FA' : '#3B82F6' }} />
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#60A5FA' : '#3B82F6' }}>
                      휴가 기간
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                      <Typography sx={{ fontSize: '15px', fontWeight: 600, color: colorScheme.textColor }}>
                        {dayjs(selectedLeave.start_date || selectedLeave.startDate).format('YYYY년 MM월 DD일')}
                      </Typography>
                      <Typography sx={{ fontSize: '13px', color: colorScheme.textColor, mt: 0.5 }}>
                        ~ {dayjs(selectedLeave.end_date || selectedLeave.endDate).format('YYYY년 MM월 DD일')}
                      </Typography>
                      {(selectedLeave.half_day_slot || selectedLeave.halfDaySlot) && (
                        <Typography sx={{ fontSize: '12px', color: colorScheme.hintTextColor, mt: 0.25 }}>
                          {(selectedLeave.half_day_slot || selectedLeave.halfDaySlot) === 'ALL'
                            ? '(종일)'
                            : `(${(selectedLeave.half_day_slot || selectedLeave.halfDaySlot) === 'AM' ? '오전반차' : '오후반차'})`}
                        </Typography>
                      )}
                    </Box>
                    <Box
                      sx={{
                        px: 2,
                        py: 1,
                        borderRadius: '8px',
                        bgcolor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                        textAlign: 'center',
                      }}
                    >
                      <Typography sx={{ fontSize: '24px', fontWeight: 800, color: isDark ? '#60A5FA' : '#3B82F6', lineHeight: 1 }}>
                        {selectedLeave.workdays_count ?? selectedLeave.workdaysCount ?? calculateDays(selectedLeave.start_date || selectedLeave.startDate, selectedLeave.end_date || selectedLeave.endDate)}
                      </Typography>
                      <Typography sx={{ fontSize: '11px', color: colorScheme.hintTextColor, fontWeight: 600 }}>
                        일 사용
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* 신청 정보 카드 */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    mb: 2,
                    borderRadius: '12px',
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    border: `1px solid ${calendarBorder}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <TimeIcon sx={{ fontSize: 20, color: colorScheme.hintTextColor }} />
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: colorScheme.hintTextColor }}>
                      신청 정보
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '11px', color: colorScheme.hintTextColor, mb: 0.5 }}>신청일</Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 500, color: colorScheme.textColor }}>
                      {dayjs(selectedLeave.requested_date || selectedLeave.requestedDate).format('YYYY.MM.DD')}
                    </Typography>
                  </Box>
                </Paper>

                {/* 사유 카드 */}
                {(() => {
                  const { cancelReason, mainReason } = parseLeaveReason(selectedLeave.reason);
                  return (
                    <>
                      {cancelReason && (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            mb: 2,
                            borderRadius: '12px',
                            bgcolor: isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.04)',
                            border: `1px solid ${isDark ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.2)'}`,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <WarningIcon sx={{ fontSize: 20, color: '#F59E0B' }} />
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#F59E0B' }}>
                              취소 사유
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: '14px', color: colorScheme.textColor, lineHeight: 1.6 }}>
                            {cancelReason}
                          </Typography>
                        </Paper>
                      )}
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          mb: 2,
                          borderRadius: '12px',
                          bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                          border: `1px solid ${calendarBorder}`,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                          <DescriptionIcon sx={{ fontSize: 20, color: colorScheme.hintTextColor }} />
                          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: colorScheme.hintTextColor }}>
                            휴가 사유
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '14px', color: colorScheme.textColor, lineHeight: 1.6 }}>
                          {mainReason || selectedLeave.reason || '-'}
                        </Typography>
                      </Paper>
                    </>
                  );
                })()}

                {/* 반려 사유 */}
                {(selectedLeave.reject_message || selectedLeave.rejectMessage) && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: '12px',
                      bgcolor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                      border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <InfoIcon sx={{ fontSize: 20, color: '#EF4444' }} />
                      <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#EF4444' }}>
                        반려 사유
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '14px', color: colorScheme.textColor, lineHeight: 1.6 }}>
                      {selectedLeave.reject_message || selectedLeave.rejectMessage}
                    </Typography>
                  </Paper>
                )}
              </DialogContent>

              <DialogActions
                sx={{
                  px: 3,
                  py: 2,
                  borderTop: `1px solid ${calendarBorder}`,
                  gap: 1,
                  justifyContent: 'space-between',
                }}
              >
                {(selectedLeave?.status?.toUpperCase() === 'APPROVED' || selectedLeave?.status?.toUpperCase() === 'REQUESTED') && (
                  <Button
                    onClick={handleOpenCancelDialog}
                    variant="outlined"
                    color="warning"
                    startIcon={<CancelIcon />}
                    sx={{ borderRadius: '8px', fontWeight: 600 }}
                  >
                    취소 상신
                  </Button>
                )}
                <Box sx={{ ml: 'auto' }}>
                  <Button
                    onClick={() => setDetailModalOpen(false)}
                    variant="outlined"
                    sx={{ borderRadius: '8px' }}
                  >
                    닫기
                  </Button>
                </Box>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
  );
}
