import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authService from './services/authService';
import giftService from './services/giftService';
import { useNotificationStore } from './store/notificationStore';
import { useLeaveRequestDraftStore } from './store/leaveRequestDraftStore';
import { useChatStore } from './store/chatStore';
import { useSseNotifications } from './hooks/useSseNotifications';
import { buildNotificationMessage, getTitleByQueueName } from './utils/notificationHelpers';
import { ackSseNotifications } from './services/sseService';
import type { NotificationEnvelope } from './types/notification';
import type { ChatMessage } from './types';
import type { TickerMessage } from './components/common/ScrollingTicker';
import type { ApprovalAlertItem } from './components/common/ApprovalAlertPopup';
import type { LeaveOverlayItem } from './components/leave/LeaveNotificationOverlay';
const DEBUG_TRACE = false;
const debugLog = (...args: unknown[]) => {
  if (!DEBUG_TRACE) return;
  console.log(...args);
};

type RealtimeToast = {
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
};

const extractPayloadMessage = (payload: unknown): string => {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;
  if (typeof payload !== 'object') return '';

  const p = payload as Record<string, unknown>;
  const messageFields = ['message', 'content', 'body', 'text', 'description', 'subject', 'title'];
  for (const field of messageFields) {
    const value = p[field];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  if (typeof p.name === 'string' && p.name.trim()) {
    return `${p.name}님의 알림`;
  }

  return '';
};

const extractEnvelopeMessage = (envelope: NotificationEnvelope): string => {
  if (typeof envelope.payload === 'string') return envelope.payload;
  const payloadMessage = extractPayloadMessage(envelope.payload);
  if (payloadMessage) return payloadMessage;
  if (typeof envelope.payload_text === 'string' && envelope.payload_text.trim()) {
    return envelope.payload_text.trim();
  }
  return '';
};

const buildRealtimeToast = (envelope: NotificationEnvelope): RealtimeToast => {
  const payload = envelope.payload as Record<string, unknown> | undefined;

  // 새로운 통합 멘트 생성 함수 사용
  const message = buildNotificationMessage(envelope.event, payload);

  // severity 결정
  let severity: 'success' | 'error' | 'warning' | 'info' = 'info';

  switch (envelope.event) {
    case 'leave_draft':
    case 'gift':
    case 'gift_arrival':
      severity = 'success';
      break;
    case 'eapproval_alert': {
      const status = payload?.status;
      if (status === 'APPROVED') severity = 'success';
      else if (status === 'REJECTED') severity = 'warning';
      break;
    }
    case 'leave_alert': {
      const status = payload?.status;
      if (status === 'APPROVED') severity = 'success';
      else if (status === 'REJECTED') severity = 'warning';
      break;
    }
  }

  return { message, severity };
};

const parseNumericId = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const estimateTickerDuration = (message: string): number => {
  const base = 4000;
  const perChar = 120;
  const duration = base + message.length * perChar;
  return Math.min(Math.max(duration, 7000), 45000);
};

export const useAppContentState = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notification, setNotification] = useState<{
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
    data?: NotificationEnvelope; // 클릭 처리를 위해 원본 데이터 저장
  } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string>('');
  const [tickerMessages, setTickerMessages] = useState<TickerMessage[]>([]);
  const [approvalAlerts, setApprovalAlerts] = useState<ApprovalAlertItem[]>([]);
  const [leaveOverlayItems, setLeaveOverlayItems] = useState<LeaveOverlayItem[]>([]);
  const [birthdayPopup, setBirthdayPopup] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });
  const [eventPopup, setEventPopup] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: '',
    message: '',
  });
  const [giftSelectionOpen, setGiftSelectionOpen] = useState(false);
  const [giftSelectionContext, setGiftSelectionContext] = useState<{
    queueName: string;
    alertId?: number;
    realTimeId?: number;
  }>({
    queueName: 'birthday',
  });

  const {
    setConnectionState,
    setSseEnabled,
    openLeaveApprovalPanel, // 패널 열기 액션
    addNotification, // SSE 수신 시 즉각 배지 업데이트
    loadAlertsFromApi, // SSE 수신 시 알림함 동기화
    setHasLeaveApprovalAlert, // 결재 요청 알림 아이콘 표시
    setHasEapprovalAlert, // 전자결재 아이콘 표시
    incrementGiftCount, // 선물 배지 즉각 업데이트
    setGiftCount, // 선물 배지 동기화
  } = useNotificationStore();
  const { openPanel: openLeaveRequestPanel } = useLeaveRequestDraftStore();
  const addChatMessage = useChatStore((s) => s.addMessage);
  const currentArchive = useChatStore((s) => s.currentArchive);

  const [giftArrivalPopup, setGiftArrivalPopup] = useState<{
    open: boolean;
    data: {
      gift_name?: string;
      message?: string;
      couponImgUrl?: string;
      coupon_end_date?: string;
      queue_name?: string;
      sender_name?: string;
    } | null;
  }>({ open: false, data: null });
  const [giftPanelOpen, setGiftPanelOpen] = useState(false);
  const refreshInFlightRef = useRef(false);
  const refreshKeyRef = useRef<string | null>(null);
  const alertsLoadedUserRef = useRef<string | null>(null);
  const alertsLoadInFlightRef = useRef(false);

  useEffect(() => {
    if (location.pathname === '/login') {
      setIsCheckingAuth(false);
      setIsLoggedIn(false);
      return;
    }

    const checkAuthStatus = async () => {
      const refreshKey = location.pathname;
      const skipRefreshOnce = sessionStorage.getItem('skip_refresh_once') === '1';
      setIsCheckingAuth(true);
      if (skipRefreshOnce) {
        sessionStorage.removeItem('skip_refresh_once');
        refreshKeyRef.current = refreshKey;
        setIsLoggedIn(true);
        setIsCheckingAuth(false);
        return;
      }

      if (refreshInFlightRef.current || refreshKeyRef.current === refreshKey) {
        setIsCheckingAuth(false);
        return;
      }

      refreshInFlightRef.current = true;
      refreshKeyRef.current = refreshKey;
      try {
        const refreshResult = await authService.refresh();
        if (refreshResult && refreshResult.status_code === 200) {
          setIsLoggedIn(true);
          debugLog('[App] 리프레시 성공 - 로그인 상태 유지');

          if (refreshResult.is_agreed === 0) {
            const currentUser = authService.getCurrentUser();
            const dismissed = sessionStorage.getItem('privacy_disagree_dismissed') === '1';
            if (currentUser && !dismissed) {
              setPendingUserId(currentUser.userId);
              setPrivacyDialogOpen(true);
            }
          }
        } else {
          setIsLoggedIn(false);
          debugLog('[App] 리프레시 실패 - 로그인 필요');
        }
      } catch (error) {
        console.error('[App] 리프레시 에러:', error);
        setIsLoggedIn(false);
      } finally {
        refreshInFlightRef.current = false;
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, [location.pathname, navigate]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!isLoggedIn || !user?.userId) return;
    if (alertsLoadInFlightRef.current || alertsLoadedUserRef.current === user.userId) return;

    alertsLoadInFlightRef.current = true;
    loadAlertsFromApi(user.userId)
      .then(() => {
        alertsLoadedUserRef.current = user.userId;
      })
      .catch((err) => {
        console.error('[App] 초기 알림 로드 실패:', err);
      })
      .finally(() => {
        alertsLoadInFlightRef.current = false;
      });
  }, [isLoggedIn, loadAlertsFromApi]);

  const handlePrivacyAgreed = () => {
    setPrivacyDialogOpen(false);
    setPendingUserId('');
    sessionStorage.removeItem('privacy_disagree_dismissed');
  };

  const handlePrivacyDisagreed = () => {
    sessionStorage.setItem('privacy_disagree_dismissed', '1');
    setPrivacyDialogOpen(false);
    setPendingUserId('');
    setPendingUserId('');
  };

  // 토스트 클릭 핸들러
  const handleToastClick = () => {
    if (!notification?.data) return;

    const envelope = notification.data;
    const userId = authService.getCurrentUser()?.userId || '';

    // 관련 알림인지 체크 (휴가 결재)
    const isLeaveApproval = envelope.queue_name === 'leave_approval'
      || envelope.queue_name === `leave.approval.${userId}`
      || envelope.queue_name.startsWith('leave.approval')
      || envelope.queue_name.startsWith('leave_approval')
      || (envelope.queue_name === 'leave' && ((envelope as any).message?.includes('결재') || envelope.payload_text?.includes('결재')));

    if (isLeaveApproval) {
      debugLog('🔔 [App] 토스트 클릭 - 휴가 결재 패널 열기');

      let leaveData: any = null;
      try {
        // payload가 있으면 사용
        if (envelope.payload && typeof envelope.payload === 'object') {
          const payload = envelope.payload as any;
          leaveData = {
            id: payload?.id || payload?.leave_id,
            status: payload?.status || 'REQUESTED',
            name: payload?.name || payload?.requester || '',
            department: payload?.department || '',
            jobPosition: payload?.job_position || '',
            leaveType: payload?.leave_type || '',
            startDate: payload?.start_date || '',
            endDate: payload?.end_date || '',
            workdaysCount: payload?.workdays_count || payload?.days || 0,
            reason: payload?.reason || '',
            isCancel: payload?.is_cancel || 0,
          };
        } else {
          // 메시지 파싱 fallback (기존 알림 벨 로직과 동일)
          // envelope에는 message가 없을 수 있으므로 any 캐스팅 또는 payload_text 사용
          const envAny = envelope as any;
          const message = envAny.message || (typeof envelope.payload === 'string' ? envelope.payload : (envelope.payload_text || ''));
          const match = message.match(/휴가 결재 요청:\s*(\S+)\s+(\S+)\s+(\S+)/);
          const isCancelMatch = message.match(/휴가 취소/);

          leaveData = {
            status: isCancelMatch ? 'CANCEL_REQUESTED' : 'REQUESTED',
            name: match ? match[1] : '',
            leaveType: match ? match[2] : '',
            startDate: match ? match[3] : '',
            isCancel: isCancelMatch ? 1 : 0,
          };
        }
      } catch (e) {
        console.error('토스트 데이터 파싱 실패:', e);
      }

      if (leaveData) {
        openLeaveApprovalPanel(leaveData);
        setNotification(null); // 토스트 닫기
      }
    }
  };

  const addTickerMessage = useCallback((message: TickerMessage) => {
    setTickerMessages((prev) => [...prev, message]);
  }, []);

  const removeTickerMessage = useCallback((messageId: string) => {
    setTickerMessages((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  const addApprovalAlert = useCallback((alert: ApprovalAlertItem) => {
    setApprovalAlerts((prev) => [...prev, alert]);
  }, []);

  const removeApprovalAlert = useCallback((alertId: string) => {
    setApprovalAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }, []);

  const addLeaveOverlayItem = useCallback((item: LeaveOverlayItem) => {
    setLeaveOverlayItems((prev) => [...prev, item]);
  }, []);

  const removeLeaveOverlayItem = useCallback((itemId: string) => {
    setLeaveOverlayItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const addSystemChatMessage = useCallback((message: string) => {
    if (!message.trim()) return;
    if (!currentArchive || !currentArchive.archive_name.includes('사내업무')) {
      return;
    }

    const chatMessage: ChatMessage = {
      chat_id: Date.now(),
      archive_id: currentArchive.archive_id,
      message,
      role: 1,
      timestamp: new Date().toISOString(),
    };

    addChatMessage(chatMessage);
  }, [addChatMessage, currentArchive]);

  const handleNotification = useCallback((envelope: NotificationEnvelope) => {
    const currentUser = authService.getCurrentUser();
    const isPrivacyAgreed = currentUser?.privacyAgreed ?? false;
    // birthday는 타인 이름 포함 → 개인정보 동의 필요
    // gift/gift_arrival은 본인 수신 선물 → 동의 불필요
    const isBirthdayEvent =
      envelope.event === 'birthday' ||
      envelope.queue_name?.startsWith('birthday.');

    if (!isPrivacyAgreed && isBirthdayEvent) {
      debugLog('[App] 개인정보 미동의 - birthday 알림 무시:', {
        event: envelope.event,
        queue_name: envelope.queue_name,
      });
      return;
    }

    debugLog('🔔 [App] SSE 알림 수신 → NotificationStore로 전달:', {
      event: envelope.event,
      event_id: envelope.event_id,
      user_id: envelope.user_id,
      queue_name: envelope.queue_name,
      sent_at: envelope.sent_at,
      payload: envelope.payload,
    });

    debugLog('🔍 [App] 이벤트 상세:', {
      event: envelope.event,
      payload_approval_type: (envelope.payload as any)?.approval_type,
      payload_status: (envelope.payload as any)?.status,
      payload_leave_type: (envelope.payload as any)?.leave_type,
      payload_grant_days: (envelope.payload as any)?.grant_days,
    });

    // 즉시 ACK 처리
    if (envelope.event_id) {
      ackSseNotifications(envelope.event_id).catch((err) => {
        console.error('[App] SSE 알림 ACK 실패:', err);
      });
    }

    // 선물 이벤트 여부 판단
    const queueName = envelope.queue_name || '';
    const payloadQueueName = (envelope.payload as any)?.queue_name || '';
    const isGiftEvent =
      envelope.event === 'gift' ||
      envelope.event === 'gift_arrival' ||
      queueName === 'gift' ||
      queueName.startsWith('gift') ||
      (envelope.event === 'notification' && queueName.startsWith('gift')) ||
      payloadQueueName === 'gift' ||
      payloadQueueName.startsWith('gift');

    if (isGiftEvent) {
      // 선물 배지 즉각 업데이트
      incrementGiftCount();
    } else {
      // 비-선물 이벤트 → 알림 스토어에 즉시 추가하여 배지 즉각 반영
      addNotification(envelope);
    }

    if (envelope.event === 'leave_draft') {
      const payload = envelope.payload as any;
      debugLog('📋 [App] 휴가 초안 메시지 수신 (leave_draft):', payload);

      const user = authService.getCurrentUser();

      const startDate = payload?.start_date || new Date().toISOString().split('T')[0];
      const endDate = payload?.end_date || startDate;

      const approvalLine = payload?.approver_name ? [{
        approverName: payload.approver_name,
        approverId: payload.approver_id || '',
        approvalSeq: 1,
      }] : [];

      const ccList = (payload?.cc_list || []).map((cc: any) => ({
        name: cc.name === 'name' ? cc.userId : cc.name,
        userId: cc.userId?.includes('@') ? cc.userId : `${cc.userId || cc.name}@aspnc.com`,
      }));

      const leaveStatus = (payload?.leave_status || payload?.leaveStatus || []).map((ls: any) => ({
        leaveType: ls.leave_type || ls.leaveType,
        totalDays: ls.total_days || ls.totalDays || 0,
        remainDays: ls.remain_days || ls.remainDays || 0,
      }));

      debugLog('🎉 [App] 휴가 상신 패널 자동 오픈:', {
        leaveType: payload?.leave_type,
        startDate,
        endDate,
        approvalLine,
        ccList,
        leaveStatus,
      });

      openLeaveRequestPanel({
        userId: payload?.user_id || user?.userId || '',
        startDate,
        endDate,
        reason: payload?.reason || '',
        leaveType: payload?.leave_type || '정기휴가',
        halfDaySlot: (payload?.half_day_slot as 'ALL' | 'AM' | 'PM') || 'ALL',
        approvalLine,
        ccList,
        leaveStatus,
        useNextYearLeave: payload?.is_next_year === 1,
      });
    }

    // leave_approval 이벤트 처리 - 결재 요청 아이콘 표시
    if (envelope.event === 'leave_approval') {
      debugLog('📋 [App] 휴가 결재 요청 알림 수신 (leave_approval)');
      // 관리자에게만 아이콘 표시
      const isApprover = authService.isApprover();
      if (isApprover) {
        debugLog('✅ [App] 관리자 확인 - 결재 요청 아이콘 표시');
        setHasLeaveApprovalAlert(true);
      }
    }

    // 전자결재 아이콘 표시
    if (envelope.event === 'eapproval' || envelope.event === 'eapproval_approval') {
      setHasEapprovalAlert(true);
    }

    // 전자결재 알림 팝업 (우상단)
    if (envelope.event === 'eapproval_alert') {
      const payload = envelope.payload as any;
      const id = envelope.event_id || `${Date.now()}-eapproval_alert`;
      const title = typeof payload?.title === 'string' ? payload.title : '전자결재 알림';
      const message = buildNotificationMessage(envelope.event, payload);

      setTimeout(() => {
        addApprovalAlert({
          id,
          title,
          message,
          status: payload?.status,
        });
        setTimeout(() => {
          removeApprovalAlert(id);
        }, 10000);
      }, 2500);

      // 휴가 관련 결재 알림이면 관련 데이터 새로고침 필요 (서버/스토어 연동 시 처리)
      const approvalType = payload?.approval_type;
      if (approvalType === 'hr_leave' || approvalType === 'hr_leave_grant') {
        debugLog('[App] eapproval_alert - 휴가 관련 결재 알림 수신:', approvalType);
      }
    }

    // 휴가/전자결재 오버레이 카드 (우측 하단)
    if (
      envelope.event === 'leave_alert' ||
      envelope.event === 'leave_cc' ||
      envelope.event === 'leave.cc' ||
      envelope.event === 'eapproval_cc'
    ) {
      const payload = envelope.payload as any;
      const id = envelope.event_id || `${Date.now()}-${envelope.event}`;
      // 이벤트 타입을 leave_cc로 정규화 (frontend에서 사용하는 타입)
      const eventType = envelope.event === 'leave.cc' ? 'leave_cc' : envelope.event;

      const title = getTitleByQueueName(eventType);
      const message = buildNotificationMessage(eventType, payload);

      addLeaveOverlayItem({
        id,
        type: eventType as LeaveOverlayItem['type'],
        title,
        message,
        payload,
      });
      setTimeout(() => {
        removeLeaveOverlayItem(id);
      }, 10000);
    }

    // 상단 티커 - alert / birthday / event / contest_detail
    if (
      envelope.event === 'alert' ||
      envelope.event === 'birthday' ||
      envelope.event === 'event' ||
      envelope.event === 'contest_detail'
    ) {
      const id = envelope.event_id || `${Date.now()}-${envelope.event}`;
      const message =
        envelope.event === 'birthday'
          ? buildNotificationMessage(envelope.event, envelope.payload as any)
          : extractEnvelopeMessage(envelope);

      if (message) {
        const tickerType: TickerMessage['type'] =
          envelope.event === 'birthday'
            ? 'birthday'
            : envelope.event === 'event'
              ? 'event'
              : 'info';

        const suffix = '자세한 내용은 알림함에서 확인해주세요.';
        const finalMessage = message.includes(suffix) ? message : `${message} ${suffix}`;
        setTimeout(() => {
          addTickerMessage({
            id,
            message: finalMessage,
            type: tickerType,
            autoClose: true,
            duration: estimateTickerDuration(finalMessage),
          });
        }, 3000);
      }
    }

    // 생일 팝업
    if (envelope.event === 'birthday') {
      const message = extractEnvelopeMessage(envelope) || buildNotificationMessage('birthday', envelope.payload as any);
      setBirthdayPopup({ open: true, message });

      const payload = envelope.payload as any;
      const name = typeof payload?.name === 'string' ? payload.name : '';
      const realTimeId = parseNumericId(
        payload?.id ?? payload?.realTimeId ?? payload?.real_time_id ?? payload?.real_timeId
      );
      setGiftSelectionContext({
        queueName: envelope.queue_name || 'birthday',
        realTimeId,
      });

      const chatText = name
        ? `🎂 ${name}님의 생일을 축하합니다!\n선물 고르기는 선물함에서 확인해주세요.`
        : '🎂 생일을 축하합니다!\n선물 고르기는 선물함에서 확인해주세요.';
      setTimeout(() => {
        addSystemChatMessage(chatText);
      }, 3500);
    }

    // 이벤트 팝업
    if (envelope.event === 'event') {
      const payload = envelope.payload as any;
      const title =
        typeof payload?.title === 'string'
          ? payload.title
          : typeof payload?.subject === 'string'
            ? payload.subject
            : '이벤트 알림';
      const message = extractEnvelopeMessage(envelope) || buildNotificationMessage('event', payload);
      setEventPopup({ open: true, title, message });
      const realTimeId = parseNumericId(
        payload?.id ?? payload?.realTimeId ?? payload?.real_time_id ?? payload?.real_timeId
      );
      setGiftSelectionContext({
        queueName: envelope.queue_name || 'event',
        realTimeId,
      });
    }

    // 공지/알림 메시지 - 채팅창 시스템 메시지
    if (envelope.event === 'alert' || envelope.event === 'contest_detail') {
      const payload = envelope.payload as any;
      const message = extractEnvelopeMessage(envelope)
        || (typeof payload?.message === 'string' ? payload.message : '')
        || (typeof payload?.title === 'string' ? payload.title : '');
      if (message) {
        setTimeout(() => {
          addSystemChatMessage(`📢 ${message}`);
        }, 3000);
      }
    }

    const toast = buildRealtimeToast(envelope);
    if (toast.message) {
      setNotification({
        ...toast,
        data: envelope, // 클릭 처리를 위해 원본 데이터 포함
      });
    }

    // SSE 알림 수신 시 API 동기화 (서버 DB와 1초 딜레이 후 완전 동기화)
    const user = authService.getCurrentUser();
    if (user?.userId) {
      setTimeout(() => {
        // 알림함 동기화 (SSE 수신 직후 → force_refresh: true)
        loadAlertsFromApi(user.userId, true)
          .then(() => debugLog('✅ [App] SSE 수신 후 checkAlerts 완료'))
          .catch((err) => console.error('❌ [App] SSE 수신 후 checkAlerts 실패:', err));
      }, 2000);
    }

    // 선물 팝업 표시 (2초 딜레이) + 팝업 등장 시 checkGifts 호출
    if (isGiftEvent) {
      const giftUser = authService.getCurrentUser();
      setTimeout(() => {
        const payload = envelope.payload as any;
        setGiftArrivalPopup({
          open: true,
          data: {
            gift_name: payload?.gift_name || payload?.title,
            message: payload?.message || payload?.description,
            couponImgUrl: payload?.couponImgUrl || payload?.coupon_img_url,
            coupon_end_date: payload?.coupon_end_date || payload?.couponEndDate,
            queue_name: payload?.queue_name || envelope.queue_name,
            sender_name: payload?.sender_name || payload?.senderName || 'ASPN AI',
          },
        });

        // 팝업 등장 트리거로 checkGifts 호출
        if (giftUser?.userId) {
          giftService.checkGifts(giftUser.userId).then((res) => {
            const unusedCount = (res?.gifts || []).filter((g: any) => {
              const raw = g.is_used ?? g.isUsed ?? g.used ?? g.use_yn ?? g.used_yn ?? g.coupon_used;
              if (raw === true || raw === 1) return false;
              if (typeof raw === 'string' && ['Y', 'TRUE', 'USED'].includes(raw.trim().toUpperCase())) return false;
              return true;
            }).length;
            setGiftCount(unusedCount);
          }).catch(() => { });
        }
      }, 2500);
    }
  }, [
    openLeaveRequestPanel,
    addNotification,
    incrementGiftCount,
    setGiftCount,
    loadAlertsFromApi,
    setHasLeaveApprovalAlert,
    setHasEapprovalAlert,
    addTickerMessage,
    addApprovalAlert,
    removeApprovalAlert,
    addLeaveOverlayItem,
    removeLeaveOverlayItem,
    addSystemChatMessage,
  ]);

  useSseNotifications({
    enabled: isLoggedIn,
    onNotification: handleNotification,
    withCredentials: true,
    onConnectionStateChange: (state) => {
      setConnectionState(state);
      debugLog('[App] SSE 연결 상태:', state);
    },
  });

  useEffect(() => {
    setSseEnabled(isLoggedIn);
  }, [isLoggedIn, setSseEnabled]);

  useEffect(() => {
    if (!notification) return;

    const handleDismiss = () => {
      setNotification(null);
    };

    window.addEventListener('click', handleDismiss);
    return () => {
      window.removeEventListener('click', handleDismiss);
    };
  }, [notification]);

  const handleGiftArrivalConfirm = () => {
    setGiftArrivalPopup({ open: false, data: null });
    setGiftPanelOpen(true);
  };

  const handleGiftArrivalClose = () => {
    setGiftArrivalPopup({ open: false, data: null });
  };

  const handleBirthdayClose = () => {
    setBirthdayPopup({ open: false, message: '' });
  };

  const handleEventClose = () => {
    setEventPopup({ open: false, title: '', message: '' });
  };

  const handleGoGift = () => {
    setBirthdayPopup({ open: false, message: '' });
    setEventPopup({ open: false, title: '', message: '' });
    setGiftSelectionOpen(true);
  };

  const handleCloseGiftSelection = () => {
    setGiftSelectionOpen(false);
  };

  const handleCloseGiftPanel = () => {
    setGiftPanelOpen(false);
  };

  const clearNotification = () => setNotification(null);

  return {
    state: {
      notification,
      isLoggedIn,
      isCheckingAuth,
      privacyDialogOpen,
      pendingUserId,
      giftArrivalPopup,
      tickerMessages,
      approvalAlerts,
      leaveOverlayItems,
      birthdayPopup,
      eventPopup,
      giftSelectionOpen,
      giftSelectionContext,
      giftPanelOpen,
    },
    actions: {
      handlePrivacyAgreed,
      handlePrivacyDisagreed,
      handleGiftArrivalConfirm,
      handleGiftArrivalClose,
      handleBirthdayClose,
      handleEventClose,
      handleGoGift,
      handleCloseGiftSelection,
      handleCloseGiftPanel,
      clearNotification,
      handleToastClick, // 클릭 핸들러 노출
      removeTickerMessage,
      removeApprovalAlert,
      removeLeaveOverlayItem,
    },
  };
};

export type AppContentStateHook = ReturnType<typeof useAppContentState>;
