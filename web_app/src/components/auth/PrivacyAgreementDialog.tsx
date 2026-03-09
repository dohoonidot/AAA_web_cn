import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Close as CloseIcon, Security as SecurityIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { usePrivacyAgreementDialogState } from './PrivacyAgreementDialog.state';

// 개인정보 동의서 내용 (Flutter lib/features/auth/privacy_agreement_popup.dart와 동일)
const PRIVACY_CONTENT = {
  title: '개인정보 수집·이용 동의서',
  intro: '㈜ASPN(이하 "회사")는 AI 앱 서비스 AAA(이하 "서비스") 제공을 위하여 다음과 같이 개인정보를 수집·이용합니다. 아래 내용을 충분히 읽고 동의 여부를 결정해주시기 바랍니다.',
  sections: [
    {
      title: '1. 수집·이용 목적',
      content: '• AAA 서비스 제공 및 맞춤형 기능 지원\n• 직원 식별, 내부 커뮤니케이션 및 기념일(생일 등) 알림 기능 제공\n• 서비스 운영 및 품질 개선을 위한 통계 분석'
    },
    {
      title: '2. 수집 항목',
      content: '• 기본정보: 이름, 사번, 부서, 직책\n• 생일 등 기념일 정보\n• 서비스 이용 기록, 기기정보(자동 수집 항목 포함)'
    },
    {
      title: '3. 보유 및 이용기간',
      content: '• 수집일로부터 퇴사일 또는 서비스 이용 종료 시까지\n• 관련 법령에 따른 보존 필요 시 해당 법령 기준에 따름'
    },
    {
      title: '4. 동의 거부 권리 및 불이익',
      content: '• 귀하는 개인정보 수집·이용에 동의하지 않을 수 있습니다. 단, 동의하지 않을 경우 AAA 서비스의 일부 또는 전체 기능 이용이 제한될 수 있습니다.'
    }
  ],
  outro: '위 내용을 확인하였으며, 개인정보 수집·이용에 동의합니다.'
};

interface PrivacyAgreementDialogProps {
  open: boolean;
  userId: string;
  // 동의 처리 완료(동의함) 콜백
  onAgreed: () => void;
  // 동의 처리 완료(동의 안 함) 콜백
  onDisagreed?: () => void;
  onClose?: () => void;
  required?: boolean; // 필수 동의 여부 (로그인 시 true)
  // 버튼 노출 제어 (설정 페이지 등에서 사용)
  showAgreeButton?: boolean; // default: true
  showDisagreeButton?: boolean; // default: true
  showCancelButton?: boolean; // default: true (required=false일 때만 의미 있음)
}

