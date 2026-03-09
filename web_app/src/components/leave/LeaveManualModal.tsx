import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
} from '@mui/material';
import {
  HelpOutline as HelpOutlineIcon,
  Close as CloseIcon,
  EditCalendar as EditCalendarIcon,
  CalendarMonth as CalendarMonthIcon,
  TableChart as TableChartIcon,
  Approval as ApprovalIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useThemeStore } from '../../store/themeStore';

interface LeaveManualModalProps {
  open: boolean;
  onClose: () => void;
}

interface ManualItemProps {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
  isDark: boolean;
}

function ManualItem({ icon, iconColor, title, description, isDark }: ManualItemProps) {
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: isDark ? '#262626' : '#F8FAFC',
        borderRadius: '10px',
        border: `1px solid ${isDark ? '#3D3D3D' : '#E2E8F0'}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box
          sx={{
            p: 1,
            bgcolor: `${iconColor}1A`,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 600,
              color: isDark ? '#FFFFFF' : '#1E293B',
              mb: 0.5,
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontSize: '13px',
              color: isDark ? '#A0AEC0' : '#64748B',
              lineHeight: 1.6,
            }}
          >
            {description}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function LeaveManualModal({ open, onClose }: LeaveManualModalProps) {
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme.name === 'Dark';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: isDark ? '#1E1E1E' : '#FFFFFF',
          borderRadius: '16px',
          maxHeight: '90vh',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          p: 2.5,
          bgcolor: isDark ? '#2D2D2D' : '#F8FAFC',
          borderBottom: `1px solid ${isDark ? '#3D3D3D' : '#E2E8F0'}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              p: 1.25,
              bgcolor: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '10px',
            }}
          >
            <HelpOutlineIcon sx={{ color: '#3B82F6', fontSize: 22 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: '17px',
                fontWeight: 700,
                color: isDark ? '#FFFFFF' : '#1E293B',
              }}
            >
              휴가관리 사용 가이드
            </Typography>
            <Typography
              sx={{
                fontSize: '12px',
                color: isDark ? '#A0AEC0' : '#64748B',
              }}
            >
              각 기능에 대한 설명입니다
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: isDark ? '#A0AEC0' : '#94A3B8',
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          <ManualItem
            icon={<EditCalendarIcon sx={{ color: '#10B981', fontSize: 20 }} />}
            iconColor="#10B981"
            title="휴가 신청"
            description='상단의 "휴가 신청" 버튼을 클릭하여 새로운 휴가를 신청할 수 있습니다. 휴가 종류, 시작일/종료일, 사유를 입력하고 결재자를 선택한 후 제출하세요.'
            isDark={isDark}
          />

          <ManualItem
            icon={<CalendarMonthIcon sx={{ color: '#8B5CF6', fontSize: 20 }} />}
            iconColor="#8B5CF6"
            title="휴가 캘린더"
            description='월별 휴가 현황과 공휴일을 한눈에 확인할 수 있습니다. 날짜를 클릭하면 해당 날짜의 휴가 상세 정보가 표시됩니다. 좌우 화살표로 월을 이동하세요. 넓게 보기 버튼을 누르면 넓은 달력이 표시됩니다.'
            isDark={isDark}
          />

          <ManualItem
            icon={<TableChartIcon sx={{ color: '#F59E0B', fontSize: 20 }} />}
            iconColor="#F59E0B"
            title="휴가 관리 대장"
            description='올해 연차 발생 일수, 사용 일수, 잔여 일수를 확인할 수 있습니다. 하단 테이블에서 휴가 사용 내역을 상세히 조회하고, 행을 클릭하면 해당 휴가의 결재 상태를 확인할 수 있습니다.'
            isDark={isDark}
          />

          <ManualItem
            icon={<ApprovalIcon sx={{ color: '#3B82F6', fontSize: 20 }} />}
            iconColor="#3B82F6"
            title="결재 현황"
            description='상단에서 결재 진행 상태(대기/승인/반려)를 실시간으로 확인할 수 있습니다. 각 상태를 클릭하면 해당 상태의 휴가 목록만 필터링하여 볼 수 있습니다.'
            isDark={isDark}
          />

          <ManualItem
            icon={<MenuIcon sx={{ color: '#EC4899', fontSize: 20 }} />}
            iconColor="#EC4899"
            title="사이드바 메뉴"
            description='왼쪽 사이드바에서 휴가 신청, AI 휴가 추천, 연차 부여 내역, 연차 촉진 안내문 등 다양한 기능에 빠르게 접근할 수 있습니다. 달력이 있고, 휴가 관리자(경영관리실)에게 예비군/민방위, 결혼, 경조사 연차 부여 요청 내역을 볼 수 있습니다. 핀 아이콘을 클릭하면 사이드바를 고정할 수 있습니다.'
            isDark={isDark}
          />
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          p: 2,
          bgcolor: isDark ? '#2D2D2D' : '#F8FAFC',
          borderTop: `1px solid ${isDark ? '#3D3D3D' : '#E2E8F0'}`,
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: '#3B82F6',
            color: '#FFFFFF',
            px: 3,
            py: 1,
            fontWeight: 600,
            borderRadius: '8px',
            '&:hover': {
              bgcolor: '#2563EB',
            },
          }}
        >
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
}
