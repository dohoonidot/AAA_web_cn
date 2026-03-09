import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  InputAdornment,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Visibility,
  VisibilityOff,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import { usePasswordChangeDialogState } from './PasswordChangeDialog.state';

interface PasswordChangeDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function PasswordChangeDialog({ open, onClose }: PasswordChangeDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { state, actions } = usePasswordChangeDialogState({ onClose });
  const {
    userId,
    currentPassword,
    newPassword,
    confirmPassword,
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    isLoading,
    error,
    success,
  } = state;
  const {
    setUserId,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    setShowCurrentPassword,
    setShowNewPassword,
    setShowConfirmPassword,
    setError,
    handleChangePassword,
    handleClose,
  } = actions;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'linear-gradient(135deg, #1D4487 0%, #1976d2 100%)',
          background: 'linear-gradient(135deg, #1D4487 0%, #1976d2 100%)',
          color: 'white',
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            비밀번호 변경
          </Typography>
        </Box>

        <IconButton
          onClick={handleClose}
          disabled={isLoading}
          sx={{
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.1)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ pt: 5, pb: 2, px: { xs: 2, sm: 3 } }}>
        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            비밀번호가 성공적으로 변경되었습니다.
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Email Field */}
        <TextField
          fullWidth
          label="이메일(아이디)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          disabled={isLoading || success}
          autoFocus
          sx={{
            mt: 2,
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            sx: {
              fontSize: { xs: '16px', sm: '14px' }, // iOS zoom prevention
            },
          }}
        />

        {/* Current Password Field */}
        <TextField
          fullWidth
          label="현재 비밀번호"
          type={showCurrentPassword ? 'text' : 'password'}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          disabled={isLoading || success}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  edge="end"
                  disabled={isLoading || success}
                >
                  {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              fontSize: { xs: '16px', sm: '14px' },
            },
          }}
        />

        {/* New Password Field */}
        <TextField
          fullWidth
          label="새 비밀번호"
          type={showNewPassword ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={isLoading || success}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOpenIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  edge="end"
                  disabled={isLoading || success}
                >
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              fontSize: { xs: '16px', sm: '14px' },
            },
          }}
        />

        {/* Confirm Password Field */}
        <TextField
          fullWidth
          label="새 비밀번호 확인"
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading || success}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOpenIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  disabled={isLoading || success}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              fontSize: { xs: '16px', sm: '14px' },
            },
          }}
        />
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={isLoading}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          취소
        </Button>
        <Button
          onClick={handleChangePassword}
          variant="contained"
          disabled={isLoading || success}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #1D4487 0%, #1976d2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #153668 0%, #1565c0 100%)',
            },
            minWidth: 120,
          }}
        >
          {isLoading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
              처리 중...
            </>
          ) : (
            '비밀번호 변경'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
