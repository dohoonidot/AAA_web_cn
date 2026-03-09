import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  CircularProgress,
  useMediaQuery,
  Slide,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Close as CloseIcon,
  HowToReg as HowToRegIcon,
  FormatListNumbered as FormatListNumberedIcon,
  Save as SaveIcon,
  AttachFile as AttachFileIcon,
  OpenInFull as OpenInFullIcon,
  Description as DescriptionIcon,
  PersonAddOutlined as PersonAddOutlinedIcon,
  CloudDone as CloudDoneIcon,
  FolderOpen as FolderOpenIcon,
  Add as AddIcon,
  PictureAsPdf as PictureAsPdfIcon,
  TableChart as TableChartIcon,
  TextSnippet as TextSnippetIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Image as ImageIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useThemeStore } from '../../store/themeStore';
import { LEAVE_TYPES } from './ElectronicApprovalDraftPanel.shared';
import { useElectronicApprovalDraftState } from './ElectronicApprovalDraftPanel.state';
import ElectronicApprovalDraftPanelModals from './ElectronicApprovalDraftPanel.modals';
import { getModernFormSchema } from './schemas';
import DynamicFormRenderer from './new/DynamicFormRenderer';
const PRIMARY_COLOR = '#475569';
const SUCCESS_COLOR = '#475569';
const INFO_COLOR = '#475569';
const PRIMARY_HOVER = '#334155';
const SUCCESS_HOVER = '#334155';
const INFO_HOVER = '#334155';
const MUTED_COLOR = '#475569';
const LIGHT_BORDER = '#E9ECEF';
const DARK_BORDER = '#4A5568';
const LIGHT_SURFACE = '#F8F9FA';
const DARK_SURFACE = '#2D3748';
const DARK_PANEL = '#1A1D1F';
const LIGHT_TEXT = '#1A1D1F';
const MUTED_TEXT = '#475569';

