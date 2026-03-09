import React from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  Description as DescriptionIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import type { LeaveManagementData } from '../../types/leave';
// useThemeStore type import removed - using 'any' for ThemeColorScheme
import LeaveCancelRequestDialog from './LeaveCancelRequestDialog';
import ApproverSelectionModal from './ApproverSelectionModal';
import ReferenceSelectionModal from './ReferenceSelectionModal';
import LeaveRequestModal from './LeaveRequestModal';
import VacationRecommendationModal from './VacationRecommendationModal';

import TotalCalendar from '../calendar/TotalCalendar';
import type {
  DesktopLeaveManagementActions,
  DesktopLeaveManagementState,
} from './DesktopLeaveManagement.state';
import type { ManagementTableRow } from './DesktopLeaveManagement.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ThemeColorScheme = any;

type DesktopLeaveManagementModalsProps = {
  state: DesktopLeaveManagementState;
  actions: DesktopLeaveManagementActions;
  colorScheme: ThemeColorScheme;
  isDark: boolean;
  leaveStatusList: LeaveManagementData['leaveStatus'];
  userId: string;
  onRefresh: () => void;
  getStatusIcon: (status: string) => React.ReactNode;
};

const DesktopLeaveManagementModals: React.FC<DesktopLeaveManagementModalsProps> = ({
  state,
  actions,
  colorScheme,
  isDark,
  leaveStatusList,
  userId,
  onRefresh,
  getStatusIcon,
}) => {
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

  const {
    requestDialogOpen,
    detailPanelOpen,
    selectedLeaveDetail,
    totalCalendarOpen,
    approverModalOpen,
    referenceModalOpen,
    managementTableDialogOpen,
    tableLoading,
    managementTableData,
    cancelRequestModalOpen,
    cancelRequestLeave,
    aiModalOpen,
    requestForm,
    isSequentialApproval,
    selectedYear,
  } = state;

  const {
    setDetailPanelOpen,
    setCancelRequestLeave,
    setCancelRequestModalOpen,
    setTotalCalendarOpen,
    setApproverModalOpen,
    setReferenceModalOpen,
    setRequestForm,
    setManagementTableDialogOpen,
    setAiModalOpen,
    handleRequestDialogClose,
    handleCancelSuccess,
  } = actions;

  return (
    <>
      {/* 휴가 신청 모달 - LeaveRequestModal 사용 */}
      <LeaveRequestModal
        open={requestDialogOpen}
        onClose={handleRequestDialogClose}
        onSubmit={async () => {
          onRefresh();
        }}
        userId={userId}
        leaveStatusList={leaveStatusList}
      />

      {/* 휴가 상세 정보 다이얼로그 */}
      <Dialog
        open={detailPanelOpen}
        onClose={() => setDetailPanelOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDark ? '#0F172A' : '#FFFFFF',
            borderRadius: '18px',
            overflow: 'hidden',
            border: `1px solid ${isDark ? 'rgba(148, 163, 184, 0.2)' : '#E2E8F0'}`,
            boxShadow: isDark ? '0 24px 48px rgba(0,0,0,0.45)' : '0 24px 48px rgba(15, 23, 42, 0.18)',
          },
        }}
      >
        {selectedLeaveDetail && (
          <>
            {/* 헤더 - Tailwind 톤 */}
            <Box
              sx={{
                bgcolor: isDark ? '#0B1120' : '#F8FAFC',
                borderBottom: `1px solid ${isDark ? 'rgba(148, 163, 184, 0.2)' : '#E2E8F0'}`,
                px: 3,
                py: 2.25,
                position: 'relative',
              }}
            >
              <IconButton
                onClick={() => setDetailPanelOpen(false)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: colorScheme.textColor,
                  border: `1px solid ${isDark ? 'rgba(148, 163, 184, 0.2)' : '#E2E8F0'}`,
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
                  {getStatusIcon(selectedLeaveDetail.status)}
                </Box>
                <Box>
                  <Typography sx={{ color: colorScheme.textColor, fontSize: '18px', fontWeight: 700 }}>
                    {selectedLeaveDetail.leaveType}
                  </Typography>
                  <Chip
                    label={
                      selectedLeaveDetail.status === 'APPROVED' ? '승인 완료' :
                        selectedLeaveDetail.status === 'REJECTED' ? '반려됨' :
                          selectedLeaveDetail.status === 'REQUESTED' ? '승인 대기' :
                            selectedLeaveDetail.status === 'CANCEL_REQUESTED' ? '취소 대기' :
                              selectedLeaveDetail.status === 'CANCELLED' ? '취소됨' : '대기'
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

            <DialogContent sx={{ p: 3, bgcolor: isDark ? '#0F172A' : '#FFFFFF' }}>
              {/* 취소 상신 알림 */}
              {selectedLeaveDetail.isCancel === 1 && (
                <Alert
                  severity="warning"
                  icon={<WarningIcon />}
                  sx={{ mb: 3, borderRadius: '12px' }}
                >
                  <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                    이 항목은 취소 상신 건입니다.
                  </Typography>
                </Alert>
              )}

              {/* 기간 정보 카드 */}
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
                      {dayjs(selectedLeaveDetail.startDate).format('YYYY년 MM월 DD일 (ddd)')}
                    </Typography>
                    <Typography sx={{ fontSize: '13px', color: colorScheme.textColor, mt: 0.5 }}>
                      ~ {dayjs(selectedLeaveDetail.endDate).format('YYYY년 MM월 DD일 (ddd)')}
                    </Typography>
                  </Box>
                  {selectedLeaveDetail.workdaysCount && (
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
                        {selectedLeaveDetail.workdaysCount}
                      </Typography>
                      <Typography sx={{ fontSize: '11px', color: colorScheme.hintTextColor, fontWeight: 600 }}>
                        일 사용
                      </Typography>
                    </Box>
                  )}
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
                  border: `1px solid ${colorScheme.textFieldBorderColor}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <TimeIcon sx={{ fontSize: 20, color: colorScheme.hintTextColor }} />
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: colorScheme.hintTextColor }}>
                    신청 정보
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 4 }}>
                  <Box>
                    <Typography sx={{ fontSize: '11px', color: colorScheme.hintTextColor, mb: 0.5 }}>신청일</Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 500, color: colorScheme.textColor }}>
                      {dayjs(selectedLeaveDetail.requestedDate).format('YYYY.MM.DD')}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* 사유 카드 */}
              {selectedLeaveDetail.isCancel === 1 ? (
                (() => {
                  const { cancelReason, mainReason } = parseLeaveReason(selectedLeaveDetail.reason);
                  const originalReason = selectedLeaveDetail.originalReason || mainReason;
                  return (
                    <>
                      {/* 원래 휴가 사유 */}
                      {originalReason && (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            mb: 2,
                            borderRadius: '12px',
                            bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                            border: `1px solid ${colorScheme.textFieldBorderColor}`,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <DescriptionIcon sx={{ fontSize: 20, color: colorScheme.hintTextColor }} />
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: colorScheme.hintTextColor }}>
                              원래 휴가 신청 사유
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: '14px', color: colorScheme.textColor, lineHeight: 1.6 }}>
                            {originalReason}
                          </Typography>
                        </Paper>
                      )}

                      {/* 취소 요청 사유 */}
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          mb: 2,
                          borderRadius: '12px',
                          bgcolor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
                          border: `1px solid ${isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'}`,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                          <WarningIcon sx={{ fontSize: 20, color: '#F59E0B' }} />
                          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#F59E0B' }}>
                            취소 요청 사유
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '14px', color: colorScheme.textColor, lineHeight: 1.6 }}>
                          {cancelReason || selectedLeaveDetail.reason || '-'}
                        </Typography>
                      </Paper>
                    </>
                  );
                })()
              ) : (
                (() => {
                  const { cancelReason, mainReason } = parseLeaveReason(selectedLeaveDetail.reason);
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
                          border: `1px solid ${colorScheme.textFieldBorderColor}`,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                          <DescriptionIcon sx={{ fontSize: 20, color: colorScheme.hintTextColor }} />
                          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: colorScheme.hintTextColor }}>
                            휴가 사유
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '14px', color: colorScheme.textColor, lineHeight: 1.6 }}>
                          {mainReason || selectedLeaveDetail.reason || '-'}
                        </Typography>
                      </Paper>
                    </>
                  );
                })()
              )}

              {/* 반려 사유 (있을 경우) */}
              {selectedLeaveDetail.rejectMessage && (
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
                    {selectedLeaveDetail.rejectMessage}
                  </Typography>
                </Paper>
              )}
            </DialogContent>

            <DialogActions
              sx={{
                px: 3,
                py: 2,
                borderTop: `1px solid ${colorScheme.textFieldBorderColor}`,
                gap: 1,
                justifyContent: 'space-between',
              }}
            >
              {(selectedLeaveDetail.status === 'APPROVED' || selectedLeaveDetail.status === 'REQUESTED') && (
                <Button
                  variant={selectedLeaveDetail.status === 'REQUESTED' ? 'outlined' : 'contained'}
                  size={selectedLeaveDetail.status === 'REQUESTED' ? 'small' : 'medium'}
                  color="warning"
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    setDetailPanelOpen(false);
                    setCancelRequestLeave(selectedLeaveDetail);
                    setCancelRequestModalOpen(true);
                  }}
                  sx={{ borderRadius: '8px' }}
                >
                  취소 상신
                </Button>
              )}
              <Box sx={{ ml: 'auto' }}>
                <Button
                  onClick={() => setDetailPanelOpen(false)}
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

      {/* 전체휴가 달력 모달 */}
      <TotalCalendar
        open={totalCalendarOpen}
        onClose={() => setTotalCalendarOpen(false)}
      />

      {/* 승인자 선택 모달 */}
      <ApproverSelectionModal
        open={approverModalOpen}
        onClose={() => setApproverModalOpen(false)}
        onConfirm={(selectedIds) => {
          setRequestForm((prev) => ({ ...prev, approverIds: selectedIds }));
        }}
        initialSelectedApproverIds={requestForm.approverIds}
        sequentialApproval={isSequentialApproval}
      />

      {/* 참조자 선택 모달 */}
      <ReferenceSelectionModal
        open={referenceModalOpen}
        onClose={() => setReferenceModalOpen(false)}
        onConfirm={(selectedReferences) => {
          setRequestForm((prev) => ({ ...prev, ccList: selectedReferences }));
        }}
        currentReferences={requestForm.ccList}
      />

      {/* 휴가 관리 대장 크게 보기 모달 */}
      <Dialog
        open={managementTableDialogOpen}
        onClose={() => setManagementTableDialogOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            height: '90vh',
            bgcolor: colorScheme.surfaceColor,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2, borderBottom: `1px solid ${colorScheme.textFieldBorderColor}`, fontSize: '18px', fontWeight: 700, color: colorScheme.textColor }}>
          <Box component="span">휴가 관리 대장</Box>
          <IconButton
            onClick={() => setManagementTableDialogOpen(false)}
            size="small"
            sx={{ p: 0.5 }}
          >
            <ArrowBackIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, overflow: 'auto' }}>
          <TableContainer sx={{ maxHeight: '100%', overflowX: 'auto' }}>
            <Table size="small" stickyHeader sx={{ borderCollapse: 'separate', minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontSize: '12px',
                      fontWeight: 600,
                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9FAFB',
                      color: colorScheme.textColor,
                      px: 2,
                      py: 1.5,
                      borderRight: `1px solid ${colorScheme.textFieldBorderColor}`,
                      position: 'sticky',
                      left: 0,
                      zIndex: 3,
                    }}
                  >
                    휴가명
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: '12px',
                      fontWeight: 600,
                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9FAFB',
                      color: colorScheme.textColor,
                      px: 2,
                      py: 1.5,
                      textAlign: 'center',
                    }}
                  >
                    허용일수
                  </TableCell>
                  {/* 월별 사용 현황 헤더 - 각 월별로 개별 셀 사용 */}
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                    <TableCell
                      key={month}
                      sx={{
                        fontSize: '11px',
                        fontWeight: 600,
                        bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9FAFB',
                        color: colorScheme.textColor,
                        px: 1,
                        py: 1.5,
                        borderRight: month < 12 ? `1px solid ${colorScheme.textFieldBorderColor}` : 'none',
                        textAlign: 'center',
                        minWidth: '50px',
                        width: '50px',
                      }}
                    >
                      {month}월
                    </TableCell>
                  ))}
                  <TableCell
                    sx={{
                      fontSize: '12px',
                      fontWeight: 600,
                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9FAFB',
                      color: colorScheme.textColor,
                      px: 2,
                      py: 1.5,
                      textAlign: 'center',
                    }}
                  >
                    사용일수
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: '12px',
                      fontWeight: 600,
                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9FAFB',
                      color: colorScheme.textColor,
                      px: 2,
                      py: 1.5,
                      textAlign: 'center',
                    }}
                  >
                    잔여일수
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableLoading ? (
                  <TableRow>
                    <TableCell colSpan={16} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : managementTableData && managementTableData.length > 0 ? (
                  managementTableData.map((row: ManagementTableRow, index: number) => {
                    const allowedDays = row.allowedDays || 0;
                    const totalUsed = row.totalUsed || 0;
                    const remainDays = allowedDays - totalUsed;
                    const usedByMonth = row.usedByMonth || Array(12).fill(0);

                    return (
                      <TableRow
                        key={index}
                        hover
                        sx={{
                          '&:hover': {
                            bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6',
                            '& .sticky-cell': {
                              bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6',
                            },
                          },
                        }}
                      >
                        <TableCell
                          className="sticky-cell"
                          sx={{
                            fontSize: '12px',
                            fontWeight: 600,
                            px: 2,
                            py: 1.5,
                            borderRight: `1px solid ${colorScheme.textFieldBorderColor}`,
                            position: 'sticky',
                            left: 0,
                            zIndex: 2,
                            bgcolor: colorScheme.surfaceColor,
                            color: colorScheme.textColor,
                          }}
                        >
                          {row.leaveType || '-'}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: '12px',
                            fontWeight: 600,
                            px: 2,
                            py: 1.5,
                            borderRight: `1px solid ${colorScheme.textFieldBorderColor}`,
                            textAlign: 'center',
                            color: colorScheme.textColor,
                          }}
                        >
                          {allowedDays > 0 ? allowedDays : '-'}
                        </TableCell>
                        {usedByMonth.map((days: number, monthIndex: number) => (
                          <TableCell
                            key={monthIndex}
                            sx={{
                              fontSize: '11px',
                              fontWeight: 600,
                              px: 1,
                              py: 1.5,
                              textAlign: 'center',
                              borderRight: monthIndex < 11 ? `1px solid ${colorScheme.textFieldBorderColor}` : 'none',
                              color: days > 0 ? colorScheme.textColor : colorScheme.hintTextColor,
                              minWidth: '50px',
                              width: '50px',
                            }}
                          >
                            {days > 0 ? days : '-'}
                          </TableCell>
                        ))}
                        <TableCell
                          sx={{
                            fontSize: '12px',
                            fontWeight: 600,
                            px: 2,
                            py: 1.5,
                            borderRight: `1px solid ${colorScheme.textFieldBorderColor}`,
                            textAlign: 'center',
                            color: colorScheme.textColor,
                          }}
                        >
                          {totalUsed > 0 ? totalUsed : '-'}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: '12px',
                            fontWeight: 600,
                            px: 2,
                            py: 1.5,
                            textAlign: 'center',
                            color: remainDays > 0
                              ? (isDark ? '#34D399' : '#059669')
                              : (isDark ? '#F87171' : '#DC2626'),
                          }}
                        >
                          {remainDays}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={16} align="center" sx={{ py: 4 }}>
                      <Typography sx={{ color: colorScheme.hintTextColor }}>데이터가 없습니다</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setManagementTableDialogOpen(false)} variant="contained">
            닫기
          </Button>
        </DialogActions>
      </Dialog>

      {/* 취소 상신 다이얼로그 */}
      <LeaveCancelRequestDialog
        open={cancelRequestModalOpen}
        onClose={() => {
          setCancelRequestModalOpen(false);
          setCancelRequestLeave(null);
        }}
        onSuccess={handleCancelSuccess}
        leave={cancelRequestLeave}
        userId={userId}
      />
      {/* AI 휴가 추천 모달 */}
      <VacationRecommendationModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        userId={userId}
        year={selectedYear}
      />


    </>
  );
};

export default DesktopLeaveManagementModals;
