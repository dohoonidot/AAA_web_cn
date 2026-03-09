/**
 * LeaveApprovalPanel - 휴가 결재 패널
 * 
 * 알림함에서 휴가 결재 알림 클릭 시 표시되는 모달 패널
 * - 관리자화면 이동 버튼으로 해당 건 상세 페이지로 이동
 */
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Chip,
    Divider,
    IconButton,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import DescriptionIcon from '@mui/icons-material/Description';
import authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';

import dayjs from 'dayjs';

export interface LeaveApprovalData {
    id: number;
    status: string;
    name: string;
    department?: string;
    jobPosition?: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    halfDaySlot?: string;
    workdaysCount?: number;
    requestedDate?: string;
    reason?: string;
    isCancel?: number;
    message?: string; // 추가: 알림 메시지 내용
}

interface LeaveApprovalPanelProps {
    open: boolean;
    onClose: () => void;
    leaveData: LeaveApprovalData | null;
    approverId: string;
    onApprovalComplete?: () => void;
}

export const LeaveApprovalPanel: React.FC<LeaveApprovalPanelProps> = ({
    open,
    onClose,
    leaveData,
    approverId,
    onApprovalComplete,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isDark = theme.palette.mode === 'dark';
    const navigate = useNavigate();

    if (!leaveData) return null;

    // 관리자 여부 확인
    const isApprover = authService.isApprover();

    // 취소상신 여부 확인
    const isPending = leaveData.status?.toUpperCase().includes('REQUESTED');

    // 상태 라벨
    const getStatusLabel = (status: string): string => {
        const upperStatus = status?.toUpperCase() || '';
        if (upperStatus.includes('CANCEL') && upperStatus.includes('REQUESTED')) {
            return '취소 상신 대기';
        }
        switch (upperStatus) {
            case 'REQUESTED': return '대기중';
            case 'APPROVED': return '승인됨';
            case 'REJECTED': return '반려됨';
            case 'CANCELLED': return '취소됨';
            default: return status;
        }
    };

    // 상태 색상
    const getStatusColor = (status: string) => {
        const upperStatus = status?.toUpperCase() || '';
        if (upperStatus.includes('CANCEL')) return 'warning';
        if (upperStatus === 'APPROVED') return 'success';
        if (upperStatus === 'REJECTED') return 'error';
        return 'info';
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="sm"
                fullWidth
                fullScreen={isMobile}
                PaperProps={{
                    sx: {
                        borderRadius: isMobile ? 0 : 2,
                        bgcolor: isDark ? '#1e1e1e' : '#fff',
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        pb: 1,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" fontWeight={600}>
                            {leaveData.status?.toUpperCase().includes('CANCEL') ? '휴가 취소 결재' : '휴가 결재'}
                        </Typography>
                        <Chip
                            label={getStatusLabel(leaveData.status)}
                            color={getStatusColor(leaveData.status)}
                            size="small"
                        />
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    {/* 내용 (Message) */}
                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <DescriptionIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                            <Typography variant="subtitle2" color="text.secondary">
                                내용
                            </Typography>
                        </Box>
                        <Typography
                            variant="body1"
                            fontWeight={500}
                            sx={{
                                p: 1.5,
                                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                borderRadius: 1,
                            }}
                        >
                            {leaveData.message || leaveData.reason || '내용 없음'}
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* 신청일 (Requested Date / Sent Time) */}
                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <EventIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                            <Typography variant="subtitle2" color="text.secondary">
                                신청일
                            </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={500}>
                            {leaveData.requestedDate
                                ? dayjs(leaveData.requestedDate).format('YYYY-MM-DD HH:mm')
                                : '-'}
                        </Typography>
                    </Box>
                </DialogContent>

                {isPending && isApprover && (
                    <DialogActions sx={{ p: 2, gap: 1 }}>
                        {/* 관리자화면 이동 버튼 - 해당 건의 상세 모달 열기 */}
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ py: 1.2 }}
                            onClick={() => {
                                onClose();
                                // leaveId를 쿼리 파라미터로 전달하여 관리자 페이지로 이동
                                navigate(`/admin-leave?leaveId=${leaveData.id}`);
                            }}
                        >
                            관리자화면 이동
                        </Button>
                    </DialogActions>
                )}
            </Dialog>
        </>
    );
};

export default LeaveApprovalPanel;
