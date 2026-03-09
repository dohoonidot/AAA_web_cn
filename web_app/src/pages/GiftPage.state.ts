import { useEffect, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import giftService from '../services/giftService';
import authService from '../services/authService';
import type { Gift } from '../types/gift';

export const useGiftPageState = () => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [mobileExportDialogOpen, setMobileExportDialogOpen] = useState(false);
  const [mobileExportLoading, setMobileExportLoading] = useState(false);
  const [mobileExportGiftUrl, setMobileExportGiftUrl] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    loadGifts();
  }, []);

  const loadGifts = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = authService.getCurrentUser();
      if (!user) {
        setError('사용자 정보를 찾을 수 없습니다.');
        return;
      }

      const response = await giftService.checkGifts(user.userId);
      console.log('받은 선물 목록:', response);
      console.log('받은 선물 개수:', response.gifts?.length || 0);

      if (response.gifts && response.gifts.length > 0) {
        console.log('첫 번째 선물 데이터:', response.gifts[0]);
        console.log('선물 필드들:', Object.keys(response.gifts[0]));
        response.gifts.forEach((gift, index) => {
          console.log(`선물 ${index + 1}:`, {
            coupon_img_url: gift.coupon_img_url,
            couponImgUrl: gift.couponImgUrl,
            hasCouponImage: !!(gift.coupon_img_url || gift.couponImgUrl),
            allFields: gift
          });
        });
      }

      setGifts(response.gifts || []);
    } catch (err: any) {
      console.error('선물 목록 로드 실패:', err);
      setError(err.response?.data?.message || '선물 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGiftClick = (gift: Gift) => {
    setSelectedGift(gift);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedGift(null);
  };

  const handleOpenInBrowser = (url: string, event?: ReactMouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    window.open(url, '_blank');
  };

  const handleOpenMobileExportDialog = (url: string, event?: ReactMouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setMobileExportGiftUrl(url);
    setMobileExportDialogOpen(true);
  };

  const handleCloseMobileExportDialog = () => {
    setMobileExportDialogOpen(false);
    setMobileExportGiftUrl(null);
  };

  const handleSendToMobile = async () => {
    if (!mobileExportGiftUrl) return;

    try {
      setMobileExportLoading(true);
      const response = await giftService.sendToMobile(mobileExportGiftUrl);

      console.log('모바일 내보내기 성공:', response);

      setSnackbarMessage(response.message || '모바일로 전송되었습니다.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      handleCloseMobileExportDialog();
    } catch (err: any) {
      console.error('모바일 내보내기 실패:', err);
      setSnackbarMessage(err.message || '모바일 내보내기에 실패했습니다.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setMobileExportLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const getCouponImageUrl = (gift: Gift): string | undefined => {
    const url = gift.coupon_img_url || gift.couponImgUrl;
    if (!url) {
      console.log('쿠폰 이미지 URL 없음:', {
        coupon_img_url: gift.coupon_img_url,
        couponImgUrl: gift.couponImgUrl,
        giftId: gift.id
      });
    }
    return url;
  };

  return {
    state: {
      gifts,
      loading,
      error,
      selectedGift,
      dialogOpen,
      mobileExportDialogOpen,
      mobileExportLoading,
      mobileExportGiftUrl,
      snackbarOpen,
      snackbarMessage,
      snackbarSeverity,
    },
    actions: {
      setGifts,
      setLoading,
      setError,
      setSelectedGift,
      setDialogOpen,
      setMobileExportDialogOpen,
      setMobileExportLoading,
      setMobileExportGiftUrl,
      setSnackbarOpen,
      setSnackbarMessage,
      setSnackbarSeverity,
      loadGifts,
      handleGiftClick,
      handleCloseDialog,
      handleOpenInBrowser,
      handleOpenMobileExportDialog,
      handleCloseMobileExportDialog,
      handleSendToMobile,
      handleCloseSnackbar,
      getCouponImageUrl,
    },
  };
};

export type GiftPageStateHook = ReturnType<typeof useGiftPageState>;
