/**
 * 휴가 신청 초안 패널
 * Flutter의 leave_draft_modal.dart 100% 동일 구현
 */
import {
  Box,
  Dialog,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Checkbox,
  FormControlLabel,
  Button,
  Chip,
  Radio,
  RadioGroup,
  Collapse,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  BeachAccess as BeachAccessIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  EventNote as EventNoteIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  HowToReg as HowToRegIcon,
  PersonAdd as PersonAddIcon,
  FormatListNumbered as FormatListNumberedIcon,
  Save as SaveIcon,
  OpenInFull as OpenInFullIcon,
} from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';
import { useThemeStore } from '../../store/themeStore';
import ApproverSelectionModal from './ApproverSelectionModal';
import ReferenceSelectionModal from './ReferenceSelectionModal';
import { useLeaveRequestDraftPanelState } from './LeaveRequestDraftPanel.state';

export default function LeaveRequestDraftPanel() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px = 모바일
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme.name === 'Dark';
  const twPanelBg = isDark ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255,255,255,0.96)';
  const twPanelBorder = isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(148, 163, 184, 0.18)';
  const twInputBg = isDark ? 'rgba(148,163,184,0.08)' : 'rgba(248,250,252,0.95)';
  const twSurface = isDark ? 'rgba(148,163,184,0.06)' : '#F8FAFC';
  const twHintText = isDark ? colorScheme.hintTextColor : '#111827';
  const twBlue = isDark ? '#E2E8F0' : '#475569';
  const twBlueHover = isDark ? '#F8FAFC' : '#334155';
  const twBlueSoft = isDark ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.10)';
  const twGreen = twBlue;
  const twGreenHover = twBlueHover;
  const twGreenSoft = twBlueSoft;
  const twIconBtnSx = {
    color: twHintText,
    border: `1px solid ${twPanelBorder}`,
    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)',
    borderRadius: '12px',
    transition: 'all 160ms ease-out',
    '&:hover': {
      bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.05)',
      color: twBlue,
      borderColor: isDark ? 'rgba(226,232,240,0.20)' : 'rgba(15,23,42,0.12)',
      transform: 'translateY(-1px)',
    },
  } as const;
  const twFormAreaSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: twInputBg,
      transition: 'all 160ms ease-out',
      '& fieldset': { borderColor: twPanelBorder },
      '&:hover fieldset': { borderColor: isDark ? 'rgba(148,163,184,0.28)' : 'rgba(100,116,139,0.24)' },
      '&.Mui-focused': {
        boxShadow: isDark ? '0 0 0 3px rgba(226,232,240,0.14)' : '0 0 0 3px rgba(15,23,42,0.08)',
      },
      '&.Mui-focused fieldset': { borderColor: isDark ? 'rgba(226,232,240,0.32)' : 'rgba(15,23,42,0.22)' },
    },
    '& .MuiInputLabel-root': {
      fontSize: '12px',
      fontWeight: 600,
      color: twHintText,
    },
    '& .MuiButton-root': {
      borderRadius: '12px',
      textTransform: 'none',
      fontWeight: 600,
      boxShadow: 'none',
    },
    '& .MuiChip-root': {
      borderRadius: '999px',
      border: `1px solid ${twPanelBorder}`,
    },
  } as const;
  const { state, actions } = useLeaveRequestDraftPanelState();
  const {
    isOpen,
    isLoading,
    formData,
    isLeaveBalanceExpanded,
    isSequentialApproval,
    useNextYear,
    halfDay,
    halfDayPeriod,
    userName,
    leaveStatusList,
    nextYearLeaveStatus,
    isApproverModalOpen,
    isReferenceModalOpen,
  } = state;
  const {
    closePanel,
    updateFormData,
    toggleLeaveBalance,
    setSequentialApproval,
    setHalfDay,
    setHalfDayPeriod,
    setIsApproverModalOpen,
    setIsReferenceModalOpen,
    handleApproverConfirm,
    handleReferenceConfirm,
    handleSaveApprovalLine,
    handleSubmit,
    handleNextYearCheckbox,
  } = actions;

  const [isMinimized, setIsMinimized] = useState(false);
  const reasonDraftRef = useRef('');
  const reasonInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!formData) return;
    const nextReason = formData.reason || '';
    reasonDraftRef.current = nextReason;
    if (reasonInputRef.current && reasonInputRef.current.value !== nextReason) {
      reasonInputRef.current.value = nextReason;
    }
  }, [formData]);

  if (!isOpen || !formData) {
    return null;
  }

  // 최소화된 상태 렌더링
  if (isMinimized) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          '@keyframes popIn': {
            from: { opacity: 0, transform: 'scale(0.5)' },
            to: { opacity: 1, transform: 'scale(1)' },
          },
        }}
      >
        <Box
          sx={{
            bgcolor: colorScheme.surfaceColor,
            borderRadius: '28px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            pr: 1,
            pl: 3,
            py: 1,
            gap: 2,
            border: `1px solid ${colorScheme.textFieldBorderColor}`,
            cursor: 'pointer',
          }}
          onClick={() => setIsMinimized(false)}
        >
          <Typography sx={{ fontWeight: 600, color: colorScheme.textColor }}>
            휴가 초안 작성 중...
          </Typography>
          <IconButton
            size="small"
            sx={{
              bgcolor: twBlueSoft,
              color: twBlue,
              border: `1px solid ${isDark ? 'rgba(226,232,240,0.20)' : 'rgba(15,23,42,0.12)'}`,
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.08)' },
            }}
          >
            <OpenInFullIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Dialog
        open
        onClose={closePanel}
        fullScreen={isMobile}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: isMobile ? '100%' : '60%',
            minWidth: isMobile ? 'unset' : '600px',
            maxWidth: isMobile ? 'unset' : '800px',
            height: isMobile ? 'var(--app-height)' : '90vh',
            bgcolor: twPanelBg,
            backdropFilter: 'blur(14px)',
            border: `1px solid ${twPanelBorder}`,
            borderRadius: isMobile ? 0 : '20px',
            boxShadow: isDark ? '0 24px 60px rgba(2,6,23,0.55)' : '0 24px 60px rgba(15,23,42,0.14)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* 헤더 */}
          <Box
            sx={{
              px: 2.25,
              py: 1.75,
              borderBottom: `1px solid ${twPanelBorder}`,
              bgcolor: isDark ? 'rgba(15,23,42,0.75)' : 'rgba(255,255,255,0.78)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexShrink: 0,
            }}
          >
            {/* 아이콘 컨테이너 */}
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                bgcolor: isDark ? 'rgba(59, 130, 246, 0.16)' : 'rgba(59, 130, 246, 0.10)',
                border: `1px solid ${isDark ? 'rgba(96,165,250,0.18)' : 'rgba(96,165,250,0.14)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BeachAccessIcon sx={{ fontSize: 20, color: twBlue }} />
            </Box>

            {/* 제목 */}
            <Typography
              sx={{
                fontSize: '19px',
                fontWeight: 700,
                color: colorScheme.textColor,
                flex: 1,
              }}
            >
              휴가 상신 초안
            </Typography>

            {/* 접기 버튼 */}
            <Tooltip title="접어두기">
              <IconButton
                size="small"
                onClick={() => setIsMinimized(true)}
                sx={twIconBtnSx}
              >
                <ChevronRightIcon />
              </IconButton>
            </Tooltip>

            {/* 닫기 버튼 */}
            <Tooltip title="닫기">
              <IconButton
                size="small"
                onClick={closePanel}
                sx={twIconBtnSx}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* 바디 - 스크롤 가능 */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              p: 2.25,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              ...twFormAreaSx,
              '&::-webkit-scrollbar': { width: 8 },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: isDark ? 'rgba(148,163,184,0.28)' : 'rgba(148,163,184,0.45)',
                borderRadius: 999,
              },
            }}
          >
            {/* 1. 휴가 현황 섹션 (Collapsible) */}
            <Box
              sx={{
                bgcolor: twSurface,
                borderRadius: '14px',
                border: `1px solid ${twPanelBorder}`,
                boxShadow: isDark ? 'none' : '0 1px 2px rgba(15,23,42,0.03)',
              }}
            >
              {/* 헤더 */}
              <Box
                sx={{
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.02)',
                  },
                }}
                onClick={toggleLeaveBalance}
              >
                <EventNoteIcon sx={{ fontSize: 16, color: twBlue }} />
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: colorScheme.textColor, flex: 1 }}>
                  내 휴가 현황
                </Typography>
                <IconButton size="small">
                  {isLeaveBalanceExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              {/* 내용 */}
              <Collapse in={isLeaveBalanceExpanded}>
                <Box sx={{ px: 1.5, pb: 2 }}>
                  {leaveStatusList && leaveStatusList.length > 0 ? (
                    leaveStatusList.map((status, index) => {
                      const leaveType = status.leaveType || (status as any).leave_type;
                      const remainDays = status.remainDays ?? (status as any).remain_days ?? 0;
                      const totalDays = status.totalDays ?? (status as any).total_days ?? 0;

                      return (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            py: 0.5,
                          }}
                        >
                          <Typography sx={{ fontSize: '12px', color: twHintText }}>
                            {leaveType}
                          </Typography>
                          <Typography sx={{ fontSize: '12px', fontWeight: 600 }}>
                            <Typography component="span" sx={{ fontSize: '12px', color: twHintText }}>
                              남은 일수{' '}
                            </Typography>
                            <Typography
                              component="span"
                              sx={{ fontSize: '12px', fontWeight: 700, color: twBlue }}
                            >
                              {remainDays.toFixed(1)}일
                            </Typography>
                            <Typography component="span" sx={{ fontSize: '12px', color: twHintText }}>
                              {' / 허용 일수 '}
                            </Typography>
                            <Typography
                              component="span"
                              sx={{ fontSize: '12px', fontWeight: 700, color: twBlue }}
                            >
                              {totalDays.toFixed(1)}일
                            </Typography>
                          </Typography>
                        </Box>
                      );
                    })
                  ) : (
                    <Typography sx={{ fontSize: '12px', color: twHintText, textAlign: 'center', py: 2 }}>
                      휴가 정보 없음
                    </Typography>
                  )}
                </Box>
              </Collapse>
            </Box>

            {/* 2. 기본 정보 섹션 */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '16px', fontWeight: 700, color: colorScheme.textColor }}>
                  📝 기본 정보
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={useNextYear}
                      onChange={(e) => handleNextYearCheckbox(e.target.checked)}
                      sx={{ color: twBlue }}
                    />
                  }
                  label={<Typography sx={{ fontSize: '14px' }}>내년 정기휴가 사용하기</Typography>}
                />
              </Box>

              {/* 신청자명 */}
              <TextField
                fullWidth
                label="신청자명"
                value={userName || ''}
                disabled
                size="small"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8F9FA',
                    fontSize: '14px',
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '12px',
                    fontWeight: 500,
                  },
                }}
              />

              {/* 휴가종류 */}
              <FormControl fullWidth size="small">
                <Typography
                  sx={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: colorScheme.textColor,
                    mb: 0.5,
                  }}
                >
                  휴가종류 *
                </Typography>
                <Select
                  value={formData.leaveType}
                  onChange={(e) => updateFormData({ leaveType: e.target.value })}
                  sx={{
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8F9FA',
                    fontSize: '14px',
                    borderRadius: '8px',
                  }}
                >
                  {useNextYear && nextYearLeaveStatus.length > 0
                    ? // 내년 정기휴가 체크 시: 내년 휴가 + 남은일수/허용일수 표시
                    nextYearLeaveStatus.map((status) => (
                      <MenuItem key={status.leaveType} value={status.leaveType}>
                        {status.leaveType} (남은일수: {status.remainDays}일 / 허용일수: {status.totalDays}일)
                      </MenuItem>
                    ))
                    : leaveStatusList.length > 0
                      ? // 일반 모드: 휴가 현황에서 가져온 휴가 종류 표시
                      leaveStatusList.map((status) => (
                        <MenuItem key={status.leaveType} value={status.leaveType}>
                          {status.leaveType} (잔여: {status.remainDays}일)
                        </MenuItem>
                      ))
                      : // API 실패 시 빈 값 표시
                      []
                  }
                </Select>
              </FormControl>
            </Box>

            {/* 3. 휴가 상세 섹션 */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '16px', fontWeight: 700, color: colorScheme.textColor }}>
                  📅 휴가 상세
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={halfDay}
                      onChange={(e) => setHalfDay(e.target.checked)}
                      sx={{ color: twBlue }}
                    />
                  }
                  label={<Typography sx={{ fontSize: '14px' }}>반차 사용</Typography>}
                />
              </Box>

              {/* 날짜 선택 */}
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                <TextField
                  fullWidth
                  label="시작일 *"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateFormData({ startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{
                    flex: 2,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8F9FA',
                      fontSize: '14px',
                      borderRadius: '8px',
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '12px',
                      fontWeight: 500,
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="종료일 *"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => updateFormData({ endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{
                    flex: 2,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8F9FA',
                      fontSize: '14px',
                      borderRadius: '8px',
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '12px',
                      fontWeight: 500,
                    },
                  }}
                />
              </Box>

              {/* 반차 선택 */}
              {halfDay && (
                <Box sx={{ mb: 2, p: 1.5, bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8F9FA', borderRadius: '8px' }}>
                  <RadioGroup
                    row
                    value={halfDayPeriod}
                    onChange={(e) => setHalfDayPeriod(e.target.value as 'AM' | 'PM')}
                    sx={{ gap: 1.5 }}
                  >
                    <FormControlLabel value="AM" control={<Radio size="small" />} label="오전반차" />
                    <FormControlLabel value="PM" control={<Radio size="small" />} label="오후반차" />
                  </RadioGroup>
                </Box>
              )}

              {/* 휴가사유 */}
              <TextField
                fullWidth
                label="휴가사유"
                multiline
                rows={6}
                defaultValue={formData.reason || ''}
                inputRef={reasonInputRef}
                onChange={(e) => {
                  reasonDraftRef.current = e.target.value;
                }}
                onBlur={() => {
                  const nextReason = reasonDraftRef.current;
                  if (nextReason !== (formData.reason || '')) {
                    updateFormData({ reason: nextReason });
                  }
                }}
                placeholder="휴가 사유를 입력하세요"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8F9FA',
                    fontSize: '14px',
                    borderRadius: '8px',
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '12px',
                    fontWeight: 500,
                  },
                }}
              />
            </Box>

            {/* 4. 승인자/참조자 섹션 */}
            <Box>
              <Typography sx={{ fontSize: '15px', fontWeight: 700, color: colorScheme.textColor, mb: 2, letterSpacing: '-0.01em' }}>
                👥 승인자 및 참조자
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                {/* 승인자 */}
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '14px', fontWeight: 600, color: colorScheme.textColor, mb: 1 }}>
                    승인자
                  </Typography>

                  {/* 승인자 선택 버튼들 */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<HowToRegIcon sx={{ fontSize: 16 }} />}
                      onClick={() => {
                        setSequentialApproval(false);
                        setIsApproverModalOpen(true);
                      }}
                      sx={{
                        flex: 1,
                        bgcolor: twBlueSoft,
                        color: twBlue,
                        border: `1px solid ${isDark ? 'rgba(96,165,250,0.22)' : 'rgba(96,165,250,0.16)'}`,
                        '&:hover': { bgcolor: isDark ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.12)', color: twBlueHover },
                        fontSize: '12px',
                        textTransform: 'none',
                      }}
                    >
                      승인자 선택
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<FormatListNumberedIcon sx={{ fontSize: 16 }} />}
                      onClick={() => {
                        setSequentialApproval(true);
                        setIsApproverModalOpen(true);
                      }}
                      sx={{
                        flex: 1,
                        bgcolor: twGreenSoft,
                        color: twGreen,
                        border: `1px solid ${isDark ? 'rgba(52,211,153,0.22)' : 'rgba(16,185,129,0.16)'}`,
                        '&:hover': { bgcolor: isDark ? 'rgba(16,185,129,0.18)' : 'rgba(16,185,129,0.12)', color: twGreenHover },
                        fontSize: '12px',
                        textTransform: 'none',
                      }}
                    >
                      순차결재
                    </Button>
                  </Box>

                  {/* 승인자 표시 영역 */}
                  <Box
                    sx={{
                      minHeight: 80,
                      p: 2,
                      bgcolor: twSurface,
                      borderRadius: '14px',
                      border: `1px solid ${twPanelBorder}`,
                    }}
                  >
                    {formData.approvalLine && formData.approvalLine.length > 0 ? (
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                          <HowToRegIcon sx={{ fontSize: 16, color: twBlue }} />
                          <Typography sx={{ fontSize: '11px', fontWeight: 600, color: colorScheme.textColor }}>
                            선택된 승인자 ({formData.approvalLine.length}명)
                            {isSequentialApproval && ' (순차결재)'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                          {formData.approvalLine.map((approver, idx) => (
                            <Chip
                              key={idx}
                              label={`${isSequentialApproval ? `${idx + 1}. ` : ''}${approver.approverName}`}
                              size="small"
                              sx={{
                                bgcolor: twBlueSoft,
                                color: twBlue,
                                border: `1px solid ${isDark ? 'rgba(96,165,250,0.18)' : 'rgba(96,165,250,0.14)'}`,
                                fontSize: '10px',
                                fontWeight: 500,
                                height: 24,
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 1 }}>
                        <HowToRegIcon sx={{ fontSize: 20, color: twBlue, mb: 0.5 }} />
                        <Typography sx={{ fontSize: '12px', color: twHintText }}>승인자 선택</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* 참조자 */}
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '14px', fontWeight: 600, color: colorScheme.textColor, mb: 1 }}>
                    참조자
                  </Typography>

                  <Button
                    variant="contained"
                    fullWidth
                    size="small"
                    startIcon={<PersonAddIcon sx={{ fontSize: 16 }} />}
                    onClick={() => setIsReferenceModalOpen(true)}
                    sx={{
                      bgcolor: twGreenSoft,
                      color: twGreen,
                      border: `1px solid ${isDark ? 'rgba(52,211,153,0.22)' : 'rgba(16,185,129,0.16)'}`,
                      '&:hover': { bgcolor: isDark ? 'rgba(16,185,129,0.18)' : 'rgba(16,185,129,0.12)', color: twGreenHover },
                      fontSize: '12px',
                      textTransform: 'none',
                      mb: 1,
                    }}
                  >
                    참조자 선택
                  </Button>

                  {/* 참조자 표시 영역 */}
                  <Box
                    sx={{
                      minHeight: 80,
                      p: 2,
                      bgcolor: twSurface,
                      borderRadius: '14px',
                      border: `1px solid ${twPanelBorder}`,
                    }}
                  >
                    {formData.ccList && formData.ccList.length > 0 ? (
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                          <PersonAddIcon sx={{ fontSize: 16, color: twGreen }} />
                          <Typography sx={{ fontSize: '11px', fontWeight: 600, color: colorScheme.textColor }}>
                            선택된 참조자 ({formData.ccList.length}명)
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                          {formData.ccList.map((cc, idx) => (
                            <Chip
                              key={idx}
                              label={cc.name}
                              size="small"
                              sx={{
                                bgcolor: twGreenSoft,
                                color: twGreen,
                                border: `1px solid ${isDark ? 'rgba(52,211,153,0.18)' : 'rgba(16,185,129,0.14)'}`,
                                fontSize: '10px',
                                fontWeight: 500,
                                height: 24,
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 1 }}>
                        <PersonAddIcon sx={{ fontSize: 20, color: twGreen, mb: 0.5 }} />
                        <Typography sx={{ fontSize: '12px', color: twHintText }}>참조자 선택</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* 푸터 - 버튼들 */}
          <Box
            sx={{
              p: 2.25,
              borderTop: `1px solid ${twPanelBorder}`,
              bgcolor: isDark ? 'rgba(15,23,42,0.72)' : 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              flexShrink: 0,
              // iOS 홈 인디케이터 / Android 제스처 바 위에 버튼이 가리지 않도록
              pb: isMobile ? 'max(env(safe-area-inset-bottom), 16px)' : 2,
            }}
          >
            {/* 결재라인 저장 버튼 */}
            <Button
              variant="outlined"
              fullWidth
              startIcon={<SaveIcon sx={{ fontSize: 20 }} />}
              onClick={handleSaveApprovalLine}
              sx={{
                color: twBlue,
                borderColor: isDark ? 'rgba(96,165,250,0.24)' : 'rgba(96,165,250,0.22)',
                fontSize: '16px',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '14px',
                py: 1,
                '&:hover': {
                  borderColor: isDark ? 'rgba(96,165,250,0.34)' : 'rgba(96,165,250,0.28)',
                  bgcolor: twBlueSoft,
                },
              }}
            >
              휴가 상신용 결재라인 저장
            </Button>

            {/* 휴가 상신 버튼 */}
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                const nextReason = reasonDraftRef.current;
                if (nextReason !== (formData.reason || '')) {
                  updateFormData({ reason: nextReason });
                }
                handleSubmit(nextReason);
              }}
              disabled={isLoading}
              sx={{
                bgcolor: twBlue,
                fontSize: '16px',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '14px',
                py: 1,
                '&:hover': {
                  bgcolor: twBlueHover,
                },
              }}
            >
              {isLoading ? '신청 중...' : '휴가 상신'}
            </Button>
          </Box>

          {/* 로딩 오버레이 */}
          {isLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '16px',
                zIndex: 10,
              }}
            >
              <Box
                sx={{
                  bgcolor: colorScheme.surfaceColor,
                  p: 2.5,
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  textAlign: 'center',
                  minWidth: 200,
                }}
              >
                {/* 로딩 스피너 */}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    border: '3px solid',
                    borderColor: isDark ? 'rgba(74, 108, 247, 0.3)' : 'rgba(74, 108, 247, 0.2)',
                    borderTopColor: twBlue,
                    borderRadius: '50%',
                    margin: '0 auto 12px',
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                      to: { transform: 'rotate(360deg)' },
                    },
                  }}
                />

                <Typography
                  sx={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: colorScheme.textColor,
                    mb: 0.5,
                  }}
                >
                  AI가 초안을 작성중입니다
                </Typography>

                <Typography
                  sx={{
                    fontSize: '14px',
                    color: twHintText,
                  }}
                >
                  잠시만 기다려주세요.
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Dialog>

      {/* 승인자 선택 모달 */}
      <ApproverSelectionModal
        open={isApproverModalOpen}
        onClose={() => setIsApproverModalOpen(false)}
        onConfirm={handleApproverConfirm}
        initialSelectedApproverIds={formData.approvalLine?.map((a) => a.approverId) || []}
        sequentialApproval={isSequentialApproval}
      />

      {/* 참조자 선택 모달 */}
      <ReferenceSelectionModal
        open={isReferenceModalOpen}
        onClose={() => setIsReferenceModalOpen(false)}
        onConfirm={handleReferenceConfirm}
        currentReferences={
          formData.ccList?.map((cc) => ({
            name: cc.name,
            department: cc.department || '',
            userId: cc.userId,
          })) || []
        }
      />
    </>
  );
}
