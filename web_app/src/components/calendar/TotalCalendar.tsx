import { useSwipeable } from 'react-swipeable';
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Collapse,
  Paper,
  List,
  Chip,
  useMediaQuery,
  useTheme,
  Pagination,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarMonth as CalendarIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Groups as GroupsIcon,
  EventNote as EventNoteIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
  BusinessCenter as BusinessCenterIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import isBetween from 'dayjs/plugin/isBetween';
import { useTotalCalendarState } from './TotalCalendar.state';

dayjs.extend(isBetween);
dayjs.locale('ko');

interface TotalCalendarProps {
  open: boolean;
  onClose: () => void;
  selectedDate?: Date;
  onDateSelected?: (date: Date) => void;
  embedded?: boolean; // true일 때 Dialog 없이 직접 렌더링
}

export default function TotalCalendar({
  open,
  onClose,
  selectedDate: initialSelectedDate,
  onDateSelected,
  embedded = false
}: TotalCalendarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';
  const palette = {
    surface: isDark ? '#293445' : '#F8FAFC',
    surfaceElevated: isDark ? '#334055' : '#FFFFFF',
    border: isDark ? 'rgba(148, 163, 184, 0.2)' : '#E2E8F0',
    borderStrong: isDark ? 'rgba(148, 163, 184, 0.35)' : '#CBD5E1',
    text: isDark ? '#E2E8F0' : '#0F172A',
    textSub: isDark ? '#94A3B8' : '#64748B',
    accent: '#3B82F6',
    accentSoft: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.12)',
    accentHover: isDark ? 'rgba(59, 130, 246, 0.28)' : '#EFF6FF',
    weekend: isDark ? 'rgba(148, 163, 184, 0.08)' : '#F1F5F9',
  };
  const surface = palette.surface;
  const panelBg = palette.surfaceElevated;
  const panelBorder = palette.border;
  const panelText = palette.text;
  const panelSubText = palette.textSub;

  const { state, actions, derived } = useTotalCalendarState({
    open,
    embedded,
    initialSelectedDate,
    onDateSelected,
  });
  const {
    selectedDate,
    currentCalendarDate,
    selectedDateDetails,
    selectedHolidayName,
    isMyVacationView,
    selectedDepartments,
    selectedEmployees,
    expandedDepartments,
    departmentEmployees,
    isDepartmentDataLoading,
    isDetailPanelVisible,
    detailPage,
    yearMonthDialogOpen,
    selectedYear,
    selectedMonth,
    loading,
    error,
  } = state;

  const {
    setDetailPage,
    setSelectedYear,
    setSelectedMonth,
    setIsDetailPanelVisible,
    handlePrevMonth,
    handleNextMonth,
    handleDateClick,
    handleYearMonthClick,
    handleYearMonthConfirm,
    handleYearMonthCancel,
    handleViewModeChange,
    toggleDepartmentSelection,
    toggleDepartmentExpansion,
    toggleEmployeeSelection,
    handleSelectAll,
    handleSelectNone,
  } = actions;

  const {
    getHolidayName,
    generateCalendarDays,
    getPaginatedDetails,
    getDetailTotalPages,
  } = derived;

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

  // 날짜 셀 렌더링
  const renderDateCell = (day: any) => {
    const hasLeaves = day.leaves.length > 0;
    const isSelected = dayjs(day.date).isSame(dayjs(selectedDate), 'day');
    const weekday = day.date.getDay();
    const isSunday = weekday === 0;
    const isSaturday = weekday === 6;
    const isHoliday = !!day.isHoliday;
    const holidayLabel = typeof day.isHoliday === 'string' ? day.isHoliday : '';

    // 상태별 색상 결정
    let leaveColor: string | null = null;
    if (hasLeaves) {
      const pendingCount = day.leaves.filter((l: any) =>
        l.status?.toUpperCase() === 'PENDING' || l.status?.toUpperCase() === 'REQUESTED'
      ).length;
      const approvedCount = day.leaves.filter((l: any) =>
        l.status?.toUpperCase() === 'APPROVED'
      ).length;
      const rejectedCount = day.leaves.filter((l: any) =>
        l.status?.toUpperCase() === 'REJECTED'
      ).length;
      const cancelledCount = day.leaves.filter((l: any) =>
        l.status?.toUpperCase() === 'CANCELLED'
      ).length;

      if (pendingCount > 0) {
        leaveColor = '#FF8C00'; // 대기중
      } else if (approvedCount > 0) {
        leaveColor = '#20C997'; // 승인됨
      } else if (rejectedCount > 0) {
        leaveColor = '#DC3545'; // 반려됨
      } else if (cancelledCount > 0) {
        leaveColor = '#6C757D'; // 취소됨
      }
    }

    const dateTextColor = !day.isCurrentMonth
      ? palette.textSub
      : isSelected
        ? '#FFFFFF'
        : isHoliday
          ? '#EF4444'
          : isSunday
            ? '#EF4444'
            : isSaturday
              ? '#3B82F6'
              : panelText;

    const accentTint = leaveColor ? `${leaveColor}1A` : palette.accentSoft;
    const deptHighlight = !isMyVacationView && hasLeaves && day.isCurrentMonth && !isSelected;
    const dayNames = Array.from(
      new Set(
        (day.leaves || [])
          .map((leave: any) => leave?.name || leave?.employeeName || '')
          .filter((value: string) => Boolean(value))
      )
    );
    const namesPerSide = 10; // 2열 x 5행
    const gridRows = 5;
    const gridCols = 2;
    const leftNames = isMyVacationView && !isMobile ? dayNames.slice(0, namesPerSide) : [];
    const rightNames = isMyVacationView && !isMobile ? dayNames.slice(namesPerSide, namesPerSide * 2) : [];
    const sideMoreCount = isMyVacationView && !isMobile ? Math.max(dayNames.length - namesPerSide * 2, 0) : 0;
    const toColumnFirstGridSlots = (names: string[]) => {
      const slots = Array.from({ length: gridRows * gridCols }, () => '');
      names.forEach((name, index) => {
        const col = Math.floor(index / gridRows);
        const row = index % gridRows;
        const rowMajorIndex = row * gridCols + col;
        slots[rowMajorIndex] = name;
      });
      return slots;
    };
    const leftSlots = toColumnFirstGridSlots(leftNames);
    const rightSlots = toColumnFirstGridSlots(rightNames);
    const firstLeaveName = !isMyVacationView && hasLeaves
      ? (day.leaves[0]?.name || day.leaves[0]?.employeeName || '')
      : '';
    const extraLeaveCount = !isMyVacationView && hasLeaves ? Math.max(day.leaves.length - 1, 0) : 0;
    const dayNameLabel = firstLeaveName
      ? `${firstLeaveName}${extraLeaveCount > 0 ? ` 외 ${extraLeaveCount}` : ''}`
      : '';

    return (
      <Box
        key={day.date.toISOString()}
        onClick={() => handleDateClick(day.date)}
        sx={{
          width: '100%',
          height: '100%',
          minHeight: isMobile ? 0 : '28px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: isMobile ? 'flex-start' : 'center',
          cursor: 'pointer',
          border: '1px solid',
          borderColor: isSelected
            ? palette.accent
            : deptHighlight
              ? (leaveColor ? `${leaveColor}66` : palette.borderStrong)
              : (day.isToday ? palette.borderStrong : panelBorder),
          borderRadius: isMobile ? '8px' : '10px',
          margin: 0,
          backgroundColor: isSelected
            ? palette.accent
            : day.isToday
              ? palette.accentSoft
              : deptHighlight
                ? (leaveColor ? `${leaveColor}14` : palette.accentSoft)
                : (day.isCurrentMonth ? palette.surfaceElevated : (isDark ? 'rgba(15, 23, 42, 0.4)' : '#F8FAFC')),
          color: dateTextColor,
          '&:hover': {
            backgroundColor: isSelected ? palette.accent : palette.accentHover,
            borderColor: palette.accent,
          },
          position: 'relative',
          p: isMobile ? 0.5 : 0,
          boxShadow: isMobile ? 'none' : (isSelected ? '0 6px 14px rgba(59, 130, 246, 0.25)' : 'none'),
          transition: 'all 140ms ease',
        }}
      >
        <Typography
          sx={{
            fontSize: isMobile ? '11px' : '15px',
            fontWeight: isSelected || day.isToday ? 700 : 600,
            mb: isMobile ? 0.25 : 0,
            mt: isHoliday && day.isCurrentMonth ? (isMobile ? 0.9 : 0.8) : 0,
            lineHeight: 1.2,
            color: dateTextColor,
          }}
        >
          {day.date.getDate()}
        </Typography>

        {!isMobile && leftNames.length > 0 && day.isCurrentMonth && (
          <Box
            sx={{
              position: 'absolute',
              left: 2,
              top: 26,
              bottom: 2,
              width: '39%',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gridTemplateRows: 'repeat(5, minmax(0, 1fr))',
              gap: '1px',
              pointerEvents: 'none',
            }}
          >
            {leftSlots.map((name, idx) => (
              <Typography
                key={`left-${idx}`}
                sx={{
                  fontSize: '0.58rem',
                  lineHeight: 1,
                  fontWeight: 600,
                  color: isSelected ? 'rgba(255,255,255,0.92)' : (isDark ? '#E2E8F0' : '#1E293B'),
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textAlign: idx % 2 === 0 ? 'left' : 'right',
                }}
                title={name || undefined}
              >
                {name}
              </Typography>
            ))}
          </Box>
        )}

        {!isMobile && rightNames.length > 0 && day.isCurrentMonth && (
          <Box
            sx={{
              position: 'absolute',
              right: 2,
              top: 26,
              bottom: 2,
              width: '39%',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gridTemplateRows: 'repeat(5, minmax(0, 1fr))',
              gap: '1px',
              pointerEvents: 'none',
            }}
          >
            {rightSlots.map((name, idx) => (
              <Typography
                key={`right-${idx}`}
                sx={{
                  fontSize: '0.58rem',
                  lineHeight: 1,
                  fontWeight: 600,
                  color: isSelected ? 'rgba(255,255,255,0.92)' : (isDark ? '#E2E8F0' : '#1E293B'),
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textAlign: idx % 2 === 0 ? 'left' : 'right',
                }}
                title={name || undefined}
              >
                {name}
              </Typography>
            ))}
          </Box>
        )}

        {!isMobile && sideMoreCount > 0 && day.isCurrentMonth && (
          <Typography
            sx={{
              position: 'absolute',
              bottom: 2,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '0.54rem',
              fontWeight: 700,
              color: isSelected ? 'rgba(255,255,255,0.9)' : panelSubText,
              pointerEvents: 'none',
            }}
            title={`외 ${sideMoreCount}명`}
          >
            외 {sideMoreCount}
          </Typography>
        )}

        {/* 데스크톱뷰: 미묘한 하단 바 + 도트로 표시 (전체 채우기 제거) */}
        {!isMobile && hasLeaves && day.isCurrentMonth && (
          <Box
            sx={{
              position: 'absolute',
              left: 6,
              right: 6,
              bottom: 4,
              height: 3,
              borderRadius: '999px',
              bgcolor: isSelected
                ? 'rgba(255,255,255,0.6)'
                : (deptHighlight ? (leaveColor ? `${leaveColor}33` : palette.accentSoft) : accentTint),
              border: `1px solid ${leaveColor ? `${leaveColor}66` : palette.border}`,
            }}
          />
        )}

        {!isMobile && dayNameLabel && day.isCurrentMonth && (
          <Typography
            sx={{
              position: 'absolute',
              left: 8,
              right: 8,
              bottom: 8,
              fontSize: '0.62rem',
              fontWeight: 600,
              color: isSelected ? 'rgba(255,255,255,0.9)' : (isDark ? '#E2E8F0' : '#1E293B'),
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
            title={dayNameLabel}
          >
            {dayNameLabel}
          </Typography>
        )}

        {!isMobile && hasLeaves && !isSelected && !day.isToday && day.isCurrentMonth && (
          <Box
            sx={{
              position: 'absolute',
              top: 6,
              left: 6,
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: leaveColor || '#20C997',
              boxShadow: isDark ? '0 0 0 2px rgba(15, 23, 42, 0.9)' : '0 0 0 2px #FFFFFF',
              transform: deptHighlight ? 'scale(1.15)' : 'scale(1)',
            }}
          />
        )}

        {!isMobile && isHoliday && day.isCurrentMonth && (
          <Box
            sx={{
              position: 'absolute',
              top: 3,
              left: 3,
              right: 3,
              display: 'flex',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          >
            <Typography
              sx={{
                maxWidth: '100%',
                px: 0.8,
                py: '2px',
                borderRadius: '999px',
                fontSize: '0.70rem',
                lineHeight: 1.05,
                fontWeight: 700,
                color: isSelected
                  ? 'rgba(255,255,255,0.92)'
                  : (isDark ? '#FFE4EA' : '#9F1239'),
                bgcolor: isSelected
                  ? 'rgba(255,255,255,0.16)'
                  : (isDark ? 'rgba(251, 113, 133, 0.14)' : 'rgba(251, 113, 133, 0.10)'),
                border: isSelected
                  ? '1px solid rgba(255,255,255,0.16)'
                  : (isDark ? '1px solid rgba(251, 113, 133, 0.20)' : '1px solid rgba(251, 113, 133, 0.16)'),
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

        {/* 모바일뷰: 기존 텍스트 표시 유지 */}
        {isMobile && hasLeaves && day.isCurrentMonth && (
          <Box
            sx={{
              position: 'absolute',
              left: 1,
              right: 1,
              bottom: 1,
              maxHeight: '28px',
              overflow: 'hidden',
              width: 'calc(100% - 2px)',
            }}
          >
            {day.leaves.slice(0, 2).map((leave: any, idx: number) => {
              const isApproved = leave.status?.toUpperCase() === 'APPROVED';
              if (!isApproved && isMyVacationView) return null;

              let displayText = '';
              if (isMyVacationView) {
                displayText = leave.reason || leave.leaveType;
              } else {
                if (leave.name && leave.department) {
                  displayText = leave.name;
                } else if (leave.employeeName && leave.department) {
                  displayText = leave.employeeName;
                } else {
                  displayText = leave.reason || leave.leaveType || leave.vacationType || '';
                }
              }

              return (
                <Typography
                  key={idx}
                  sx={{
                    fontSize: '9px',
                    fontWeight: 500,
                    color: panelText,
                    lineHeight: 1.1,
                    mb: 0.25,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%',
                  }}
                >
                  {displayText}
                </Typography>
              );
            })}
            {day.leaves.length > 2 && (
              <Typography
                sx={{
                  fontSize: '8px',
                  color: panelSubText,
                  fontWeight: 600,
                  lineHeight: 1,
                }}
              >
                +{day.leaves.length - 2}
              </Typography>
            )}
          </Box>
        )}

        {isMobile && isHoliday && day.isCurrentMonth && (
          <Box
            sx={{
              position: 'absolute',
              top: 2,
              left: 2,
              right: 2,
              display: 'flex',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          >
            <Typography
              sx={{
                maxWidth: '100%',
                px: 0.5,
                py: '1px',
                borderRadius: '999px',
                fontSize: '9px',
                lineHeight: 1.05,
                fontWeight: 700,
                color: isSelected ? 'rgba(255,255,255,0.92)' : (isDark ? '#FFE4EA' : '#9F1239'),
                bgcolor: isSelected
                  ? 'rgba(255,255,255,0.16)'
                  : (isDark ? 'rgba(251, 113, 133, 0.14)' : 'rgba(251, 113, 133, 0.10)'),
                border: isSelected
                  ? '1px solid rgba(255,255,255,0.16)'
                  : (isDark ? '1px solid rgba(251, 113, 133, 0.20)' : '1px solid rgba(251, 113, 133, 0.16)'),
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
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

  // 달력 월 렌더링
  const renderMonthCalendar = (monthDate: dayjs.Dayjs) => {
    const calendarDays = generateCalendarDays(monthDate);

    // 주(week) 단위로 그룹화 (관리자용 달력과 동일한 구조)
    const weeks: typeof calendarDays[] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    return (
      <Box
        sx={{
          flex: 1, // 남은 공간 모두 차지하도록 flex: 1 설정
          minHeight: 0, // flexbox에서 필수
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 요일 헤더 - 관리자용과 동일한 스타일 (데스크톱뷰) */}
        {!isMobile ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1, flexShrink: 0 }}>
            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => {
              const isSunday = index === 0;
              const isSaturday = index === 6;
              return (
                <Box
                  key={day}
                  sx={{
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: palette.surfaceElevated,
                    borderRadius: '10px',
                    border: `1px solid ${panelBorder}`,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: isSunday
                        ? '#EF4444'
                        : isSaturday
                          ? '#3B82F6'
                          : panelSubText,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {day}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Grid container spacing={0} sx={{ mb: 0, flexShrink: 0 }}>
            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => {
              const isSunday = index === 0;
              const isSaturday = index === 6;
              return (
                <Grid size={12 / 7} key={day} sx={{ display: 'flex' }}>
                  <Box
                    sx={{
                      width: '100%',
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: palette.surfaceElevated,
                      borderRadius: 0,
                      borderBottom: `1px solid ${panelBorder}`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: isSunday
                          ? '#EF4444'
                          : isSaturday
                            ? '#3B82F6'
                            : panelSubText,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {day}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* 달력 그리드 - 관리자용 달력과 동일한 구조 (데스크톱뷰) */}
        {!isMobile ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75, minHeight: 0 }}>
            {weeks.map((week, weekIndex) => (
              <Box
                key={weekIndex}
                sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.75, flex: 1, minHeight: 0 }}
              >
                {week.map((day, dayIndex) => (
                  <Box
                    key={dayIndex}
                    sx={{
                      height: '100%',
                      width: '100%',
                      display: 'flex',
                    }}
                  >
                    {renderDateCell(day)}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        ) : (
          // 모바일뷰는 기존 Grid 구조 유지
          <Grid container spacing={0} sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            {calendarDays.map((day, index) => (
              <Grid
                size={12 / 7}
                key={index}
                sx={{
                  display: 'flex',
                  minHeight: '48px',
                  aspectRatio: '1',
                }}
              >
                {renderDateCell(day)}
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  // 메인 컨텐츠 (Dialog 내부 또는 직접 렌더링)
  const renderContent = () => (
    <>
      {/* 헤더 */}
      <DialogTitle
        sx={{
          p: isMobile ? 1 : 2.5,
          borderBottom: `1px solid ${panelBorder}`,
          bgcolor: panelBg,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                p: isMobile ? 0.75 : 1,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                flexShrink: 0,
              }}
            >
              <CalendarIcon sx={{ color: 'white', fontSize: isMobile ? 18 : 20 }} />
            </Box>
            <Typography
              sx={{
                fontSize: isMobile ? '16px' : '20px',
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {isMobile ? '전체보기' : '부서 휴가 일정 (전체보기)'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            {!isMobile && (
              <Box>
                <ToggleButtonGroup
                  value={isMyVacationView ? 'my' : 'dept'}
                  exclusive
                  onChange={(_, value) => {
                    if (value !== null) {
                      handleViewModeChange(value === 'my');
                    }
                  }}
                  sx={{
                    bgcolor: palette.surfaceElevated,
                    borderRadius: '12px',
                    border: `1px solid ${panelBorder}`,
                    p: '2px',
                  }}
                >
                  <ToggleButton value="my" sx={{ px: 2, py: 1, borderRadius: '10px' }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: panelText }}>
                      휴가 내역
                    </Typography>
                  </ToggleButton>
                  <ToggleButton value="dept" sx={{ px: 2, py: 1, borderRadius: '10px' }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: panelText }}>
                      전체 휴가 현황
                    </Typography>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            )}
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          {isMobile && (
            <Box sx={{ width: '100%', mt: 1 }}>
              <ToggleButtonGroup
                value={isMyVacationView ? 'my' : 'dept'}
                exclusive
                onChange={(_, value) => {
                  if (value !== null) {
                    handleViewModeChange(value === 'my');
                  }
                }}
                fullWidth
                sx={{
                  bgcolor: palette.surfaceElevated,
                  borderRadius: '12px',
                  border: `1px solid ${panelBorder}`,
                  p: '2px',
                }}
              >
                <ToggleButton value="my" sx={{ px: 1.5, py: 0.75, flex: 1, borderRadius: '10px' }}>
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: panelText }}>
                    휴가 내역
                  </Typography>
                </ToggleButton>
                <ToggleButton value="dept" sx={{ px: 1.5, py: 0.75, flex: 1, borderRadius: '10px' }}>
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: panelText }}>
                    전체 휴가 현황
                  </Typography>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: isMobile ? 'visible' : 'hidden', height: isMobile ? 'auto' : 'calc(100% - 80px)', bgcolor: surface }}>
        <Box sx={{ display: 'flex', flex: 1, overflow: isMobile ? 'visible' : 'hidden', flexDirection: isMobile ? 'column' : 'row', width: '100%' }}>
          {/* 달력 영역 - 관리자용과 동일하게 70% (flex: 7) */}
          <Box sx={{ flex: isMobile ? 'none' : 7, p: isMobile ? 1 : 2.5, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
            {/* 네비게이션 */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: isMobile ? 1.5 : 2.5, px: isMobile ? 0.5 : 0 }}>
              <IconButton
                onClick={handlePrevMonth}
                disabled={loading}
                sx={{ width: isMobile ? 36 : 48, height: isMobile ? 36 : 48 }}
              >
                <ChevronLeftIcon sx={{ fontSize: isMobile ? 24 : 32 }} />
              </IconButton>

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? 0.5 : 1, flex: 1, mx: 1 }}>
                <Box
                  onClick={handleYearMonthClick}
                  sx={{
                    px: isMobile ? 1.5 : 2,
                    py: isMobile ? 0.75 : 1,
                    bgcolor: palette.surfaceElevated,
                    borderRadius: '10px',
                    border: `1px solid ${panelBorder}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    '&:hover': {
                      bgcolor: palette.accentHover,
                    },
                  }}
                >
                  <Typography sx={{ fontSize: isMobile ? '16px' : '24px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {currentCalendarDate.format('YYYY년 MM월')}
                  </Typography>
                  {!isMobile && <CalendarIcon sx={{ fontSize: 20, color: panelSubText }} />}
                </Box>
              </Box>

              <IconButton
                onClick={handleNextMonth}
                disabled={loading}
                sx={{ width: isMobile ? 36 : 48, height: isMobile ? 36 : 48 }}
              >
                <ChevronRightIcon sx={{ fontSize: isMobile ? 24 : 32 }} />
              </IconButton>
            </Box>

            {/* 달력 - 관리자용과 동일한 스타일 */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                bgcolor: surface,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: panelBorder,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: isDark ? '0 12px 24px rgba(0,0,0,0.25)' : '0 10px 20px rgba(15, 23, 42, 0.08)',
              }}
              {...useSwipeable({
                onSwipedLeft: () => handleNextMonth(),
                onSwipedRight: () => handlePrevMonth(),
                trackMouse: true,
              })}
            >
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : (
                renderMonthCalendar(currentCalendarDate)
              )}
            </Box>
          </Box>


          {/* 우측 패널 - 관리자용과 동일하게 30% (flex: 3) */}
          <Box sx={{
            flex: isMobile ? 'none' : 3,
            display: 'flex',
            flexDirection: 'column',
            overflow: isMobile ? 'visible' : 'hidden',
            borderTop: isMobile ? `1px solid ${panelBorder}` : 'none',
            borderLeft: isMobile ? 'none' : `1px solid ${panelBorder}`,
            height: isMobile ? 'auto' : 'auto', // 고정값 제거, Flexbox로 자동 조정
            minHeight: isMobile ? 'auto' : 'none',
            maxHeight: isMobile ? 'none' : 'none', // 모바일에서 높이 제한 제거
            minWidth: isMobile ? 'auto' : '300px', // 최소 너비 보장
          }}>
            {isMyVacationView ? (
              // 부서 휴가 내역 패널
              <Box sx={{ p: isMobile ? 1.5 : 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* 스크롤 가능한 상세내역 영역 */}
                <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                  <Box
                    sx={{
                      p: isMobile ? 1.5 : 2,
                      bgcolor: palette.accentSoft,
                      borderRadius: '12px',
                      mb: isMobile ? 1.5 : 2,
                      border: `1px solid ${panelBorder}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EventNoteIcon sx={{ color: palette.accent, fontSize: isMobile ? 18 : 20 }} />
                      <Typography sx={{ fontSize: isMobile ? '14px' : '18px', fontWeight: 600, color: panelText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {dayjs(selectedDate).format('YYYY년 MM월 DD일 (ddd)')}
                      </Typography>
                    </Box>
                  </Box>

                  {selectedHolidayName && (
                    <Box
                      sx={{
                        mb: isMobile ? 1 : 1.5,
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
                      <Typography sx={{ fontSize: isMobile ? '12px' : '13px', color: panelText, fontWeight: 600 }}>
                        {selectedHolidayName}
                      </Typography>
                    </Box>
                  )}

                  {selectedDateDetails.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: isMobile ? 4 : 8 }}>
                      <CalendarIcon sx={{ fontSize: isMobile ? 48 : 64, color: panelSubText, mb: 1.5 }} />
                      <Typography sx={{ color: panelSubText, fontSize: isMobile ? '13px' : '14px' }}>
                        선택된 날짜에<br />휴가 일정이 없습니다.
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <List sx={{ p: 0, mb: 1 }}>
                        {getPaginatedDetails().map((detail, index) => {
                          const status = detail.status?.toUpperCase() || 'PENDING';
                          const statusColor =
                            status === 'REQUESTED' || status === 'PENDING'
                              ? '#FF8C00'
                              : status === 'APPROVED'
                                ? '#20C997'
                                : status === 'REJECTED'
                                  ? '#DC3545'
                                  : '#6C757D';
                          const halfDaySlot = detail.halfDaySlot || detail.half_day_slot;
                          const usedDays = detail.workdaysCount ?? detail.workdays_count ?? detail.totalDays;

                          return (
                            <Paper
                              key={index}
                              sx={{
                                p: isMobile ? 1 : 1.5,
                                mb: isMobile ? 0.75 : 1,
                                bgcolor: panelBg,
                                border: `1px solid ${panelBorder}`,
                                borderRadius: '14px',
                                boxShadow: isDark ? '0 8px 18px rgba(0,0,0,0.2)' : '0 8px 18px rgba(15, 23, 42, 0.08)',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: isMobile ? 0.5 : 0.75, flexWrap: 'wrap' }}>
                                <Chip
                                  label={
                                    status === 'REQUESTED' || status === 'PENDING'
                                      ? '대기'
                                      : status === 'APPROVED'
                                        ? '승인'
                                        : status === 'REJECTED'
                                          ? '반려'
                                          : '취소'
                                  }
                                  size="small"
                                  sx={{
                                    bgcolor: `${statusColor}1A`,
                                    color: statusColor,
                                    fontSize: isMobile ? '10px' : '11px',
                                    fontWeight: 700,
                                    height: isMobile ? 20 : 22,
                                    border: `1px solid ${statusColor}55`,
                                  }}
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, minWidth: 0 }}>
                                  <Typography sx={{ fontSize: isMobile ? '12px' : '13px', fontWeight: 600, color: panelText, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {detail.vacationType || detail.leaveType || detail.leave_type || '휴가'}
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
                                      <Typography sx={{ fontSize: isMobile ? '10px' : '11px', fontWeight: 600, color: panelText }}>
                                        {halfDaySlot === 'AM' ? '오전반차' : halfDaySlot === 'PM' ? '오후반차' : '반차'}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                                {typeof usedDays === 'number' && (
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
                                    }}
                                  >
                                    <Typography sx={{ fontSize: '10px', fontWeight: 700, color: panelSubText, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                      사용
                                    </Typography>
                                    <Typography sx={{ fontSize: isMobile ? '10px' : '11px', color: panelText, fontWeight: 600 }}>
                                      {usedDays}일
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                              {(detail.name || detail.employeeName) && (
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline', mb: 0.5 }}>
                                  <Typography sx={{ fontSize: '10px', fontWeight: 700, color: panelSubText, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                    이름
                                  </Typography>
                                  <Typography sx={{ fontSize: isMobile ? '11px' : '12px', color: panelText, wordBreak: 'break-word' }}>
                                    {detail.name || detail.employeeName}
                                  </Typography>
                                </Box>
                              )}
                              {(() => {
                                const { cancelReason, mainReason } = parseLeaveReason(detail.reason);
                                return (
                                  <>
                                    {cancelReason && (
                                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline', mb: 0.5 }}>
                                        <Typography sx={{ fontSize: '10px', fontWeight: 700, color: panelSubText, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                          취소사유
                                        </Typography>
                                        <Typography sx={{ fontSize: isMobile ? '11px' : '12px', color: panelText, wordBreak: 'break-word' }}>
                                          {cancelReason}
                                        </Typography>
                                      </Box>
                                    )}
                                    {mainReason && (
                                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline', mb: 0.5 }}>
                                        <Typography sx={{ fontSize: '10px', fontWeight: 700, color: panelSubText, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                          사유
                                        </Typography>
                                        <Typography sx={{ fontSize: isMobile ? '11px' : '12px', color: panelText, wordBreak: 'break-word' }}>
                                          {mainReason}
                                        </Typography>
                                      </Box>
                                    )}
                                  </>
                                );
                              })()}
                              {detail.startDate && detail.endDate && (
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
                                  <Typography sx={{ fontSize: '10px', fontWeight: 700, color: panelSubText, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                    기간
                                  </Typography>
                                  <Typography sx={{ fontSize: isMobile ? '10px' : '11px', color: panelSubText, wordBreak: 'break-word' }}>
                                    {dayjs(detail.startDate).format('YYYY.MM.DD (ddd)')} ~{' '}
                                    {dayjs(detail.endDate).format('YYYY.MM.DD (ddd)')}
                                    {halfDaySlot === 'ALL' && ' (종일)'}
                                  </Typography>
                                </Box>
                              )}
                            </Paper>
                          );
                        })}
                      </List>

                      {/* 페이지네이션 */}
                      {getDetailTotalPages() > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 1, borderTop: `1px solid ${panelBorder}`, pt: 1 }}>
                          <Pagination
                            count={getDetailTotalPages()}
                            page={detailPage}
                            onChange={(_, page) => setDetailPage(page)}
                            color="primary"
                            size="small"
                            siblingCount={0}
                            boundaryCount={1}
                          />
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              </Box>
            ) : (
              // 부서 휴가 현황 패널
              <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden', position: 'relative', flexDirection: isMobile ? 'column' : 'row' }}>
                {/* 부서 선택 패널 */}
                <Box
                  sx={{
                    width: isDetailPanelVisible && !isMobile ? 0 : '100%',
                    height: isMobile && isDetailPanelVisible ? 0 : 'auto',
                    overflow: 'hidden',
                    transition: isMobile ? 'height 0.3s ease-in-out' : 'width 0.3s ease-in-out',
                    borderRight: isMobile ? 'none' : `1px solid ${panelBorder}`,
                    borderBottom: isMobile ? `1px solid ${panelBorder}` : 'none',
                  }}
                >
                  <Box sx={{
                    p: isMobile ? 1.5 : 2.5,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                  }}>
                    {/* 헤더 (상단 고정) */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        pb: isMobile ? 1 : 1.5,
                        borderBottom: `1px solid ${panelBorder}`,
                        flexShrink: 0,
                      }}
                    >
                      <Box
                        sx={{
                          p: isMobile ? 0.5 : 0.75,
                          bgcolor: palette.accentSoft,
                          borderRadius: '10px',
                          flexShrink: 0,
                        }}
                      >
                        <GroupsIcon sx={{ color: palette.accent, fontSize: isMobile ? 16 : 18 }} />
                      </Box>
                      <Typography sx={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        부서 선택
                      </Typography>
                    </Box>

                    {/* 부서 목록 (중간 스크롤 영역) */}
                    <Box sx={{
                      flex: 1,
                      overflow: 'auto',
                      my: isMobile ? 1.5 : 2,
                      minHeight: 0,
                    }}>
                      {isDepartmentDataLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                          <CircularProgress size={24} />
                        </Box>
                      ) : departmentEmployees.size === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography sx={{ color: panelSubText }}>
                            부서 데이터를 불러오는 중...<br />또는 휴가 일정이 없습니다.
                          </Typography>
                        </Box>
                      ) : (
                        <Box>
                          {Array.from(departmentEmployees.keys())
                            .sort()
                            .map(deptName => {
                              const employees = departmentEmployees.get(deptName) || [];
                              const isDeptSelected = selectedDepartments.has(deptName);
                              const isExpanded = expandedDepartments.has(deptName);

                              return (
                                <Paper
                                  key={deptName}
                                  sx={{
                                    mb: isMobile ? 0.75 : 1,
                                    bgcolor: isDeptSelected
                                      ? 'rgba(59, 130, 246, 0.12)'
                                      : (isDark ? '#0B1220' : '#F8FAFC'),
                                    border: `1.5px solid ${isDeptSelected
                                      ? 'rgba(59, 130, 246, 0.35)'
                                      : (isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0')
                                      }`,
                                    borderRadius: '14px',
                                  }}
                                >
                                  {/* 부서 헤더 */}
                                  <Box sx={{ display: 'flex' }}>
                                    <Box
                                      onClick={() => toggleDepartmentSelection(deptName)}
                                      sx={{
                                        p: isMobile ? 1 : 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        borderRight: `1px solid ${panelBorder}`,
                                        flexShrink: 0,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          width: isMobile ? 18 : 20,
                                          height: isMobile ? 18 : 20,
                                          border: '2px solid',
                                          borderColor: isDeptSelected ? palette.accent : (isDark ? '#334155' : '#CBD5E1'),
                                          bgcolor: isDeptSelected ? palette.accent : 'transparent',
                                          borderRadius: '4px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}
                                      >
                                        {isDeptSelected && (
                                          <CheckCircleOutlineIcon sx={{ fontSize: isMobile ? 12 : 14, color: 'white' }} />
                                        )}
                                      </Box>
                                    </Box>
                                    <Box
                                      onClick={() => toggleDepartmentExpansion(deptName)}
                                      sx={{
                                        flex: 1,
                                        p: isMobile ? 1 : 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        minWidth: 0,
                                      }}
                                    >
                                      <BusinessCenterIcon
                                        sx={{ fontSize: isMobile ? 14 : 16, color: panelSubText, mr: isMobile ? 1 : 1.5, flexShrink: 0 }}
                                      />
                                      <Box sx={{ flex: 1, minWidth: 0 }}>
                                          <Typography
                                            sx={{
                                              fontSize: isMobile ? '13px' : '14px',
                                              fontWeight: 600,
                                              color: isDeptSelected ? palette.accent : panelText,
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap',
                                            }}
                                          >
                                          {deptName}
                                        </Typography>
                                        <Typography sx={{ fontSize: isMobile ? '11px' : '12px', color: panelSubText }}>
                                          {employees.length}명
                                        </Typography>
                                      </Box>
                                      {isExpanded ? (
                                        <ExpandLessIcon sx={{ color: panelSubText, fontSize: isMobile ? 18 : 20, flexShrink: 0 }} />
                                      ) : (
                                        <ExpandMoreIcon sx={{ color: panelSubText, fontSize: isMobile ? 18 : 20, flexShrink: 0 }} />
                                      )}
                                    </Box>
                                  </Box>

                                  {/* 직원 목록 */}
                                  <Collapse in={isExpanded}>
                                    <Box>
                                      {employees.map(employeeName => {
                                        // 이름과 부서를 함께 확인하여 동명이인 문제 해결
                                        const employeeKey = `${employeeName}|${deptName}`;
                                        const isEmpSelected = selectedEmployees.has(employeeKey);
                                        return (
                                          <Box
                                            key={employeeKey}
                                            onClick={() => toggleEmployeeSelection(employeeName, deptName)}
                                            sx={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              p: isMobile ? 0.75 : 1,
                                              pl: isMobile ? 3 : 4,
                                              cursor: 'pointer',
                                              bgcolor: isEmpSelected
                                                ? 'rgba(59, 130, 246, 0.08)'
                                                : 'transparent',
                                              '&:hover': {
                                                bgcolor: 'rgba(59, 130, 246, 0.08)',
                                              },
                                            }}
                                          >
                                            <Box
                                              sx={{
                                                width: isMobile ? 14 : 16,
                                                height: isMobile ? 14 : 16,
                                                border: '1.5px solid',
                                                borderColor: isEmpSelected ? palette.accent : (isDark ? '#334155' : '#CBD5E1'),
                                                bgcolor: isEmpSelected ? palette.accent : 'transparent',
                                                borderRadius: '3px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 0.75,
                                                flexShrink: 0,
                                              }}
                                            >
                                              {isEmpSelected && (
                                                <CheckCircleOutlineIcon
                                                  sx={{ fontSize: isMobile ? 9 : 10, color: 'white' }}
                                                />
                                              )}
                                            </Box>
                                            <PersonIcon sx={{ fontSize: isMobile ? 14 : 16, color: panelSubText, mr: 0.75, flexShrink: 0 }} />
                                            <Typography
                                              sx={{
                                                fontSize: isMobile ? '12px' : '13px',
                                                color: isEmpSelected ? palette.accent : panelText,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                flex: 1,
                                              }}
                                            >
                                              {employeeName}
                                            </Typography>
                                          </Box>
                                        );
                                      })}
                                    </Box>
                                  </Collapse>
                                </Paper>
                              );
                            })}
                        </Box>
                      )}
                    </Box>

                    {/* 전체 선택/해제 버튼 (하단 고정) */}
                    {departmentEmployees.size > 0 && (
                      <Box sx={{
                        display: 'flex',
                        gap: isMobile ? 1 : 1.5,
                        pt: isMobile ? 1 : 1.5,
                        borderTop: `1px solid ${panelBorder}`,
                        flexShrink: 0,
                      }}>
                        <Button
                          startIcon={<CheckCircleOutlineIcon sx={{ fontSize: isMobile ? 16 : 18 }} />}
                          onClick={handleSelectAll}
                          fullWidth
                          variant="contained"
                          size={isMobile ? 'small' : 'medium'}
                          sx={{
                            bgcolor: '#10B981',
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: isMobile ? '12px' : '14px',
                          }}
                        >
                          전체 선택
                        </Button>
                        <Button
                          startIcon={<RemoveCircleOutlineIcon sx={{ fontSize: isMobile ? 16 : 18 }} />}
                          onClick={handleSelectNone}
                          fullWidth
                          variant="outlined"
                          size={isMobile ? 'small' : 'medium'}
                          sx={{
                            borderColor: isDark ? '#334155' : '#CBD5E1',
                            color: panelSubText,
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: isMobile ? '12px' : '14px',
                          }}
                        >
                          선택 해제
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* 상세 패널 */}
                <Box
                  sx={{
                    width: isDetailPanelVisible && !isMobile ? '100%' : isMobile ? '100%' : 0,
                    height: isMobile && isDetailPanelVisible ? 'auto' : isMobile ? 0 : 'auto',
                    overflow: 'hidden',
                    transition: isMobile ? 'height 0.3s ease-in-out' : 'width 0.3s ease-in-out',
                    bgcolor: panelBg,
                    boxShadow: isMobile ? (isDark ? '0 -2px 10px rgba(0,0,0,0.4)' : '0 -2px 10px rgba(0,0,0,0.1)') : (isDark ? '-2px 0 10px rgba(0,0,0,0.4)' : '-2px 0 10px rgba(0,0,0,0.1)'),
                    borderTop: isMobile ? `1px solid ${panelBorder}` : 'none',
                  }}
                >
                  <Box sx={{ p: isMobile ? 1 : 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* 패널 헤더 */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: isMobile ? 1 : 2,
                        pb: isMobile ? 1 : 2,
                        borderBottom: `1px solid ${panelBorder}`,
                        flexShrink: 0,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flex: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            p: isMobile ? 0.5 : 0.75,
                            bgcolor: palette.accentSoft,
                            borderRadius: '10px',
                            flexShrink: 0,
                          }}
                        >
                          <EventNoteIcon sx={{ color: palette.accent, fontSize: isMobile ? 14 : 16 }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 600, color: panelText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            휴가 상세 내역
                          </Typography>
                          <Typography sx={{ fontSize: isMobile ? '11px' : '12px', color: panelSubText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {dayjs(selectedDate).format('YYYY년 MM월 DD일 (ddd)')}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        onClick={() => setIsDetailPanelVisible(false)}
                        size="small"
                        sx={{
                          flexShrink: 0,
                          width: isMobile ? 36 : 40,
                          height: isMobile ? 36 : 40,
                          borderRadius: '10px',
                          border: `1px solid ${panelBorder}`,
                          bgcolor: panelBg,
                          '&:hover': {
                            bgcolor: palette.accentHover,
                          },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: isMobile ? 20 : 22 }} />
                      </IconButton>
                    </Box>

                    {/* 스크롤 가능한 상세내역 영역 */}
                    <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                      {selectedHolidayName && (
                        <Box
                          sx={{
                            mb: isMobile ? 1 : 1.5,
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
                          <Typography sx={{ fontSize: isMobile ? '12px' : '13px', color: panelText, fontWeight: 600 }}>
                            {selectedHolidayName}
                          </Typography>
                        </Box>
                      )}
                      {/* 상세 내용 */}
                      {selectedDateDetails.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: isMobile ? 4 : 8 }}>
                          <CalendarIcon sx={{ fontSize: isMobile ? 36 : 48, color: panelSubText, mb: 1 }} />
                          <Typography sx={{ color: panelSubText, fontSize: isMobile ? '12px' : '14px' }}>
                            선택된 날짜에<br />휴가 일정이 없습니다.
                          </Typography>
                        </Box>
                      ) : (
                        <>
                          <List sx={{ p: 0, mb: 1 }}>
                            {getPaginatedDetails().map((detail, index) => {
                              const halfDaySlot = detail.halfDaySlot || detail.half_day_slot;
                              const usedDays = detail.workdaysCount ?? detail.workdays_count ?? detail.totalDays;
                              return (
                              <Paper
                                key={index}
                                sx={{
                                  p: isMobile ? 1 : 2,
                                  mb: isMobile ? 0.75 : 1.5,
                                  bgcolor: panelBg,
                                  border: `1px solid ${panelBorder}`,
                                  borderRadius: '14px',
                                  boxShadow: isDark ? '0 10px 22px rgba(0,0,0,0.2)' : '0 10px 22px rgba(15, 23, 42, 0.08)',
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: isMobile ? 0.75 : 1, flexWrap: 'wrap' }}>
                                  <Typography sx={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
                                    {detail.employeeName || detail.name || '신청자'}
                                  </Typography>
                                  {detail.department && (
                                    <Typography sx={{ fontSize: isMobile ? '11px' : '12px', color: panelSubText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      ({detail.department})
                                    </Typography>
                                  )}
                                  <Chip
                                    label={detail.vacationType}
                                    size="small"
                                    sx={{
                                      bgcolor: palette.accentSoft,
                                      color: palette.accent,
                                      fontSize: isMobile ? '10px' : '11px',
                                      fontWeight: 600,
                                      height: isMobile ? 20 : 24,
                                      border: `1px solid ${palette.border}`,
                                    }}
                                  />
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
                                      <Typography sx={{ fontSize: isMobile ? '10px' : '11px', fontWeight: 600, color: panelText }}>
                                        {halfDaySlot === 'AM' ? '오전반차' : halfDaySlot === 'PM' ? '오후반차' : '반차'}
                                      </Typography>
                                    </Box>
                                  )}
                                  {typeof usedDays === 'number' && (
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
                                      }}
                                    >
                                      <Typography sx={{ fontSize: '10px', fontWeight: 700, color: panelSubText, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                        사용
                                      </Typography>
                                      <Typography sx={{ fontSize: isMobile ? '10px' : '11px', color: panelText, fontWeight: 600 }}>
                                        {usedDays}일
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                                {detail.startDate && detail.endDate && (
                                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
                                    <Typography sx={{ fontSize: '10px', fontWeight: 700, color: panelSubText, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                      기간
                                    </Typography>
                                    <Typography sx={{ fontSize: isMobile ? '12px' : '13px', fontWeight: 600, color: panelText, wordBreak: 'break-word' }}>
                                      {dayjs(detail.startDate).format('YYYY.MM.DD (ddd)')} ~{' '}
                                      {dayjs(detail.endDate).format('YYYY.MM.DD (ddd)')}
                                      {halfDaySlot === 'ALL' && ' (종일)'}
                                    </Typography>
                                  </Box>
                                )}
                              </Paper>
                            );
                            })}
                          </List>

                          {/* 상세내역 페이지네이션 */}
                          {getDetailTotalPages() > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 1, borderTop: `1px solid ${panelBorder}`, pt: 1 }}>
                              <Pagination
                                count={getDetailTotalPages()}
                                page={detailPage}
                                onChange={(_, page) => setDetailPage(page)}
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
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      {/* 년월 선택 다이얼로그 */}
      <Dialog
        open={yearMonthDialogOpen}
        onClose={handleYearMonthCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          연도 및 월 선택
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <Typography sx={{ mb: 1, fontWeight: 500 }}>연도</Typography>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i; // 현재 연도 ±2년
                  return (
                    <MenuItem key={year} value={year}>
                      {year}년
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <Typography sx={{ mb: 1, fontWeight: 500 }}>월</Typography>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>
                    {i + 1}월
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleYearMonthCancel}>취소</Button>
          <Button onClick={handleYearMonthConfirm} variant="contained">
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

  // embedded 모드: Dialog 없이 Box로 감싸서 반환
  if (embedded) {
    return (
      <Box
        sx={{
          width: '100%',
          height: isMobile ? 'auto' : '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: isMobile ? 'visible' : 'hidden',
          bgcolor: surface,
        }}
      >
        {renderContent()}
      </Box>
    );
  }

  // 일반 모드: Dialog로 감싸서 반환
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          maxHeight: isMobile ? '100%' : '90vh',
          height: isMobile ? '100%' : '90vh',
          width: isMobile ? '100%' : '90vw',
          maxWidth: isMobile ? '100%' : '90vw',
          borderRadius: isMobile ? 0 : '20px',
          m: isMobile ? 0 : 0, // 관리자용과 동일하게 여백 제거
          bgcolor: surface,
          border: `1px solid ${panelBorder}`,
          boxShadow: isDark ? '0 24px 48px rgba(0,0,0,0.45)' : '0 24px 48px rgba(15, 23, 42, 0.18)',
        },
      }}
    >
      {renderContent()}
    </Dialog>
  );
}
