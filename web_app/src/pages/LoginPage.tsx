import { Box, Container, Paper, Typography, useMediaQuery, useTheme, Button, IconButton, Tooltip } from '@mui/material';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import CloseIcon from '@mui/icons-material/Close';
import LoginForm from '../components/auth/LoginForm';
import PrivacyAgreementDialog from '../components/auth/PrivacyAgreementDialog';
import { useLoginPageState } from './LoginPage.state';
import { useThemeStore } from '../store/themeStore';
import { useChannelIO } from '../hooks/useChannelIO';

export default function LoginPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme.name === 'Dark';
  const { state, actions } = useLoginPageState();
  const { privacyDialogOpen, pendingUserId, loginLoading } = state;
  const { handleLoginSuccess, handlePrivacyAgreed, handlePrivacyDisagreed, setLoginLoading } = actions;
  const { isOpen: isChannelIOOpen, openMessenger, closeMessenger } = useChannelIO();

  return (
    <Box
      sx={{
        minHeight: { xs: 'var(--app-height)', md: '100vh' },
        background: isDark ? '#334155' : 'linear-gradient(135deg, #f5f5f5 0%, #e3f2fd 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 },
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={isDark ? 0 : 8}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            background: isDark ? '#475569' : 'rgba(255, 255, 255, 0.95)',
            border: 'none',
            boxShadow: isDark ? '0 10px 25px -5px rgba(0, 0, 0, 0.3)' : undefined,
          }}
        >
          {/* 로고 영역 */}
          <Box
            sx={{
              textAlign: 'center',
              mb: 4,
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                mx: 'auto',
                mb: 2,
                borderRadius: '20px',
                background: isDark ? '#3B82F6' : 'linear-gradient(135deg, #1D4487 0%, #1976d2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.75rem',
                fontWeight: 800,
                boxShadow: isDark ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: isDark ? 'none' : 'none',
              }}
            >
              AAA
            </Box>
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 800,
                color: isDark ? '#F8FAFC' : '#1D4487',
                letterSpacing: '-0.025em',
                mb: 1,
              }}
            >
              ASPN AI Agent
            </Typography>
          </Box>

          <LoginForm onLoginSuccess={handleLoginSuccess} onLoadingChange={setLoginLoading} />

          {/* 개인정보 동의 모달 (이미 로그인된 상태이지만 동의가 안 된 경우) */}
          {pendingUserId && (
            <PrivacyAgreementDialog
              open={privacyDialogOpen}
              userId={pendingUserId}
              onAgreed={handlePrivacyAgreed}
              onDisagreed={handlePrivacyDisagreed}
              required={true}
            />
          )}
        </Paper>
      </Container>

      {/* 1:1 문의 플로팅 버튼 */}
      {!isChannelIOOpen && (
        <Box
          sx={{
            position: 'fixed',
            bottom: { xs: 24, md: 32 },
            right: { xs: 20, md: 32 },
            zIndex: 9999,
          }}
        >
          <Button
            className="channel-io-inquiry-btn"
            size="large"
            onClick={openMessenger}
            startIcon={<HeadsetMicIcon />}
            sx={{
              px: { xs: 2, md: 3 },
              py: { xs: 1, md: 1.5 },
              borderRadius: '30px',
              fontSize: { xs: '0.9rem', md: '1rem' },
              fontWeight: 700,
              letterSpacing: '0.03em',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 4px 15px rgba(139,92,246,0.35)',
              transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
                transform: 'translateY(-2px) scale(1.05)',
                boxShadow: '0 8px 25px rgba(139,92,246,0.5)',
              },
              '&:active': {
                transform: 'translateY(0) scale(0.97)',
                boxShadow: '0 2px 10px rgba(139,92,246,0.3)',
              },
              '@keyframes pulse-glow-login': {
                '0%, 100%': { boxShadow: '0 4px 15px rgba(139,92,246,0.35)' },
                '50%': { boxShadow: '0 4px 25px rgba(139,92,246,0.6)' },
              },
              animation: 'pulse-glow-login 2.5s ease-in-out infinite',
            }}
          >
            1:1 문의
          </Button>
        </Box>
      )}

      {/* ChannelIO 열려있을 때 X 닫기 버튼 오버레이 */}
      {isChannelIOOpen && (
        <Box
          sx={{
            position: 'fixed',
            bottom: { xs: 106, md: 96 },
            right: { xs: 12, md: 92 },
            zIndex: 99999,
          }}
        >
          <Tooltip title="문의 창 닫기" placement="left">
            <IconButton
              onClick={closeMessenger}
              size="small"
              sx={{
                bgcolor: isDark ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.95)',
                color: isDark ? '#fff' : '#333',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                width: 32,
                height: 32,
                '&:hover': {
                  bgcolor: isDark ? 'rgba(50,50,50,0.95)' : 'rgba(240,240,240,0.98)',
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
}
