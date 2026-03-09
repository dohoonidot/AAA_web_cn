import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import giftService from '../../services/giftService';
import authService from '../../services/authService';

interface GiftSelectionModalProps {
  open: boolean;
  onClose: () => void;
  alertId?: number;
  queueName?: string;
  realTimeId?: number;
}

type GiftItem = {
  id: string;
  name: string;
  description: string;
  goodsCode: string;
  image: string;
  note?: string;
};

const gifts: GiftItem[] = [
  {
    id: 'baedal_minjok',
    name: '배달의민족',
    description: '모바일상품권 2만원',
    goodsCode: 'G00003471033',
    image: '/assets/images/baemin.png',
  },
  {
    id: 'shinsegae',
    name: '신세계',
    description: '상품권 2만원',
    goodsCode: 'G00002071060',
    image: '/assets/images/sinsaegae.png',
    note: '백화점 상품권샵에서만 교환 가능',
  },
  {
    id: 'cu',
    name: 'CU',
    description: '모바일상품권 2만원',
    goodsCode: 'G00004291585',
    image: '/assets/images/cu.png',
  },
  {
    id: 'gs25',
    name: 'GS25',
    description: '모바일상품권 2만원',
    goodsCode: 'G00000750719',
    image: '/assets/images/gs25.png',
  },
  {
    id: 'emart',
    name: '이마트',
    description: '상품권 2만원',
    goodsCode: 'G00000830685',
    image: '/assets/images/emart.png',
    note: '만원권 두 장으로 전송됩니다',
  },
  {
    id: 'seven_eleven',
    name: '세븐일레븐',
    description: '모바일상품권 2만원',
    goodsCode: 'G00002251034',
    image: '/assets/images/seven.png',
  },
];

