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
  TextField,
  InputAdornment,
  Collapse,
  Chip,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  PersonAddOutlined as PersonAddIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import type { CcPerson } from '../../types/leave';
import { useThemeStore } from '../../store/themeStore';
import { useReferenceSelectionModalState } from './ReferenceSelectionModal.state';

interface ReferenceSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedReferences: CcPerson[]) => void;
  currentReferences?: CcPerson[];
}

export default function ReferenceSelectionModal({
  open,
  onClose,
  onConfirm,
  currentReferences = [],
}: ReferenceSelectionModalProps) {
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme.name === 'Dark';
  const twBg = isDark ? 'rgba(15,23,42,0.96)' : 'rgba(255,255,255,0.96)';
  const twBorder = isDark ? 'rgba(148,163,184,0.16)' : 'rgba(148,163,184,0.18)';
  const twSurface = isDark ? 'rgba(148,163,184,0.06)' : '#F8FAFC';
  const twFieldBg = isDark ? 'rgba(148,163,184,0.07)' : 'rgba(248,250,252,0.92)';
  const accent = isDark ? '#E5E7EB' : '#111827';
  const accentSoft = isDark ? 'rgba(226,232,240,0.10)' : 'rgba(15,23,42,0.05)';
  const { state, actions } = useReferenceSelectionModalState({
    open,
    onClose,
    onConfirm,
    currentReferences,
  });
  const {
    selectedReferences,
    departments,
    departmentMembers,
    expandedDepartments,
    searchText,
    isLoading,
    error,
    filteredDepartments,
  } = state;
  const {
    setSearchText,
    toggleDepartmentExpansion,
    isPersonSelected,
    togglePerson,
    removeReference,
    isDepartmentFullySelected,
    toggleDepartment,
    getFilteredMembers,
    handleConfirm,
  } = actions;

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
                border: `1px solid ${isDark ? 'rgba(226,232,240,0.16)' : 'rgba(15,23,42,0.10)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PersonAddIcon sx={{ color: accent, fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontSize: '18px', fontWeight: 700 }}>
              참조자 선택
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: isDark ? '#E5E7EB' : '#111827',
              border: `1px solid ${twBorder}`,
              borderRadius: '12px',
              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
              '&:hover': { color: accent, bgcolor: accentSoft },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* 검색 필드 */}
        <TextField
          fullWidth
          placeholder="이름 검색"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: twFieldBg,
                color: isDark ? '#E5E7EB' : '#111827',
                borderRadius: '12px',
                '&.Mui-focused': {
                  boxShadow: isDark ? '0 0 0 3px rgba(226,232,240,0.14)' : '0 0 0 3px rgba(15,23,42,0.08)',
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

        {/* 선택된 참조자 표시 */}
        {selectedReferences.length > 0 && (
          <Box
            sx={{
              p: 1.5,
              mb: 2,
              borderRadius: '12px',
              bgcolor: accentSoft,
              border: `1px solid ${isDark ? 'rgba(226,232,240,0.18)' : 'rgba(15,23,42,0.12)'}`,
            }}
          >
            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: accent, mb: 1 }}>
              선택된 참조자 ({selectedReferences.length}명)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selectedReferences.map((ref, idx) => (
                <Chip
                  key={idx}
                  label={`${ref.name} ${ref.department}`}
                  onDelete={() => removeReference(ref)}
                  deleteIcon={<CloseIcon sx={{ fontSize: 14 }} />}
                  size="small"
                  sx={{
                    bgcolor: isDark ? 'rgba(226,232,240,0.10)' : 'rgba(15,23,42,0.05)',
                    color: accent,
                    border: `1px solid ${isDark ? 'rgba(226,232,240,0.18)' : 'rgba(15,23,42,0.12)'}`,
                    fontSize: '11px',
                    height: 22,
                    borderRadius: '999px',
                    '& .MuiChip-deleteIcon': {
                      color: accent,
                      opacity: 1,
                      marginRight: '-2px',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* 부서 및 멤버 리스트 */}
        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2, color: isDark ? '#9CA3AF' : '#111827' }}>부서 목록을 불러오는 중...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
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
            {filteredDepartments.map((department) => {
              const members = getFilteredMembers(department);
              const isExpanded = expandedDepartments.has(department);

              if (members.length === 0 && searchText) return null;

              return (
                <Box key={department}>
                  <ListItem
                    disablePadding
                    sx={{
                      mb: 0.5,
                      borderRadius: '8px',
                      bgcolor: twSurface,
                      border: `1px solid ${twBorder}`,
                    }}
                  >
                    <ListItemButton
                      onClick={() => toggleDepartmentExpansion(department)}
                      sx={{ borderRadius: '8px', '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(148,163,184,0.04)' } }}
                    >
                      <ListItemIcon>
                        <Checkbox
                          checked={isDepartmentFullySelected(department)}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDepartment(department);
                          }}
                          sx={{
                            color: accent,
                            '&.Mui-checked': {
                              color: accent,
                            },
                            padding: 0,
                            marginRight: 1,
                          }}
                        />
                        <BusinessIcon sx={{ color: isDark ? '#9CA3AF' : '#111827', fontSize: 18 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontSize: '14px', fontWeight: 600, color: isDark ? '#E5E7EB' : '#111827' }}>
                            {department}
                          </Typography>
                        }
                        secondary={
                          <Typography sx={{ fontSize: '12px', color: isDark ? '#9CA3AF' : '#9CA3AF' }}>
                            {members.length}명
                          </Typography>
                        }
                      />
                      {isExpanded ? (
                        <ExpandLessIcon sx={{ color: isDark ? '#9CA3AF' : '#111827' }} />
                      ) : (
                        <ExpandMoreIcon sx={{ color: isDark ? '#9CA3AF' : '#111827' }} />
                      )}
                    </ListItemButton>
                  </ListItem>

                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {members.map((member, idx) => {
                        const isSelected = isPersonSelected(member);

                        return (
                          <ListItem
                            key={idx}
                            disablePadding
                            sx={{
                              pl: 4,
                              mb: 0.5,
                              borderRadius: '8px',
                              bgcolor: isSelected
                                ? accentSoft
                                : isDark
                                  ? 'rgba(15,23,42,0.42)'
                                  : 'transparent',
                              border: `1px solid ${isSelected ? (isDark ? 'rgba(226,232,240,0.18)' : 'rgba(15,23,42,0.12)') : (isDark ? 'rgba(148,163,184,0.08)' : 'transparent')}`,
                            }}
                          >
                            <ListItemButton onClick={() => togglePerson(member)}>
                              <ListItemIcon>
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
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                    <Typography sx={{ fontSize: '14px', fontWeight: 500, color: isDark ? '#E5E7EB' : '#111827' }}>
                                      {member.name}
                                    </Typography>
                                    {member.job_position && (
                                      <Typography
                                        sx={{
                                          fontSize: '11px',
                                          fontWeight: 600,
                                          color: isDark ? '#E2E8F0' : '#111827',
                                          bgcolor: isDark ? 'rgba(226,232,240,0.10)' : 'rgba(15,23,42,0.05)',
                                          border: `1px solid ${isDark ? 'rgba(226,232,240,0.16)' : 'rgba(15,23,42,0.10)'}`,
                                          borderRadius: '999px',
                                          px: 0.8,
                                          py: 0.1,
                                        }}
                                      >
                                        {member.job_position}
                                      </Typography>
                                    )}
                                    {member.user_id && (
                                      <Typography sx={{ fontSize: '12px', color: isDark ? '#9CA3AF' : '#111827' }}>
                                        {member.user_id}
                                      </Typography>
                                    )}
                                    {!member.user_id && member.email && (
                                      <Typography sx={{ fontSize: '12px', color: isDark ? '#9CA3AF' : '#111827' }}>
                                        {member.email}
                                      </Typography>
                                    )}
                                  </Box>
                                }
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Collapse>
                </Box>
              );
            })}
          </List>
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
          sx={{
            flex: 1,
            bgcolor: accent,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#059669' },
          }}
        >
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
}