const PrivacySection = ({ title, content, isDark }: { title: string; content: string; isDark: boolean }) => (
  <Box
    sx={{
      mb: 1.5,
      p: 1.5,
      borderRadius: '12px',
      border: `1px solid ${isDark ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.18)'}`,
      bgcolor: isDark ? 'rgba(148,163,184,0.04)' : 'rgba(248,250,252,0.9)',
    }}
  >
    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75, fontSize: '0.95rem', color: isDark ? '#E5E7EB' : '#111827' }}>
      {title}
    </Typography>
    <Typography variant="body2" sx={{ color: isDark ? '#CBD5E1' : '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
      {content}
    </Typography>
  </Box>
);

export default function PrivacyAgreementDialog({
  open,
  userId,
  onAgreed,
  onDisagreed,
  onClose,
  required = false,
  showAgreeButton = true,
  showDisagreeButton = true,
  showCancelButton = true,
}: PrivacyAgreementDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';
  const twBorder = isDark ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.18)';
  const twSurface = isDark ? 'rgba(15,23,42,0.96)' : 'rgba(255,255,255,0.96)';
  const twSubtle = isDark ? 'rgba(148,163,184,0.10)' : 'rgba(148,163,184,0.10)';
  const twText = isDark ? '#E2E8F0' : '#475569';
  const twTextHover = isDark ? '#F8FAFC' : '#334155';
  const twTextOnFill = isDark ? '#0F172A' : '#FFFFFF';
  const { state, actions } = usePrivacyAgreementDialogState({
    userId,
    onAgreed,
    onDisagreed,
    onClose,
    required,
    showAgreeButton,
    showDisagreeButton,
    showCancelButton,
  });
  const {
    loading,
    error,
    cancelVisible,
    disagreeVisible,
    agreeVisible,
    hasAnyActions,
  } = state;
  const { handleAgreement, handleClose } = actions;

  return (
    <Dialog
      open={open}
      onClose={required ? undefined : handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      disableEscapeKeyDown={required}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : '20px',
          maxHeight: isMobile ? 'var(--app-height)' : '90vh',
          border: `1px solid ${twBorder}`,
          bgcolor: twSurface,
          backdropFilter: 'blur(14px)',
          boxShadow: isDark ? '0 24px 60px rgba(2,6,23,0.5)' : '0 24px 60px rgba(15,23,42,0.14)',
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'text.primary',
          borderRadius: isMobile ? 0 : '20px 20px 0 0',
          px: { xs: 2, sm: 3 },
          py: 1.75,
          borderBottom: `1px solid ${twBorder}`,
          bgcolor: isDark ? 'rgba(15,23,42,0.78)' : 'rgba(255,255,255,0.84)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '12px',
              display: 'grid',
              placeItems: 'center',
              bgcolor: twSubtle,
              border: `1px solid ${twBorder}`,
              color: twText,
            }}
          >
            <SecurityIcon sx={{ fontSize: 20 }} />
          </Box>
          <Typography component="span" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
            개인정보 수집·이용 동의서
          </Typography>
        </Box>
        {!required && onClose && (
          <IconButton
            onClick={handleClose}
            sx={{
              color: 'text.primary',
              border: `1px solid ${twBorder}`,
              borderRadius: '12px',
              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: twSubtle },
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: 'transparent',
          overflow: 'auto',
        }}
      >
        {error && (
          <Alert severity="error" variant="outlined" sx={{ mb: 2, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        {/* 서두 */}
        <Typography 
          variant="body2" 
          sx={{ 
            color: isDark ? '#CBD5E1' : '#334155',
            lineHeight: 1.6, 
            mb: 3 
          }}
        >
          {PRIVACY_CONTENT.intro}
        </Typography>

        {/* 섹션들 */}
        {PRIVACY_CONTENT.sections.map((section, index) => (
          <PrivacySection
            key={index}
            title={section.title}
            content={section.content}
            isDark={isDark}
          />
        ))}

        {/* 마무리 */}
        <Typography 
          variant="body1" 
          sx={{ 
            color: isDark ? '#E5E7EB' : '#111827',
            fontWeight: 700,
            mt: 2,
            p: 1.25,
            borderRadius: '12px',
            border: `1px solid ${twBorder}`,
            bgcolor: isDark ? 'rgba(148,163,184,0.04)' : 'rgba(248,250,252,0.9)',
          }}
        >
          {PRIVACY_CONTENT.outro}
        </Typography>
      </DialogContent>

      {hasAnyActions && (
        <DialogActions
          sx={{
            p: { xs: 2, sm: 3 },
            gap: 1,
            flexDirection: { xs: 'column', sm: 'row' },
            bgcolor: isDark ? 'rgba(15,23,42,0.72)' : 'rgba(255,255,255,0.82)',
            borderTop: `1px solid ${twBorder}`,
            backdropFilter: 'blur(10px)',
          }}
        >
          {cancelVisible && (
            <Button
              onClick={handleClose}
              variant="outlined"
              disabled={loading}
              fullWidth={isMobile}
              sx={{
                order: { xs: 3, sm: 1 },
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                borderColor: twBorder,
                color: isDark ? '#E2E8F0' : '#334155',
                '&:hover': { borderColor: twBorder, bgcolor: twSubtle },
              }}
            >
              취소
            </Button>
          )}
          {disagreeVisible && (
            <Button
              onClick={() => handleAgreement(false)}
              variant="outlined"
              color="error"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CancelIcon />}
              fullWidth={isMobile}
              sx={{
                order: { xs: 2, sm: 2 },
                minWidth: { xs: '100%', sm: 120 },
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                color: twText,
                borderColor: twBorder,
                bgcolor: isDark ? 'rgba(148,163,184,0.06)' : 'rgba(248,250,252,0.9)',
                '&:hover': {
                  borderColor: twBorder,
                  bgcolor: isDark ? 'rgba(148,163,184,0.12)' : 'rgba(241,245,249,0.95)',
                  color: twTextHover,
                },
              }}
            >
              {loading ? '처리 중...' : '동의 안 함'}
            </Button>
          )}
          {agreeVisible && (
            <Button
              onClick={() => handleAgreement(true)}
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
              fullWidth={isMobile}
              sx={{
                order: { xs: 1, sm: 3 },
                minWidth: { xs: '100%', sm: 120 },
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                bgcolor: twText,
                color: twTextOnFill,
                boxShadow: '0 1px 3px rgba(15,23,42,0.10)',
                transition: 'all 160ms ease-out',
                '&:hover': {
                  bgcolor: twTextHover,
                  transform: 'translateY(-1px)',
                  boxShadow: isDark ? '0 8px 18px rgba(2,6,23,0.18)' : '0 8px 18px rgba(15,23,42,0.10)',
                },
              }}
            >
              {loading ? '처리 중...' : '동의함'}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
}
