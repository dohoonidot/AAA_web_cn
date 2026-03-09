import { Box, Button, Typography } from '@mui/material';
import { useEffect } from 'react';

interface GiftArrivalPopupProps {
  open: boolean;
  giftData: {
    gift_name?: string;
    message?: string;
    couponImgUrl?: string;
    coupon_end_date?: string;
    queue_name?: string;
    sender_name?: string;
  } | null;
  onConfirm: () => void;
  onClose: () => void;
}

export default function GiftArrivalPopup({
  open,
  giftData,
  onConfirm,
  onClose,
}: GiftArrivalPopupProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open || !giftData) return null;

  return (
    <Box
      onClick={onClose}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1500,
        bgcolor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          width: { xs: '100%', sm: 440 },
          maxWidth: 500,
          borderRadius: '20px',
          overflow: 'hidden',
          bgcolor: '#FFFFFF',
          boxShadow: '0 0 0 1px rgba(245,158,11,0.25), 0 25px 60px rgba(15,23,42,0.5)',
          '@keyframes zoomIn': {
            from: { transform: 'scale(0.85)', opacity: 0 },
            to: { transform: 'scale(1)', opacity: 1 },
          },
          '@keyframes glowPulse': {
            '0%, 100%': {
              boxShadow: '0 0 0 1px rgba(245,158,11,0.25), 0 25px 60px rgba(15,23,42,0.5)',
            },
            '50%': {
              boxShadow: '0 0 0 2px rgba(245,158,11,0.5), 0 25px 60px rgba(15,23,42,0.5)',
            },
          },
          animation:
            'zoomIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, glowPulse 2.4s ease-in-out 0.4s infinite',
        }}
      >
        {/* 상단 액센트 바 */}
        <Box
          sx={{
            height: 4,
            background: 'linear-gradient(90deg, #F59E0B 0%, #EF4444 50%, #F97316 100%)',
          }}
        />

        {/* 헤더 */}
        <Box
          sx={{
            px: 3,
            pt: 2.5,
            pb: 2,
            bgcolor: '#1E293B',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-60%',
              width: '60%',
              height: '100%',
              background:
                'linear-gradient(90deg, transparent, rgba(245,158,11,0.1), transparent)',
              '@keyframes sweep': {
                from: { left: '-60%' },
                to: { left: '120%' },
              },
              animation: 'sweep 2.5s ease-in-out 0.4s infinite',
            },
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: 'rgba(245, 158, 11, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: 22,
            }}
          >
            🎁
          </Box>
          <Box>
            <Typography
              sx={{
                color: '#F59E0B',
                fontWeight: 700,
                fontSize: '10px',
                letterSpacing: '0.1em',
                display: 'block',
                mb: 0.5,
              }}
            >
              GIFT
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#F8FAFC',
                fontWeight: 700,
                fontSize: '1.05rem',
                letterSpacing: '-0.01em',
                lineHeight: 1.3,
              }}
            >
              선물이 도착했습니다! 🎉
            </Typography>
          </Box>
        </Box>

        {/* 본문 */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            bgcolor: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
          }}
        >
          {/* 쿠폰 이미지 */}
          {giftData.couponImgUrl && (
            <Box
              component="img"
              src={giftData.couponImgUrl}
              alt="쿠폰 이미지"
              sx={{
                width: 80,
                height: 80,
                borderRadius: '12px',
                objectFit: 'cover',
                mb: 2,
                border: '1px solid #E2E8F0',
              }}
            />
          )}

          {/* 선물 이름 */}
          {giftData.gift_name && (
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: '#1E293B', mb: 0.75, fontSize: '15px' }}
            >
              {giftData.gift_name}
            </Typography>
          )}

          {/* 메시지 */}
          {giftData.message && (
            <Typography
              variant="body2"
              sx={{
                color: '#475569',
                lineHeight: 1.7,
                fontSize: '14px',
                whiteSpace: 'pre-wrap',
                mb: giftData.sender_name || giftData.coupon_end_date ? 1.5 : 0,
              }}
            >
              {giftData.message}
            </Typography>
          )}

          {/* 발신자 */}
          {giftData.sender_name && (
            <Typography
              variant="caption"
              sx={{ color: '#64748B', display: 'block', mb: 0.5 }}
            >
              From. {giftData.sender_name}
            </Typography>
          )}

          {/* 만료일 */}
          {giftData.coupon_end_date && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 0.5,
                px: 1,
                py: 0.25,
                borderRadius: '5px',
                bgcolor: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#EF4444' }}>
                만료일 {giftData.coupon_end_date}
              </Typography>
            </Box>
          )}
        </Box>

        {/* 버튼 영역 */}
        <Box
          sx={{
            px: 3,
            py: 2,
            bgcolor: '#FFFFFF',
            display: 'flex',
            gap: 1,
            justifyContent: 'flex-end',
            borderTop: '1px solid #F1F5F9',
          }}
        >
          <Button
            variant="text"
            onClick={onClose}
            sx={{
              color: '#64748B',
              fontWeight: 500,
              fontSize: '13.5px',
              textTransform: 'none',
              borderRadius: '8px',
              px: 2,
              py: 0.75,
              '&:hover': { bgcolor: '#F1F5F9' },
            }}
          >
            나중에
          </Button>
          <Button
            variant="contained"
            onClick={onConfirm}
            sx={{
              bgcolor: '#1E293B',
              color: '#F8FAFC',
              fontWeight: 600,
              fontSize: '13.5px',
              textTransform: 'none',
              borderRadius: '8px',
              px: 2.5,
              py: 0.75,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#334155', boxShadow: 'none' },
            }}
          >
            선물함에서 확인하기
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
