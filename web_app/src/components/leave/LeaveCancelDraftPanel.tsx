import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Divider,
    CircularProgress,
    Snackbar,
    Alert,
    IconButton,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { useLeaveCancelDraftStore } from '../../store/leaveCancelDraftStore';
import leaveService from '../../services/leaveService';
import authService from '../../services/authService';

/** 날짜 문자열을 YYYY-MM-DD 형식으로 정규화 */
const formatDate = (isoDate: string): string => {
    if (!isoDate) return '-';
    return isoDate.split('T')[0];
};

/** 반일 구분 라벨 */
const halfDayLabel = (slot: string): string => {
    switch (slot) {
        case 'AM': return '오전 반차';
        case 'PM': return '오후 반차';
        default: return '종일';
    }
};

function LeaveCancelDraftPanel() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isDark = theme.palette.mode === 'dark';
    const { isOpen, pendingData, closePanel } = useLeaveCancelDraftStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({ open: false, message: '', severity: 'success' });

    if (!isOpen || !pendingData) return null;

    const handleSubmit = async () => {
        const user = authService.getCurrentUser();
        if (!user?.userId) {
            setSnackbar({ open: true, message: '로그인 정보를 확인할 수 없습니다.', severity: 'error' });
            return;
        }

        const confirmed = window.confirm(
            '휴가 취소 상신을 진행하시겠습니까?\n취소 상신은 재취소가 불가능하니 신중하게 검토해주세요.'
        );
        if (!confirmed) return;

        setIsSubmitting(true);
        try {
            const result = await leaveService.requestLeaveCancel({
                id: pendingData.id,
                userId: user.userId,
                reason: pendingData.cancel_reason || '',
            });

            if (result.error) {
                setSnackbar({ open: true, message: result.error, severity: 'error' });
            } else {
                setSnackbar({ open: true, message: '휴가 취소 상신이 완료되었습니다.', severity: 'success' });
                setTimeout(() => closePanel(), 1500);
            }
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error?.message || '휴가 취소 상신에 실패했습니다.',
                severity: 'error',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const InfoRow = ({ label, value }: { label: string; value: string }) => (
        <Box
            sx={{
                display: 'flex',
                py: 1.5,
                px: 1.25,
                borderRadius: '10px',
                border: `1px solid ${isDark ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.18)'}`,
                bgcolor: isDark ? 'rgba(148,163,184,0.04)' : 'rgba(248,250,252,0.9)',
                mb: 0.75,
                alignItems: 'flex-start',
                gap: 1,
            }}
        >
            <Typography
                variant="body2"
                sx={{ width: 88, flexShrink: 0, fontWeight: 700, color: isDark ? '#CBD5E1' : '#334155', pt: 0.1 }}
            >
                {label}
            </Typography>
            <Typography variant="body2" sx={{ flex: 1, color: 'text.primary', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {value}
            </Typography>
        </Box>
    );

    const startDate = formatDate(pendingData.start_date);
    const endDate = formatDate(pendingData.end_date);
    const dateDisplay = startDate === endDate ? startDate : `${startDate} ~ ${endDate}`;

    return (
        <>
            <Dialog
                open={isOpen}
                onClose={isSubmitting ? undefined : closePanel}
                fullScreen={isMobile}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: isMobile ? 0 : '20px',
                        border: `1px solid ${isDark ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.18)'}`,
                        bgcolor: isDark ? 'rgba(15,23,42,0.96)' : 'rgba(255,255,255,0.96)',
                        backdropFilter: 'blur(14px)',
                        boxShadow: isDark ? '0 24px 60px rgba(2,6,23,0.5)' : '0 24px 60px rgba(15,23,42,0.14)',
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        py: 1.75,
                        px: 2,
                        borderBottom: `1px solid ${isDark ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.18)'}`,
                        bgcolor: isDark ? 'rgba(15,23,42,0.78)' : 'rgba(255,255,255,0.82)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: isDark ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.10)',
                            border: `1px solid ${isDark ? 'rgba(148,163,184,0.18)' : 'rgba(148,163,184,0.16)'}`,
                            color: isDark ? '#E2E8F0' : '#475569',
                            flexShrink: 0,
                        }}
                    >
                        <EventBusyIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>
                        휴가 취소 상신
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={closePanel}
                        disabled={isSubmitting}
                        sx={{
                            color: 'text.primary',
                            border: `1px solid ${isDark ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.18)'}`,
                            borderRadius: '12px',
                            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
                            '&:hover': {
                                bgcolor: isDark ? 'rgba(148,163,184,0.10)' : 'rgba(148,163,184,0.10)',
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ pt: 2.5, px: 2, pb: 1 }}>
                    <Typography variant="body2" sx={{ mb: 2, color: isDark ? '#CBD5E1' : '#475569' }}>
                        아래 내용을 확인한 후 취소 상신 버튼을 눌러주세요.
                    </Typography>

                    <InfoRow label="휴가 종류" value={pendingData.leave_type || '-'} />
                    <InfoRow label="기간" value={dateDisplay} />
                    <InfoRow label="반일 구분" value={halfDayLabel(pendingData.half_day_slot)} />
                    <InfoRow label="취소 사유" value={pendingData.cancel_reason || '-'} />
                    {pendingData.reason && (
                        <InfoRow label="원래 사유" value={pendingData.reason} />
                    )}
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 2,
                        pb: 2,
                        pt: 1.25,
                        borderTop: `1px solid ${isDark ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.18)'}`,
                        bgcolor: isDark ? 'rgba(15,23,42,0.72)' : 'rgba(255,255,255,0.82)',
                        backdropFilter: 'blur(10px)',
                        gap: 1,
                    }}
                >
                    <Button
                        onClick={closePanel}
                        disabled={isSubmitting}
                        variant="outlined"
                        color="inherit"
                        sx={{
                            flex: 1,
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderColor: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(148,163,184,0.20)',
                            color: isDark ? '#E2E8F0' : '#334155',
                            '&:hover': {
                                borderColor: isDark ? 'rgba(148,163,184,0.24)' : 'rgba(148,163,184,0.24)',
                                bgcolor: isDark ? 'rgba(148,163,184,0.08)' : 'rgba(148,163,184,0.08)',
                            },
                        }}
                    >
                        닫기
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        variant="contained"
                        sx={{
                            flex: 1,
                            fontWeight: 700,
                            borderRadius: '12px',
                            textTransform: 'none',
                            bgcolor: isDark ? '#E2E8F0' : '#475569',
                            color: isDark ? '#0F172A' : '#FFFFFF',
                            boxShadow: '0 1px 3px rgba(15,23,42,0.10)',
                            transition: 'all 160ms ease-out',
                            '&:hover': {
                                bgcolor: isDark ? '#F8FAFC' : '#334155',
                                transform: 'translateY(-1px)',
                                boxShadow: isDark ? '0 8px 18px rgba(2,6,23,0.18)' : '0 8px 18px rgba(15,23,42,0.10)',
                            },
                        }}
                        startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <EventBusyIcon />}
                    >
                        {isSubmitting ? '처리 중...' : '취소 상신'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    variant="outlined"
                    sx={{
                        borderRadius: '12px',
                        bgcolor: isDark ? 'rgba(15,23,42,0.94)' : 'rgba(255,255,255,0.96)',
                        color: isDark ? '#E2E8F0' : '#111827',
                        borderColor: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(148,163,184,0.20)',
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}

export default LeaveCancelDraftPanel;
