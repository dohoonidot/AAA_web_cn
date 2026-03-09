/**
 * LeaveApprovalListPanel - 결재 대기 목록 슬라이드 패널
 *
 * 아이콘 클릭 시 열리며, API를 호출하여 현재 대기 중인 결재건을 조회하여 표시
 * Flutter의 _buildApprovalSlidePanel과 동일한 역할
 * 승인/반려 기능 포함
 */
import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  Button,
  CircularProgress,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  alpha,
  Tooltip,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNotificationStore } from '../../store/notificationStore';
import leaveService from '../../services/leaveService';
import authService from '../../services/authService';
import type { AdminWaitingLeave } from '../../types/leave';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { formatServerDateTime } from '../../pages/admin/AdminLeaveApproval.shared';

const PANEL_WIDTH = 450;

export const LeaveApprovalListPanel: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const {
    isLeaveApprovalListPanelOpen,
    closeLeaveApprovalListPanel,
  } = useNotificationStore();

  const [loading, setLoading] = useState(false);
  const [waitingLeaves, setWaitingLeaves] = useState<AdminWaitingLeave[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // 반려 다이얼로그 상태
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<AdminWaitingLeave | null>(null);
  const [rejectMessage, setRejectMessage] = useState('');

  // 승인 다이얼로그 상태 (취소 승인용 - 관리자 화면과 동일하게 구현)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<AdminWaitingLeave | null>(null);

  // 패널이 열릴 때 API 호출
  useEffect(() => {
    if (isLeaveApprovalListPanelOpen) {
      fetchWaitingLeaves();
    }
  }, [isLeaveApprovalListPanelOpen]);

  const fetchWaitingLeaves = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = authService.getCurrentUser();
      if (!user?.userId) {
        setError('사용자 정보를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      console.log('[LeaveApprovalListPanel] API 호출 시작:', user.userId);
      const result = await leaveService.getAdminWaitingLeaves(user.userId);
      console.log('[LeaveApprovalListPanel] API 응답:', result);
      result.forEach((leave, idx) => {
        console.log(`[LeaveApprovalListPanel] 항목[${idx}]:`, { id: leave.id, name: leave.name, status: leave.status, isCancel: leave.isCancel });
      });

      setWaitingLeaves(result);
    } catch (err: any) {
      console.error('[LeaveApprovalListPanel] API 에러:', err);
      setError('결재 대기 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // 다이얼로그가 열려있으면 패널 닫지 않음
    if (rejectDialogOpen || approveDialogOpen) return;
    closeLeaveApprovalListPanel();
  };

  // 취소 요청 여부 판별 (관리자 화면과 동일하게 isCancel + status 모두 체크)
  const isCancelRequest = (leave: AdminWaitingLeave) =>
    leave.isCancel === 1 || leave.status === 'CANCEL_REQUESTED';

  // 승인 처리 (관리자 화면 AdminLeaveApprovalScreen.state.ts의 handleApprove와 동일)
  const handleApprove = async (leave: AdminWaitingLeave) => {
    const user = authService.getCurrentUser();
    if (!user?.userId) return;

    // 일반 승인의 경우 confirm, 취소 승인은 Dialog에서 호출되므로 생략
    if (!approveDialogOpen && !isCancelRequest(leave)) {
      if (!window.confirm(`${leave.name}님의 휴가를 승인하시겠습니까?`)) {
        return;
      }
    }

    setProcessingId(leave.id);

    try {
      const isCancel = isCancelRequest(leave);
      console.log('[LeaveApprovalListPanel] 승인 처리:', { id: leave.id, isCancel, status: leave.status });

      if (isCancel) {
        // 취소 승인: 관리자 화면과 100% 동일하게 processCancelApproval 사용
        await leaveService.processCancelApproval({
          id: leave.id,
          approverId: user.userId,
        });
      } else {
        // 일반 승인
        await leaveService.processAdminApproval({
          id: leave.id,
          approverId: user.userId,
          isApproved: 'APPROVED',
        });
      }

      console.log('[LeaveApprovalListPanel] 승인 완료');

      // 목록에서 제거
      setWaitingLeaves((prev) => prev.filter((l) => l.id !== leave.id));
    } catch (err: any) {
      console.error('[LeaveApprovalListPanel] 승인 실패:', err);
      alert(`승인 처리 실패: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  // 반려 다이얼로그 열기
  const handleOpenRejectDialog = (leave: AdminWaitingLeave) => {
    setRejectTarget(leave);
    setRejectMessage('');
    setRejectDialogOpen(true);
  };

  // 반려 처리
  const handleReject = async () => {
    if (!rejectTarget) return;

    const user = authService.getCurrentUser();
    if (!user?.userId) return;

    if (!rejectMessage.trim()) {
      alert('반려 사유를 입력해주세요.');
      return;
    }

    setProcessingId(rejectTarget.id);
    setRejectDialogOpen(false);

    try {
      console.log('[LeaveApprovalListPanel] 반려 처리:', rejectTarget.id);

      await leaveService.processAdminApproval({
        id: rejectTarget.id,
        approverId: user.userId,
        isApproved: 'REJECTED',
        rejectMessage: rejectMessage.trim(),
        isCancel: rejectTarget.isCancel,
      });

      console.log('[LeaveApprovalListPanel] 반려 완료');

      // 목록에서 제거
      setWaitingLeaves((prev) => prev.filter((l) => l.id !== rejectTarget.id));
    } catch (err: any) {
      console.error('[LeaveApprovalListPanel] 반려 실패:', err);
      alert(`반려 처리 실패: ${err.message}`);
    } finally {
      setProcessingId(null);
      setRejectTarget(null);
    }
  };

  // 상태 라벨 스타일
  const getTypeColor = (type: string) => {
    if (type === '연차') return '#4facfe'; // Blue
    if (type === '반차') return '#00f2fe'; // Cyan
    if (type === '병가') return '#ff9a9e'; // Pink
    return '#a18cd1'; // Purple
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={isLeaveApprovalListPanelOpen}
        onClose={handleClose}
        sx={{ zIndex: 1400 }}
        PaperProps={{
          sx: {
            width: PANEL_WIDTH,
            maxWidth: '100vw',
            bgcolor: isDark ? '#121212' : '#f8f9fc',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.05)',
          },
        }}
      >
        {/* 헤더 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3,
            bgcolor: isDark ? '#1e1e1e' : '#fff',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
              결재 대기 목록
            </Typography>
            <Typography variant="body2" color="text.primary">
              처리해야 할 요청이 <Box component="span" color="primary.main" fontWeight={700}>{waitingLeaves.length}</Box>건 있습니다
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="목록 새로고침">
              <IconButton
                onClick={fetchWaitingLeaves}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <RefreshRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* 하단 그라데이션 라인 */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #2962FF 0%, #6200EA 100%)',
              opacity: 0.8
            }}
          />
        </Box>

        {/* 컨텐츠 */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: 2 }}>
              <CircularProgress size={32} thickness={4} />
              <Typography variant="body2" color="text.secondary">데이터를 불러오는 중...</Typography>
            </Box>
          ) : error ? (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: alpha(theme.palette.error.main, 0.05),
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                borderRadius: 3
              }}
            >
              <Typography color="error" variant="subtitle2" gutterBottom>{error}</Typography>
              <Button size="small" variant="outlined" color="error" onClick={fetchWaitingLeaves} startIcon={<RefreshRoundedIcon />}>
                다시 시도
              </Button>
            </Paper>
          ) : waitingLeaves.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', opacity: 0.5 }}>
              <DescriptionRoundedIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                대기 중인 결재가 없습니다
              </Typography>
              <Typography variant="body2" color="text.secondary">
                새로운 요청이 들어오면 알려드릴게요!
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {waitingLeaves.map((leave) => (
                <Paper
                  key={leave.id}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
                    bgcolor: isDark ? '#252525' : '#fff',
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  {/* 취소 상신 뱃지 */}
                  {isCancelRequest(leave) && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bgcolor: '#ff5252',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        px: 1.5,
                        py: 0.5,
                        borderBottomLeftRadius: 8
                      }}
                    >
                      취소 요청
                    </Box>
                  )}

                  {/* 로딩 오버레이 */}
                  {processingId === leave.id && (
                    <Box sx={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      bgcolor: 'rgba(255,255,255,0.7)', zIndex: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backdropFilter: 'blur(2px)'
                    }}>
                      <CircularProgress size={24} />
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {/* 상단: 유저 정보 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{
                        width: 40, height: 40, borderRadius: '12px',
                        bgcolor: alpha(getTypeColor(leave.leaveType), 0.1),
                        color: getTypeColor(leave.leaveType),
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <PersonRoundedIcon />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                          {leave.name}
                          <Typography component="span" variant="caption" color="text.primary" sx={{ ml: 0.8, fontWeight: 400 }}>
                            {leave.department}
                          </Typography>
                        </Typography>
                        <Typography variant="caption" color="text.primary" fontWeight={500}>
                          {leave.leaveType} · {leave.workdaysCount}일
                        </Typography>
                      </Box>
                    </Box>

                    {/* 기간 정보 */}
                    <Box sx={{
                      p: 1.5,
                      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f5f7fa',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5
                    }}>
                      <CalendarTodayRoundedIcon sx={{ fontSize: 16, color: 'text.primary' }} />
                      <Typography variant="body2" fontWeight={500} color="text.primary">
                        {dayjs(leave.startDate).locale('ko').format('YYYY-MM-DD (ddd)')}
                        {leave.startDate !== leave.endDate && ` ~ ${dayjs(leave.endDate).locale('ko').format('YYYY-MM-DD (ddd)')}`}
                      </Typography>
                      {(() => {
                        const halfDaySlot = leave.halfDaySlot || (leave as any).half_day_slot;
                        if (!halfDaySlot || halfDaySlot === 'ALL') return null;
                        return (
                          <Typography variant="caption" sx={{
                            bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', px: 0.8, py: 0.2, borderRadius: 1
                          }}>
                            {halfDaySlot === 'AM' ? '오전' : '오후'}
                          </Typography>
                        );
                      })()}
                    </Box>

                    {/* 사유 (있을 경우만) */}
                    {leave.reason && (
                      <Typography variant="body2" color="text.primary" sx={{ px: 0.5 }}>
                        "{leave.reason}"
                      </Typography>
                    )}

                    {/* 액션 버튼 그룹 */}
                    <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
                      {isCancelRequest(leave) ? (
                        // 취소 상신인 경우: 관리자 화면과 동일한 스타일 및 동작 (다이얼로그 오픈)
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => {
                            setApproveTarget(leave);
                            setApproveDialogOpen(true);
                          }}
                          disabled={processingId === leave.id}
                          startIcon={<CheckCircleIcon />}
                          sx={{
                            borderRadius: '12px',
                            boxShadow: 'none',
                            fontWeight: 600,
                            bgcolor: '#1cc88a',
                            '&:hover': { bgcolor: '#17a673', boxShadow: 'none' }
                          }}
                        >
                          취소 승인
                        </Button>
                      ) : (
                        // 일반 상신인 경우: 승인/반려 버튼 모두 표시
                        <>
                          <Button
                            variant="outlined"
                            color="error" // 붉은색이지만 아웃라인으로 부드럽게
                            onClick={() => handleOpenRejectDialog(leave)}
                            disabled={processingId === leave.id}
                            sx={{
                              flex: 1,
                              borderRadius: '12px',
                              textTransform: 'none',
                              fontWeight: 600,
                              py: 1,
                              borderWidth: '1.5px',
                              '&:hover': { borderWidth: '1.5px', bgcolor: alpha(theme.palette.error.main, 0.05) }
                            }}
                            startIcon={<CloseRoundedIcon />}
                          >
                            반려
                          </Button>
                          <Button
                            variant="contained"
                            // success 색상 대신 커스텀 그라데이션 사용 가능하나, 여기선 깔끔한 success 사용
                            onClick={() => handleApprove(leave)}
                            disabled={processingId === leave.id}
                            sx={{
                              flex: 2,
                              borderRadius: '12px',
                              textTransform: 'none',
                              fontWeight: 600,
                              py: 1,
                              boxShadow: 'none',
                              bgcolor: '#1cc88a', // 부드러운 초록색
                              '&:hover': { bgcolor: '#17a673', boxShadow: 'none' }
                            }}
                            startIcon={<CheckRoundedIcon />}
                          >
                            승인하기
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>
                </Paper>
              ))}
            </List>
          )}
        </Box>
      </Drawer>

      {/* 반려 사유 입력 다이얼로그 - 깔끔하게 개선 */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        sx={{ zIndex: 1500 }}
        PaperProps={{
          sx: { borderRadius: '20px', p: 1 }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 3, textAlign: 'center', fontWeight: 800 }}>
          반려 사유 입력
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            <Box component="span" fontWeight={700} color="text.primary">{rejectTarget?.name}</Box>님의 요청을 반려하시겠습니까?
            <br />사유를 입력하면 요청자에게 전달됩니다.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            variant="filled"
            label="반려 사유"
            placeholder="예: 업무 일정으로 인해 반려합니다."
            value={rejectMessage}
            onChange={(e) => setRejectMessage(e.target.value)}
            sx={{
              '& .MuiFilledInput-root': {
                borderRadius: '12px',
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f5f7fa',
                '&:before, &:after': { border: 'none' }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
          <Button
            onClick={() => setRejectDialogOpen(false)}
            color="inherit"
            sx={{ borderRadius: '12px', px: 3, color: 'text.secondary' }}
          >
            취소
          </Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error" // 여기서만 강조를 위해 빨간색 유지
            disabled={!rejectMessage.trim()}
            sx={{ borderRadius: '12px', px: 4, elevation: 0 }}
          >
            반려 확정
          </Button>
        </DialogActions>
      </Dialog>

      {/* 승인 다이얼로그 (취소 승인용) - AdminLeaveApprovalPage와 동일한 디자인 */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{ zIndex: 1500 }}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            bgcolor: isDark ? '#1e1e1e' : '#fff',
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 3, px: 3 }}>
          <CheckCircleIcon sx={{ color: '#20C997' }} />
          <Typography variant="h6" component="span" fontWeight={600}>
            휴가 승인
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          {approveTarget && (
            <Box sx={{ pt: 1 }}>
              <Box sx={{ mb: 2, p: 2, bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F5F5F5', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  신청자
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {approveTarget.name} ({approveTarget.department})
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
                  휴가 종류
                </Typography>
                <Typography variant="body1">
                  {approveTarget.leaveType}
                  {approveTarget.isCancel === 1 && (
                    <Chip label="취소 상신" size="small" color="warning" sx={{ ml: 1, height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }} />
                  )}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
                  휴가 기간
                </Typography>
                <Typography variant="body1">
                  {dayjs(approveTarget.startDate).format('YYYY-MM-DD')} ~ {dayjs(approveTarget.endDate).format('YYYY-MM-DD')} ({approveTarget.workdaysCount}일)
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
                  신청일
                </Typography>
                <Typography variant="body1">
                  {formatServerDateTime(approveTarget.requestedDate || approveTarget.startDate)}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
                  사유
                </Typography>
                <Typography variant="body1">
                  {approveTarget.reason || '사유 없음'}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setApproveDialogOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              borderWidth: '1.5px',
              fontWeight: 600,
              color: 'text.secondary',
              borderColor: 'text.disabled',
              '&:hover': {
                borderWidth: '1.5px',
                bgcolor: alpha(theme.palette.text.primary, 0.05)
              }
            }}
          >
            취소
          </Button>
          <Button
            onClick={() => {
              if (approveTarget) {
                handleApprove(approveTarget);
                setApproveDialogOpen(false);
              }
            }}
            variant="contained"
            sx={{
              bgcolor: '#1cc88a',
              borderRadius: '12px',
              boxShadow: 'none',
              fontWeight: 600,
              '&:hover': { bgcolor: '#17a673', boxShadow: 'none' }
            }}
          >
            승인하기
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LeaveApprovalListPanel;