export default function GiftSelectionModal({
  open,
  onClose,
  alertId,
  queueName = 'birthday',
  realTimeId,
}: GiftSelectionModalProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const selectedGift = useMemo(
    () => gifts.find((g) => g.id === selectedGiftId) || null,
    [selectedGiftId]
  );

  const handleConfirm = () => {
    if (!selectedGift) return;
    setConfirmOpen(true);
  };

  const handleSendGift = async () => {
    if (!selectedGift) return;
    setConfirmOpen(false);
    onClose();

    const userId = authService.getCurrentUser()?.userId;
    if (!userId) {
      setSnackbar({ open: true, message: '사용자 정보를 찾을 수 없습니다.', severity: 'error' });
      return;
    }

    try {
      const response = await giftService.sendGift({
        goodsCode: selectedGift.goodsCode,
        userId,
        id: alertId ?? 0,
        realTimeId,
        queueName,
      });

      const statusCode = typeof response?.status_code === 'number' ? response.status_code : 200;
      if (statusCode >= 400) {
        setSnackbar({
          open: true,
          message: response?.detail || '오류가 발생했습니다.',
          severity: 'error',
        });
        return;
      }

      setSnackbar({ open: true, message: '선물이 성공적으로 전송되었습니다! 🎁', severity: 'success' });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.message || '선물 전송 중 오류가 발생했습니다.',
        severity: 'error',
      });
    }
  };

  const handleCloseAll = () => {
    setSelectedGiftId(null);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCloseAll}
        maxWidth="lg"
        fullWidth
        fullScreen={fullScreen}
        PaperProps={{
          sx: {
            borderRadius: fullScreen ? 0 : '20px',
            bgcolor: isDark ? '#0F172A' : '#FFFFFF',
            boxShadow: '0 25px 60px rgba(15,23,42,0.25)',
            overflow: 'hidden',
          },
        }}
      >
        {/* 상단 액센트 바 */}
        <Box
          sx={{
            height: 4,
            background: 'linear-gradient(90deg, #F59E0B 0%, #EF4444 50%, #EC4899 100%)',
            flexShrink: 0,
          }}
        />

        {/* 헤더 */}
        <Box
          sx={{
            px: 3,
            pt: 2.5,
            pb: 2,
            bgcolor: isDark ? '#1E293B' : '#1E293B',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: 'rgba(245,158,11,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            🎁
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{ color: '#F59E0B', fontWeight: 700, fontSize: '10px', letterSpacing: '0.1em', mb: 0.5 }}
            >
              GIFT SELECTION
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: '#F8FAFC', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.01em' }}
            >
              선물을 선택해 주세요
            </Typography>
          </Box>
          <IconButton onClick={handleCloseAll} sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* 안내문구 */}
        <Box
          sx={{
            mx: 3,
            mt: 2,
            mb: 0,
            px: 2,
            py: 1.25,
            borderRadius: '10px',
            bgcolor: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)',
            border: isDark ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(99,102,241,0.15)',
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: isDark ? '#818CF8' : '#4F46E5', fontWeight: 600, lineHeight: 1.6 }}
          >
            선물은 "선물 받기" 버튼을 누르면 즉시 수령 처리됩니다. 수령 후 30일 이내에 꼭 사용해주세요.
          </Typography>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
              gap: 1.5,
            }}
          >
            {gifts.map((gift) => {
              const isSelected = selectedGiftId === gift.id;
              return (
                <Box
                  key={gift.id}
                  onClick={() => setSelectedGiftId(gift.id)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: isSelected
                      ? '2.5px solid #F59E0B'
                      : isDark
                        ? '1px solid rgba(255,255,255,0.08)'
                        : '1px solid #E2E8F0',
                    boxShadow: isSelected
                      ? '0 0 0 3px rgba(245,158,11,0.18), 0 8px 24px rgba(245,158,11,0.15)'
                      : isDark
                        ? 'none'
                        : '0 2px 8px rgba(15,23,42,0.06)',
                    bgcolor: isSelected
                      ? isDark ? 'rgba(245,158,11,0.07)' : 'rgba(245,158,11,0.04)'
                      : isDark ? '#1E293B' : '#FFFFFF',
                    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: isSelected
                        ? '0 0 0 3px rgba(245,158,11,0.22), 0 12px 28px rgba(245,158,11,0.18)'
                        : isDark
                          ? '0 8px 24px rgba(0,0,0,0.3)'
                          : '0 8px 24px rgba(15,23,42,0.1)',
                    },
                    position: 'relative',
                  }}
                >
                  {/* 선택 표시 */}
                  {isSelected && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        bgcolor: '#F59E0B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,
                        fontSize: 14,
                        color: 'white',
                        fontWeight: 900,
                        boxShadow: '0 2px 8px rgba(245,158,11,0.5)',
                      }}
                    >
                      ✓
                    </Box>
                  )}

                  {/* 이미지 */}
                  <Box
                    sx={{
                      height: 240,
                      bgcolor: isDark ? '#0F172A' : '#F8FAFC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 0,
                    }}
                  >
                    <Box
                      component="img"
                      src={gift.image}
                      alt={gift.name}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>

                  {/* 정보 */}
                  <Box
                    sx={{
                      p: 1.75,
                      borderTop: isSelected
                        ? '1px solid rgba(245,158,11,0.2)'
                        : isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F1F5F9',
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, color: isSelected ? '#D97706' : isDark ? '#F1F5F9' : '#1E293B', mb: 0.25 }}
                    >
                      {gift.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: isSelected ? '#92400E' : isDark ? '#94A3B8' : '#64748B', display: 'block' }}
                    >
                      {gift.description}
                    </Typography>
                    {gift.note && (
                      <Typography
                        variant="caption"
                        sx={{ color: '#EF4444', fontWeight: 600, display: 'block', mt: 0.5, fontSize: '10px' }}
                      >
                        ※ {gift.note}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2.5,
            borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F1F5F9',
            gap: 1,
          }}
        >
          <Button
            onClick={handleCloseAll}
            variant="text"
            sx={{
              color: isDark ? '#94A3B8' : '#64748B',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: '8px',
              px: 2,
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' },
            }}
          >
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={!selectedGiftId}
            sx={{
              bgcolor: '#1E293B',
              color: '#F8FAFC',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '8px',
              px: 2.5,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#334155', boxShadow: 'none' },
              '&:disabled': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', color: isDark ? '#475569' : '#94A3B8' },
            }}
          >
            선물 받기
          </Button>
        </DialogActions>
      </Dialog>

      {/* 확인 다이얼로그 */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            bgcolor: isDark ? '#1E293B' : '#FFFFFF',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ height: 4, background: 'linear-gradient(90deg, #F59E0B, #EF4444)' }} />
        <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: isDark ? '#F1F5F9' : '#1E293B', mb: 0.5 }}>
            선물 받기 확인
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#64748B', lineHeight: 1.7 }}>
            선물 수령 후 30일 이내에 꼭 사용하셔야 합니다.
          </Typography>
          {selectedGift?.id === 'emart' && (
            <Box
              sx={{
                mt: 1.5,
                p: 1.25,
                borderRadius: '8px',
                bgcolor: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)',
                border: '1px solid rgba(99,102,241,0.2)',
              }}
            >
              <Typography variant="caption" sx={{ color: isDark ? '#818CF8' : '#4F46E5', fontWeight: 600 }}>
                이마트 상품권은 만원권 두 장이 전송됩니다.
              </Typography>
            </Box>
          )}
          {selectedGift?.id === 'shinsegae' && (
            <Box
              sx={{
                mt: 1.5,
                p: 1.25,
                borderRadius: '8px',
                bgcolor: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.25)',
              }}
            >
              <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 600 }}>
                신세계 상품권은 백화점 상품권샵에서만 교환 가능합니다.
              </Typography>
            </Box>
          )}
        </Box>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            variant="text"
            sx={{
              color: isDark ? '#94A3B8' : '#64748B',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' },
            }}
          >
            취소
          </Button>
          <Button
            onClick={handleSendGift}
            variant="contained"
            sx={{
              bgcolor: '#1E293B',
              color: '#F8FAFC',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '8px',
              px: 2.5,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#334155', boxShadow: 'none' },
            }}
          >
            받기
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
