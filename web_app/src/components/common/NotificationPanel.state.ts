import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../store/notificationStore';
import { ackSseNotifications } from '../../services/sseService';
import authService from '../../services/authService';
import type { NotificationDisplay } from '../../types/notification';
import type { MouseEvent as ReactMouseEvent } from 'react';
const DEBUG_TRACE = false;
const debugLog = (...args: unknown[]) => {
  if (!DEBUG_TRACE) return;
  console.log(...args);
};

export const useNotificationPanelState = () => {
  const navigate = useNavigate();
  const {
    isNotificationPanelOpen,
    setNotificationPanelOpen,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    refreshNotificationMessages,
    openLeaveApprovalPanel,
    isLeaveApprovalPanelOpen,
    selectedLeaveApproval,
    closeLeaveApprovalPanel,
    loadAlertsFromApi,
    // 페이지네이션
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
    getPaginatedNotifications,
    // 카테고리 필터
    selectedCategory,
    setSelectedCategory,
  } = useNotificationStore();

  const [selectedNotification, setSelectedNotification] = useState<NotificationDisplay | null>(null);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const modalOpenRef = useRef(false);
  const [birthdayPopup, setBirthdayPopup] = useState<{ open: boolean; message: string; title?: string; type?: 'birthday' | 'event' }>({
    open: false,
    message: '',
  });
  const [giftSelectionOpen, setGiftSelectionOpen] = useState(false);
  const [selectedBirthdayNotification, setSelectedBirthdayNotification] = useState<NotificationDisplay | null>(null);
  const [giftPanelOpen, setGiftPanelOpen] = useState(false);

  useEffect(() => {
    refreshNotificationMessages();
  }, [refreshNotificationMessages]);

  // 패널 열릴 때 알림함 API 호출하여 최신 데이터 로드
  useEffect(() => {
    if (isNotificationPanelOpen) {
      const userId = authService.getCurrentUser()?.userId;
      if (userId) {
        loadAlertsFromApi(userId).catch((err) => {
          console.error('[NotificationPanel] 알림 로드 실패:', err);
        });
      }
    }
  }, [isNotificationPanelOpen, loadAlertsFromApi]);

  const handleClearAll = async () => {
    const eventIds = notifications.map((n) => n.id);

    if (eventIds.length === 0) return;

    try {
      await ackSseNotifications(eventIds);
      debugLog('[NotificationPanel] 모든 알림 ACK 완료:', eventIds.length);
    } catch (error) {
      console.error('[NotificationPanel] 모든 알림 ACK 실패:', error);
    }

    clearAllNotifications();
  };

  const handleClose = (_event?: unknown, _reason?: 'backdropClick' | 'escapeKeyDown') => {
    // 상세 모달이 열려있거나 열리는 중이면 알림함 닫지 않음
    if (modalOpenRef.current || notificationModalOpen || isLeaveApprovalPanelOpen) return;
    setNotificationPanelOpen(false);
  };

  const handleNotificationClick = async (notificationId: string, _link?: string) => {
    markAsRead(notificationId);

    try {
      await ackSseNotifications(notificationId);
      debugLog('[NotificationPanel] 알림 ACK 완료:', notificationId);
    } catch (error) {
      console.error('[NotificationPanel] 알림 ACK 실패:', error);
    }

    const clickedNotification = notifications.find((n) => n.id === notificationId);
    if (!clickedNotification) return;

    // --- 클릭된 알림 상세 로깅 ---
    debugLog('[NotificationPanel] =======================================');
    debugLog('[NotificationPanel] 🔔 알림 클릭 감지 (상세 정보)');
    debugLog(`[NotificationPanel] - ID       :`, clickedNotification.id);
    debugLog(`[NotificationPanel] - 타입     :`, clickedNotification.type, `(큐: ${clickedNotification.queue_name})`);
    debugLog(`[NotificationPanel] - 제목     :`, clickedNotification.title);
    debugLog(`[NotificationPanel] - 내용     :`, clickedNotification.message);
    debugLog(`[NotificationPanel] - 수신시간 :`, clickedNotification.receivedAt);
    if (clickedNotification.payload) {
      debugLog(`[NotificationPanel] - Payload  :`, clickedNotification.payload);
    }
    if (clickedNotification.link) {
      debugLog(`[NotificationPanel] - Link     :`, clickedNotification.link);
    }
    debugLog('[NotificationPanel] =======================================');

    const isGiftEvent = (clickedNotification.type || '').startsWith('birthday') ||
      clickedNotification.queue_name.startsWith('birthday') ||
      clickedNotification.type === 'event';

    if (isGiftEvent) {
      setNotificationPanelOpen(false);
      setSelectedBirthdayNotification(clickedNotification);
      setBirthdayPopup({
        open: true,
        message: clickedNotification.message || '행복한 하루 되세요!',
        title: clickedNotification.type === 'event' ? '이벤트 당첨을 축하합니다!' : undefined,
        type: clickedNotification.type === 'event' ? 'event' : 'birthday',
      });
      return;
    }

    // 휴가 결재 알림 감지
    const userId = authService.getCurrentUser()?.userId || '';
    const qn = clickedNotification.queue_name || '';
    const isLeaveApproval = qn === 'leave_approval'
      || qn === `leave.approval.${userId}`
      || qn.startsWith('leave.approval')
      || qn.startsWith('leave_approval')
      || (qn === 'leave' && (clickedNotification.message || '').includes('결재'));

    if (isLeaveApproval && clickedNotification.payload) {
      // payload에서 휴가 데이터 추출
      let leaveData: any = null;
      try {
        if (clickedNotification.payload && typeof clickedNotification.payload === 'object') {
          const payload = clickedNotification.payload as any;
          leaveData = {
            id: payload?.id || payload?.leave_id || clickedNotification.id,
            status: payload?.status || 'REQUESTED',
            name: payload?.name || payload?.requester || '',
            department: payload?.department || '',
            jobPosition: payload?.job_position || '',
            leaveType: payload?.leave_type || '',
            startDate: payload?.start_date || '',
            endDate: payload?.end_date || '',
            halfDaySlot: payload?.half_day_slot || '',
            workdaysCount: payload?.workdays_count || payload?.days || 0,
            requestedDate: payload?.requested_date || '',
            reason: payload?.reason || '',
            isCancel: payload?.is_cancel || 0,
          };
        } else {
          leaveData = {
            id: clickedNotification.id,
            status: 'REQUESTED',
            name: '',
            leaveType: '',
            startDate: '',
            endDate: '',
          };
        }
      } catch (e) {
        leaveData = {
          id: clickedNotification.id,
          status: 'REQUESTED',
          name: '',
          leaveType: '',
          startDate: '',
          endDate: '',
        };
      }

      openLeaveApprovalPanel(leaveData);
      return;
    }

    // 일반 알림은 상세 모달 표시
    modalOpenRef.current = true;
    setSelectedNotification(clickedNotification);
    setNotificationModalOpen(true);
  };

  const handleDelete = async (notificationId: string, event: ReactMouseEvent) => {
    event.stopPropagation();

    try {
      await ackSseNotifications(notificationId);
      debugLog('[NotificationPanel] 알림 삭제 및 ACK 완료:', notificationId);
    } catch (error) {
      console.error('[NotificationPanel] 알림 ACK 실패:', error);
    }

    removeNotification(notificationId);
  };

  const handleNavigateToLink = (link: string) => {
    navigate(link);
    setNotificationModalOpen(false);
    setSelectedNotification(null);
    setNotificationPanelOpen(false);
  };

  const handleCloseModal = () => {
    modalOpenRef.current = false;
    setNotificationModalOpen(false);
    setSelectedNotification(null);
  };

  const handleCloseBirthdayPopup = () => {
    setBirthdayPopup({ open: false, message: '' });
  };

  const handleGoGiftFromBirthday = (notification?: NotificationDisplay) => {
    if (notification?.id) {
      markAsRead(notification.id);
      ackSseNotifications(notification.id).catch((error) => {
        console.error('[NotificationPanel] 알림 ACK 실패:', error);
      });
      setSelectedBirthdayNotification(notification);
    }
    handleCloseBirthdayPopup();
    setGiftSelectionOpen(true);
  };

  const handleCloseGiftSelection = () => {
    setGiftSelectionOpen(false);
  };

  const handleOpenGiftPanel = () => {
    setNotificationModalOpen(false);
    setNotificationPanelOpen(false);
    setGiftPanelOpen(true);
  };

  const handleCloseGiftPanel = () => {
    setGiftPanelOpen(false);
  };

  // 현재 페이지의 알림만 가져오기
  const paginatedNotifications = getPaginatedNotifications();

  return {
    modalOpenRef,
    state: {
      isNotificationPanelOpen,
      notifications,
      paginatedNotifications,
      unreadCount,
      selectedNotification,
      notificationModalOpen,
      birthdayPopup,
      giftSelectionOpen,
      selectedBirthdayNotification,
      giftPanelOpen,
      isLeaveApprovalPanelOpen,
      selectedLeaveApproval,
      // 페이지네이션
      currentPage,
      totalPages,
      pageSize,
      // 카테고리 필터
      selectedCategory,
    },
    actions: {
      setNotificationPanelOpen,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAllNotifications,
      refreshNotificationMessages,
      handleClearAll,
      handleClose,
      handleNotificationClick,
      handleDelete,
      handleNavigateToLink,
      handleCloseModal,
      handleCloseBirthdayPopup,
      handleGoGiftFromBirthday,
      handleCloseGiftSelection,
      handleOpenGiftPanel,
      handleCloseGiftPanel,
      closeLeaveApprovalPanel,
      loadAlertsFromApi,
      // 페이지네이션
      setCurrentPage,
      goToNextPage,
      goToPrevPage,
      goToFirstPage,
      goToLastPage,
      // 카테고리 필터
      setSelectedCategory,
    },
  };
};

export type NotificationPanelStateHook = ReturnType<typeof useNotificationPanelState>;
