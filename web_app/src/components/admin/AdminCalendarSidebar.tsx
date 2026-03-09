import React from 'react';
import {
  Box,
  IconButton,
  Typography,
  Button,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  PeopleAltOutlined as PeopleAltOutlinedIcon,
  PushPin as PushPinIcon,
  PushPinOutlined as PushPinOutlinedIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { DepartmentLeaveStatusModal } from './DepartmentLeaveStatusModal';
import { useAdminCalendarSidebarState } from './AdminCalendarSidebar.state';
import authService from '../../services/authService';

interface AdminCalendarSidebarProps {
  isExpanded: boolean;
  isPinned: boolean;
  onHover: () => void;
  onExit: () => void;
  onPinToggle: () => void;
}

export const AdminCalendarSidebar: React.FC<AdminCalendarSidebarProps> = ({
  isExpanded,
  isPinned,
  onHover,
  onExit,
  onPinToggle,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDarkTheme = theme.palette.mode === 'dark';
  const { state, actions } = useAdminCalendarSidebarState();
  const { modalOpen } = state;
  const { setModalOpen } = actions;

  const currentUser = authService.getCurrentUser();
  const showTotalLeaveManage = currentUser?.adminRole === 0 || currentUser?.adminRole === 1;

  // 모바일에서는 사이드바를 렌더링하지 않음
  if (isMobile) {
    return (
      <>
        <DepartmentLeaveStatusModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <Box
        onMouseEnter={!isPinned ? onHover : undefined}
        onMouseLeave={!isPinned ? onExit : undefined}
        sx={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: isExpanded ? '285px' : '50px',
          height: '100%',
          background: isDarkTheme
            ? 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)'
            : 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
          borderRight: `1px solid ${isDarkTheme ? '#334155' : '#E2E8F0'}`,
          boxShadow: isDarkTheme
            ? '4px 0 24px rgba(0, 0, 0, 0.4)'
            : '4px 0 24px rgba(15, 23, 42, 0.06)',
          transition: 'width 0.3s ease-in-out',
          zIndex: 1000,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            height: '100%',
            overflowY: 'auto',
          }}
        >
          {isExpanded && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    p: 0.5,
                    borderRadius: '6px',
                    bgcolor: isDarkTheme ? 'rgba(100, 116, 139, 0.15)' : 'rgba(71, 85, 105, 0.08)',
                  }}
                >
                  <AdminPanelSettingsIcon
                    sx={{
                      color: isDarkTheme ? '#94A3B8' : '#475569',
                      fontSize: 16,
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: isDarkTheme ? '#F1F5F9' : '#1E293B',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  관리자 메뉴
                </Typography>
              </Box>
              <IconButton
                onClick={onPinToggle}
                size="small"
                sx={{
                  width: 24,
                  height: 24,
                  p: 0,
                  color: isPinned
                    ? (isDarkTheme ? '#94A3B8' : '#475569')
                    : isDarkTheme
                      ? 'rgba(148, 163, 184, 0.5)'
                      : 'rgba(71, 85, 105, 0.5)',
                }}
                title={isPinned ? '사이드바 고정 해제' : '사이드바 고정'}
              >
                {isPinned ? (
                  <PushPinIcon sx={{ fontSize: 14 }} />
                ) : (
                  <PushPinOutlinedIcon sx={{ fontSize: 14 }} />
                )}
              </IconButton>
            </Box>
          )}

          {!isExpanded && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mt: 2.5,
              }}
            >
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '8px',
                  bgcolor: isDarkTheme ? 'rgba(100, 116, 139, 0.15)' : 'rgba(71, 85, 105, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AdminPanelSettingsIcon
                  sx={{
                    color: isDarkTheme ? '#94A3B8' : '#475569',
                    fontSize: 18,
                  }}
                />
              </Box>
            </Box>
          )}

          {isExpanded && (
            <Button
              fullWidth
              variant="contained"
              startIcon={<PeopleAltOutlinedIcon sx={{ fontSize: 18 }} />}
              onClick={() => setModalOpen(true)}
              sx={{
                bgcolor: isDarkTheme ? '#334155' : '#475569',
                color: '#F8FAFC',
                py: 1.75,
                px: 1.5,
                borderRadius: '10px',
                textTransform: 'none',
                fontSize: '13.5px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                boxShadow: isDarkTheme
                  ? '0 1px 3px rgba(0,0,0,0.4)'
                  : '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
                '&:hover': {
                  bgcolor: isDarkTheme ? '#3E4C63' : '#334155',
                },
              }}
            >
              부서원 휴가 현황
            </Button>
          )}

          {isExpanded && showTotalLeaveManage && (
            <Button
              fullWidth
              variant="contained"
              startIcon={<OpenInNewIcon sx={{ fontSize: 18 }} />}
              onClick={() => window.open('http://211.43.205.49:9988/pages/vacation-requests.html', '_blank')}
              sx={{
                mt: 1.5,
                bgcolor: isDarkTheme ? '#1E293B' : '#F1F5F9',
                color: isDarkTheme ? '#CBD5E1' : '#475569',
                py: 1.75,
                px: 1.5,
                borderRadius: '10px',
                textTransform: 'none',
                fontSize: '13.5px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                border: isDarkTheme ? '1px solid #334155' : '1px solid #E2E8F0',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: isDarkTheme ? '#283548' : '#E2E8F0',
                  boxShadow: 'none',
                },
              }}
            >
              휴가총괄관리
            </Button>
          )}
        </Box>
      </Box>

      <DepartmentLeaveStatusModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

