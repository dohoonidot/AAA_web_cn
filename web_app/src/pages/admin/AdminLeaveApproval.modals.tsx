import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarMonth as CalendarMonthIcon,
  Today as TodayIcon,
  Close as CloseIcon,
  EventNote as EventNoteIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import type { Theme } from '@mui/material/styles';
import { DepartmentLeaveStatusModal } from '../../components/admin/DepartmentLeaveStatusModal';
// useThemeStore type import removed - using 'any' for ThemeColorScheme
import {
  RenderReasonWithCancelHighlight,
  formatServerDateDots,
  formatServerDateKorean,
  formatServerDateYMD,
  formatServerDateTime,
  formatServerDateTimeKorean,
} from './AdminLeaveApproval.shared';
import type {
  AdminLeaveApprovalActions,
  AdminLeaveApprovalDerived,
  AdminLeaveApprovalState,
} from './AdminLeaveApproval.state';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ThemeColorScheme = any;

type AdminLeaveApprovalModalsProps = {
  state: AdminLeaveApprovalState;
  derived: AdminLeaveApprovalDerived;
  actions: AdminLeaveApprovalActions;
  theme: Theme;
  isMobile: boolean;
  isDark: boolean;
  colorScheme: ThemeColorScheme;
  modalSelectedHolidayName: string | null;
  onConfirmYearMonth: () => Promise<void>;
};

