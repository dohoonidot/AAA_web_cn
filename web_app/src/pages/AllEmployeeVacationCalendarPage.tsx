import { Box, Button, Typography } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import VacationCalendar from '../components/calendar/VacationCalendar';

export default function AllEmployeeVacationCalendarPage() {
  const navigate = useNavigate();
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme.name === 'Dark';

  return (
    <Box
      sx={{
        height: { xs: 'var(--app-height)', md: '100vh' },
        display: 'flex',
        flexDirection: 'column',
        bgcolor: colorScheme.backgroundColor,
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 1.5,
          borderBottom: `1px solid ${colorScheme.textFieldBorderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          bgcolor: colorScheme.surfaceColor,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Button
            onClick={() => navigate('/leave')}
            startIcon={<ArrowBackIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: colorScheme.textColor,
              border: `1px solid ${colorScheme.textFieldBorderColor}`,
              borderRadius: '10px',
            }}
          >
            휴가관리로 돌아가기
          </Button>
          <Typography
            sx={{ fontSize: { xs: '15px', md: '16px' }, fontWeight: 700, color: colorScheme.textColor }}
          >
            전 사원 휴가 현황
          </Typography>
        </Box>
        <Box />
      </Box>

      {/* 캘린더 영역 */}
      <Box sx={{ flex: 1, minHeight: 0, p: { xs: 1, md: 1.5 } }}>
        <Box
          sx={{
            height: '100%',
            borderRadius: '12px',
            overflow: 'hidden',
            border: `1px solid ${colorScheme.textFieldBorderColor}`,
            boxShadow: isDark
              ? '0 8px 20px rgba(0,0,0,0.28)'
              : '0 8px 20px rgba(15,23,42,0.08)',
          }}
        >
          <VacationCalendar isDark={isDark} colorScheme={colorScheme} />
        </Box>
      </Box>
    </Box>
  );
}
