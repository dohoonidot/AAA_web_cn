import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Person, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import PasswordChangeDialog from './PasswordChangeDialog';
import PrivacyAgreementDialog from './PrivacyAgreementDialog';
import { useLoginFormState, USER_ID_SUFFIX } from './LoginForm.state';
import { useThemeStore } from '../../store/themeStore';

interface LoginFormProps {
  onLoginSuccess: () => void;
  onLoadingChange?: (loading: boolean) => void;
}

export default function LoginForm({ onLoginSuccess, onLoadingChange }: LoginFormProps) {
  const navigate = useNavigate();
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme.name === 'Dark';
  const { state, actions } = useLoginFormState({ onLoginSuccess, navigate, onLoadingChange });
  const {
    userIdPrefix,
    fullUserId,
    password,
    error,
    loading,
    showPassword,
    passwordChangeDialogOpen,
    privacyDialogOpen,
    pendingUserId,
  } = state;
  const {
    setUserIdPrefix,
    setPassword,
    setShowPassword,
    setPasswordChangeDialogOpen,
    setPrivacyDialogOpen,
    handleSubmit,
    handlePrivacyAgreed,
    handlePrivacyDisagreed,
  } = actions;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        width: '100%',
      }}
    >
      {error && (
        <Alert
          severity="error"
          sx={{
            borderRadius: 2,
            fontSize: '0.875rem',
          }}
        >
          {error}
        </Alert>
      )}

      <TextField
        label="아이디"
        value={userIdPrefix}
        onChange={(e) => setUserIdPrefix(e.target.value)}
        placeholder=""
        required
        fullWidth
        autoFocus
        disabled={loading}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Person sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'action.active' }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end" sx={{ mr: 0.5 }}>
              <span style={{ color: isDark ? 'rgba(255,255,255,0.5)' : undefined }}>{USER_ID_SUFFIX}</span>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            fontSize: { xs: '16px', sm: '14px' }, // 모바일에서 줌 방지
            color: isDark ? '#F8FAFC' : 'inherit',
            bgcolor: isDark ? '#334155' : undefined,
            '& fieldset': {
              border: isDark ? 'none' : undefined,
            },
            '&:hover fieldset': {
              border: isDark ? 'none' : undefined,
            },
            '&.Mui-focused fieldset': {
              border: isDark ? 'none' : undefined,
            },
            '&.Mui-focused': {
              boxShadow: isDark ? '0 0 0 2px #3B82F6' : undefined,
            },
            '& input:-webkit-autofill': {
              WebkitBoxShadow: isDark ? '0 0 0 1000px #334155 inset !important' : '0 0 0 1000px white inset !important',
              WebkitTextFillColor: isDark ? '#F8FAFC !important' : 'inherit !important',
              transition: 'background-color 5000s ease-in-out 0s',
            },
          },
          '& .MuiInputLabel-root': {
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : undefined,
            '&.Mui-focused': {
              color: isDark ? '#3B82F6' : undefined,
            },
          },
        }}
      />

      <TextField
        label="비밀번호"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
        disabled={loading}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'action.active' }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                disabled={loading}
                sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'action.active' }}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            fontSize: { xs: '16px', sm: '14px' }, // 모바일에서 줌 방지
            color: isDark ? '#F8FAFC' : 'inherit',
            bgcolor: isDark ? '#334155' : undefined,
            '& fieldset': {
              border: isDark ? 'none' : undefined,
            },
            '&:hover fieldset': {
              border: isDark ? 'none' : undefined,
            },
            '&.Mui-focused fieldset': {
              border: isDark ? 'none' : undefined,
            },
            '&.Mui-focused': {
              boxShadow: isDark ? '0 0 0 2px #3B82F6' : undefined,
            },
            '& input:-webkit-autofill': {
              WebkitBoxShadow: isDark ? '0 0 0 1000px #334155 inset !important' : '0 0 0 1000px white inset !important',
              WebkitTextFillColor: isDark ? '#F8FAFC !important' : 'inherit !important',
              transition: 'background-color 5000s ease-in-out 0s',
            },
          },
          '& .MuiInputLabel-root': {
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : undefined,
            '&.Mui-focused': {
              color: isDark ? '#3B82F6' : undefined,
            },
          },
        }}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={loading || !fullUserId || !password.trim()}
        sx={{
          mt: 1,
          minHeight: 48,
          fontSize: '1rem',
          fontWeight: 600,
          color: isDark ? '#F8FAFC' : 'white',
          background: isDark ? '#3B82F6' : 'linear-gradient(135deg, #1D4487 0%, #1976d2 100%)',
          boxShadow: isDark ? 'none' : undefined,
          '&:hover': {
            background: isDark ? '#2563EB' : 'linear-gradient(135deg, #1976d2 0%, #1D4487 100%)',
            boxShadow: isDark ? 'none' : undefined,
          },
          '&:disabled': {
            background: isDark ? 'rgba(255,255,255,0.1)' : '#e0e0e0',
            color: isDark ? 'rgba(255,255,255,0.3)' : '#9e9e9e',
          },
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} color="inherit" />
            잠시만 기다려 주세요
          </Box>
        ) : (
          '로그인'
        )}
      </Button>

      <Button
        variant="text"
        size="small"
        onClick={() => setPasswordChangeDialogOpen(true)}
        sx={{
          alignSelf: 'center',
          fontSize: '0.75rem',
          color: isDark ? 'rgba(255,255,255,0.4)' : 'text.secondary',
          textTransform: 'none',
          '&:hover': {
            color: isDark ? 'rgba(255,255,255,0.7)' : 'text.primary',
            background: 'transparent',
          }
        }}
      >
        비밀번호 변경
      </Button>

      {/* Password Change Dialog */}
      <PasswordChangeDialog
        open={passwordChangeDialogOpen}
        onClose={() => setPasswordChangeDialogOpen(false)}
      />

      {/* Privacy Agreement Dialog */}
      {pendingUserId && (
        <PrivacyAgreementDialog
          open={privacyDialogOpen}
          userId={pendingUserId}
          onAgreed={handlePrivacyAgreed}
          onDisagreed={handlePrivacyDisagreed}
          required={true}
        />
      )}
    </Box>
  );
}
