import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Box,
  Typography,
  IconButton,
  Chip,
  Alert,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Close as CloseIcon,
  PeopleAltOutlined as PeopleIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FormatListNumbered as SequentialIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import type { Approver } from '../../types/leave';
import { useThemeStore } from '../../store/themeStore';
import { useApproverSelectionModalState } from './ApproverSelectionModal.state';

interface ApproverSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedApproverIds: string[], selectedApprovers: Approver[]) => void;
  initialSelectedApproverIds?: string[];
  sequentialApproval?: boolean; // 순차결재 모드 활성화 여부
}

export default function ApproverSelectionModal({
  open,
  onClose,
  onConfirm,
  initialSelectedApproverIds = [],
  sequentialApproval = false,
}: ApproverSelectionModalProps) {
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme.name === 'Dark';
  const twBg = isDark ? 'rgba(15,23,42,0.96)' : 'rgba(255,255,255,0.96)';
  const twBorder = isDark ? 'rgba(148,163,184,0.16)' : 'rgba(148,163,184,0.18)';
  const twSurface = isDark ? 'rgba(148,163,184,0.06)' : '#F8FAFC';
  const twFieldBg = isDark ? 'rgba(148,163,184,0.07)' : 'rgba(248,250,252,0.92)';
  const accent = isDark ? '#E5E7EB' : '#111827';
  const accentSoft = isDark ? 'rgba(226,232,240,0.10)' : 'rgba(15,23,42,0.05)';
  const { state, actions } = useApproverSelectionModalState({
    open,
    onClose,
    onConfirm,
    initialSelectedApproverIds,
    sequentialApproval,
  });
  const {
    approverList,
    selectedApproverIds,
    selectedApproverOrder,
    isLoading,
    error,
    searchText,
    filteredApprovers,
  } = state;
  const { setSearchText, loadApprovers, handleToggleApprover, handleConfirm } = actions;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableEnforceFocus
      disableAutoFocus
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 200,
        '& .MuiPaper-root': {
          bgcolor: twBg,
          backdropFilter: 'blur(14px)',
          color: isDark ? '#E5E7EB' : '#111827',
          border: `1px solid ${twBorder}`,
          borderRadius: '18px',
          boxShadow: isDark ? '0 24px 60px rgba(2,6,23,0.55)' : '0 24px 60px rgba(15,23,42,0.14)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1.25, borderBottom: `1px solid ${twBorder}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: '12px',
                bgcolor: accentSoft,
                border: `1px solid ${isDark ? 'rgba(96,165,250,0.18)' : 'rgba(96,165,250,0.14)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PeopleIcon sx={{ color: accent, fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontSize: '18px', fontWeight: 700 }}>
              {sequentialApproval ? '승인자 선택 (순차결재)' : '승인자 선택'}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: accent,
              border: `1px solid ${twBorder}`,
              borderRadius: '12px',
              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
              '&:hover': { color: accent, bgcolor: accentSoft },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography sx={{ fontSize: '13px', color: isDark ? '#9CA3AF' : '#111827', mt: 1 }}>
          {selectedApproverIds.size}명 선택됨
          {sequentialApproval && selectedApproverOrder.length > 0 && (
            <span> · 순서: {selectedApproverOrder.map((_, idx) => idx + 1).join(' → ')}</span>
          )}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* 검색 필드 */}
        {!isLoading && !error && approverList.length > 0 && (
          <TextField
            fullWidth
            placeholder="이름, 이메일, 부서, 직급으로 검색"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: twFieldBg,
                color: isDark ? '#E5E7EB' : '#111827',
                borderRadius: '12px',
                '& fieldset': { borderColor: twBorder },
                '&.Mui-focused': {
                  boxShadow: isDark ? '0 0 0 3px rgba(59,130,246,0.18)' : '0 0 0 3px rgba(59,130,246,0.10)',
                },
                '& fieldset': {
                  borderColor: twBorder,
                },
                '&:hover fieldset': {
                  borderColor: isDark ? 'rgba(148,163,184,0.26)' : 'rgba(100,116,139,0.22)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: accent,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: isDark ? '#9CA3AF' : '#9CA3AF' }} />
                </InputAdornment>
              ),
            }}
          />
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2, color: isDark ? '#9CA3AF' : '#111827' }}>승인자 목록을 불러오는 중...</Typography>
          </Box>
        ) : error ? (
          <Box>
            <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
              {error}
            </Alert>
            <Button
              startIcon={<RefreshIcon />}
              onClick={loadApprovers}
              variant="contained"
              fullWidth
              sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
            >
              다시 시도
            </Button>
          </Box>
        ) : approverList.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PeopleIcon sx={{ fontSize: 64, color: isDark ? '#475569' : '#111827', mb: 2, opacity: 0.22 }} />
            <Typography sx={{ color: isDark ? '#9CA3AF' : '#111827' }}>승인자 목록이 없습니다.</Typography>
          </Box>
        ) : (
          <>
            {/* 선택된 승인자 표시 (모든 모드) */}
            {selectedApproverIds.size > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, mb: 1, color: isDark ? '#E5E7EB' : '#111827' }}>
                  {sequentialApproval ? '선택된 승인자 순서' : '선택된 승인자'}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {sequentialApproval ? (
                    // 순차결재 모드: 순서 표시
                    selectedApproverOrder.map((approverId, index) => {
                      const approver = approverList.find((a) => a.approverId === approverId);
                      if (!approver) return null;

                      return (
                        <Chip
                          key={approverId}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  bgcolor: isDark ? '#111827' : 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  color: accent,
                                }}
                              >
                                {index + 1}
                              </Box>
                              <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                                {approver.approverName}
                              </Typography>
                              {index < selectedApproverOrder.length - 1 && (
                                <ArrowForwardIcon sx={{ fontSize: 16, color: isDark ? '#9CA3AF' : '#9CA3AF' }} />
                              )}
                            </Box>
                          }
                          sx={{
                            bgcolor: accentSoft,
                              color: accent,
                            border: `1px solid ${isDark ? 'rgba(96,165,250,0.24)' : 'rgba(96,165,250,0.18)'}`,
                            height: 36,
                            borderRadius: '999px',
                            '& .MuiChip-deleteIcon': {
                              color: accent,
                            },
                          }}
                          onDelete={() => handleToggleApprover(approverId)}
                        />
                      );
                    })
                  ) : (
                    // 일반 모드: 선택된 승인자 목록
                    Array.from(selectedApproverIds).map((approverId) => {
                      const approver = approverList.find((a) => a.approverId === approverId);
                      if (!approver) return null;

                      return (
                        <Chip
                          key={approverId}
                          label={approver.approverName}
                          sx={{
                            bgcolor: accentSoft,
                            color: accent,
                            border: `1px solid ${isDark ? 'rgba(96,165,250,0.24)' : 'rgba(96,165,250,0.18)'}`,
                            fontSize: '13px',
                            fontWeight: 600,
                            height: 32,
                            borderRadius: '999px',
                            '& .MuiChip-deleteIcon': {
                              color: accent,
                            },
                          }}
                          onDelete={() => handleToggleApprover(approverId)}
                        />
                      );
                    })
                  )}
                </Box>
              </Box>
            )}
            
            <List
              sx={{
                maxHeight: 400,
                overflow: 'auto',
                pr: 0.25,
                '&::-webkit-scrollbar': { width: 8 },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: isDark ? 'rgba(148,163,184,0.28)' : 'rgba(148,163,184,0.42)',
                  borderRadius: 999,
                },
              }}
            >
              {filteredApprovers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ color: isDark ? '#9CA3AF' : '#111827' }}>
                    검색 결과가 없습니다.
                  </Typography>
                </Box>
              ) : (
                filteredApprovers.map((approver) => {
                const isSelected = selectedApproverIds.has(approver.approverId);
                // 순차결재 모드에서 순서 번호 표시
                const sequenceNumber = sequentialApproval && isSelected
                  ? selectedApproverOrder.indexOf(approver.approverId) + 1
                  : null;
                
                return (
                  <ListItem
                    key={approver.approverId}
                    disablePadding
                    sx={{
                      mb: 1,
                      borderRadius: '12px',
                      border: `1px solid ${isSelected ? (isDark ? 'rgba(96,165,250,0.28)' : 'rgba(96,165,250,0.22)') : twBorder}`,
                      bgcolor: isSelected
                        ? accentSoft
                        : isDark
                          ? twSurface
                          : '#FFFFFF',
                      boxShadow: isSelected && !isDark ? '0 4px 12px rgba(59,130,246,0.06)' : 'none',
                    }}
                  >
                    <ListItemButton
                      onClick={() => handleToggleApprover(approver.approverId)}
                      sx={{
                        borderRadius: '12px',
                        transition: 'all 160ms ease-out',
                        '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(148,163,184,0.04)' },
                      }}
                    >
                      <ListItemIcon>
                        {sequentialApproval && sequenceNumber ? (
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: accent,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '14px',
                              fontWeight: 700,
                            }}
                          >
                            {sequenceNumber}
                          </Box>
                        ) : (
                          <Checkbox
                            checked={isSelected}
                            edge="start"
                            sx={{
                            color: accent,
                              '&.Mui-checked': {
                                color: accent,
                              },
                            }}
                          />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontSize: '15px', fontWeight: 600, color: isDark ? '#E5E7EB' : '#111827' }}>
                              {approver.approverName}
                            </Typography>
                            {approver.jobPosition && (
                              <Chip
                                label={approver.jobPosition}
                                size="small"
                                sx={{
                                  bgcolor: accentSoft,
                                  color: accent,
                                  border: `1px solid ${isDark ? 'rgba(96,165,250,0.18)' : 'rgba(96,165,250,0.14)'}`,
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  height: 20,
                                }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box component="div" sx={{ mt: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <BusinessIcon sx={{ fontSize: 14, color: isDark ? '#9CA3AF' : '#9CA3AF' }} />
                              <Typography sx={{ fontSize: '12px', color: isDark ? '#C4C8D1' : '#111827' }}>
                                {approver.department}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <EmailIcon sx={{ fontSize: 14, color: isDark ? '#9CA3AF' : '#9CA3AF' }} />
                              <Typography
                                sx={{ fontSize: '11px', color: isDark ? '#9CA3AF' : '#9CA3AF' }}
                                noWrap
                              >
                                {approver.approverId}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
                })
              )}
            </List>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1.25, borderTop: `1px solid ${twBorder}`, bgcolor: isDark ? 'rgba(15,23,42,0.72)' : 'rgba(255,255,255,0.8)' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            flex: 1,
            color: isDark ? '#E5E7EB' : '#111827',
            borderColor: twBorder,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          취소
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={selectedApproverIds.size === 0}
          sx={{
            flex: 1,
            bgcolor: accent,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#2563EB' },
          }}
        >
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
}
