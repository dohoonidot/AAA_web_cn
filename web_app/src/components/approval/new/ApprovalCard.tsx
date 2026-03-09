import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface ApprovalCardProps {
  title: string;
  children: ReactNode;
  isDark?: boolean;
}

export default function ApprovalCard({ title, children, isDark = false }: ApprovalCardProps) {
  const panelBorder = isDark ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.18)';

  return (
    <Box sx={{ border: `1px solid ${panelBorder}`, borderRadius: '16px', overflow: 'hidden' }}>
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          borderBottom: `1px solid ${panelBorder}`,
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.70)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: isDark ? '#CBD5E1' : '#475569' }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 2.5, background: isDark ? 'rgba(17,24,39,0.50)' : 'rgba(248,250,252,0.60)' }}>
        {children}
      </Box>
    </Box>
  );
}
