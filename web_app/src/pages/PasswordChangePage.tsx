import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LockReset as LockResetIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useThemeStore } from '../store/themeStore';
import { usePasswordChangePageState } from './PasswordChangePage.state';

export default function PasswordChangePage() {
  const { colorScheme } = useThemeStore();

  const { state, actions } = usePasswordChangePageState();
  const { formData, showPassword, loading, error, success, passwordStrength } = state;
  const { setFormData, setShowPassword, handleSubmit, navigate } = actions;

  return (
    <Box
      sx={{
        minHeight: { xs: 'var(--app-height)', md: '100vh' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          maxWidth: 500,
          width: '100%',
          borderRadius: 3,
        }}
      >
        {/* 헤더 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>

          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <LockResetIcon
              sx={{
                fontSize: 48,
                color: colorScheme.primaryColor,
                mb: 1,
              }}
            />
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              비밀번호 변경
            </Typography>
            <Typography variant="body2" color="text.secondary">
              새로운 비밀번호를 설정해주세요
            </Typography>
          </Box>
        </Box>

        {/* 에러/성공 메시지 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다...
          </Alert>
        )}

        {/* 폼 */}
        <form onSubmit={handleSubmit}>
          {/* 현재 비밀번호 */}
          <TextField
            fullWidth
            type={showPassword.current ? 'text' : 'password'}
            label="현재 비밀번호"
            value={formData.currentPassword}
            onChange={(e) =>
              setFormData({ ...formData, currentPassword: e.target.value })
            }
            disabled={loading || success}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() =>
                      setShowPassword({ ...showPassword, current: !showPassword.current })
                    }
                    edge="end"
                  >
                    {showPassword.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* 새 비밀번호 */}
          <TextField
            fullWidth
            type={showPassword.new ? 'text' : 'password'}
            label="새 비밀번호"
            value={formData.newPassword}
            onChange={(e) =>
              setFormData({ ...formData, newPassword: e.target.value })
            }
            disabled={loading || success}
            helperText="최소 8자, 대문자, 소문자, 숫자, 특수문자 중 3가지 이상 포함"
            sx={{ mb: 1 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() =>
                      setShowPassword({ ...showPassword, new: !showPassword.new })
                    }
                    edge="end"
                  >
                    {showPassword.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* 비밀번호 강도 표시 */}
          {formData.newPassword && (
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mb: 0.5,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  비밀번호 강도:
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: passwordStrength.color,
                  }}
                >
                  {passwordStrength.label}
                </Typography>
              </Box>

              <Box
                sx={{
                  height: 4,
                  bgcolor: '#E5E7EB',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    width: `${(passwordStrength.level / 4) * 100}%`,
                    bgcolor: passwordStrength.color,
                    transition: 'all 0.3s',
                  }}
                />
              </Box>
            </Box>
          )}

          {/* 새 비밀번호 확인 */}
          <TextField
            fullWidth
            type={showPassword.confirm ? 'text' : 'password'}
            label="새 비밀번호 확인"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            disabled={loading || success}
            error={
              formData.confirmPassword !== '' &&
              formData.newPassword !== formData.confirmPassword
            }
            helperText={
              formData.confirmPassword !== '' &&
                formData.newPassword !== formData.confirmPassword
                ? '비밀번호가 일치하지 않습니다'
                : ''
            }
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() =>
                      setShowPassword({ ...showPassword, confirm: !showPassword.confirm })
                    }
                    edge="end"
                  >
                    {showPassword.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* 버튼 */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || success}
            sx={{
              bgcolor: colorScheme.primaryColor,
              py: 1.5,
              fontWeight: 600,
              fontSize: '1rem',
              '&:hover': {
                bgcolor: colorScheme.primaryColor,
                opacity: 0.9,
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : success ? (
              '변경 완료'
            ) : (
              '비밀번호 변경'
            )}
          </Button>
        </form>

        {/* 안내 */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
            💡 안전한 비밀번호 만들기
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            • 최소 8자 이상
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            • 대문자, 소문자, 숫자, 특수문자 조합
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            • 추측하기 어려운 문자열 사용
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            • 다른 사이트와 동일한 비밀번호 사용 금지
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