const AdminLeaveApprovalModals: React.FC<AdminLeaveApprovalModalsProps> = ({
  state,
  derived,
  actions,
  theme,
  isMobile,
  isDark,
  colorScheme,
  modalSelectedHolidayName,
  onConfirmYearMonth,
}) => {
  const {
    approvalDialog,
    selectedLeave,
    approvalAction,
    rejectMessage,
    actionLoading,
    fullscreenModalOpen,
    modalCalendarDate,
    modalSelectedDate,
    modalHolidays,
    yearMonthPickerOpen,
    departmentStatusModalOpen,
    detailModalOpen,
    selectedDetailLeave,
  } = state;

  const {
    generateCalendar,
    getLeavesForDate: _getLeavesForDate,
    getModalLeavesForDate,
    getHolidayName,
    getStatusLabel,
    getStatusColor,
  } = derived;
  // 전체보기 모달 내부에서는 항상 모달 전용 데이터 사용
  const getLeavesForDate = getModalLeavesForDate ?? _getLeavesForDate;

  const {
    setApprovalDialog,
    setRejectMessage,
    setFullscreenModalOpen,
    setModalCalendarDate,
    setModalSelectedDate,
    setYearMonthPickerOpen,
    setDepartmentStatusModalOpen,
    setDetailModalOpen,
    setSelectedLeave,
    setApprovalAction,
    setSelectedDate,
    handleApprove,
    handleReject,
    handleModalMonthChange,
  } = actions;

  return (
    <>
      {/* 승인/반려 다이얼로그 */}
      <Dialog
        open={approvalDialog}
        onClose={() => !actionLoading && setApprovalDialog(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            bgcolor: isDark ? colorScheme.surfaceColor : undefined,
            color: isDark ? colorScheme.textColor : undefined,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {approvalAction === 'approve' ? (
            <CheckCircleIcon sx={{ color: '#20C997' }} />
          ) : (
            <CancelIcon sx={{ color: '#DC3545' }} />
          )}
          <Typography variant="h6" component="span" fontWeight={600} sx={{ color: colorScheme.textColor }}>
            {approvalAction === 'approve' ? '휴가 승인' : '휴가 반려'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedLeave && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ mb: 2, p: 2, bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F5F5F5', borderRadius: '8px', border: isDark ? `1px solid ${colorScheme.textFieldBorderColor}` : 'none' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  신청자
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ color: colorScheme.textColor }}>
                  {selectedLeave.name} ({selectedLeave.department} · {selectedLeave.job_position})
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
                  휴가 종류
                </Typography>
                <Typography variant="body1" sx={{ color: colorScheme.textColor }}>
                  {selectedLeave.leave_type}
                  {selectedLeave.is_cancel === 1 && (
                    <Chip label="취소 상신" size="small" color="warning" sx={{ ml: 1 }} />
                  )}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
                  휴가 기간
                </Typography>
                <Typography variant="body1" sx={{ color: colorScheme.textColor }}>
                  {formatServerDateYMD(selectedLeave.start_date)} ~ {formatServerDateYMD(selectedLeave.end_date)} ({selectedLeave.workdays_count}일)
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
                  신청일
                </Typography>
                <Typography variant="body1" sx={{ color: colorScheme.textColor }}>
                  {formatServerDateTime(selectedLeave.requested_date)}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
                  사유
                </Typography>
                {selectedLeave.reason ? (
                  <RenderReasonWithCancelHighlight reason={selectedLeave.reason} color={colorScheme.textColor} />
                ) : (
                  <Typography variant="body1" sx={{ color: colorScheme.textColor }}>사유 없음</Typography>
                )}
              </Box>

              {approvalAction === 'reject' && (
                <TextField
                  label="반려 사유"
                  multiline
                  rows={3}
                  fullWidth
                  value={rejectMessage}
                  onChange={(e) => setRejectMessage(e.target.value)}
                  placeholder="반려 사유를 입력해주세요"
                  required
                  error={rejectMessage !== undefined && rejectMessage.trim() === '' && rejectMessage !== ''}
                  helperText={approvalAction === 'reject' ? '반려 시 사유 입력은 필수입니다.' : ''}
                  autoFocus
                  sx={{
                    mt: 2,
                    '& .MuiOutlinedInput-root': {
                      color: colorScheme.textColor,
                      '& fieldset': { borderColor: isDark ? colorScheme.textFieldBorderColor : undefined },
                      '&:hover fieldset': { borderColor: isDark ? '#64748B' : undefined },
                    },
                    '& .MuiInputLabel-root': { color: isDark ? 'rgba(255,255,255,0.7)' : undefined },
                    '& .MuiFormHelperText-root': { color: isDark ? 'rgba(255,255,255,0.5)' : undefined },
                  }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setApprovalDialog(false)}
            variant="outlined"
            disabled={actionLoading}
            sx={{
              borderRadius: '12px',
              borderWidth: '1.5px',
              fontWeight: 600,
              color: isDark ? 'rgba(255,255,255,0.7)' : undefined,
              borderColor: isDark ? 'rgba(255,255,255,0.3)' : undefined,
              '&:hover': {
                borderWidth: '1.5px',
                borderColor: isDark ? 'rgba(255,255,255,0.5)' : undefined,
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : undefined,
              }
            }}
          >
            취소
          </Button>
          <Button
            onClick={() => {
              console.debug('[AdminLeaveApproval] 승인/반려 버튼 클릭', {
                approvalAction,
                selectedLeaveId: selectedLeave?.id,
              });
              (approvalAction === 'approve' ? handleApprove : handleReject)();
            }}
            variant={approvalAction === 'approve' ? 'contained' : 'outlined'}
            color={approvalAction === 'approve' ? 'success' : 'error'}
            disabled={actionLoading}
            sx={approvalAction === 'approve' ? {
              bgcolor: '#1cc88a',
              borderRadius: '12px',
              boxShadow: 'none',
              fontWeight: 600,
              '&:hover': { bgcolor: '#17a673', boxShadow: 'none' }
            } : {
              borderRadius: '12px',
              borderWidth: '1.5px',
              fontWeight: 600,
              '&:hover': { borderWidth: '1.5px', bgcolor: (theme) => alpha(theme.palette.error.main, 0.05) }
            }}
          >
            {actionLoading ? '처리 중...' : approvalAction === 'approve' ? '승인하기' : '반려하기'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 전체보기 모달 */}
      <Dialog
        open={fullscreenModalOpen}
        onClose={() => setFullscreenModalOpen(false)}
        maxWidth={false}
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            width: isMobile ? '100%' : '90%',
            height: isMobile ? '100%' : '90%',
            maxWidth: isMobile ? '100%' : '90vw',
            maxHeight: isMobile ? '100%' : '90vh',
            borderRadius: isMobile ? 0 : '20px',
            bgcolor: isDark ? '#0F172A' : 'white',
            border: isDark ? '1px solid rgba(148,163,184,0.14)' : 'none',
          },
        }}
      >
        {/* 헤더 */}
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: isDark ? '#334155' : '#F1F3F5',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #64748B 0%, #475569 100%)',
              }}
            >
              <CalendarMonthIcon sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: isDark ? '#E2E8F0' : undefined }}>
              부서원 휴가 일정 (전체보기)
            </Typography>
          </Box>
          <IconButton onClick={() => setFullscreenModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* 메인 콘텐츠 */}
        <Box sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          height: 'calc(100% - 80px)',
          overflow: 'auto',
        }}>
          {/* 달력 영역 (70%) */}
          <Box
            sx={{
              flex: isMobile ? 'none' : 7,
              p: isMobile ? 1.5 : 2.5,
              display: 'flex',
              flexDirection: 'column',
              minHeight: isMobile ? 'auto' : 0,
            }}
          >
            {/* 월 네비게이션 */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <IconButton
                onClick={() => { void handleModalMonthChange('prev'); }}
                sx={{ color: isDark ? '#94A3B8' : '#6C757D' }}
              >
                <ChevronLeftIcon sx={{ fontSize: 32 }} />
              </IconButton>

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Box
                  onClick={() => setYearMonthPickerOpen(true)}
                  sx={{
                    px: 2,
                    py: 1,
                    bgcolor: isDark ? 'rgba(30,41,59,0.8)' : '#F8F9FA',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(148,163,184,0.18)' : '#E9ECEF',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(51,65,85,0.9)' : '#E9ECEF',
                    },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: isDark ? '#E2E8F0' : undefined }}>
                      {dayjs(modalCalendarDate).format('YYYY년 M월')}
                    </Typography>
                    <CalendarMonthIcon sx={{ color: isDark ? '#94A3B8' : '#6C757D', fontSize: 20 }} />
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<TodayIcon sx={{ fontSize: 16 }} />}
                  onClick={() => {
                    const today = new Date();
                    setModalSelectedDate(today);
                    setSelectedDate(today);
                    void handleModalMonthChange('today');
                  }}
                  sx={{
                    bgcolor: '#64748B',
                    color: 'white',
                    fontSize: '13px',
                    '&:hover': {
                      bgcolor: '#475569',
                    },
                  }}
                >
                  오늘
                </Button>
              </Box>

              <IconButton
                onClick={() => { void handleModalMonthChange('next'); }}
                sx={{ color: isDark ? '#94A3B8' : '#6C757D' }}
              >
                <ChevronRightIcon sx={{ fontSize: 32 }} />
              </IconButton>
            </Box>

            {/* 달력 */}
            <Box
              sx={{
                flex: 1,
                bgcolor: isDark ? 'rgba(15,23,42,0.6)' : '#F8FAFC',
                borderRadius: '14px',
                border: '1px solid',
                borderColor: isDark ? 'rgba(148,163,184,0.12)' : '#E2E8F0',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* 요일 헤더 */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
                {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                  <Box
                    key={day}
                    sx={{
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: isDark ? 'rgba(30,41,59,0.6)' : 'white',
                      borderRadius: '8px',
                      border: isDark ? '1px solid rgba(148,163,184,0.08)' : '1px solid #F1F5F9',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color:
                          index === 0
                            ? (isDark ? '#F87171' : '#E53E3E')
                            : index === 6
                              ? (isDark ? '#60A5FA' : '#3182CE')
                              : (isDark ? '#64748B' : '#94A3B8'),
                      }}
                    >
                      {day}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* 달력 그리드 */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {generateCalendar(modalCalendarDate).map((week, weekIndex) => (
                  <Box
                    key={weekIndex}
                    sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, flex: 1 }}
                  >
                    {week.map((date, dayIndex) => {
                      if (!date) return <Box key={dayIndex} />;

                      const isCurrentMonth = date.getMonth() === modalCalendarDate.getMonth();
                      const isToday =
                        date.getDate() === new Date().getDate() &&
                        date.getMonth() === new Date().getMonth() &&
                        date.getFullYear() === new Date().getFullYear();
                      const isSelected =
                        date.getDate() === modalSelectedDate.getDate() &&
                        date.getMonth() === modalSelectedDate.getMonth() &&
                        date.getFullYear() === modalSelectedDate.getFullYear();
                      const dayLeaves = getLeavesForDate(date);
                      const hasLeave = dayLeaves.length > 0;
                      const namedLeaves = dayLeaves
                        .map((leave: any) => String(leave.name || '').trim())
                        .filter((name: string) => Boolean(name));
                      const firstName = namedLeaves[0] || '';
                      const extraCount = Math.max(namedLeaves.length - 1, 0);
                      const nameSummary = firstName ? `${firstName}${extraCount > 0 ? ` 외 ${extraCount}` : ''}` : '';
                      const firstStatus = String(dayLeaves[0]?.status || '').trim().toUpperCase();
                      const modalHasRequested = dayLeaves.some((l: any) => String(l.status || '').toUpperCase().includes('REQUESTED'));
                      let nameColor = '#20C997';
                      if (firstStatus.includes('REQUESTED') || firstStatus === 'CANCEL_REQUESTED') nameColor = '#FF8C00';
                      else if (firstStatus === 'REJECTED') nameColor = '#DC3545';
                      else if (firstStatus === 'CANCELLED') nameColor = '#6C757D';
                      const modalCellBgColor = modalHasRequested
                        ? (isDark ? 'rgba(255,140,0,0.14)' : 'rgba(255,140,0,0.10)')
                        : 'rgba(32, 201, 151, 0.1)';
                      const dotColor = modalHasRequested ? '#FF8C00' : '#20C997';
                      const weekday = date.getDay();
                      const holidayName = getHolidayName(date, modalHolidays);
                      const isHoliday = !!holidayName;

                      return (
                        <Box
                          key={dayIndex}
                          onClick={() => {
                            setModalSelectedDate(date);
                            setSelectedDate(date);
                          }}
                          sx={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            borderRadius: '10px',
                            border: isSelected
                              ? '1px solid transparent'
                              : isDark
                                ? '1px solid rgba(148,163,184,0.07)'
                                : '1px solid rgba(226,232,240,0.9)',
                            bgcolor: isSelected
                              ? '#475569'
                              : isToday
                                ? (isDark ? 'rgba(71,85,105,0.7)' : 'rgba(100,116,139,0.2)')
                                : hasLeave && isCurrentMonth
                                  ? modalCellBgColor
                                  : isDark
                                    ? 'rgba(15,23,42,0.3)'
                                    : 'white',
                            boxShadow: isSelected ? '0 2px 10px rgba(71,85,105,0.35)' : 'none',
                            '&:hover': {
                              bgcolor: isSelected
                                ? '#475569'
                                : isDark
                                  ? 'rgba(71,85,105,0.28)'
                                  : 'rgba(71,85,105,0.08)',
                            },
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: '16px',
                              fontWeight: isSelected || isToday ? 700 : 500,
                              mt: isHoliday && isCurrentMonth ? 1.1 : 0,
                              color: !isCurrentMonth
                                ? (isDark ? '#334155' : '#CBD5E1')
                                : isSelected || isToday
                                  ? 'white'
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
                                top: 4,
                                left: 4,
                                right: 4,
                                display: 'flex',
                                justifyContent: 'center',
                                pointerEvents: 'none',
                              }}
                            >
                              <Typography
                                sx={{
                                  maxWidth: '100%',
                                  px: 0.65,
                                  py: '1px',
                                  borderRadius: '999px',
                                  fontSize: '11px',
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
                          {hasLeave && !isSelected && !isToday && isCurrentMonth && (
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 3,
                                width: 5,
                                height: 5,
                                borderRadius: '50%',
                                bgcolor: dotColor,
                              }}
                            />
                          )}
                          {nameSummary && isCurrentMonth && (
                            <Typography
                              sx={{
                                position: 'absolute',
                                left: 3,
                                right: 3,
                                bottom: 12,
                                fontSize: '12px',
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
            </Box>
          </Box>

          {/* 상세정보 영역 (30%) */}
          <Box
            sx={{
              flex: isMobile ? 'none' : 3,
              p: isMobile ? 1.5 : 2.5,
              borderLeft: isMobile ? 'none' : '1px solid',
              borderTop: isMobile ? '1px solid' : 'none',
              borderColor: isDark ? '#334155' : '#F1F3F5',
              display: 'flex',
              flexDirection: 'column',
              minHeight: isMobile ? 'auto' : 0,
            }}
          >
            {/* 헤더 */}
            <Box
              sx={{
                p: 2,
                bgcolor: isDark ? 'rgba(30,41,59,0.6)' : 'rgba(100,116,139,0.08)',
                borderRadius: '12px',
                border: isDark ? '1px solid rgba(148,163,184,0.12)' : '1px solid rgba(148,163,184,0.15)',
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <EventNoteIcon sx={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: isDark ? '#E2E8F0' : undefined }}>
                  {dayjs(modalSelectedDate).format('YYYY년 M월 D일')}
                </Typography>
              </Box>
            </Box>

            {/* 상세 내용 */}
            <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {modalSelectedHolidayName && (
                <Box
                  sx={{
                    mb: 1.5,
                    p: 1,
                    borderRadius: '8px',
                    bgcolor: isDark ? 'rgba(251, 113, 133, 0.08)' : 'rgba(251, 113, 133, 0.05)',
                    border: isDark ? '1px solid rgba(251, 113, 133, 0.16)' : '1px solid rgba(251, 113, 133, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
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
                  <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                    {modalSelectedHolidayName}
                  </Typography>
                </Box>
              )}
              {getLeavesForDate(modalSelectedDate).length === 0 ? (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CalendarTodayIcon sx={{ fontSize: 64, color: '#9E9E9E', mb: 2 }} />
                  <Typography sx={{ fontSize: '16px', color: '#9E9E9E', textAlign: 'center' }}>
                    선택된 날짜에
                    <br />
                    휴가 일정이 없습니다.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {getLeavesForDate(modalSelectedDate).map((leave: any, index: number) => {
                    const department = leave.department;
                    const jobPosition = leave.job_position ?? leave.jobPosition;
                    const leaveType = leave.leave_type ?? leave.leaveType;
                    const startDate = leave.start_date ?? leave.startDate;
                    const endDate = leave.end_date ?? leave.endDate;
                    const workdays = leave.workdays_count ?? leave.workdaysCount ?? 0;
                    const status = String(leave.status || '').trim().toUpperCase();
                    const isCancelRequested = leave.isCancel === 1 || status === 'CANCEL_REQUESTED';
                    const statusColor =
                      status === 'APPROVED'
                        ? '#20C997'
                        : status.includes('REQUESTED')
                          ? '#FF8C00'
                          : status === 'REJECTED'
                            ? '#DC3545'
                            : status === 'CANCELLED'
                              ? '#6C757D'
                              : '#6C757D';

                    const statusLabel =
                      status === 'APPROVED'
                        ? '승인됨'
                        : isCancelRequested
                          ? '취소 상신 대기'
                          : status.includes('REQUESTED')
                            ? '승인 대기'
                            : status === 'REJECTED'
                              ? '반려됨'
                              : status === 'CANCELLED'
                                ? '상신취소'
                                : (leave.status || '알 수 없음');

                    return (
                      <Card
                        key={leave.id || index}
                        sx={{
                          borderRadius: '12px',
                          bgcolor: colorScheme.surfaceColor,
                          border: '1px solid',
                          borderColor: isDark ? colorScheme.textFieldBorderColor : '#E9ECEF',
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: statusColor,
                                }}
                              />
                              <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>
                                {leave.name}
                              </Typography>
                            </Box>
                            <Chip
                              label={statusLabel}
                              size="small"
                              sx={{
                                bgcolor: `${statusColor}22`,
                                color: statusColor,
                                fontSize: '11px',
                                fontWeight: 600,
                                height: 22,
                              }}
                            />
                          </Box>
                          <Typography
                            sx={{
                              fontSize: '13px',
                              fontWeight: 500,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {department}
                            {jobPosition ? ` · ${jobPosition}` : ''}
                            {' | '}
                            {leaveType}
                            {leave.half_day_slot === 'AM' && ' (오전반차)'}
                            {leave.half_day_slot === 'PM' && ' (오후반차)'}
                            {leave.half_day_slot === 'ALL' && ' (종일연차)'}
                            {' | '}
                            {formatServerDateDots(startDate)} ~ {formatServerDateDots(endDate)}
                            {workdays ? ` | ${workdays}일` : ''}
                          </Typography>
                          {leave.reason && (
                            <Typography sx={{ fontSize: '12px', color: isDark ? '#94A3B8' : '#6C757D', mt: 0.75 }}>
                              사유: {leave.reason}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Dialog>

      {/* 연도/월 선택 다이얼로그 */}
      <Dialog
        open={yearMonthPickerOpen}
        onClose={() => setYearMonthPickerOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonthIcon sx={{ color: '#64748B', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              연도 및 월 선택
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>연도</InputLabel>
              <Select
                value={dayjs(modalCalendarDate).year()}
                label="연도"
                onChange={(e) => {
                  const newDate = new Date(modalCalendarDate);
                  newDate.setFullYear(Number(e.target.value));
                  setModalCalendarDate(newDate);
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
              >
                {Array.from({ length: 11 }, (_, i) => 2020 + i).map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}년
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>월</InputLabel>
              <Select
                value={dayjs(modalCalendarDate).month() + 1}
                label="월"
                onChange={(e) => {
                  const newDate = new Date(modalCalendarDate);
                  newDate.setMonth(Number(e.target.value) - 1);
                  setModalCalendarDate(newDate);
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <MenuItem key={month} value={month}>
                    {month}월
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={() => setYearMonthPickerOpen(false)}
            sx={{
              color: '#6C757D',
              '&:hover': {
                bgcolor: 'rgba(108, 117, 125, 0.1)',
              },
            }}
          >
            취소
          </Button>
          <Button
            onClick={onConfirmYearMonth}
            variant="contained"
            sx={{
              bgcolor: '#64748B',
              '&:hover': {
                bgcolor: '#475569',
              },
            }}
          >
            확인
          </Button>
        </DialogActions>
      </Dialog>

      {/* 부서원 휴가 현황 모달 */}
      <DepartmentLeaveStatusModal
        open={departmentStatusModalOpen}
        onClose={() => setDepartmentStatusModalOpen(false)}
      />

      {/* 상세 모달 */}
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : '16px',
            maxHeight: isMobile ? '100%' : '90vh',
            bgcolor: colorScheme.surfaceColor,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventNoteIcon sx={{ color: '#64748B', fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                휴가 신청 상세 정보
              </Typography>
            </Box>
            <IconButton
              onClick={() => setDetailModalOpen(false)}
              sx={{
                color: colorScheme.textColor,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{
          maxHeight: isMobile ? 'none' : '70vh',
          overflowY: 'auto',
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
          {selectedDetailLeave && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* 상태 및 휴가 타입 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={getStatusLabel(selectedDetailLeave)}
                  size="medium"
                  sx={{
                    bgcolor: `${getStatusColor(selectedDetailLeave.status, selectedDetailLeave.isCancel)}22`,
                    color: getStatusColor(selectedDetailLeave.status, selectedDetailLeave.isCancel),
                    fontSize: '13px',
                    fontWeight: 600,
                    height: '32px',
                  }}
                />
                <Chip
                  label={`${selectedDetailLeave.leave_type}${selectedDetailLeave.half_day_slot === 'AM' ? ' (오전반차)' :
                    selectedDetailLeave.half_day_slot === 'PM' ? ' (오후반차)' :
                      selectedDetailLeave.half_day_slot === 'ALL' ? ' (종일연차)' : ''
                    }`}
                  size="medium"
                  sx={{
                    bgcolor: '#64748B22',
                    color: '#64748B',
                    fontSize: '13px',
                    height: '32px',
                  }}
                />
                <Chip
                  label={`${selectedDetailLeave.workdays_count}일`}
                  size="medium"
                  sx={{
                    bgcolor: '#64748B',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '13px',
                    height: '32px',
                  }}
                />
                {selectedDetailLeave.half_day_slot && (
                  <Chip
                    label={selectedDetailLeave.half_day_slot === 'AM' ? '오전 반차' : selectedDetailLeave.half_day_slot === 'PM' ? '오후 반차' : selectedDetailLeave.half_day_slot}
                    size="medium"
                    sx={{
                      bgcolor: '#FF8C0022',
                      color: '#FF8C00',
                      fontSize: '13px',
                      height: '32px',
                    }}
                  />
                )}
              </Box>

              <Divider />

              {/* 신청자 정보 */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, color: colorScheme.textColor, fontWeight: 600 }}>
                  신청자 정보
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8F9FA', borderRadius: '12px', border: `1px solid ${colorScheme.textFieldBorderColor}` }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: '#64748B22',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PersonIcon sx={{ color: '#64748B', fontSize: 28 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                      {selectedDetailLeave.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colorScheme.textColor }}>
                      {selectedDetailLeave.department} | {selectedDetailLeave.job_position}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* 휴가 기간 */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, color: colorScheme.textColor, fontWeight: 600 }}>
                  휴가 기간
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 2, bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8F9FA', borderRadius: '12px', border: `1px solid ${colorScheme.textFieldBorderColor}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CalendarTodayIcon sx={{ color: '#64748B', fontSize: 20 }} />
                    <Typography variant="body1" fontWeight={600}>
                      {formatServerDateKorean(selectedDetailLeave.start_date)} - {formatServerDateKorean(selectedDetailLeave.end_date)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 4 }}>
                    <AccessTimeIcon sx={{ color: colorScheme.textColor, fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: colorScheme.textColor }}>
                      신청일: {formatServerDateTimeKorean(selectedDetailLeave.requested_date)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* 사유 */}
              {selectedDetailLeave.reason && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, color: colorScheme.textColor, fontWeight: 600 }}>
                    사유
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8F9FA', borderRadius: '12px', border: `1px solid ${colorScheme.textFieldBorderColor}` }}>
                    <RenderReasonWithCancelHighlight reason={selectedDetailLeave.reason} color={colorScheme.textColor} />
                  </Box>
                </Box>
              )}

              {/* 반려사유 */}
              {selectedDetailLeave.reject_message && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#DC3545', fontWeight: 600, fontSize: '15px' }}>
                    반려사유
                  </Typography>
                  <Box sx={{
                    p: 2,
                    bgcolor: isDark ? 'rgba(220, 53, 69, 0.1)' : 'rgba(220, 53, 69, 0.08)',
                    borderRadius: '12px',
                    border: '1px solid rgba(220, 53, 69, 0.3)'
                  }}>
                    <Typography variant="body1" sx={{ color: isDark ? '#FFFFFF' : '#000000', fontSize: '17px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {selectedDetailLeave.reject_message}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* 결재 정보 */}
              {selectedDetailLeave.approval_line && selectedDetailLeave.approval_line.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, color: colorScheme.textColor, fontWeight: 600 }}>
                    결재 정보
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {selectedDetailLeave.approval_line.map((approver: any, index: number) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 2,
                          bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8F9FA',
                          borderRadius: '12px',
                          border: `1px solid ${colorScheme.textFieldBorderColor}`,
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: approver.status === 'approved' ? '#20C99722' : approver.status === 'rejected' ? '#DC354522' : '#FF8C0022',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {approver.status === 'approved' ? (
                            <CheckCircleIcon sx={{ color: '#20C997', fontSize: 20 }} />
                          ) : approver.status === 'rejected' ? (
                            <CancelIcon sx={{ color: '#DC3545', fontSize: 20 }} />
                          ) : (
                            <AccessTimeIcon sx={{ color: '#FF8C00', fontSize: 20 }} />
                          )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {approver.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: colorScheme.textColor }}>
                            {approver.department} · {approver.position}
                          </Typography>
                        </Box>
                        <Chip
                          label={approver.status === 'approved' ? '승인' : approver.status === 'rejected' ? '반려' : '대기'}
                          size="small"
                          sx={{
                            bgcolor: approver.status === 'approved' ? '#20C99722' : approver.status === 'rejected' ? '#DC354522' : '#FF8C0022',
                            color: approver.status === 'approved' ? '#20C997' : approver.status === 'rejected' ? '#DC3545' : '#FF8C00',
                            fontWeight: 600,
                            fontSize: '11px',
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* 첨부파일 */}
              {selectedDetailLeave.attachments && selectedDetailLeave.attachments.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, color: colorScheme.textColor, fontWeight: 600 }}>
                    첨부파일
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {selectedDetailLeave.attachments.map((file: any, index: number) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 1.5,
                          bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8F9FA',
                          borderRadius: '8px',
                          border: `1px solid ${colorScheme.textFieldBorderColor}`,
                        }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '8px',
                            bgcolor: '#64748B22',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <EventNoteIcon sx={{ color: '#64748B', fontSize: 18 }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {file.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: colorScheme.textColor }}>
                            {(file.size / 1024).toFixed(1)} KB
                          </Typography>
                        </Box>
                        <Button variant="outlined" size="small">
                          다운로드
                        </Button>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${colorScheme.textFieldBorderColor}` }}>
          {selectedDetailLeave && selectedDetailLeave.status?.includes('REQUESTED') && (
            <Box sx={{ width: '100%', display: 'flex', gap: 1 }}>
              {selectedDetailLeave.status !== 'CANCEL_REQUESTED' && selectedDetailLeave.isCancel !== 1 && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    setDetailModalOpen(false);
                    setSelectedLeave(selectedDetailLeave);
                    setApprovalAction('reject');
                    setApprovalDialog(true);
                  }}
                >
                  반려
                </Button>
              )}
              <Button
                fullWidth
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => {
                  setDetailModalOpen(false);
                  setSelectedLeave(selectedDetailLeave);
                  setApprovalAction('approve');
                  setApprovalDialog(true);
                }}
              >
                {selectedDetailLeave.status === 'CANCEL_REQUESTED' || selectedDetailLeave.isCancel === 1
                  ? '취소승인'
                  : '승인'}
              </Button>
            </Box>
          )}
          {(!selectedDetailLeave || !selectedDetailLeave.status?.includes('REQUESTED')) && (
            <Button
              variant="outlined"
              onClick={() => setDetailModalOpen(false)}
              sx={{ width: '100%' }}
            >
              닫기
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminLeaveApprovalModals;
