import { Box, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useScrollingTickerState } from './ScrollingTicker.state';

export interface TickerMessage {
  id: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success' | 'birthday' | 'gift' | 'event';
  autoClose?: boolean;
  duration?: number; // 자동 닫힘 시간 (ms)
}

interface ScrollingTickerProps {
  messages: TickerMessage[];
  onClose?: (messageId: string) => void;
}

export default function ScrollingTicker({ messages, onClose }: ScrollingTickerProps) {
  const { state, actions } = useScrollingTickerState({ messages, onClose });
  const { currentMessage, isVisible, currentIndex } = state;
  const { handleClose } = actions;

  // 메시지가 없으면 숨김
  if (messages.length === 0 || !isVisible) {
    return null;
  }

  // 타입별 배경색
  const getBackgroundColor = (type?: string) => {
    switch (type) {
      case 'error':
        return '#DC2626';
      case 'warning':
        return '#F59E0B';
      case 'success':
        return '#10B981';
      case 'birthday':
        return '#EC4899';
      case 'gift':
        return '#8B5CF6';
      case 'event':
        return '#3B82F6';
      default:
        return '#1D4487';
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        bgcolor: getBackgroundColor(currentMessage?.type),
        color: 'white',
        py: 1,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease-in-out',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
      }}
    >
      {/* 스크롤링 메시지 */}
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          height: '24px',
        }}
      >
        <Box
          sx={{
            display: 'inline-block',
            whiteSpace: 'nowrap',
            animation: currentMessage?.autoClose
              ? `marquee ${currentMessage.duration || 10000}ms linear 1`
              : 'marquee 20s linear infinite',
            animationFillMode: currentMessage?.autoClose ? 'forwards' : 'initial',
            '@keyframes marquee': {
              '0%': {
                transform: 'translateX(100%)',
              },
              '100%': {
                transform: 'translateX(-100%)',
              },
            },
            '&:hover': {
              animationPlayState: 'paused',
            },
          }}
          onAnimationEnd={() => {
            if (currentMessage?.autoClose) {
              handleClose(currentMessage.id);
            }
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              fontSize: '0.9rem',
              display: 'inline-block',
            }}
          >
            {currentMessage?.message}
          </Typography>
        </Box>
      </Box>

      {/* 닫기 버튼 */}
      {onClose && (
        <IconButton
          size="small"
          onClick={() => handleClose(currentMessage?.id)}
          sx={{
            color: 'white',
            ml: 2,
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.2)',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}

      {/* 메시지 인디케이터 (여러 개일 때) */}
      {messages.length > 1 && (
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            ml: 2,
          }}
        >
          {messages.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
