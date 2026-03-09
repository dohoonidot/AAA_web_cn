import { Box, Button, Typography } from '@mui/material';
import ConfettiEffect, { useConfetti } from './ConfettiEffect';
import { useEffect } from 'react';

interface BirthdayPopupProps {
  open: boolean;
  message: string;
  title?: string;
  type?: 'birthday' | 'event';
  onClose: () => void;
  onGoGift: () => void;
}

export default function BirthdayPopup({
  open,
  message,
  title,
  type = 'birthday',
  onClose,
  onGoGift,
}: BirthdayPopupProps) {
  const { triggerConfetti, ConfettiComponent } = useConfetti(10000);
  const isBirthday = type === 'birthday';

  useEffect(() => {
    if (open && isBirthday) {
      triggerConfetti();
    }
  }, [open, isBirthday, triggerConfetti]);

  if (!open) return null;

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
      {isBirthday && ConfettiComponent}

      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          width: { xs: '100%', sm: 460 },
          maxWidth: 520,
          borderRadius: '20px',
          overflow: 'hidden',
          bgcolor: '#FFFFFF',
          boxShadow: isBirthday
            ? '0 25px 60px rgba(15, 23, 42, 0.35)'
            : '0 0 0 1px rgba(99,102,241,0.3), 0 25px 60px rgba(15, 23, 42, 0.5)',
          // Birthday: slide up, Event: zoom in
          ...(isBirthday
            ? {
                '@keyframes slideUp': {
                  from: { transform: 'translateY(32px)', opacity: 0 },
                  to: { transform: 'translateY(0)', opacity: 1 },
                },
                animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }
            : {
                '@keyframes zoomIn': {
                  from: { transform: 'scale(0.85)', opacity: 0 },
                  to: { transform: 'scale(1)', opacity: 1 },
                },
                '@keyframes glowPulse': {
                  '0%, 100%': { boxShadow: '0 0 0 1px rgba(99,102,241,0.3), 0 25px 60px rgba(15,23,42,0.5)' },
                  '50%': { boxShadow: '0 0 0 2px rgba(99,102,241,0.6), 0 25px 60px rgba(15,23,42,0.5)' },
                },
                animation: 'zoomIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, glowPulse 2.4s ease-in-out 0.4s infinite',
              }),
        }}
      >
        {/* 상단 컬러 액센트 바 */}
        <Box
          sx={{
            height: 4,
            background: isBirthday
              ? 'linear-gradient(90deg, #F59E0B 0%, #EF4444 50%, #EC4899 100%)'
              : 'linear-gradient(90deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)',
          }}
        />

        {/* 헤더 */}
        <Box
          sx={{
            px: 3,
            pt: 2.5,
            pb: 2,
            bgcolor: isBirthday ? '#1E293B' : '#0F172A',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            position: 'relative',
            overflow: 'hidden',
            // Event 전용: 헤더 shimmer sweep
            ...(!isBirthday && {
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-60%',
                width: '60%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.12), transparent)',
                '@keyframes sweep': {
                  from: { left: '-60%' },
                  to: { left: '120%' },
                },
                animation: 'sweep 2.5s ease-in-out 0.4s infinite',
              },
            }),
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: isBirthday
                ? 'rgba(245, 158, 11, 0.15)'
                : 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: 22,
            }}
          >
            {isBirthday ? '🎂' : '🏆'}
          </Box>
          <Box>
            <Typography
              sx={{
                color: isBirthday ? '#F59E0B' : '#818CF8',
                fontWeight: 700,
                fontSize: '10px',
                letterSpacing: '0.1em',
                display: 'block',
                mb: 0.5,
              }}
            >
              {isBirthday ? 'BIRTHDAY' : 'EVENT'}
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
              {title || (isBirthday ? '생일 축하합니다! 🎉' : '이벤트 당첨 🎊')}
            </Typography>
          </Box>
        </Box>

        {/* 메시지 본문 */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            bgcolor: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: '#334155',
              fontWeight: 500,
              fontSize: '14.5px',
              lineHeight: 1.75,
              whiteSpace: 'pre-wrap',
              minHeight: 72,
            }}
          >
            {message || '행복한 하루 되세요!'}
          </Typography>
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
            닫기
          </Button>
          <Button
            variant="contained"
            onClick={onGoGift}
            sx={{
              bgcolor: isBirthday ? '#1E293B' : '#4F46E5',
              color: '#F8FAFC',
              fontWeight: 600,
              fontSize: '13.5px',
              textTransform: 'none',
              borderRadius: '8px',
              px: 2.5,
              py: 0.75,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: isBirthday ? '#334155' : '#4338CA',
                boxShadow: 'none',
              },
            }}
          >
            선물 받기
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
