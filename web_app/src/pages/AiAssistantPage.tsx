import { Box, CircularProgress, Typography } from '@mui/material';
import { useAiAssistantPageState } from './AiAssistantPage.state';

/**
 * AI Chatbot 페이지
 * "AI Chatbot" 아카이브를 자동으로 선택하고 채팅 페이지로 리다이렉트
 */
export default function AiAssistantPage() {
  const { state } = useAiAssistantPageState();
  const { isCreating } = state;

  // 로딩 중 표시
  return (
    <Box
      sx={{
        height: { xs: 'var(--app-height)', md: '100vh' },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        {isCreating
          ? 'AI Chatbot 아카이브를 생성하는 중...'
          : 'AI Chatbot으로 이동 중...'}
      </Typography>
    </Box>
  );
}
