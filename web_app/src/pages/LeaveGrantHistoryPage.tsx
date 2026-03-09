import React, { useMemo } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Container,
    CircularProgress,
    Button,
    Dialog,
    DialogContent,
    DialogActions,
    Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import DescriptionIcon from '@mui/icons-material/Description';
import dayjs from 'dayjs';
import { formatDateTime } from '../utils/notificationHelpers';
import { useThemeStore } from '../store/themeStore';
import { useLeaveGrantHistoryPageState } from './LeaveGrantHistoryPage.state';
import type { LeaveGrantRequestItem } from '../types/leave';

// --- Main Component ---
const LeaveGrantHistoryPage: React.FC = () => {
    const { colorScheme } = useThemeStore();
    const isDark = colorScheme.name === 'Dark';

    const calendarSurface = isDark ? '#0B1120' : '#F8FAFC';
    const calendarBorder = isDark ? 'rgba(148, 163, 184, 0.2)' : '#E2E8F0';
    const calendarShadow = isDark ? '0 18px 32px rgba(0,0,0,0.35)' : '0 16px 30px rgba(15, 23, 42, 0.08)';

    const { state, actions } = useLeaveGrantHistoryPageState();
    const { loading, history, selectedItem, error } = state;
    const { setSelectedItem, fetchHistory, navigate, openAttachment } = actions;

    const getStatusColor = (status: string) => {
        const lower = status.toLowerCase();
        if (lower.includes('complete') || lower.includes('done') || status.includes('완료')) return '#20C997';
        if (lower.includes('process') || lower.includes('progress') || status.includes('진행')) return '#3B82F6';
        if (lower.includes('approved') || status.includes('승인')) return '#20C997';
        if (lower.includes('rejected') || status.includes('반려')) return '#DC3545';
        if (lower.includes('pending') || status.includes('대기')) return '#FF8C00';
        if (lower.includes('cancel') || status.includes('취소')) return '#94A3B8';
        return '#F59E0B';
    };

    const getStatusLabel = (status: string) => {
        if (!status) return '알 수 없음';
        const lower = status.toLowerCase();
        if (lower.includes('complete') || lower.includes('done')) return '완료';
        if (lower.includes('process') || lower.includes('progress')) return '진행중';
        if (lower.includes('approved')) return '승인됨';
        if (lower.includes('rejected')) return '반려됨';
        if (lower.includes('cancel') || status.includes('취소')) return '취소됨';
        if (lower.includes('request')) return '상신됨';
        if (status.includes('승인')) return '승인됨';
        if (status.includes('반려')) return '반려됨';
        if (status.includes('대기')) return '대기중';
        if (status.includes('취소')) return '취소됨';
        if (status.includes('진행')) return '진행중';
        if (status.includes('완료')) return '완료';
        if (status.includes('상신') || status.includes('요청') || status.includes('신청')) return '상신됨';
        return status;
    };

    const isApprovedStatus = (status: string) => {
        const lower = status.toLowerCase();
        return lower.includes('approved') || status.includes('승인') || lower.includes('complete') || lower.includes('done') || status.includes('완료');
    };

    const isRejectedStatus = (status: string) => {
        const lower = status.toLowerCase();
        return lower.includes('rejected') || status.includes('반려');
    };

    const formatDate = (date: Date | string | null) => {
        if (!date) return '-';
        if (typeof date === 'string') return formatDateTime(date);
        return dayjs(date).format('YYYY-MM-DD HH:mm');
    };

    const formatDays = (days: number) => {
        const formatted = days.toFixed(1);
        return formatted.endsWith('.0') ? formatted.substring(0, formatted.length - 2) : formatted;
    };

    const stats = useMemo(() => {
        const total = history.length;
        const managerCount = history.filter(item => item.isManager === 1).length;
        const approved = history.filter(item => item.isManager === 0 && isApprovedStatus(item.status)).length;
        const rejected = history.filter(item => isRejectedStatus(item.status)).length;
        const pending = history.filter(item => {
            const status = item.status.toLowerCase();
            return status.includes('pending') || status.includes('대기') ||
                status.includes('process') || status.includes('progress') ||
                status.includes('request') || item.status.includes('상신') ||
                item.status.includes('진행') || item.status.includes('요청') ||
                item.status.includes('신청');
        }).length;
        return { total, managerCount, approved, rejected, pending };
    }, [history]);

    const parseLeaveReason = (reason?: string) => {
        if (!reason) return { cancelReason: '', mainReason: '' };
        return { cancelReason: '', mainReason: reason.trim() };
    };

    return (
        <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: isDark ? '#0A0F1A' : '#F1F5F9',
            height: { xs: 'var(--app-height)', md: '100vh' },
            overflow: 'hidden',
        }}>
            {/* AppBar */}
            <Box sx={{
                height: 64,
                display: 'flex',
                alignItems: 'center',
                px: 2,
                bgcolor: calendarSurface,
                borderBottom: `1px solid ${calendarBorder}`,
                justifyContent: 'space-between',
                flexShrink: 0,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        size="small"
                        sx={{
                            color: colorScheme.textColor,
                            border: `1px solid ${calendarBorder}`,
                            borderRadius: '10px',
                            '&:hover': { bgcolor: isDark ? 'rgba(59,130,246,0.12)' : '#EFF6FF' },
                        }}
                    >
                        <ArrowBackIcon fontSize="small" />
                    </IconButton>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            bgcolor: isDark ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <DescriptionIcon sx={{ fontSize: 17, color: isDark ? '#60A5FA' : '#3B82F6' }} />
                        </Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '17px', color: colorScheme.textColor }}>
                            휴가 부여 내역
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    onClick={fetchHistory}
                    size="small"
                    sx={{
                        color: colorScheme.textColor,
                        border: `1px solid ${calendarBorder}`,
                        borderRadius: '10px',
                        '&:hover': { bgcolor: isDark ? 'rgba(59,130,246,0.12)' : '#EFF6FF' },
                    }}
                >
                    <RefreshIcon fontSize="small" />
                </IconButton>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                <Container maxWidth="md" sx={{ p: 0, pb: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>

                    {/* 요약 패널 */}
                    <Box sx={{
                        m: 2,
                        p: 2,
                        borderRadius: '14px',
                        bgcolor: isDark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.04)',
                        border: `1px solid ${isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.15)'}`,
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                            <DescriptionIcon sx={{ fontSize: 14, color: isDark ? '#60A5FA' : '#3B82F6' }} />
                            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#60A5FA' : '#3B82F6', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                내 휴가 부여 내역
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                            {[
                                { label: '전체', value: stats.total },
                                { label: '대기', value: stats.pending, color: isDark ? '#FBBF24' : '#FF8C00' },
                                { label: '반려', value: stats.rejected, color: isDark ? '#F87171' : '#DC3545' },
                                { label: '관리자부여', value: stats.managerCount, color: isDark ? '#A78BFA' : '#7C3AED' },
                                { label: '관리자승인', value: stats.approved, color: isDark ? '#34D399' : '#20C997' },
                            ].map((s) => (
                                <Box
                                    key={s.label}
                                    sx={{
                                        px: 1.25,
                                        py: 0.75,
                                        borderRadius: '8px',
                                        bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)',
                                        border: `1px solid ${calendarBorder}`,
                                        textAlign: 'center',
                                        minWidth: 48,
                                    }}
                                >
                                    <Typography sx={{ fontSize: '16px', fontWeight: 800, color: s.color || (isDark ? '#60A5FA' : '#3B82F6'), lineHeight: 1 }}>
                                        {s.value}
                                    </Typography>
                                    <Typography sx={{ fontSize: '10px', color: colorScheme.hintTextColor, mt: 0.25 }}>
                                        {s.label}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* Content */}
                    {loading ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
                            <CircularProgress size={30} />
                            <Typography sx={{ color: colorScheme.hintTextColor, fontSize: '14px' }}>
                                불러오는 중...
                            </Typography>
                        </Box>
                    ) : error ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
                            <ErrorOutlineIcon sx={{ fontSize: 48, color: isDark ? '#F87171' : '#DC3545' }} />
                            <Typography sx={{ color: colorScheme.hintTextColor, fontSize: '14px' }}>{error}</Typography>
                            <Button startIcon={<RefreshIcon />} onClick={fetchHistory}>다시 시도</Button>
                        </Box>
                    ) : history.length === 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
                            <InboxOutlinedIcon sx={{ fontSize: 52, color: colorScheme.hintTextColor }} />
                            <Typography sx={{ color: colorScheme.hintTextColor, fontSize: '14px' }}>
                                휴가 부여 내역이 없습니다.
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ px: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                            {history.map((item: LeaveGrantRequestItem) => {
                                const statusColor = getStatusColor(item.status);
                                const statusLabel = getStatusLabel(item.status);

                                return (
                                    <Box
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        sx={{
                                            p: 1.75,
                                            borderRadius: '14px',
                                            bgcolor: calendarSurface,
                                            border: `1px solid ${calendarBorder}`,
                                            boxShadow: calendarShadow,
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.04)' },
                                        }}
                                    >
                                        {/* 상단: 상태 + 타입 + 일수 */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                                                <Box sx={{
                                                    px: 0.75,
                                                    py: 0.2,
                                                    borderRadius: '999px',
                                                    bgcolor: `${statusColor}1A`,
                                                    border: `1px solid ${statusColor}55`,
                                                }}>
                                                    <Typography sx={{ fontSize: '11px', fontWeight: 700, color: statusColor, lineHeight: 1.2 }}>
                                                        {statusLabel}
                                                    </Typography>
                                                </Box>
                                                <Typography sx={{ fontSize: '11px', color: colorScheme.hintTextColor, border: `1px solid ${calendarBorder}`, px: 0.75, py: 0.2, borderRadius: '999px' }}>
                                                    {item.isManager === 1 ? '관리자 부여' : '사용자 신청'}
                                                </Typography>
                                                {item.leaveType && (
                                                    <Typography sx={{ fontSize: '11px', color: colorScheme.hintTextColor, border: `1px solid ${calendarBorder}`, px: 0.75, py: 0.2, borderRadius: '999px' }}>
                                                        {item.leaveType}
                                                    </Typography>
                                                )}
                                            </Box>
                                            {item.grantDays > 0 && (
                                                <Typography sx={{ fontSize: '13px', fontWeight: 800, color: isDark ? '#60A5FA' : '#3B82F6' }}>
                                                    {formatDays(item.grantDays)}일
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* 제목 */}
                                        <Typography sx={{ fontSize: '14px', fontWeight: 700, color: colorScheme.textColor, mb: 0.5 }}>
                                            {item.title || '제목 없음'}
                                        </Typography>

                                        {/* 사유 미리보기 */}
                                        {item.reason && (
                                            <Typography sx={{
                                                fontSize: '12px',
                                                color: colorScheme.hintTextColor,
                                                mb: 1,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 1,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                            }}>
                                                {item.reason}
                                            </Typography>
                                        )}

                                        {/* 메타 */}
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <CalendarTodayIcon sx={{ fontSize: 12, color: colorScheme.hintTextColor }} />
                                                <Typography sx={{ fontSize: '11px', color: colorScheme.hintTextColor }}>
                                                    결재 {formatDate(item.approvalDate)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <CheckCircleOutlineIcon sx={{ fontSize: 12, color: colorScheme.hintTextColor }} />
                                                <Typography sx={{ fontSize: '11px', color: colorScheme.hintTextColor }}>
                                                    처리 {formatDate(item.procDate)}
                                                </Typography>
                                            </Box>
                                            {(item.attachmentsList?.length ?? 0) > 0 && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <AttachFileIcon sx={{ fontSize: 12, color: colorScheme.hintTextColor }} />
                                                    <Typography sx={{ fontSize: '11px', color: colorScheme.hintTextColor }}>
                                                        {item.attachmentsList?.length}개
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>

                                        {/* 코멘트 */}
                                        {item.comment && (
                                            <Box sx={{
                                                mt: 1,
                                                p: 1,
                                                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                                borderRadius: '8px',
                                                border: `1px solid ${calendarBorder}`,
                                                display: 'flex',
                                                gap: 0.75,
                                            }}>
                                                <ChatBubbleOutlineIcon sx={{ fontSize: 13, color: colorScheme.hintTextColor, flexShrink: 0, mt: 0.1 }} />
                                                <Typography sx={{ fontSize: '11px', color: colorScheme.hintTextColor }}>
                                                    {item.comment}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                    )}
                </Container>
            </Box>

            {/* 상세 다이얼로그 */}
            <Dialog
                open={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: isDark ? '#0F172A' : '#FFFFFF',
                        borderRadius: '18px',
                        overflow: 'hidden',
                        border: `1px solid ${calendarBorder}`,
                        boxShadow: isDark ? '0 24px 48px rgba(0,0,0,0.45)' : '0 24px 48px rgba(15, 23, 42, 0.18)',
                        m: 2,
                        backgroundImage: 'none',
                    }
                }}
            >
                {selectedItem && (
                    <>
                        {/* 다이얼로그 헤더 */}
                        <Box sx={{
                            bgcolor: isDark ? '#0B1120' : '#F8FAFC',
                            borderBottom: `1px solid ${calendarBorder}`,
                            px: 3,
                            py: 2.25,
                            position: 'relative',
                        }}>
                            <IconButton
                                onClick={() => setSelectedItem(null)}
                                sx={{
                                    position: 'absolute',
                                    right: 8,
                                    top: 8,
                                    color: colorScheme.textColor,
                                    border: `1px solid ${calendarBorder}`,
                                    borderRadius: '10px',
                                    '&:hover': { bgcolor: isDark ? 'rgba(59,130,246,0.12)' : '#EFF6FF' },
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: '12px',
                                    bgcolor: `${getStatusColor(selectedItem.status)}1A`,
                                    border: `1px solid ${getStatusColor(selectedItem.status)}55`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <DescriptionIcon sx={{ fontSize: 22, color: getStatusColor(selectedItem.status) }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ color: colorScheme.textColor, fontSize: '17px', fontWeight: 700, pr: 4 }}>
                                        {selectedItem.title || '휴가 부여 상세'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                                        <Box sx={{
                                            px: 0.75,
                                            py: 0.2,
                                            borderRadius: '999px',
                                            bgcolor: `${getStatusColor(selectedItem.status)}1A`,
                                            border: `1px solid ${getStatusColor(selectedItem.status)}55`,
                                        }}>
                                            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: getStatusColor(selectedItem.status) }}>
                                                {getStatusLabel(selectedItem.status)}
                                            </Typography>
                                        </Box>
                                        {selectedItem.leaveType && (
                                            <Typography sx={{ fontSize: '12px', color: colorScheme.hintTextColor }}>
                                                {selectedItem.leaveType}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        <DialogContent sx={{ p: 2.5, bgcolor: isDark ? '#0F172A' : '#FFFFFF' }}>
                            {/* 기본 정보 */}
                            <Paper elevation={0} sx={{
                                p: 2,
                                mb: 1.5,
                                borderRadius: '12px',
                                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                border: `1px solid ${calendarBorder}`,
                            }}>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '10px', color: colorScheme.hintTextColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
                                            구분
                                        </Typography>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: colorScheme.textColor }}>
                                            {selectedItem.isManager === 1 ? '관리자 부여' : '사용자 신청'}
                                        </Typography>
                                    </Box>
                                    {selectedItem.grantDays > 0 && (
                                        <Box>
                                            <Typography sx={{ fontSize: '10px', color: colorScheme.hintTextColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
                                                부여 일수
                                            </Typography>
                                            <Typography sx={{ fontSize: '18px', fontWeight: 800, color: isDark ? '#60A5FA' : '#3B82F6', lineHeight: 1 }}>
                                                {formatDays(selectedItem.grantDays)}<Typography component="span" sx={{ fontSize: '12px', fontWeight: 600 }}>일</Typography>
                                            </Typography>
                                        </Box>
                                    )}
                                    <Box>
                                        <Typography sx={{ fontSize: '10px', color: colorScheme.hintTextColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
                                            ID
                                        </Typography>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: colorScheme.textColor }}>
                                            {selectedItem.id}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>

                            {/* 날짜 정보 */}
                            <Paper elevation={0} sx={{
                                p: 2,
                                mb: 1.5,
                                borderRadius: '12px',
                                bgcolor: isDark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.04)',
                                border: `1px solid ${isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.15)'}`,
                            }}>
                                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                            <CalendarTodayIcon sx={{ fontSize: 13, color: isDark ? '#60A5FA' : '#3B82F6' }} />
                                            <Typography sx={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#60A5FA' : '#3B82F6' }}>결재일</Typography>
                                        </Box>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 500, color: colorScheme.textColor }}>
                                            {formatDate(selectedItem.approvalDate)}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                            <CheckCircleOutlineIcon sx={{ fontSize: 13, color: isDark ? '#60A5FA' : '#3B82F6' }} />
                                            <Typography sx={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#60A5FA' : '#3B82F6' }}>처리일</Typography>
                                        </Box>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 500, color: colorScheme.textColor }}>
                                            {formatDate(selectedItem.procDate)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>

                            {/* 사유 */}
                            <Paper elevation={0} sx={{
                                p: 2,
                                mb: 1.5,
                                borderRadius: '12px',
                                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                border: `1px solid ${calendarBorder}`,
                            }}>
                                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: colorScheme.hintTextColor, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
                                    사유
                                </Typography>
                                <Typography sx={{ fontSize: '14px', color: colorScheme.textColor, lineHeight: 1.6 }}>
                                    {selectedItem.reason || '사유 없음'}
                                </Typography>
                            </Paper>

                            {/* 코멘트 */}
                            {selectedItem.comment && (
                                <Paper elevation={0} sx={{
                                    p: 2,
                                    mb: 1.5,
                                    borderRadius: '12px',
                                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                    border: `1px solid ${calendarBorder}`,
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                                        <ChatBubbleOutlineIcon sx={{ fontSize: 14, color: colorScheme.hintTextColor }} />
                                        <Typography sx={{ fontSize: '11px', fontWeight: 700, color: colorScheme.hintTextColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                            코멘트
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: '14px', color: colorScheme.textColor, lineHeight: 1.6 }}>
                                        {selectedItem.comment}
                                    </Typography>
                                </Paper>
                            )}

                            {/* 첨부파일 */}
                            <Paper elevation={0} sx={{
                                p: 2,
                                borderRadius: '12px',
                                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                border: `1px solid ${calendarBorder}`,
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                                    <AttachFileIcon sx={{ fontSize: 14, color: colorScheme.hintTextColor }} />
                                    <Typography sx={{ fontSize: '11px', fontWeight: 700, color: colorScheme.hintTextColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                        첨부파일
                                    </Typography>
                                </Box>
                                {selectedItem.attachmentsList && selectedItem.attachmentsList.length > 0 ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                        {selectedItem.attachmentsList.map((file, i) => {
                                            let fileName = '첨부파일';
                                            if (typeof file === 'string') {
                                                try { const p = JSON.parse(file); fileName = p.file_name || p.name || fileName; }
                                                catch { fileName = file; }
                                            } else {
                                                fileName = (file as any).file_name || (file as any).name || (file as any).filename || fileName;
                                            }
                                            return (
                                                <Box
                                                    key={i}
                                                    onClick={() => openAttachment(file)}
                                                    sx={{
                                                        p: 1.25,
                                                        borderRadius: '10px',
                                                        border: `1px solid ${calendarBorder}`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        cursor: 'pointer',
                                                        '&:hover': { bgcolor: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.04)' },
                                                    }}
                                                >
                                                    <AttachFileIcon sx={{ color: colorScheme.hintTextColor, fontSize: 16 }} />
                                                    <Typography sx={{ flex: 1, color: colorScheme.textColor, fontWeight: 600, fontSize: '13px' }}>
                                                        {fileName}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '11px', color: isDark ? '#60A5FA' : '#3B82F6', fontWeight: 600 }}>
                                                        열기
                                                    </Typography>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                ) : (
                                    <Typography sx={{ color: colorScheme.hintTextColor, fontSize: '13px' }}>
                                        첨부파일이 없습니다.
                                    </Typography>
                                )}
                            </Paper>
                        </DialogContent>

                        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${calendarBorder}` }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => setSelectedItem(null)}
                                sx={{ borderRadius: '10px', fontWeight: 600 }}
                            >
                                닫기
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default LeaveGrantHistoryPage;
