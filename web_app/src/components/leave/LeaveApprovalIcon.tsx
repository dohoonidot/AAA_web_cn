import React from 'react';
import { Button, Typography, keyframes, styled, Slide, useTheme } from '@mui/material';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import { useNotificationStore } from '../../store/notificationStore';

// 빛이 지나가는 효과 (Shimmer)
const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// 둥둥 떠있는 효과 (Float)
const float = keyframes`
  0% {
    transform: translateY(0px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  }
  50% {
    transform: translateY(-4px);
    box-shadow: 0 12px 20px rgba(0,0,0,0.2);
  }
  100% {
    transform: translateY(0px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  }
`;

const StyledFab = styled(Button)(({ theme }) => ({
  position: 'fixed',
  top: 90,
  right: 24,
  zIndex: 1100,
  borderRadius: '24px', // 캡슐 모양
  padding: '10px 20px',
  // Vibrant Blue -> Purple Gradient (모던하고 트렌디한 색상)
  background: 'linear-gradient(135deg, #2962FF 0%, #6200EA 100%)',
  color: '#ffffff',
  textTransform: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.1)',
  backdropFilter: 'blur(10px)',

  // Float 애니메이션 적용 (3초 주기)
  animation: `${float} 3s ease-in-out infinite`,

  // 텍스트 스타일 가독성 확보
  '& .MuiTypography-root': {
    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
  },

  // Shimmer 효과를 위한 가상 요소
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '200%',
    height: '100%',
    background: 'linear-gradient(115deg, transparent 0%, transparent 40%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.4) 50%, transparent 55%, transparent 100%)',
    backgroundSize: '200% 100%',
    animation: `${shimmer} 2.5s infinite linear`, // 조금 더 빠르게 빛이 지나감
    pointerEvents: 'none',
  },

  '&:hover': {
    background: 'linear-gradient(135deg, #1E88E5 0%, #4A148C 100%)', // 호버 시 조금 더 밝게/진하게 변화
    transform: 'translateY(-4px)', // 호버 시 살짝 더 뜸
    boxShadow: '0 8px 25px rgba(98, 0, 234, 0.4)', // 그림자 강화
  },

  '&:active': {
    transform: 'scale(0.96)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    animation: 'none', // 클릭 시 둥실거림 멈춤
  }
}));

export const LeaveApprovalIcon: React.FC = () => {
  const {
    hasLeaveApprovalAlert,
    openLeaveApprovalListPanel,
    setHasLeaveApprovalAlert,
  } = useNotificationStore();

  const handleClick = () => {
    // 알림 끄고 패널 열기
    setHasLeaveApprovalAlert(false);
    openLeaveApprovalListPanel();
  };

  return (
    <Slide direction="left" in={hasLeaveApprovalAlert} mountOnEnter unmountOnExit>
      <StyledFab
        onClick={handleClick}
        variant="contained"
        disableElevation

      >
        <FactCheckRoundedIcon sx={{ fontSize: 20 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
          결재 요청 도착
        </Typography>
      </StyledFab>
    </Slide>
  );
};

export default LeaveApprovalIcon;
