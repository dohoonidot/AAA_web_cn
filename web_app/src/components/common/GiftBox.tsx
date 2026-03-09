/**
 * 선물함 컴포넌트
 * 우측 상단에 배지 아이콘으로 표시되며, 클릭 시 선물 목록 표시
 */

import React from 'react';
import {
  Badge,
  IconButton,
  Box,
  Typography,
  List,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  useTheme,
} from '@mui/material';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import RefreshIcon from '@mui/icons-material/Refresh';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import type { Gift } from '../../types/gift';
import dayjs from 'dayjs';
import { formatServerDateTime } from '../../pages/admin/AdminLeaveApproval.shared';
import { useGiftButtonState, useGiftPanelState } from './GiftBox.state';

/**
 * 선물함 아이콘 버튼
 * 헤더나 네비게이션 바에 배치
 */
export function GiftButton({ onDark = true }: { onDark?: boolean }) {
  const { state, actions } = useGiftButtonState();
  const { giftCount, isOpen } = state;
  const { setIsOpen, setGiftCount } = actions;
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const btnColor = onDark ? 'rgba(255,255,255,0.92)' : (isDark ? 'rgba(226,232,240,0.85)' : 'rgba(51,65,85,0.8)');
  const btnBg = onDark ? 'rgba(255,255,255,0.13)' : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)');
  const btnBorder = onDark ? 'rgba(255,255,255,0.25)' : (isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.13)');
  const hoverBg = onDark ? 'rgba(255,255,255,0.24)' : (isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)');
  const hoverBorder = onDark ? 'rgba(255,255,255,0.45)' : (isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.22)');
  const hoverGlow = onDark ? '0 0 14px rgba(255,255,255,0.18)' : (isDark ? '0 0 12px rgba(255,255,255,0.1)' : '0 0 12px rgba(0,0,0,0.1)');

  return (
    <>
      <IconButton
        onClick={() => setIsOpen(true)}
        aria-label="선물함"
        sx={{
          mr: 1,
          color: btnColor,
          bgcolor: btnBg,
          backdropFilter: 'blur(6px)',
          border: '1px solid',
          borderColor: btnBorder,
          transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
          '&:hover': {
            bgcolor: hoverBg,
            transform: 'scale(1.12)',
            boxShadow: hoverGlow,
            borderColor: hoverBorder,
          },
          '&:active': { transform: 'scale(0.95)' },
        }}
      >
        <Badge badgeContent={giftCount} color="error">
          <CardGiftcardIcon />
        </Badge>
      </IconButton>
      <GiftPanel
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onGiftCountChange={setGiftCount}
      />
    </>
  );
}

interface GiftPanelProps {
  open: boolean;
  onClose: () => void;
  onGiftCountChange: (count: number) => void;
}

/**
 * 선물함 모달 (Dialog)
 */
