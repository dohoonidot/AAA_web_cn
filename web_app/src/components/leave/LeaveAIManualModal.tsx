import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import {
  SmartToy as SmartToyIcon,
  Close as CloseIcon,
  EditNote as EditNoteIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  PeopleOutline as PeopleOutlineIcon,
} from '@mui/icons-material';
import { useThemeStore } from '../../store/themeStore';

interface LeaveAIManualModalProps {
  open: boolean;
  onClose: () => void;
}

interface ManualSectionProps {
  title: string;
  icon: React.ReactNode;
  content: string;
  isDark: boolean;
}

function ManualSection({ title, icon, content, isDark }: ManualSectionProps) {
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: isDark ? '#2D3748' : '#F8F9FA',
        borderRadius: '12px',
        border: `1px solid ${isDark ? '#4A5568' : '#E9ECEF'}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        {icon}
        <Typography
          sx={{
            fontSize: '16px',
            fontWeight: 600,
            color: isDark ? '#FFFFFF' : '#1A1D1F',
          }}
        >
          {title}
        </Typography>
      </Box>
      <Typography
        sx={{
          fontSize: '14px',
          lineHeight: 1.6,
          color: isDark ? '#CBD5E0' : '#4B5563',
          whiteSpace: 'pre-line',
        }}
      >
        {content}
      </Typography>
    </Box>
  );
}

export default function LeaveAIManualModal({ open, onClose }: LeaveAIManualModalProps) {
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme.name === 'Dark';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: isDark ? '#1A1D1F' : '#FFFFFF',
          borderRadius: '16px',
          maxHeight: '90vh',
          width: { xs: '95%', sm: '600px', md: '700px' },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          p: 2.5,
          borderBottom: `1px solid ${isDark ? '#2D3748' : '#E9ECEF'}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              p: 1.25,
              bgcolor: 'rgba(74, 108, 247, 0.1)',
              borderRadius: '10px',
            }}
          >
            <SmartToyIcon sx={{ color: '#4A6CF7', fontSize: 24 }} />
          </Box>
          <Typography
            sx={{
              flex: 1,
              fontSize: '20px',
              fontWeight: 700,
              color: isDark ? '#FFFFFF' : '#1A1D1F',
            }}
          >
            휴가 AI 작성 메뉴얼
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{ color: '#8B95A1' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* 1. 휴가상신 */}
          <ManualSection
            title="1. 휴가상신"
            icon={<EditNoteIcon sx={{ color: '#4A6CF7', fontSize: 20 }} />}
            content={`사내업무에서 "날짜, 연차 종류, 반차 여부, 사유(미작성 시 개인 사유)"를 입력하여 휴가 상신 요청

예시:
• "내일 휴가 써 줘"
• "3월 4일 휴가 써 줘 반차로"
• "다음 주 화요일 오후 반차 써 줘"

AI 말고 직접 작성 시에는 사이드바의 휴가 관리 → "휴가 작성"을 통해 하시면 됩니다.`}
            isDark={isDark}
          />

          {/* 2. 휴가 부여 상신 */}
          <ManualSection
            title="2. 휴가 부여 상신"
            icon={<AssignmentTurnedInIcon sx={{ color: '#4A6CF7', fontSize: 20 }} />}
            content={`사내업무에서 예비군 부여의 경우 예비군 관련 서류를 첨부하여 채팅으로 "예비군 휴가 부여 좀 해 줘" 요청 시

"휴가 부여 상신 전자결재 폼 자동 작성 → 관리자(경영관리실) 승인 → AAA 해당 예비군 연차 상신 폼 자동 작성 → 상신(수정 필요 시 수정 후 상신)"

마찬가지로, 처음부터 직접 작성하고 싶을 경우 채팅방 상단 메뉴 중 "전자결재 상신 초안" 클릭하여 작성하면 됩니다.`}
            isDark={isDark}
          />

          {/* 3. 전자결재 승인자/참조자 저장 */}
          <ManualSection
            title="3. 전자결재 승인자/참조자 저장"
            icon={<PeopleOutlineIcon sx={{ color: '#4A6CF7', fontSize: 20 }} />}
            content={`전자결재의 경우 승인자, 참조자를 저장할 수 있습니다.

휴가 상신 시와 다르게 저장됩니다. 서로 연관 없음.`}
            isDark={isDark}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}
