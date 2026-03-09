import React from 'react';
import { Button, Typography, keyframes, styled, Slide } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNotificationStore } from '../../store/notificationStore';
import authService from '../../services/authService';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const float = keyframes`
  0% { transform: translateY(0px); box-shadow: 0 4px 10px rgba(0,0,0,0.15); }
  50% { transform: translateY(-4px); box-shadow: 0 12px 20px rgba(0,0,0,0.2); }
  100% { transform: translateY(0px); box-shadow: 0 4px 10px rgba(0,0,0,0.15); }
`;

const StyledFab = styled(Button)(() => ({
  position: 'fixed',
  top: 140,
  right: 24,
  zIndex: 1100,
  borderRadius: '24px',
  padding: '10px 20px',
  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  color: '#ffffff',
  textTransform: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.1)',
  backdropFilter: 'blur(10px)',
  animation: `${float} 3s ease-in-out infinite`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '200%',
    height: '100%',
    background: 'linear-gradient(115deg, transparent 0%, transparent 40%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.4) 50%, transparent 55%, transparent 100%)',
    backgroundSize: '200% 100%',
    animation: `${shimmer} 2.5s infinite linear`,
    pointerEvents: 'none',
  },
  '&:hover': {
    background: 'linear-gradient(135deg, #34D399 0%, #059669 100%)',
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
  },
  '&:active': {
    transform: 'scale(0.96)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    animation: 'none',
  },
}));

export const EApprovalIcon: React.FC = () => {
  const { hasEapprovalAlert, setHasEapprovalAlert } = useNotificationStore();

  const handleClick = () => {
    setHasEapprovalAlert(false);

    // 외부 휴가 부여/승인 페이지로 이동 (자동 로그인을 위해 userId 전달)
    const user = authService.getCurrentUser();
    const userId = user?.userId || '';
    const targetUrl = `http://210.107.96.193:9999/pages/vacation-requests.html?userId=${encodeURIComponent(userId)}`;

    window.location.href = targetUrl;
  };

  return (
    <Slide direction="left" in={hasEapprovalAlert} mountOnEnter unmountOnExit>
      <StyledFab onClick={handleClick} variant="contained" disableElevation>
        <AssignmentIcon sx={{ fontSize: 20 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
          전자결재 도착
        </Typography>
      </StyledFab>
    </Slide>
  );
};

export default EApprovalIcon;