export function GiftPanel({ open, onClose, onGiftCountChange }: GiftPanelProps) {
  const { state, actions } = useGiftPanelState({ open, onGiftCountChange });
  const {
    gifts,
    loading,
    error,
    mobileExportDialogOpen,
    mobileExportLoading,
    mobileExportGiftUrl,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
  } = state;
  const {
    loadGifts,
    getCouponImageUrl,
    handleOpenInBrowser,
    handleOpenMobileExportDialog,
    handleCloseMobileExportDialog,
    handleSendToMobile,
    handleCloseSnackbar,
  } = actions;
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const cardBorder = isDark ? '#334155' : '#E2E8F0';
  const panelBg = isDark ? '#0F172A' : '#F8FAFC';

  const [couponPreviewOpen, setCouponPreviewOpen] = React.useState(false);
  const [couponPreviewUrl, setCouponPreviewUrl] = React.useState<string | null>(null);

  const openCouponPreview = (url: string) => {
    setCouponPreviewUrl(url);
    setCouponPreviewOpen(true);
  };

  const closeCouponPreview = () => {
    setCouponPreviewOpen(false);
    setCouponPreviewUrl(null);
  };

  const isCouponGift = (gift: Gift) => {
    const giftType = String(gift.gift_type || '').trim();
    return Boolean(getCouponImageUrl(gift) || giftType.includes('쿠폰'));
  };

  const isGiftUsed = (gift: Gift): boolean => {
    const raw = (gift as any).is_used ?? (gift as any).isUsed ?? (gift as any).used ?? (gift as any).use_yn ?? (gift as any).used_yn ?? (gift as any).coupon_used;
    if (raw === true || raw === 1) return true;
    if (typeof raw === 'string') {
      const value = raw.trim().toUpperCase();
      if (value === 'Y' || value === 'TRUE' || value === 'USED') return true;
    }
    return false;
  };

  const unusedCouponCount = gifts.filter((gift) => isCouponGift(gift) && !isGiftUsed(gift)).length;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: panelBg,
            borderRadius: '20px',
            height: '82vh',
            maxHeight: '82vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: isDark
              ? '0 24px 48px rgba(0,0,0,0.5)'
              : '0 24px 48px rgba(15,23,42,0.12)',
          },
        }}
      >
        {/* 상단 액센트 바 */}
        <Box
          sx={{
            height: 4,
            flexShrink: 0,
            background: 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 50%, #FCD34D 100%)',
          }}
        />

        {/* 헤더 */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            flexShrink: 0,
            bgcolor: isDark ? '#1E293B' : '#FFFFFF',
            borderBottom: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-60%',
              width: '60%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.06), transparent)',
              '@keyframes giftSweep': {
                from: { left: '-60%' },
                to: { left: '120%' },
              },
              animation: 'giftSweep 3s ease-in-out 0.5s infinite',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, zIndex: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CardGiftcardIcon sx={{ fontSize: 20, color: '#F59E0B' }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  color: '#F59E0B',
                  fontWeight: 700,
                  fontSize: '10px',
                  letterSpacing: '0.08em',
                  lineHeight: 1,
                  mb: 0.4,
                }}
              >
                GIFT BOX
              </Typography>
              <Typography
                sx={{
                  color: isDark ? '#F1F5F9' : '#1E293B',
                  fontWeight: 700,
                  fontSize: '1rem',
                  lineHeight: 1.2,
                }}
              >
                받은 선물함
              </Typography>
            </Box>
            {unusedCouponCount > 0 && (
              <Box
                sx={{
                  px: 1,
                  py: 0.3,
                  borderRadius: '6px',
                  bgcolor: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.1)',
                  border: `1px solid ${isDark ? 'rgba(245,158,11,0.25)' : '#FDE68A'}`,
                }}
              >
                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#F59E0B' }}>
                  미사용 {unusedCouponCount}개
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, zIndex: 1 }}>
            <IconButton
              size="small"
              onClick={loadGifts}
              disabled={loading}
              sx={{
                color: isDark ? '#94A3B8' : '#64748B',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                color: isDark ? '#94A3B8' : '#64748B',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* 선물 목록 */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
            p: 2,
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: isDark ? '#334155' : '#CBD5E1',
              borderRadius: '3px',
              '&:hover': { bgcolor: isDark ? '#475569' : '#94A3B8' },
            },
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress size={36} sx={{ color: '#F59E0B' }} />
            </Box>
          ) : error ? (
            <Alert
              severity="error"
              sx={{
                borderRadius: '12px',
                bgcolor: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              {error}
            </Alert>
          ) : gifts.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '16px',
                  bgcolor: isDark ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1,
                }}
              >
                <CardGiftcardIcon sx={{ fontSize: 32, color: '#F59E0B', opacity: 0.6 }} />
              </Box>
              <Typography sx={{ fontWeight: 600, color: isDark ? '#94A3B8' : '#64748B', fontSize: '15px' }}>
                받은 선물이 없습니다
              </Typography>
              <Typography sx={{ fontSize: '13px', color: isDark ? '#475569' : '#94A3B8' }}>
                선물이 도착하면 여기에 표시됩니다
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {gifts.map((gift, index) => {
                const couponUrl = getCouponImageUrl(gift);
                const used = isGiftUsed(gift);
                const expiryDate = gift.coupon_end_date
                  ? dayjs(gift.coupon_end_date)
                  : null;
                const isExpiringSoon = expiryDate
                  ? expiryDate.diff(dayjs(), 'day') <= 7
                  : false;

                return (
                  <Box
                    key={gift.id || index}
                    sx={{
                      bgcolor: cardBg,
                      borderRadius: '14px',
                      border: `1px solid ${used ? (isDark ? '#1E293B' : '#F1F5F9') : cardBorder}`,
                      overflow: 'hidden',
                      opacity: used ? 0.55 : 1,
                      transition: 'all 0.18s ease',
                      '&:hover': used ? {} : {
                        transform: 'translateY(-2px)',
                        boxShadow: isDark
                          ? '0 8px 20px rgba(0,0,0,0.3)'
                          : '0 8px 20px rgba(15,23,42,0.08)',
                        borderColor: isDark ? '#475569' : '#CBD5E1',
                      },
                    }}
                  >
                    {/* 카드 상단 — 타입·배지·날짜 */}
                    <Box
                      sx={{
                        px: 2,
                        pt: 1.5,
                        pb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        borderBottom: `1px solid ${isDark ? '#334155' : '#F1F5F9'}`,
                      }}
                    >
                      {/* 타입 배지 */}
                      <Box
                        sx={{
                          px: 0.75,
                          py: 0.25,
                          borderRadius: '5px',
                          bgcolor: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.1)',
                        }}
                      >
                        <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#F59E0B', letterSpacing: '0.05em' }}>
                          {gift.gift_type || '쿠폰'}
                        </Typography>
                      </Box>

                      {/* NEW 배지 */}
                      {gift.is_new && !used && (
                        <Box
                          sx={{
                            px: 0.75,
                            py: 0.25,
                            borderRadius: '5px',
                            bgcolor: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)',
                          }}
                        >
                          <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#EF4444', letterSpacing: '0.05em' }}>
                            NEW
                          </Typography>
                        </Box>
                      )}

                      {/* 사용됨 배지 */}
                      {used && (
                        <Box
                          sx={{
                            px: 0.75,
                            py: 0.25,
                            borderRadius: '5px',
                            bgcolor: isDark ? 'rgba(100,116,139,0.2)' : 'rgba(100,116,139,0.1)',
                          }}
                        >
                          <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.05em' }}>
                            사용됨
                          </Typography>
                        </Box>
                      )}

                      {/* 만료일 */}
                      {expiryDate && (
                        <Typography
                          sx={{
                            ml: 'auto',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: isExpiringSoon ? '#EF4444' : (isDark ? '#64748B' : '#94A3B8'),
                          }}
                        >
                          {isExpiringSoon ? '⚠ ' : ''}만료 {expiryDate.format('YYYY.MM.DD')}
                        </Typography>
                      )}
                    </Box>

                    {/* 카드 본문 */}
                    <Box sx={{ px: 2, py: 1.5 }}>
                      {/* 선물 내용 */}
                      {gift.gift_content && (
                        <Typography
                          sx={{
                            fontSize: '13.5px',
                            fontWeight: 500,
                            color: isDark ? '#E2E8F0' : '#1E293B',
                            lineHeight: 1.6,
                            mb: couponUrl ? 1.25 : 0,
                          }}
                        >
                          {gift.gift_content}
                        </Typography>
                      )}

                      {/* 쿠폰 이미지 */}
                      {couponUrl && (
                        <Box
                          sx={{
                            position: 'relative',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            cursor: 'zoom-in',
                            mb: 1.5,
                            '&:hover .zoom-overlay': { opacity: 1 },
                          }}
                          onClick={() => openCouponPreview(couponUrl)}
                        >
                          <Box
                            component="img"
                            src={couponUrl}
                            alt="쿠폰 이미지"
                            sx={{
                              width: '100%',
                              maxHeight: 180,
                              objectFit: 'contain',
                              display: 'block',
                              bgcolor: isDark ? '#0F172A' : '#F8FAFC',
                            }}
                          />
                          <Box
                            className="zoom-overlay"
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              bgcolor: 'rgba(15,23,42,0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: 0,
                              transition: 'opacity 0.18s ease',
                              borderRadius: '10px',
                            }}
                          >
                            <ZoomInIcon sx={{ color: 'white', fontSize: 28 }} />
                          </Box>
                        </Box>
                      )}

                      {/* 받은 시간 */}
                      {gift.received_at && (
                        <Typography
                          sx={{
                            fontSize: '11.5px',
                            color: isDark ? '#475569' : '#94A3B8',
                            mb: couponUrl || gift.gift_url ? 1.25 : 0,
                          }}
                        >
                          받은 날짜: {formatServerDateTime(gift.received_at)}
                        </Typography>
                      )}

                      {/* 버튼 영역 */}
                      {(couponUrl || gift.gift_url) && (
                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 0.5 }}>
                          {couponUrl && (
                            <>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                                onClick={() => handleOpenInBrowser(couponUrl)}
                                sx={{
                                  flex: 1,
                                  minWidth: 0,
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  textTransform: 'none',
                                  borderRadius: '8px',
                                  py: 0.6,
                                  borderColor: isDark ? '#334155' : '#CBD5E1',
                                  color: isDark ? '#CBD5E1' : '#475569',
                                  '&:hover': {
                                    borderColor: isDark ? '#475569' : '#94A3B8',
                                    bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                                  },
                                }}
                              >
                                브라우저 열기
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<PhoneAndroidIcon sx={{ fontSize: 14 }} />}
                                onClick={() => handleOpenMobileExportDialog(couponUrl)}
                                sx={{
                                  flex: 1,
                                  minWidth: 0,
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  textTransform: 'none',
                                  borderRadius: '8px',
                                  py: 0.6,
                                  bgcolor: isDark ? '#334155' : '#1E293B',
                                  color: '#F8FAFC',
                                  boxShadow: 'none',
                                  '&:hover': {
                                    bgcolor: isDark ? '#475569' : '#334155',
                                    boxShadow: 'none',
                                  },
                                }}
                              >
                                모바일 전송
                              </Button>
                            </>
                          )}
                          {gift.gift_url && (
                            <Button
                              size="small"
                              variant="contained"
                              endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                              href={gift.gift_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                flex: couponUrl ? 'none' : 1,
                                fontSize: '12px',
                                fontWeight: 600,
                                textTransform: 'none',
                                borderRadius: '8px',
                                py: 0.6,
                                px: 1.5,
                                bgcolor: isDark ? '#334155' : '#1E293B',
                                color: '#F8FAFC',
                                boxShadow: 'none',
                                '&:hover': {
                                  bgcolor: isDark ? '#475569' : '#334155',
                                  boxShadow: 'none',
                                },
                              }}
                            >
                              선물 확인하기
                            </Button>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </List>
          )}
        </Box>
      </Dialog>

      {/* 쿠폰 이미지 확대 */}
      <Dialog
        open={couponPreviewOpen}
        onClose={closeCouponPreview}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDark ? '#0F172A' : '#FFFFFF',
            borderRadius: '16px',
            overflow: 'hidden',
          },
        }}
      >
        {/* 상단 액센트 바 */}
        <Box sx={{ height: 4, background: 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)' }} />
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            bgcolor: isDark ? '#1E293B' : '#F8FAFC',
            borderBottom: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '14px', color: isDark ? '#F1F5F9' : '#1E293B' }}>
            쿠폰 확대보기
          </Typography>
          <IconButton
            size="small"
            onClick={closeCouponPreview}
            sx={{ color: isDark ? '#94A3B8' : '#64748B' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', p: 2.5 }}>
          {couponPreviewUrl && (
            <Box
              component="img"
              src={couponPreviewUrl}
              alt="쿠폰 이미지 확대"
              sx={{
                width: '100%',
                maxWidth: 680,
                height: 'auto',
                borderRadius: '10px',
                objectFit: 'contain',
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 모바일 내보내기 확인 다이얼로그 */}
      <Dialog
        open={mobileExportDialogOpen}
        onClose={handleCloseMobileExportDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            bgcolor: isDark ? '#0F172A' : '#FFFFFF',
            overflow: 'hidden',
          },
        }}
      >
        {/* 상단 액센트 바 */}
        <Box sx={{ height: 4, background: 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)' }} />
        <Box
          sx={{
            px: 2.5,
            py: 2,
            bgcolor: isDark ? '#1E293B' : '#F8FAFC',
            borderBottom: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '9px',
              bgcolor: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <PhoneAndroidIcon sx={{ fontSize: 18, color: '#F59E0B' }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '15px', color: isDark ? '#F1F5F9' : '#1E293B' }}>
            모바일로 전송
          </Typography>
        </Box>
        <DialogContent sx={{ px: 2.5, py: 2 }}>
          <Typography
            sx={{
              fontSize: '13.5px',
              fontWeight: 500,
              color: isDark ? '#CBD5E1' : '#475569',
              lineHeight: 1.7,
            }}
          >
            쿠폰을 모바일로 전송합니다.
            <br />
            전송까지 <strong style={{ color: isDark ? '#F1F5F9' : '#1E293B' }}>3~5분</strong> 정도 소요될 수 있습니다.
            <br />
            계속하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2, gap: 0.75 }}>
          <Button
            onClick={handleCloseMobileExportDialog}
            disabled={mobileExportLoading}
            sx={{
              fontSize: '13px',
              fontWeight: 500,
              textTransform: 'none',
              color: isDark ? '#94A3B8' : '#64748B',
              borderRadius: '8px',
              px: 1.75,
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' },
            }}
          >
            취소
          </Button>
          <Button
            onClick={handleSendToMobile}
            disabled={mobileExportLoading}
            variant="contained"
            startIcon={mobileExportLoading ? <CircularProgress size={14} sx={{ color: 'white' }} /> : <PhoneAndroidIcon sx={{ fontSize: 16 }} />}
            sx={{
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '8px',
              px: 2,
              bgcolor: isDark ? '#334155' : '#1E293B',
              color: '#F8FAFC',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: isDark ? '#475569' : '#334155',
                boxShadow: 'none',
              },
            }}
          >
            {mobileExportLoading ? '전송 중...' : '전송하기'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 성공/에러 알림 Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{
            width: '100%',
            borderRadius: '10px',
            fontWeight: 500,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