export default function ElectronicApprovalDraftPanel() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isNarrowDesktop = useMediaQuery(theme.breakpoints.down('lg'));
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme.name === 'Dark';
  const { state, derived, actions } = useElectronicApprovalDraftState();
  const {
    user,
    isOpen,
    isLoading,
    approvalType,
    draftingDepartment,
    isCustomDepartment,
    departments,
    isDepartmentsLoading,
    retentionPeriod,
    draftingDate,
    documentTitle,
    content,
    leaveType,
    grantDays,
    reason,
    approvers,
    ccList,
    attachments,
    chatAttachments,
    isApproverModalOpen,
    isReferenceModalOpen,
    isSequentialApproval,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
  } = state;

  const { approvalOptions } = derived;

  const {
    closePanel,
    setApprovalType,
    setDraftingDepartment,
    setIsCustomDepartment,
    loadDepartments,
    setRetentionPeriod,
    setDraftingDate,
    setDocumentTitle,
    setContent,
    setLeaveType,
    setGrantDays,
    setReason,
    setApprovers,
    setCcList,
    setAttachments,
    setChatAttachments,
    setIsApproverModalOpen,
    setIsReferenceModalOpen,
    setIsSequentialApproval,
    setSnackbarOpen,
    handleAttachmentSelect,
    handleRemoveAttachment,
    handleRemoveChatAttachment,
    handleApproverConfirm,
    handleSaveApprovalLine,
    handleSubmit,
    handleReset,
  } = actions;

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (!ext) return InsertDriveFileIcon;
    if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(ext)) return ImageIcon;
    if (ext === 'pdf') return PictureAsPdfIcon;
    if (['xls', 'xlsx'].includes(ext)) return TableChartIcon;
    if (['txt'].includes(ext)) return TextSnippetIcon;
    return InsertDriveFileIcon;
  };

  const formatSize = (size?: number) => {
    if (!size && size !== 0) return '-';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = size;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex += 1;
    }
    return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  };

  const normalizeReferences = (refs: Array<any>) => {
    const normalized: Array<{ user_id: string; name: string; department?: string }> = [];
    const seen = new Set<string>();
    refs.forEach((ref) => {
      const userId = String(ref.user_id || ref.userId || '').trim();
      const name = String(ref.name || '').trim();
      if (!userId || !name) return;
      if (seen.has(userId)) return;
      seen.add(userId);
      normalized.push({
        user_id: userId,
        name,
        department: ref.department,
      });
    });
    return normalized;
  };

  const panelBorderColor = isDark ? DARK_BORDER : LIGHT_BORDER;
  const panelSurface = isDark ? DARK_SURFACE : LIGHT_SURFACE;
  const panelText = isDark ? 'white' : LIGHT_TEXT;
  const subtitleText = isDark ? '#CBD5E1' : '#334155';
  const twPanelBg = isDark ? 'rgba(30, 41, 59, 0.92)' : 'rgba(255,255,255,0.96)';
  const twPanelBorder = isDark ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.18)';
  const twFieldBg = isDark ? 'rgba(71, 85, 105, 0.52)' : '#FFFFFF';
  const primarySoft = isDark ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.10)';
  const successSoft = isDark ? 'rgba(148,163,184,0.20)' : 'rgba(148,163,184,0.14)';
  const infoSoft = isDark ? 'rgba(148,163,184,0.10)' : 'rgba(148,163,184,0.07)';
  const actionFill = isDark ? '#E2E8F0' : '#475569';
  const actionFillHover = isDark ? '#F8FAFC' : '#334155';
  const actionTextOnFill = isDark ? '#0F172A' : '#FFFFFF';
  const infoBoxBg = isDark ? 'rgba(71, 85, 105, 0.44)' : '#FFFFFF';
  const infoChipBg = isDark ? 'rgba(71, 85, 105, 0.62)' : '#FFFFFF';
  const whiteInfoText = isDark ? '#E2E8F0' : '#334155';
  const whiteInfoMuted = isDark ? '#CBD5E1' : '#64748B';
  const noWrapTextSx = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };
  const menuProps = {
    disablePortal: false,
    sx: { zIndex: 1700 },
    PaperProps: {
      sx: { zIndex: 1700 },
    },
    slotProps: {
      root: {
        sx: { zIndex: 1700 },
        style: { zIndex: 1700 },
      },
    },
  } as const;
  const fieldSx = {
    '& .MuiInputLabel-root': {
      color: isDark ? '#CBD5E1' : '#475569',
      fontSize: 12,
      fontWeight: 600,
      whiteSpace: 'nowrap',
    },
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: twFieldBg,
      transition: 'all 160ms ease-out',
      '& fieldset': {
        borderColor: twPanelBorder,
      },
      '&:hover fieldset': {
        borderColor: isDark ? 'rgba(148,163,184,0.26)' : 'rgba(100,116,139,0.22)',
      },
      '&.Mui-focused fieldset': {
        borderColor: isDark ? 'rgba(226,232,240,0.32)' : 'rgba(15,23,42,0.22)',
      },
      '&.Mui-focused': {
        boxShadow: isDark ? '0 0 0 3px rgba(226,232,240,0.14)' : '0 0 0 3px rgba(15,23,42,0.08)',
      },
      '& .MuiSelect-select': {
        color: isDark ? '#F8FAFC' : '#1A1D1F',
      },
      '& .MuiSvgIcon-root': {
        color: isDark ? '#CBD5E1' : '#64748B',
      },
    },
    '& .MuiOutlinedInput-input': {
      padding: '12px',
      color: isDark ? '#F8FAFC' : '#1A1D1F',
    },
    '& .MuiInputBase-inputMultiline': {
      color: isDark ? '#F8FAFC' : '#1A1D1F',
    },
  };

  const [isMinimized, setIsMinimized] = useState(false);
  if (!isOpen) return null;

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
            bgcolor: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(12px)',
            borderRadius: '28px',
            boxShadow: isDark ? '0 16px 36px rgba(2,6,23,0.45)' : '0 16px 36px rgba(15,23,42,0.12)',
            display: 'flex',
            alignItems: 'center',
            pr: 1,
            pl: 3,
            py: 1,
            gap: 2,
            border: `1px solid ${twPanelBorder}`,
            cursor: 'pointer',
            transition: 'all 160ms ease-out',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: isDark ? '0 18px 42px rgba(2,6,23,0.5)' : '0 20px 42px rgba(15,23,42,0.14)',
            },
          }}
          onClick={() => setIsMinimized(false)}
        >
          <Typography sx={{ fontWeight: 600, color: isDark ? 'white' : LIGHT_TEXT }}>
            전자결재 작성 중...
          </Typography>
          <IconButton
            size="small"
            sx={{
              bgcolor: primarySoft,
              color: PRIMARY_COLOR,
              border: `1px solid ${isDark ? 'rgba(96,165,250,0.22)' : 'rgba(96,165,250,0.16)'}`,
              borderRadius: '10px',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.06)',
                color: PRIMARY_HOVER,
              },
            }}
          >
            <OpenInFullIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    );
  }

  // 공통 패널 내용 스타일
  const panelContentSx = {
    bgcolor: twPanelBg,
    backdropFilter: 'blur(14px)',
    border: `1px solid ${twPanelBorder}`,
    boxShadow: isDark ? '0 24px 60px rgba(2,6,23,0.55)' : '0 24px 60px rgba(15,23,42,0.16)',
    display: 'flex',
    flexDirection: 'column',
  };

  const modernSchema = getModernFormSchema(approvalType);

  // 패널 내용 렌더링 함수
  const renderPanelContent = () => (
    <>
      <Box
        sx={{
          px: isNarrowDesktop ? 2 : 3,
          py: isNarrowDesktop ? 2 : 2.5,
          borderBottom: `1px solid ${twPanelBorder}`,
          bgcolor: isDark ? 'rgba(15,23,42,0.76)' : 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '14px',
            display: 'grid',
            placeItems: 'center',
            bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.05)',
            border: `1px solid ${isDark ? 'rgba(226,232,240,0.16)' : 'rgba(15,23,42,0.10)'}`,
            flexShrink: 0,
          }}
        >
          <DescriptionIcon sx={{ color: PRIMARY_COLOR, fontSize: 20 }} />
        </Box>
        <Typography
          sx={{
            flexGrow: 1,
            fontSize: 19,
            fontWeight: 700,
            color: panelText,
            minWidth: 0,
            ...noWrapTextSx,
          }}
        >
          전자결재 상신
        </Typography>
        {/* 접어두기 버튼 */}
        <IconButton
          onClick={() => setIsMinimized(true)}
          sx={{
            color: MUTED_COLOR,
            border: `1px solid ${twPanelBorder}`,
            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)',
            borderRadius: '12px',
            '&:hover': { color: PRIMARY_COLOR, bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.05)' },
          }}
          title="접어두기"
        >
          <ChevronRightIcon />
        </IconButton>
        <IconButton
          onClick={closePanel}
          sx={{
            color: panelText,
            border: `1px solid ${twPanelBorder}`,
            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)',
            borderRadius: '12px',
            '&:hover': { color: PRIMARY_COLOR, bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.05)' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: isNarrowDesktop ? 2 : 3,
          '& .MuiButton-root': {
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
          },
          '& .MuiChip-root': { borderRadius: '999px' },
          '&::-webkit-scrollbar': { width: 8, height: 8 },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: isDark ? 'rgba(148,163,184,0.28)' : 'rgba(148,163,184,0.42)',
            borderRadius: 999,
          },
        }}
      >
        {isLoading && (
          <Box
            sx={{
              mb: 2,
              p: 2.5,
              borderRadius: '12px',
              border: `1px solid ${PRIMARY_COLOR}4D`,
              bgcolor: `${PRIMARY_COLOR}1A`,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <CircularProgress size={20} sx={{ color: PRIMARY_COLOR }} />
            <Typography sx={{ color: PRIMARY_COLOR, fontWeight: 600, fontSize: 14 }}>
              휴가 부여 상신 데이터를 불러오는 중입니다...
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, minWidth: 0 }}>
          <DescriptionIcon sx={{ fontSize: 16, color: PRIMARY_COLOR }} />
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: panelText, minWidth: 0, ...noWrapTextSx }}>
            공통 필수영역
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? '1fr'
              : isNarrowDesktop
                ? 'repeat(2, minmax(0, 1fr))'
                : 'repeat(4, minmax(0, 1fr))',
            gap: 1,
            minWidth: 0,
          }}
        >
          {isCustomDepartment ? (
            <TextField
              label="기안부서 *"
              value={draftingDepartment}
              onChange={(e) => setDraftingDepartment(e.target.value)}
              placeholder="부서명을 입력하세요"
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => {
                      setIsCustomDepartment(false);
                      setDraftingDepartment('');
                    }}
                    size="small"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                ),
              }}
              sx={fieldSx}
            />
          ) : (
            <FormControl fullWidth sx={fieldSx}>
              <InputLabel>기안부서 *</InputLabel>
              <Select
                label="기안부서 *"
                value={draftingDepartment || ''}
                MenuProps={menuProps}
                onOpen={() => {
                  if (departments.length === 0) {
                    loadDepartments();
                  }
                }}
                onChange={(e) => {
                  if (e.target.value === '__CUSTOM__') {
                    setIsCustomDepartment(true);
                    setDraftingDepartment('');
                    return;
                  }
                  setDraftingDepartment(String(e.target.value));
                }}
              >
                {isDepartmentsLoading && (
                  <MenuItem disabled value="">
                    부서 목록 불러오는 중...
                  </MenuItem>
                )}
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
                <MenuItem value="__CUSTOM__">직접입력</MenuItem>
              </Select>
            </FormControl>
          )}

          <TextField
            label="기안자 *"
            value={user?.userId || ''}
            InputProps={{ readOnly: true }}
            sx={{
              ...fieldSx,
              '& .MuiOutlinedInput-input': {
                padding: '12px',
                color: isDark ? '#E2E8F0' : MUTED_TEXT,
              },
            }}
          />

          <TextField
            label="기안일 *"
            type="date"
            value={draftingDate}
            onChange={(e) => setDraftingDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={fieldSx}
          />

          <TextField
            label="보존년한 *"
            value="영구"
            InputProps={{ readOnly: true }}
            sx={{
              ...fieldSx,
              '& .MuiOutlinedInput-input': {
                padding: '12px',
                color: isDark ? '#E2E8F0' : MUTED_TEXT,
              },
            }}
          />
        </Box>

        <Box sx={{ mt: 2, mb: 3 }}>
          <FormControl fullWidth sx={fieldSx}>
            <InputLabel>결재 종류 *</InputLabel>
            <Select
              label="결재 종류 *"
              value={approvalType}
              MenuProps={menuProps}
              onChange={(e) => {
                const next = String(e.target.value);
                setApprovalType(next);
                setDocumentTitle(next);
              }}
            >
              {approvalOptions.map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: isMobile || isNarrowDesktop ? '1fr' : 'repeat(2, minmax(0, 1fr))',
            gap: 2,
            mb: 3,
            minWidth: 0,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, minWidth: 0 }}>
              <HowToRegIcon sx={{ fontSize: 16, color: isDark ? '#CBD5E1' : PRIMARY_COLOR }} />
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: panelText, minWidth: 0, ...noWrapTextSx }}>
                승인자
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'stretch',
                gap: 1,
                mb: 1.5,
                flexWrap: 'nowrap',
                minWidth: 0,
              }}
            >
              <Button
                variant="contained"
                startIcon={<HowToRegIcon sx={{ fontSize: 16 }} />}
                onClick={() => {
                  setIsSequentialApproval(false);
                  setIsApproverModalOpen(true);
                }}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  bgcolor: isDark ? 'rgba(226,232,240,0.86)' : 'rgba(71,85,105,0.92)',
                  color: actionTextOnFill,
                  border: 'none',
                  borderRadius: '12px',
                  py: 1.3,
                  fontWeight: 600,
                  fontSize: 'clamp(11px, 1.1vw, 14px)',
                  whiteSpace: 'nowrap',
                  px: 1.25,
                  transition: 'all 160ms ease-out',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: isDark ? '#F1F5F9' : '#334155',
                    color: isDark ? '#0F172A' : '#FFFFFF',
                    transform: 'translateY(-1px)',
                    boxShadow: isDark ? '0 8px 18px rgba(2,6,23,0.18)' : '0 8px 18px rgba(15,23,42,0.10)',
                  },
                }}
              >
                승인자 선택
              </Button>
              <Button
                variant="contained"
                startIcon={<FormatListNumberedIcon sx={{ fontSize: 16 }} />}
                onClick={() => {
                  setIsSequentialApproval(true);
                  setIsApproverModalOpen(true);
                }}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  bgcolor: isDark ? 'rgba(203,213,225,0.82)' : 'rgba(100,116,139,0.92)',
                  color: actionTextOnFill,
                  border: 'none',
                  borderRadius: '12px',
                  py: 1.3,
                  fontWeight: 600,
                  fontSize: 'clamp(11px, 1.1vw, 14px)',
                  whiteSpace: 'nowrap',
                  px: 1.25,
                  transition: 'all 160ms ease-out',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: isDark ? '#E2E8F0' : '#475569',
                    color: isDark ? '#0F172A' : '#FFFFFF',
                    transform: 'translateY(-1px)',
                    boxShadow: isDark ? '0 8px 18px rgba(2,6,23,0.18)' : '0 8px 18px rgba(15,23,42,0.10)',
                  },
                }}
              >
                순차결재
              </Button>
            </Box>
            <Box
              sx={{
                minHeight: 80,
                p: 2,
                borderRadius: '12px',
                bgcolor: infoBoxBg,
                border: `1px solid ${panelBorderColor}`,
              }}
            >
              {approvers.length === 0 ? (
                <Box sx={{ textAlign: 'center', color: whiteInfoMuted }}>
                  <HowToRegIcon sx={{ fontSize: 20, color: whiteInfoMuted }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 500, mt: 0.5 }}>
                    승인자 선택
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <HowToRegIcon sx={{ fontSize: 16, color: whiteInfoMuted }} />
                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: whiteInfoText }}>
                      선택된 승인자 ({approvers.length}명)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {approvers.map((item, idx) => (
                      <Box
                        key={`${item.approverId}-${idx}`}
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: '12px',
                          bgcolor: infoChipBg,
                          color: isDark ? '#F8FAFC' : '#1A1D1F',
                          border: `1px solid ${isDark ? 'rgba(148,163,184,0.26)' : 'rgba(148,163,184,0.22)'}`,
                          fontSize: 10,
                          fontWeight: 500,
                        }}
                      >
                        {isSequentialApproval ? `${idx + 1}. ` : ''}{item.approverName}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, minWidth: 0 }}>
              <PersonAddOutlinedIcon sx={{ fontSize: 16, color: isDark ? '#CBD5E1' : INFO_COLOR }} />
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: panelText, minWidth: 0, ...noWrapTextSx }}>
                참조자
              </Typography>
            </Box>
            <Button
              fullWidth
              variant="contained"
              startIcon={<PersonAddOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={() => setIsReferenceModalOpen(true)}
              sx={{
                bgcolor: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(148,163,184,0.14)',
                color: isDark ? '#E2E8F0' : PRIMARY_COLOR,
                border: `1px solid ${isDark ? 'rgba(148,163,184,0.24)' : 'rgba(148,163,184,0.20)'}`,
                borderRadius: '12px',
                py: 1.3,
                fontWeight: 600,
                mb: 1.5,
                fontSize: 'clamp(11px, 1.1vw, 14px)',
                whiteSpace: 'nowrap',
                transition: 'all 160ms ease-out',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(148,163,184,0.26)' : 'rgba(148,163,184,0.20)',
                  color: isDark ? '#F8FAFC' : PRIMARY_HOVER,
                  transform: 'translateY(-1px)',
                  boxShadow: isDark ? '0 8px 18px rgba(2,6,23,0.16)' : '0 8px 18px rgba(15,23,42,0.08)',
                },
              }}
            >
              참조자 선택
            </Button>
            <Box
              sx={{
                minHeight: 80,
                p: 2,
                borderRadius: '12px',
                bgcolor: infoBoxBg,
                border: `1px solid ${panelBorderColor}`,
              }}
            >
              {ccList.length === 0 ? (
                <Box sx={{ textAlign: 'center', color: whiteInfoMuted }}>
                  <PersonAddOutlinedIcon sx={{ fontSize: 20, color: whiteInfoMuted }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 500, mt: 0.5 }}>
                    참조자 선택
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <PersonAddOutlinedIcon sx={{ fontSize: 16, color: whiteInfoMuted }} />
                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: whiteInfoText }}>
                      선택된 참조자 ({ccList.length}명)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {ccList.map((item, idx) => (
                      <Box
                        key={`${item.name}-${idx}`}
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: '12px',
                          bgcolor: infoChipBg,
                          color: isDark ? '#F8FAFC' : '#1A1D1F',
                          border: `1px solid ${isDark ? 'rgba(148,163,184,0.26)' : 'rgba(148,163,184,0.22)'}`,
                          fontSize: 10,
                          fontWeight: 500,
                        }}
                      >
                        {item.name}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, minWidth: 0 }}>
          <DescriptionIcon sx={{ fontSize: 16, color: PRIMARY_COLOR }} />
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: panelText, minWidth: 0, ...noWrapTextSx }}>
            결재 상세
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          {approvalType === '휴가 부여 상신' && (
            <Box
              sx={{
                p: 2,
                borderRadius: '8px',
                bgcolor: panelSurface,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>휴가 종류 *</InputLabel>
                  <Select
                    label="휴가 종류 *"
                    value={leaveType}
                    MenuProps={menuProps}
                    onChange={(e) => setLeaveType(String(e.target.value))}
                  >
                    {LEAVE_TYPES.map((item) => (
                      <MenuItem key={item} value={item}>{item}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="제목 *"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  sx={fieldSx}
                />
                <TextField
                  label="휴가 부여 일수 *"
                  value={grantDays}
                  onChange={(e) => setGrantDays(e.target.value)}
                  type="number"
                  sx={fieldSx}
                />
                <TextField
                  label="사유"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  multiline
                  minRows={4}
                  sx={fieldSx}
                />
              </Box>
            </Box>
          )}

          {approvalType !== '휴가 부여 상신' && (
            <Box
              sx={{
                p: 2,
                borderRadius: '8px',
                bgcolor: panelSurface,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <TextField
                label="제목 *"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                sx={fieldSx}
              />
              {modernSchema ? (
                <DynamicFormRenderer schema={modernSchema} isDark={isDark} />
              ) : (
                <TextField
                  label="상세 내용"
                  multiline
                  minRows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  sx={fieldSx}
                />
              )}
            </Box>
          )}

        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, minWidth: 0 }}>
          <AttachFileIcon sx={{ fontSize: 16, color: PRIMARY_COLOR }} />
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: panelText, minWidth: 0, ...noWrapTextSx }}>
            첨부파일
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: '12px',
            bgcolor: panelSurface,
            border: `1px solid ${panelBorderColor}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, minWidth: 0 }}>
            <AttachFileIcon sx={{ fontSize: 16, color: panelText }} />
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: panelText, minWidth: 0, ...noWrapTextSx }}>
              {attachments.length + chatAttachments.length === 0
                ? '첨부파일'
                : `첨부파일 ${attachments.length + chatAttachments.length}개`}
            </Typography>
            <Box sx={{ flex: 1 }} />
            {(attachments.length > 0 || chatAttachments.length > 0) && (
              <Button
                size="small"
                onClick={() => { setAttachments([]); setChatAttachments([]); }}
                sx={{ color: PRIMARY_COLOR, borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
              >
                모두 삭제
              </Button>
            )}
            <Button
              size="small"
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              component="label"
              sx={{
                bgcolor: primarySoft,
                color: PRIMARY_COLOR,
                border: `1px solid ${isDark ? 'rgba(148,163,184,0.20)' : 'rgba(148,163,184,0.18)'}`,
                fontSize: 12,
                py: 0.5,
                px: 1.5,
                whiteSpace: 'nowrap',
                '&:hover': { bgcolor: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(148,163,184,0.14)', color: PRIMARY_HOVER },
              }}
            >
              파일 추가
              <input hidden type="file" multiple onChange={(e) => handleAttachmentSelect(e.target.files)} />
            </Button>
          </Box>

          {chatAttachments.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <CloudDoneIcon sx={{ fontSize: 14, color: SUCCESS_COLOR }} />
                <Typography sx={{ fontSize: 11, color: SUCCESS_COLOR }}>
                  채팅에서 첨부됨 ({chatAttachments.length}개)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {chatAttachments.map((item, idx) => {
                  const Icon = getFileIcon(item.file_name);
                  return (
                    <Box
                      key={`${item.file_name}-${idx}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        borderRadius: '8px',
                        bgcolor: isDark ? 'rgba(15,23,42,0.6)' : 'white',
                        border: `1px solid ${panelBorderColor}`,
                      }}
                    >
                      <Icon sx={{ fontSize: 20, color: PRIMARY_COLOR }} />
                      <Box>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: panelText }}>
                          {item.file_name.length > 15 ? `${item.file_name.slice(0, 12)}...` : item.file_name}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: subtitleText }}>
                          {formatSize(item.size)}
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={() => handleRemoveChatAttachment(idx)}>
                        <CloseIcon sx={{ fontSize: 12, color: subtitleText }} />
                      </IconButton>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {attachments.length > 0 && (
            <Box>
              {chatAttachments.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <FolderOpenIcon sx={{ fontSize: 14, color: PRIMARY_COLOR }} />
                  <Typography sx={{ fontSize: 11, color: PRIMARY_COLOR }}>
                    직접 첨부 ({attachments.length}개)
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {attachments.map((file, idx) => {
                  const Icon = getFileIcon(file.name);
                  return (
                    <Box
                      key={`${file.name}-${idx}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        borderRadius: '8px',
                        bgcolor: isDark ? 'rgba(15,23,42,0.6)' : 'white',
                        border: `1px solid ${panelBorderColor}`,
                        boxShadow: isDark ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
                      }}
                    >
                      <Icon sx={{ fontSize: 20, color: PRIMARY_COLOR }} />
                      <Box>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: panelText }}>
                          {file.name.length > 15 ? `${file.name.slice(0, 12)}...` : file.name}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: subtitleText }}>
                          {formatSize(file.size)}
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={() => handleRemoveAttachment(idx)}>
                        <CloseIcon sx={{ fontSize: 12, color: subtitleText }} />
                      </IconButton>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {attachments.length === 0 && chatAttachments.length === 0 && (
            <Typography sx={{ fontSize: 12, color: subtitleText, textAlign: 'center', mt: 2 }}>
              파일을 추가하려면 위의 "파일 추가" 버튼을 클릭하세요
            </Typography>
          )}
        </Box>
      </Box>

      <Divider />
      <Box
        sx={{
          p: isNarrowDesktop ? 2 : 3,
          borderTop: `1px solid ${twPanelBorder}`,
          bgcolor: isDark ? 'rgba(15,23,42,0.72)' : 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          startIcon={<SaveIcon />}
          onClick={handleSaveApprovalLine}
          sx={{
            color: isDark ? '#E2E8F0' : PRIMARY_COLOR,
            borderColor: isDark ? 'rgba(148,163,184,0.24)' : 'rgba(148,163,184,0.22)',
            bgcolor: primarySoft,
            borderRadius: '14px',
            py: 1.2,
            fontWeight: 600,
            fontSize: 'clamp(11px, 1.1vw, 14px)',
            whiteSpace: 'nowrap',
            mb: 1.5,
            transition: 'all 160ms ease-out',
            '&:hover': {
              borderColor: isDark ? 'rgba(148,163,184,0.26)' : 'rgba(148,163,184,0.22)',
              bgcolor: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(148,163,184,0.14)',
              color: isDark ? '#F8FAFC' : PRIMARY_HOVER,
              transform: 'translateY(-1px)',
            },
          }}
        >
          전자결재용 결재라인 저장
        </Button>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            fullWidth
            onClick={handleReset}
            sx={{
              color: isDark ? '#CBD5E1' : '#111827',
              border: `1px solid ${twPanelBorder}`,
              bgcolor: isDark ? 'rgba(148,163,184,0.06)' : 'rgba(248,250,252,0.9)',
              fontWeight: 600,
              fontSize: 'clamp(11px, 1.1vw, 14px)',
              whiteSpace: 'nowrap',
              borderRadius: '12px',
              transition: 'all 160ms ease-out',
              '&:hover': {
                bgcolor: isDark ? 'rgba(148,163,184,0.10)' : 'rgba(241,245,249,0.95)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            초기화
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            disabled={isLoading}
            sx={{
              bgcolor: actionFill,
              color: actionTextOnFill,
              border: 'none',
              fontWeight: 600,
              py: 1.2,
              borderRadius: '14px',
              fontSize: 'clamp(11px, 1.1vw, 14px)',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 3px rgba(15,23,42,0.10)',
              transition: 'all 160ms ease-out',
              '&:hover': {
                bgcolor: actionFillHover,
                color: isDark ? '#0F172A' : '#FFFFFF',
                transform: 'translateY(-1px)',
                boxShadow: isDark ? '0 8px 18px rgba(2,6,23,0.18)' : '0 8px 18px rgba(15,23,42,0.10)',
              },
            }}
          >
            {isLoading ? <CircularProgress size={20} sx={{ color: actionTextOnFill }} /> : '상신'}
          </Button>
        </Box>
      </Box>
    </>
  );

  // 모바일: 오른쪽 슬라이드 패널
  if (isMobile) {
    return (
      <>
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0, 0, 0, 0.15)',
            zIndex: 1350,
          }}
          onClick={closePanel}
        />
        <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
          <Box
            sx={{
              ...panelContentSx,
              position: 'fixed',
              top: 0,
              right: 0,
              height: { xs: 'var(--app-height)', md: '100vh' },
              width: '100%',
              zIndex: 1400,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {renderPanelContent()}
          </Box>
        </Slide>
        <ElectronicApprovalDraftPanelModals
          isApproverModalOpen={isApproverModalOpen}
          isReferenceModalOpen={isReferenceModalOpen}
          isSequentialApproval={isSequentialApproval}
          snackbarOpen={snackbarOpen}
          snackbarMessage={snackbarMessage}
          snackbarSeverity={snackbarSeverity}
          approverIds={approvers.map((item) => item.approverId)}
          ccList={ccList}
          onCloseApprover={() => setIsApproverModalOpen(false)}
          onConfirmApprover={handleApproverConfirm}
          onCloseReference={() => setIsReferenceModalOpen(false)}
          onConfirmReference={(refs) => setCcList(normalizeReferences(refs))}
          onSnackbarClose={() => setSnackbarOpen(false)}
        />
      </>
    );
  }

  // 데스크톱: 중앙 팝업 모달
  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1350,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={closePanel}
      >
        <Box
          sx={{
            ...panelContentSx,
            width: '95vw',
            minWidth: 560,
            maxWidth: 1600,
            maxHeight: '90vh',
            borderRadius: '20px',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {renderPanelContent()}
        </Box>
      </Box>
      <ElectronicApprovalDraftPanelModals
        isApproverModalOpen={isApproverModalOpen}
        isReferenceModalOpen={isReferenceModalOpen}
        isSequentialApproval={isSequentialApproval}
        snackbarOpen={snackbarOpen}
        snackbarMessage={snackbarMessage}
        snackbarSeverity={snackbarSeverity}
        approverIds={approvers.map((item) => item.approverId)}
        ccList={ccList}
        onCloseApprover={() => setIsApproverModalOpen(false)}
        onConfirmApprover={handleApproverConfirm}
        onCloseReference={() => setIsReferenceModalOpen(false)}
        onConfirmReference={(refs) => setCcList(normalizeReferences(refs))}
        onSnackbarClose={() => setSnackbarOpen(false)}
      />
    </>
  );
}
