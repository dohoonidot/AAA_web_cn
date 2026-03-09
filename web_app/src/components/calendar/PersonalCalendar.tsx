import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Slide,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarMonth as CalendarIcon,
  Fullscreen as FullscreenIcon,
  Close as CloseIcon,
  EventNote as EventNoteIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import type { MonthlyLeave, CalendarDay } from '../../types/leave';
import { usePersonalCalendarState } from './PersonalCalendar.state';

interface PersonalCalendarProps {
  monthlyLeaves?: MonthlyLeave[]; // 초기 데이터 (선택사항)
  loading?: boolean;
  error?: string | null;
  onTotalCalendarOpen?: () => void;
  onMonthChange?: (month: string, leaves: MonthlyLeave[]) => void; // 월 변경 콜백
  title?: string; // 달력 제목 (선택사항)
}

export default function PersonalCalendar({
  monthlyLeaves: initialMonthlyLeaves = [],
  loading: initialLoading = false,
  error: initialError = null,
  onTotalCalendarOpen,
  onMonthChange,
  title,
}: PersonalCalendarProps) {
  dayjs.locale('ko');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';
  const { state, actions, derived } = usePersonalCalendarState({
    initialMonthlyLeaves,
    initialLoading,
    initialError,
    onMonthChange,
  });
  const {
    currentDate,
    selectedDate,
    selectedDateDetails,
    selectedHolidayName,
    detailDialogOpen,
    slidePanelOpen,
    fullCalendarOpen,
    loading,
    error,
    calendarDays,
  } = state;
  const {
    setDetailDialogOpen,
    setSlidePanelOpen,
    setFullCalendarOpen,
    handlePrevMonth,
    handleNextMonth,
    handleDateClick,
  } = actions;
  const { getStatusColor, getStatusLabel } = derived;
  const palette = {
    surface: isDark ? '#0B1120' : '#F8FAFC',
    surfaceElevated: isDark ? '#0F172A' : '#FFFFFF',
    border: isDark ? 'rgba(148, 163, 184, 0.2)' : '#E2E8F0',
    borderStrong: isDark ? 'rgba(148, 163, 184, 0.35)' : '#CBD5E1',
    text: isDark ? '#E2E8F0' : '#0F172A',
    textSub: isDark ? '#94A3B8' : '#64748B',
    accent: '#3B82F6',
    accentSoft: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.12)',
    accentHover: isDark ? 'rgba(59, 130, 246, 0.28)' : '#EFF6FF',
    weekend: isDark ? 'rgba(148, 163, 184, 0.08)' : '#F1F5F9',
  };
  const cardBg = palette.surface;
  const panelBg = palette.surfaceElevated;
  const panelBorder = palette.border;
  const panelText = palette.text;
  const panelSubText = palette.textSub;
  const emptyIcon = palette.textSub;


  const renderCalendarDay = (day: CalendarDay) => {
    const hasLeaves = day.leaves.length > 0;
    const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
    const isHoliday = !!day.isHoliday;
    const holidayLabel = day.holidayName || '';

    // 상태별 우선순위에 따른 마커 색상 결정: 대기/취소대기(주황) > 승인(초록) > 반려(빨강)
    const getLeaveMarkerColor = () => {
      if (!hasLeaves) return '';

      const hasPending = day.leaves.some(l => {
        const status = l.status?.toUpperCase();
        return status === 'REQUESTED' || status === 'PENDING' || status === 'CANCEL_REQUESTED';
      });
      const hasApproved = day.leaves.some(l => l.status?.toUpperCase() === 'APPROVED');
      const hasRejected = day.leaves.some(l => l.status?.toUpperCase() === 'REJECTED');

      if (hasPending) return '#FF8C00'; // 대기/취소대기 - 주황색
      if (hasApproved) return '#20C997'; // 승인 - 초록색
      if (hasRejected) return '#DC3545'; // 반려 - 빨간색
      return '#20C997';
    };

    const leaveColor = getLeaveMarkerColor();

    return (
      <Box
        key={day.date.toISOString()}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: hasLeaves || isHoliday ? 'pointer' : 'default',
          border: '1px solid',
          borderColor: day.isToday ? palette.borderStrong : panelBorder,
          borderRadius: '10px',
          backgroundColor: !day.isCurrentMonth
            ? (isDark ? 'rgba(15, 23, 42, 0.4)' : '#F8FAFC')
            : day.isToday
              ? palette.accentSoft
              : isWeekend
                ? palette.weekend
                : palette.surfaceElevated,
          color: day.isCurrentMonth ? panelText : palette.textSub,
          '&:hover': (hasLeaves || isHoliday) ? {
            backgroundColor: palette.accentHover,
            borderColor: palette.accent,
          } : {},
          transition: 'all 140ms ease',
          position: 'relative',
          p: 0.25,
          overflow: 'hidden',
        }}
        onClick={() => handleDateClick(day)}
      >
        <Typography
          component="span"
          sx={{
            fontWeight: day.isToday ? 700 : 600,
            fontSize: '0.78rem',
            lineHeight: 1,
            textAlign: 'center',
            display: 'block',
            color: 'inherit',
            zIndex: 1,
            mt: isHoliday && day.isCurrentMonth ? 0.6 : 0,
          }}
        >
          {day.date.getDate()}
        </Typography>

        {hasLeaves && (
          <Box
            sx={{
              position: 'absolute',
              bottom: '1px',
              left: 1,
              right: 1,
              maxHeight: '28px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 2,
            }}
          >
            {day.leaves.some((l) => l.name) ? (
              (() => {
                const namedLeaves = day.leaves.filter((l: any) => Boolean(l.name));
                const firstLeave = namedLeaves[0];
                const status = (firstLeave?.status || '').toUpperCase();
                let itemColor = '#20C997'; // default approved
                if (status === 'REQUESTED' || status === 'PENDING' || status === 'CANCEL_REQUESTED' || status === '대기' || status === '대기중' || status === '취소 대기') itemColor = '#FF8C00';
                else if (status === 'REJECTED' || status === '반려' || status === '반려됨') itemColor = '#DC3545';
                else if (status === 'CANCELLED' || status === '취소' || status === '취소됨') itemColor = '#6C757D';

                const extraCount = Math.max(namedLeaves.length - 1, 0);
                const summaryLabel = `${firstLeave?.name || ''}${extraCount > 0 ? ` 외 ${extraCount}` : ''}`;

                return (
                  <Typography
                    sx={{
                      fontSize: '9px',
                      fontWeight: 600,
                      color: itemColor,
                      lineHeight: 1.1,
                      mb: 0.15,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      width: '100%',
                      textAlign: 'center',
                    }}
                    title={summaryLabel}
                  >
                    {summaryLabel}
                  </Typography>
                );
              })()
            ) : (
              <Box
                sx={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: leaveColor,
                  mb: '2px',
                }}
              />
            )}
          </Box>
        )}

        {isHoliday && day.isCurrentMonth && (
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
              className="holiday-label"
              sx={{
                maxWidth: '100%',
                px: 0.7,
                py: '2px',
                borderRadius: '999px',
                fontSize: '0.64rem',
                lineHeight: 1.05,
                fontWeight: 700,
                letterSpacing: '-0.015em',
                color: isDark ? '#FFE4EA' : '#9F1239',
                bgcolor: isDark ? 'rgba(251, 113, 133, 0.14)' : 'rgba(251, 113, 133, 0.10)',
                border: isDark ? '1px solid rgba(251, 113, 133, 0.20)' : '1px solid rgba(251, 113, 133, 0.16)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                boxShadow: isDark ? '0 1px 2px rgba(0,0,0,0.14)' : '0 1px 2px rgba(15,23,42,0.04)',
                backdropFilter: 'blur(2px)',
              }}
              title={holidayLabel}
            >
              {holidayLabel}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  const sortedSelectedDetails = [...selectedDateDetails].sort((a, b) => {
    const statusPriority: { [key: string]: number } = {
      'REQUESTED': 1,
      'PENDING': 1,
      'CANCEL_REQUESTED': 1,
      '대기': 1,
      '대기중': 1,
      '취소 대기': 1,
      'APPROVED': 2,
      '승인': 2,
      '승인됨': 2,
      'REJECTED': 3,
      '반려': 3,
      '반려됨': 3,
      'CANCELLED': 4,
      '취소': 4,
      '취소됨': 4,
    };
    const statusA = (a.status || '').toUpperCase();
    const statusB = (b.status || '').toUpperCase();
    const priorityA = statusPriority[statusA] || 5;
    const priorityB = statusPriority[statusB] || 5;
    return priorityA - priorityB;
  });

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <>
      <Card
        sx={{
          borderRadius: 3,
          position: 'relative',
          bgcolor: cardBg,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${panelBorder}`,
          boxShadow: isDark ? '0 12px 24px rgba(0,0,0,0.35)' : '0 10px 22px rgba(15, 23, 42, 0.08)',
        }}
      >
        {/* 배경 오버레이 (패널이 열려있을 때) */}
        {slidePanelOpen && (
          <Box
            onClick={() => setSlidePanelOpen(false)}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0, 0, 0, 0.3)',
              zIndex: 999,
              borderRadius: 2,
            }}
          />
        )}

        <CardContent
          sx={{
            p: 0.75,
            '&:last-child': { pb: 0.75 },
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden',
          }}
          onClick={(e) => {
            // 패널이 열려있고, 패널이 아닌 영역을 클릭한 경우 패널 닫기
            if (slidePanelOpen && !(e.target as HTMLElement).closest('[data-panel-content]')) {
              setSlidePanelOpen(false);
            }
          }}
        >
          {/* 달력 헤더 - 제목, 년월, 버튼을 같은 행에 배치 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 0.75,
              flexShrink: 0,
              px: 0.25,
            }}
          >
            {/* 왼쪽: 제목 */}
            {title && (
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: panelText, letterSpacing: '-0.01em' }}>
                {title}
              </Typography>
            )}

            {/* 오른쪽: 년월 + 네비게이션 + 전체보기 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, ml: 'auto' }}>
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '8px',
                  bgcolor: palette.accentSoft,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CalendarIcon sx={{ fontSize: 14, color: palette.accent }} />
              </Box>
              <Typography sx={{ fontWeight: 600, fontSize: '0.75rem', color: panelText, letterSpacing: '-0.01em' }}>
                {currentDate.format('YYYY년 MM월')}
              </Typography>

              <IconButton
                onClick={handlePrevMonth}
                size="small"
                sx={{ p: 0.25, width: 26, height: 26, border: `1px solid ${panelBorder}`, borderRadius: '8px' }}
              >
                <ChevronLeftIcon sx={{ fontSize: 16, color: panelSubText }} />
              </IconButton>

              <IconButton
                onClick={handleNextMonth}
                size="small"
                sx={{ p: 0.25, width: 26, height: 26, border: `1px solid ${panelBorder}`, borderRadius: '8px' }}
              >
                <ChevronRightIcon sx={{ fontSize: 16, color: panelSubText }} />
              </IconButton>

              <IconButton
                onClick={() => onTotalCalendarOpen?.()}
                size="small"
                sx={{ p: 0.25, width: 26, height: 26, border: `1px solid ${panelBorder}`, borderRadius: '8px' }}
                title="전체휴가 보기"
              >
                <FullscreenIcon sx={{ fontSize: 14, color: panelSubText }} />
              </IconButton>
            </Box>
          </Box>

          {/* 요일 헤더 */}
          <Grid container spacing={0} sx={{ mb: 0.5, flexShrink: 0 }}>
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <Grid size={12 / 7} key={day}>
                <Box sx={{
                  textAlign: 'center',
                  py: 0.35,
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  color: day === '일'
                    ? '#EF4444'
                    : day === '토'
                      ? '#3B82F6'
                      : panelSubText,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  {day}
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* 달력 그리드 - 6행을 균등 배분하여 영역 최대 활용 */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gridTemplateRows: 'repeat(6, 1fr)', // 6주를 균등 배분
                gap: '4px',
              }}
            >
              {calendarDays.map((day, index) => (
                <Box key={index} sx={{ display: 'flex', minHeight: 0, height: '100%', width: '100%' }}>
                  {renderCalendarDay(day)}
                </Box>
              ))}
            </Box>
          </Box>
        </CardContent>

        {/* 슬라이드 패널 - Flutter와 동일한 스타일 */}
        <Slide direction="left" in={slidePanelOpen} mountOnEnter unmountOnExit>
          <Paper
            data-panel-content
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '400px',
              height: '100%',
              zIndex: 1000,
              borderRadius: '16px 0 0 16px',
              boxShadow: isDark ? '-10px 0 24px rgba(0,0,0,0.4)' : '-10px 0 24px rgba(15, 23, 42, 0.12)',
              bgcolor: panelBg,
            }}
          >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* 패널 헤더 - Flutter와 동일 */}
              <Box sx={{
                px: 1.5,
                py: 1,
                borderBottom: `1px solid ${panelBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: '16px 0 0 0',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      p: 0.5,
                      bgcolor: palette.accentSoft,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <EventNoteIcon sx={{ color: palette.accent, fontSize: 14 }} />
                  </Box>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: panelText, letterSpacing: '-0.01em' }}>
                    {selectedDate && `${dayjs(selectedDate).format('YYYY년 MM월 DD일 (ddd)')}`}
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => setSlidePanelOpen(false)}
                  size="small"
                  sx={{
                    p: 0,
                    minWidth: 20,
                    minHeight: 20,
                    color: panelSubText,
                  }}
                >
                  <CloseIcon sx={{ fontSize: 16, color: panelSubText }} />
                </IconButton>
              </Box>

              {/* 휴가 내역 리스트 - Flutter와 동일한 스타일 */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
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
                    <Typography sx={{ fontSize: '12px', color: panelText, fontWeight: 600 }}>
                      {selectedHolidayName}
                    </Typography>
                  </Box>
                )}
                {selectedDateDetails.length === 0 ? (
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    p: 2
                  }}>
                    <CalendarIcon sx={{ fontSize: 48, color: emptyIcon, mb: 1 }} />
                    <Typography sx={{ fontSize: '12px', color: panelSubText, textAlign: 'center' }}>
                      휴가 일정이 없습니다
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {sortedSelectedDetails.map((leave, index) => {
                      const status = (leave.status || '').toUpperCase();
                      const isPending = status === 'REQUESTED' || status === 'PENDING' || status === 'CANCEL_REQUESTED' || status === '대기' || status === '대기중' || status === '취소 대기';
                      const isApproved = status === 'APPROVED' || status === '승인' || status === '승인됨';
                      const isRejected = status === 'REJECTED' || status === '반려' || status === '반려됨';
                      const isCancelled = status === 'CANCELLED' || status === '취소' || status === '취소됨';
                      const halfDaySlot = leave.halfDaySlot || (leave as any).half_day_slot;
                      const usedDays = (leave as any).workdaysCount ?? (leave as any).workdays_count ?? (leave as any).totalDays;
                      const requestedDate = (leave as any).requestedDate ?? (leave as any).requested_date;

                      let statusColor = '#1E88E5';
                      if (isPending) statusColor = '#FF8C00';
                      else if (isApproved) statusColor = '#20C997';
                      else if (isRejected) statusColor = '#DC3545';
                      else if (isCancelled) statusColor = '#6C757D';

                      return (
                        <Paper
                          key={index}
                          sx={{
                            p: 1.5,
                            mb: 1,
                            bgcolor: panelBg,
                            borderRadius: '14px',
                            border: `1px solid ${panelBorder}`,
                            boxShadow: isDark ? '0 8px 18px rgba(0,0,0,0.2)' : '0 8px 18px rgba(15, 23, 42, 0.08)',
                          }}
                        >
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                            {/* 상태 배지와 휴가 종류 - Flutter와 동일한 레이아웃 */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <Chip
                                label={getStatusLabel(leave.status)}
                                size="small"
                                sx={{
                                  bgcolor: `${statusColor}1A`,
                                  color: statusColor,
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  height: 22,
                                  px: 1.25,
                                  py: 0.5,
                                  borderRadius: '15px',
                                  border: `1px solid ${statusColor}55`,
                                }}
                              />
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, minWidth: 0 }}>
                                <Typography sx={{
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  color: panelText,
                                  flex: 1,
                                  minWidth: 0,
                                }}>
                                  {leave.name ? `${leave.name} - ${leave.leaveType || '휴가'}` : (leave.leaveType || '휴가')}
                                </Typography>
                                {halfDaySlot && halfDaySlot !== 'ALL' && (
                                  <Box
                                    sx={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                      px: 0.75,
                                      py: 0.2,
                                      borderRadius: '999px',
                                      bgcolor: isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(15, 23, 42, 0.04)',
                                      border: `1px solid ${panelBorder}`,
                                      flexShrink: 0,
                                    }}
                                  >
                                    <Typography sx={{ fontSize: '10px', fontWeight: 700, color: panelSubText, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                      유형
                                    </Typography>
                                    <Typography sx={{ fontSize: '11px', fontWeight: 600, color: panelText }}>
                                      {halfDaySlot === 'AM' ? '오전반차' : halfDaySlot === 'PM' ? '오후반차' : '반차'}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>

                            {/* 사유 - Flutter와 동일한 순서 */}
                            {(() => {
                              const { cancelReason, mainReason } = parseLeaveReason(leave.reason);
                              return (
                                <>
                                  {cancelReason && (
                                    <Box sx={{
                                      display: 'flex',
                                      gap: 0.75,
                                      alignItems: 'baseline',
                                      fontSize: '10px',
                                    }}>
                                      <Typography sx={{ fontSize: '10px', fontWeight: 700, color: panelSubText, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                        취소사유
                                      </Typography>
                                      <Typography sx={{
                                        fontSize: '10px',
                                        color: panelText,
                                        lineHeight: 1.4,
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                      }}>
                                        {cancelReason}
                                      </Typography>
                                    </Box>
                                  )}
                                  {mainReason && (
                                    <Box sx={{
                                      display: 'flex',
                                      gap: 0.75,
                                      alignItems: 'baseline',
                                      fontSize: '10px',
                                    }}>
                                      <Typography sx={{ fontSize: '10px', fontWeight: 700, color: panelSubText, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                        사유
                                      </Typography>
                                      <Typography sx={{
                                        fontSize: '10px',
                                        color: panelSubText,
                                        lineHeight: 1.4,
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                      }}>
                                        {mainReason}
                                      </Typography>
                                    </Box>
                                  )}
                                </>
                              );
                            })()}

                            {/* 기간 - Flutter와 동일한 형식 */}
                            {leave.startDate && leave.endDate && (
                              <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'baseline' }}>
                                <Typography sx={{ fontSize: '10px', fontWeight: 700, color: panelSubText, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                  기간
                                </Typography>
                                <Typography sx={{ fontSize: '10px', color: panelSubText, whiteSpace: 'pre-wrap' }}>
                                  {dayjs(leave.startDate).format('YYYY.MM.DD (ddd)')} ~ {dayjs(leave.endDate).format('YYYY.MM.DD (ddd)')}
                                  {halfDaySlot === 'ALL' && ' (종일)'}
                                </Typography>
                              </Box>
                            )}

                            {usedDays && (
                              <Box
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  px: 0.75,
                                  py: 0.2,
                                  borderRadius: '999px',
                                  bgcolor: isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(15, 23, 42, 0.04)',
                                  border: `1px solid ${panelBorder}`,
                                  alignSelf: 'flex-start',
                                }}
                              >
                                <Typography sx={{ fontSize: '10px', fontWeight: 700, color: panelSubText, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                  사용
                                </Typography>
                                <Typography sx={{ fontSize: '10px', color: panelText, fontWeight: 600 }}>
                                  {usedDays}일
                                </Typography>
                              </Box>
                            )}

                            {requestedDate && (
                              <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'baseline' }}>
                                <Typography sx={{ fontSize: '10px', fontWeight: 700, color: panelSubText, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                  신청일
                                </Typography>
                                <Typography sx={{ fontSize: '10px', color: panelSubText }}>
                                  {dayjs(requestedDate).format('YYYY.MM.DD')}
                                </Typography>
                              </Box>
                            )}

                            {/* 반려 사유 - 있으면 표시 */}
                            {leave.rejectMessage && leave.rejectMessage.trim() && (
                              <Box sx={{
                                mt: 0.5,
                                p: 0.75,
                                bgcolor: '#DC354520',
                                borderRadius: '6px',
                                border: '1px solid #DC354533',
                              }}>
                                <Typography sx={{
                                  fontSize: '10px',
                                  color: '#DC3545',
                                  fontWeight: 600,
                                }}>
                                  반려 사유: {leave.rejectMessage}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Paper>
                      );
                    })}
                  </Box>
                )}
              </Box>
            </Box>
          </Paper>
        </Slide>
      </Card>

      {/* 휴가 상세 다이얼로그 */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: panelText }}>
          {selectedDate && dayjs(selectedDate).format('YYYY년 MM월 DD일 (ddd)')} 휴가 내역
        </DialogTitle>
        <DialogContent>
          {selectedHolidayName && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                color: panelText,
                bgcolor: isDark ? 'rgba(244, 63, 94, 0.10)' : 'rgba(244, 63, 94, 0.06)',
                border: isDark ? '1px solid rgba(251, 113, 133, 0.2)' : '1px solid rgba(251, 113, 133, 0.16)',
                '& .MuiAlert-icon': {
                  color: isDark ? '#FDA4AF' : '#E11D48',
                },
              }}
            >
              <Typography sx={{ color: panelText, fontWeight: 600 }}>
                공휴일: {selectedHolidayName}
              </Typography>
            </Alert>
          )}
          {sortedSelectedDetails.map((leave, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: panelText }}>
                      {leave.name ? `${leave.name} - ${leave.leaveType || '휴가'}` : (leave.leaveType || '휴가')}
                    </Typography>
                    {(() => {
                      const halfDaySlot = leave.halfDaySlot || (leave as any).half_day_slot;
                      if (!halfDaySlot || halfDaySlot === 'ALL') return null;
                      return (
                        <Typography
                          sx={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: panelText,
                            px: 0.75,
                            py: 0.15,
                            borderRadius: '999px',
                            bgcolor: 'rgba(15, 23, 42, 0.06)',
                            border: '1px solid rgba(15, 23, 42, 0.15)',
                            flexShrink: 0,
                          }}
                        >
                          {halfDaySlot === 'AM' ? '오전반차' : halfDaySlot === 'PM' ? '오후반차' : '반차'}
                        </Typography>
                      );
                    })()}
                  </Box>
                  <Chip
                    label={getStatusLabel(leave.status)}
                    color={getStatusColor(leave.status) as any}
                    size="small"
                    sx={{ color: panelText }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline', mb: 1 }}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: panelSubText, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    기간
                  </Typography>
                  <Typography variant="body2" sx={{ color: panelText }}>
                    {dayjs(leave.startDate).format('YYYY.MM.DD (ddd)')} - {dayjs(leave.endDate).format('YYYY.MM.DD (ddd)')}
                    {(() => {
                      const halfDaySlot = leave.halfDaySlot || (leave as any).half_day_slot;
                      return halfDaySlot === 'ALL' ? ' (종일)' : '';
                    })()}
                  </Typography>
                </Box>
                {(() => {
                  const { cancelReason, mainReason } = parseLeaveReason(leave.reason);
                  return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {cancelReason && (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
                          <Typography sx={{ fontSize: '11px', fontWeight: 700, color: panelSubText, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            취소사유
                          </Typography>
                          <Typography variant="body2" sx={{ color: panelText }}>
                            {cancelReason}
                          </Typography>
                        </Box>
                      )}
                      {mainReason && (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
                          <Typography sx={{ fontSize: '11px', fontWeight: 700, color: panelSubText, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            사유
                          </Typography>
                          <Typography variant="body2" sx={{ color: panelText }}>
                            {mainReason}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  );
                })()}
                {leave.rejectMessage && (
                  <Alert severity="error" sx={{ mt: 1, color: panelText }}>
                    <Typography sx={{ color: panelText }}>
                      반려 사유: {leave.rejectMessage}
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)} sx={{ color: panelText, borderRadius: '10px' }}>
            닫기
          </Button>
        </DialogActions>
      </Dialog>

    </>
  );
}
