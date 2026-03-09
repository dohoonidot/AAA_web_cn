import { useEffect, useState } from 'react';
import giftService from '../../services/giftService';
import authService from '../../services/authService';
import type { Gift } from '../../types/gift';
import { useNotificationStore } from '../../store/notificationStore';

export const useGiftButtonState = () => {
  const giftCount = useNotificationStore((s) => s.giftCount);
  const storeSetGiftCount = useNotificationStore((s) => s.setGiftCount);
  const [isOpen, setIsOpen] = useState(false);

  const isCouponGift = (gift: Gift) => {
    const giftType = String(gift.gift_type || '').trim();
    return Boolean(gift.coupon_img_url || gift.couponImgUrl || giftType.includes('쿠폰'));
  };

  const isGiftUsed = (gift: Gift): boolean => {
    const raw = (gift as any).is_used ?? (gift as any).isUsed ?? (gift as any).used ?? (gift as any).use_yn ?? (gift as any).used_yn ?? (gift as any).coupon_used;
    if (raw === true || raw === 1) return true;
    if (typeof raw === 'string') {
      const value = raw.trim().toUpperCase();
      if (value === 'Y' || value === 'TRUE' || value === 'USED') return true;
    }
    return false;
  };

  const countUnusedCoupons = (gifts: Gift[]) =>
    gifts.filter((gift) => isCouponGift(gift) && !isGiftUsed(gift)).length;

  useEffect(() => {
    const loadGiftCount = async () => {
      try {
        const user = authService.getCurrentUser();
        if (!user) return;

        const response = await giftService.checkGifts(user.userId);
        console.log('🎁 선물 응답:', response);
        const newGiftCount = countUnusedCoupons(response?.gifts || []);
        storeSetGiftCount(newGiftCount);
      } catch (error) {
        console.error('🎁 선물 개수 조회 실패:', error);
        storeSetGiftCount(0);
      }
    };

    loadGiftCount();

    const interval = setInterval(loadGiftCount, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [storeSetGiftCount]);

  return {
    state: {
      giftCount,
      isOpen,
    },
    actions: {
      setGiftCount: storeSetGiftCount,
      setIsOpen,
    },
  };
};

export const useGiftPanelState = ({
  open,
  onGiftCountChange,
}: {
  open: boolean;
  onGiftCountChange: (count: number) => void;
}) => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mobileExportDialogOpen, setMobileExportDialogOpen] = useState(false);
  const [mobileExportLoading, setMobileExportLoading] = useState(false);
  const [mobileExportGiftUrl, setMobileExportGiftUrl] = useState<string | null>(null);


  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const isCouponGift = (gift: Gift) => {
    const giftType = String(gift.gift_type || '').trim();
    return Boolean(gift.coupon_img_url || gift.couponImgUrl || giftType.includes('쿠폰'));
  };

  const isGiftUsed = (gift: Gift): boolean => {
    const raw = (gift as any).is_used ?? (gift as any).isUsed ?? (gift as any).used ?? (gift as any).use_yn ?? (gift as any).used_yn ?? (gift as any).coupon_used;
    if (raw === true || raw === 1) return true;
    if (typeof raw === 'string') {
      const value = raw.trim().toUpperCase();
      if (value === 'Y' || value === 'TRUE' || value === 'USED') return true;
    }
    return false;
  };

  const countUnusedCoupons = (items: Gift[]) =>
    items.filter((gift) => isCouponGift(gift) && !isGiftUsed(gift)).length;

  useEffect(() => {
    if (open) {
      loadGifts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
      setGifts(response.gifts || []);

      const newGiftCount = countUnusedCoupons(response.gifts || []);
      onGiftCountChange(newGiftCount);
    } catch (err: any) {
      console.error('선물함 조회 실패:', err);
      setError('선물함을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getCouponImageUrl = (gift: Gift): string | undefined => {
    return gift.coupon_img_url || gift.couponImgUrl;
  };

  const handleOpenInBrowser = (url: string) => {
    window.open(url, '_blank');
  };

  const handleOpenMobileExportDialog = (url: string) => {
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

  return {
    state: {
      gifts,
      loading,
      error,
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
      setMobileExportDialogOpen,
      setMobileExportLoading,
      setMobileExportGiftUrl,
      setSnackbarOpen,
      setSnackbarMessage,
      setSnackbarSeverity,
      loadGifts,
      getCouponImageUrl,
      handleOpenInBrowser,
      handleOpenMobileExportDialog,
      handleCloseMobileExportDialog,
      handleSendToMobile,
      handleCloseSnackbar,
    },
  };
};

export type GiftButtonStateHook = ReturnType<typeof useGiftButtonState>;
export type GiftPanelStateHook = ReturnType<typeof useGiftPanelState>;
