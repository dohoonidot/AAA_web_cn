import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import MinimizeIcon from '@mui/icons-material/Minimize';
import type { ApprovalFormSchema } from '../types/formSchema';
import type { ApprovalFormData } from '../types/formSchema';
import type { ElectronicApprovalDraftStateHook } from '../ElectronicApprovalDraftPanel.state';
import ApprovalCard from './ApprovalCard';
import DynamicFormRenderer from './DynamicFormRenderer';

interface ModernApprovalPanelProps {
  schema: ApprovalFormSchema;
  stateHook: ElectronicApprovalDraftStateHook;
  isDark?: boolean;
}

function formatFileSize(size?: number) {
  if (!size && size !== 0) return '-';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = size;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export default function ModernApprovalPanel({ schema, stateHook, isDark = false }: ModernApprovalPanelProps) {
  const { state, derived, actions } = stateHook;
  const {
    user,
    isLoading,
    approvalType,
    draftingDepartment,
    isCustomDepartment,
    departments,
    isDepartmentsLoading,
    draftingDate,
    documentTitle,
    approvers,
    ccList,
    attachments,
    chatAttachments,
    isSequentialApproval,
  } = state;

  const { approvalOptions } = derived;

  const {
    closePanel,
    setApprovalType,
    setDraftingDepartment,
    setIsCustomDepartment,
    setDraftingDate,
    setDocumentTitle,
    setContent,
    loadDepartments,
    setIsApproverModalOpen,
    setIsReferenceModalOpen,
    setIsSequentialApproval,
    setAttachments,
    setChatAttachments,
    handleAttachmentSelect,
    handleRemoveAttachment,
    handleRemoveChatAttachment,
    handleSaveApprovalLine,
    handleSubmit,
    handleReset,
  } = actions;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentTitleInputRef = useRef<HTMLInputElement>(null);
  const detailDataRef = useRef<ApprovalFormData>({
    fields: {},
    fixedTables: {},
    repeatableSections: {},
  });
  const [isMinimized, setIsMinimized] = useState(false);

  const PRIMARY_COLOR = '#475569';
  const panelBg = isDark ? 'rgba(30,41,59,0.92)' : 'rgba(255,255,255,0.96)';
  const panelBorder = isDark ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.18)';
  const panelText = isDark ? '#FFFFFF' : '#1A1D1F';
  const subtitleText = isDark ? '#CBD5E1' : '#334155';
  const infoBoxBg = isDark ? 'rgba(71,85,105,0.44)' : '#FFFFFF';
  const infoChipBg = isDark ? 'rgba(71,85,105,0.62)' : '#FFFFFF';
  const whiteBoxMuted = isDark ? '#CBD5E1' : '#64748B';
  const primarySoft = isDark ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.10)';
  const actionFill = isDark ? 'rgba(226,232,240,0.86)' : 'rgba(71,85,105,0.92)';
  const actionTextOnFill = isDark ? '#0F172A' : '#FFFFFF';
  const fieldText = isDark ? '#F1F5F9' : '#1A1D1F';
  const fieldBg = isDark ? 'rgba(148,163,184,0.07)' : 'rgba(248,250,252,0.92)';

  const fieldSx = {
    '& .MuiInputLabel-root': {
      color: isDark ? '#A0AEC0' : '#111827',
      fontSize: 12,
      fontWeight: 600,
    },
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: fieldBg,
      fontSize: 13,
      '& fieldset': { borderColor: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(148,163,184,0.22)' },
      '&.Mui-focused fieldset': {
        borderColor: isDark ? 'rgba(226,232,240,0.32)' : 'rgba(15,23,42,0.22)',
      },
      '& .MuiInputBase-input, & .MuiInputBase-inputMultiline, & .MuiSelect-select': {
        color: fieldText,
        WebkitTextFillColor: fieldText,
      },
      '& input:-webkit-autofill, & textarea:-webkit-autofill': {
        WebkitTextFillColor: fieldText,
        caretColor: fieldText,
        WebkitBoxShadow: `0 0 0 100px ${fieldBg} inset`,
        transition: 'background-color 9999s ease-out 0s',
      },
    },
  };

  const handleDetailDataChange = useCallback(
    (next: ApprovalFormData) => {
      detailDataRef.current = next;
    },
    []
  );

  const commitDocumentTitle = useCallback(() => {
    const next = documentTitleInputRef.current?.value ?? '';
    if (next !== documentTitle) {
      setDocumentTitle(next);
    }
  }, [documentTitle, setDocumentTitle]);

  useEffect(() => {
    if (!documentTitleInputRef.current) return;
    if (documentTitleInputRef.current.value !== documentTitle) {
      documentTitleInputRef.current.value = documentTitle;
    }
  }, [documentTitle]);

  const handleSubmitWithDetail = useCallback(() => {
    commitDocumentTitle();
    const detailData = detailDataRef.current;
    setContent(
      JSON.stringify(
        {
          schemaType: schema.approvalType,
          ...detailData,
        },
        null,
        2
      )
    );
    handleSubmit();
  }, [commitDocumentTitle, handleSubmit, schema.approvalType, setContent]);
  const menuProps = {
    disablePortal: false,
    sx: { zIndex: 1700 },
    PaperProps: { sx: { zIndex: 1700 } },
    slotProps: {
      root: {
        sx: { zIndex: 1700 },
        style: { zIndex: 1700 },
      },
    },
  } as const;

  if (isMinimized) {
    return (
      <Box sx={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1400 }}>
        <Button
          variant="outlined"
          onClick={() => setIsMinimized(false)}
          endIcon={<OpenInFullIcon fontSize="small" />}
          sx={{
            borderRadius: '999px',
            px: 2,
            py: 1,
            background: panelBg,
            borderColor: panelBorder,
            color: panelText,
            backdropFilter: 'blur(12px)',
          }}
        >
          전자결재 작성 중...
        </Button>
      </Box>
    );
  }

  const renderApprovalLineCard = () => (
    <ApprovalCard title="결재선" isDark={isDark}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 1, color: panelText }}>승인자</Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Button
              fullWidth
              onClick={() => {
                setIsSequentialApproval(false);
                setIsApproverModalOpen(true);
              }}
              sx={{ borderRadius: '12px', background: actionFill, color: actionTextOnFill, fontSize: 12, fontWeight: 700 }}
            >
              승인자 선택
            </Button>
            <Button
              fullWidth
              onClick={() => {
                setIsSequentialApproval(true);
                setIsApproverModalOpen(true);
              }}
              sx={{
                borderRadius: '12px',
                background: isDark ? 'rgba(203,213,225,0.82)' : 'rgba(100,116,139,0.92)',
                color: actionTextOnFill,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              순차결재
            </Button>
          </Stack>
          <Box sx={{ p: 1.5, minHeight: 64, borderRadius: '12px', border: `1px solid ${panelBorder}`, bgcolor: infoBoxBg }}>
            {approvers.length === 0 ? (
              <Typography sx={{ fontSize: 12, color: whiteBoxMuted }}>승인자를 선택하세요</Typography>
            ) : (
              <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1}>
                {approvers.map((item, idx) => (
                  <Chip
                    key={`${item.approverId}-${idx}`}
                    label={`${isSequentialApproval ? `${idx + 1}. ` : ''}${item.approverName}`}
                    size="small"
                    sx={{
                      background: infoChipBg,
                      color: isDark ? '#F8FAFC' : '#1A1D1F',
                      border: `1px solid ${isDark ? 'rgba(148,163,184,0.26)' : 'rgba(148,163,184,0.22)'}`,
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 1, color: panelText }}>참조자</Typography>
          <Button
            fullWidth
            onClick={() => setIsReferenceModalOpen(true)}
            sx={{
              borderRadius: '12px',
              mb: 1,
              background: primarySoft,
              color: PRIMARY_COLOR,
              border: `1px solid ${isDark ? 'rgba(148,163,184,0.24)' : 'rgba(148,163,184,0.20)'}`,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            참조자 선택
          </Button>
          <Box sx={{ p: 1.5, minHeight: 64, borderRadius: '12px', border: `1px solid ${panelBorder}`, bgcolor: infoBoxBg }}>
            {ccList.length === 0 ? (
              <Typography sx={{ fontSize: 12, color: whiteBoxMuted }}>참조자를 선택하세요</Typography>
            ) : (
              <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1}>
                {ccList.map((item, idx) => (
                  <Chip
                    key={`${item.name}-${idx}`}
                    label={item.name}
                    size="small"
                    sx={{
                      background: infoChipBg,
                      color: isDark ? '#F8FAFC' : '#1A1D1F',
                      border: `1px solid ${isDark ? 'rgba(148,163,184,0.26)' : 'rgba(148,163,184,0.22)'}`,
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Box>
      </Stack>
    </ApprovalCard>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: panelBg }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${panelBorder}`,
          background: isDark ? 'rgba(15,23,42,0.76)' : 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ width: 36, height: 36, borderRadius: '12px', display: 'grid', placeItems: 'center', border: `1px solid ${panelBorder}` }}>
          <DescriptionIcon fontSize="small" sx={{ color: PRIMARY_COLOR }} />
        </Box>
        <Typography sx={{ flex: 1, fontSize: 18, fontWeight: 700, color: panelText }}>전자결재 상신</Typography>
        <IconButton onClick={() => setIsMinimized(true)} size="small" sx={{ border: `1px solid ${panelBorder}` }}>
          <MinimizeIcon fontSize="small" />
        </IconButton>
        <IconButton onClick={closePanel} size="small" sx={{ border: `1px solid ${panelBorder}` }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {isLoading ? (
          <Box sx={{ px: 2, py: 1.5, borderRadius: '12px', fontSize: 13, fontWeight: 600, background: `${PRIMARY_COLOR}1A`, color: PRIMARY_COLOR }}>
            데이터를 불러오는 중입니다...
          </Box>
        ) : null}

        <ApprovalCard title="공통 필수영역" isDark={isDark}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2,minmax(0,1fr))' }, gap: 1.5 }}>
            {isCustomDepartment ? (
              <TextField
                fullWidth
                size="small"
                label="기안부서 *"
                value={draftingDepartment}
                onChange={(e) => setDraftingDepartment(e.target.value)}
                placeholder="부서명을 입력하세요"
                InputProps={{
                  endAdornment: (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setIsCustomDepartment(false);
                        setDraftingDepartment('');
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
                sx={fieldSx}
              />
            ) : (
              <FormControl fullWidth size="small" sx={fieldSx}>
                <InputLabel>기안부서 *</InputLabel>
                <Select
                  label="기안부서 *"
                  value={draftingDepartment || ''}
                  MenuProps={menuProps}
                  onOpen={() => {
                    if (departments.length === 0) loadDepartments();
                  }}
                  onChange={(e) => {
                    const next = e.target.value;
                    if (next === '__CUSTOM__') {
                      setIsCustomDepartment(true);
                      setDraftingDepartment('');
                    } else {
                      setDraftingDepartment(next);
                    }
                  }}
                >
                  <MenuItem value="">{isDepartmentsLoading ? '불러오는 중...' : '부서 선택'}</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                  <MenuItem value="__CUSTOM__">직접입력</MenuItem>
                </Select>
              </FormControl>
            )}

            <TextField fullWidth size="small" label="기안자 *" value={user?.userId || ''} InputProps={{ readOnly: true }} sx={fieldSx} />

            <TextField
              fullWidth
              size="small"
              label="기안일 *"
              type="date"
              value={draftingDate}
              onChange={(e) => setDraftingDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={fieldSx}
            />

            <TextField fullWidth size="small" label="보존년한 *" value="영구" InputProps={{ readOnly: true }} sx={fieldSx} />

            <TextField
              fullWidth
              size="small"
              label="제목 *"
              inputRef={documentTitleInputRef}
              defaultValue={documentTitle}
              onBlur={commitDocumentTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  commitDocumentTitle();
                }
              }}
              sx={{ ...fieldSx, gridColumn: { xs: 'span 1', md: 'span 2' } }}
            />
          </Box>
        </ApprovalCard>

        <FormControl fullWidth size="small" sx={fieldSx}>
          <InputLabel>결재 종류 *</InputLabel>
          <Select
            label="결재 종류 *"
            value={approvalType}
            MenuProps={menuProps}
            onChange={(e) => {
              const next = e.target.value;
              setApprovalType(next);
              setDocumentTitle(next);
            }}
          >
            <MenuItem value="">결재 종류 선택</MenuItem>
            {approvalOptions.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {renderApprovalLineCard()}

        <Box>
          <Typography sx={{ mb: 1, fontSize: 14, fontWeight: 700, color: panelText }}>결재 상세</Typography>
          <DynamicFormRenderer schema={schema} isDark={isDark} onDataChange={handleDetailDataChange} />
        </Box>

        <ApprovalCard title={`첨부파일${attachments.length + chatAttachments.length ? ` ${attachments.length + chatAttachments.length}개` : ''}`} isDark={isDark}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <input ref={fileInputRef} type="file" multiple hidden onChange={(e) => handleAttachmentSelect(e.target.files)} />
            <Button size="small" onClick={() => fileInputRef.current?.click()} sx={{ borderRadius: '10px', background: primarySoft, color: PRIMARY_COLOR }}>
              + 파일 추가
            </Button>
            {attachments.length + chatAttachments.length > 0 ? (
              <Button size="small" onClick={() => { setAttachments([]); setChatAttachments([]); }} sx={{ color: PRIMARY_COLOR }}>
                모두 삭제
              </Button>
            ) : null}
          </Stack>

          <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1}>
            {chatAttachments.map((item, idx) => (
              <Chip
                key={`chat-${item.file_name}-${idx}`}
                label={`${item.file_name} (${formatFileSize(item.size)})`}
                onDelete={() => handleRemoveChatAttachment(idx)}
                size="small"
              />
            ))}
            {attachments.map((file, idx) => (
              <Chip
                key={`file-${file.name}-${idx}`}
                label={`${file.name} (${formatFileSize(file.size)})`}
                onDelete={() => handleRemoveAttachment(idx)}
                size="small"
              />
            ))}
          </Stack>
        </ApprovalCard>
      </Box>

      <Box sx={{ p: 2, borderTop: `1px solid ${panelBorder}`, background: isDark ? 'rgba(15,23,42,0.72)' : 'rgba(255,255,255,0.85)' }}>
        <Button
          fullWidth
          onClick={handleSaveApprovalLine}
          sx={{
            mb: 1,
            borderRadius: '14px',
            color: PRIMARY_COLOR,
            border: `1px solid ${isDark ? 'rgba(148,163,184,0.24)' : 'rgba(148,163,184,0.22)'}`,
            background: primarySoft,
            fontWeight: 700,
          }}
        >
          전자결재용 결재라인 저장
        </Button>
        <Stack direction="row" spacing={1}>
          <Button fullWidth onClick={handleReset} sx={{ borderRadius: '14px', border: `1px solid ${panelBorder}`, color: panelText }}>
            초기화
          </Button>
          <Button fullWidth onClick={handleSubmitWithDetail} sx={{ borderRadius: '14px', background: '#475569', color: '#fff', fontWeight: 700 }}>
            상신
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
