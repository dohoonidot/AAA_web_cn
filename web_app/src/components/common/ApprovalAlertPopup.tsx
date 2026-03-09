import { Box, IconButton, Paper, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export interface ApprovalAlertItem {
  id: string;
  title: string;
  message: string;
  status?: string;
}

interface ApprovalAlertPopupProps {
  alerts: ApprovalAlertItem[];
  onClose: (id: string) => void;
}

const getStatusColor = (status?: string) => {
  if (status === 'APPROVED') return '#10B981';
  if (status === 'REJECTED') return '#F59E0B';
  return '#2563EB';
};

export default function ApprovalAlertPopup({ alerts, onClose }: ApprovalAlertPopupProps) {
  if (alerts.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1400,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        pointerEvents: 'none',
      }}
    >
      {alerts.map((alert) => (
        <Paper
          key={alert.id}
          elevation={6}
          sx={{
            minWidth: 280,
            maxWidth: 360,
            px: 2,
            py: 1.5,
            borderRadius: 2,
            border: `1px solid ${getStatusColor(alert.status)}`,
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(6px)',
            pointerEvents: 'auto',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: getStatusColor(alert.status),
                flexShrink: 0,
              }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1 }}>
              {alert.title}
            </Typography>
            <IconButton size="small" onClick={() => onClose(alert.id)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
            {alert.message}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}
