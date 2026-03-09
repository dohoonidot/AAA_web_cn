import { Box, IconButton, Paper, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export type LeaveOverlayType = 'leave_alert' | 'leave_cc' | 'eapproval_cc';

export interface LeaveOverlayItem {
  id: string;
  type: LeaveOverlayType;
  title: string;
  message: string;
  payload?: Record<string, unknown>;
}

interface LeaveNotificationOverlayProps {
  items: LeaveOverlayItem[];
  onClose: (id: string) => void;
}

const buildDetails = (item: LeaveOverlayItem) => {
  const p = item.payload || {};
  const details: string[] = [];

  if (item.type === 'leave_cc') {
    if (typeof p.name === 'string') details.push(`이름: ${p.name}`);
    if (typeof p.department === 'string') details.push(`부서: ${p.department}`);
    if (typeof p.leave_type === 'string') details.push(`휴가종류: ${p.leave_type}`);
  } else if (item.type === 'leave_alert') {
    if (typeof p.leave_type === 'string') details.push(`휴가종류: ${p.leave_type}`);
    if (typeof p.reason === 'string') details.push(`사유: ${p.reason}`);
  } else if (item.type === 'eapproval_cc') {
    if (typeof p.title === 'string') details.push(`문서: ${p.title}`);
    if (typeof p.requester === 'string') details.push(`요청자: ${p.requester}`);
  }

  return details;
};

export default function LeaveNotificationOverlay({ items, onClose }: LeaveNotificationOverlayProps) {
  if (items.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 1400,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        maxWidth: 360,
        pointerEvents: 'none',
      }}
    >
      {items.map((item) => {
        const details = buildDetails(item);
        return (
          <Paper
            key={item.id}
            elevation={6}
            sx={{
              px: 2,
              py: 1.5,
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(6px)',
              pointerEvents: 'auto',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1 }}>
                {item.title}
              </Typography>
              <IconButton size="small" onClick={() => onClose(item.id)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="body2" sx={{ mt: 0.5, color: 'text.primary' }}>
              {item.message}
            </Typography>
            {details.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {details.map((line) => (
                  <Typography key={line} variant="caption" sx={{ display: 'block', color: 'text.primary' }}>
                    {line}
                  </Typography>
                ))}
              </Box>
            )}
          </Paper>
        );
      })}
    </Box>
  );
}
