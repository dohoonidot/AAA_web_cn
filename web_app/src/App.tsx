import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Snackbar, Alert, Box, CircularProgress } from '@mui/material';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import CodingAssistantPage from './pages/CodingAssistantPage';
import AiAssistantPage from './pages/AiAssistantPage';
import LeaveManagementPage from './pages/LeaveManagementPage';
import AdminLeaveApprovalPage from './pages/AdminLeaveApprovalPage';
import ApprovalPage from './pages/ApprovalPage';
import SapPage from './pages/SapPage';
import SettingsPage from './pages/SettingsPage';
import ContestPage from './pages/ContestPage';
import LeaveGrantHistoryPage from './pages/LeaveGrantHistoryPage';
import AllEmployeeVacationCalendarPage from './pages/AllEmployeeVacationCalendarPage';
import PrivateRoute from './components/auth/PrivateRoute';
import { useThemeStore } from './store/themeStore';
import { NotificationPanel } from './components/common/NotificationPanel';
import GiftArrivalPopup from './components/common/GiftArrivalPopup';
import ScrollingTicker from './components/common/ScrollingTicker';
import ApprovalAlertPopup from './components/common/ApprovalAlertPopup';
import BirthdayPopup from './components/common/BirthdayPopup';
import EventPopup from './components/common/EventPopup';
import GiftSelectionModal from './components/common/GiftSelectionModal';
import { GiftPanel } from './components/common/GiftBox';
import LeaveRequestDraftPanel from './components/leave/LeaveRequestDraftPanel';
import LeaveApprovalIcon from './components/leave/LeaveApprovalIcon';
import LeaveApprovalListPanel from './components/leave/LeaveApprovalListPanel';
import LeaveNotificationOverlay from './components/leave/LeaveNotificationOverlay';
import EApprovalIcon from './components/approval/EApprovalIcon';
import PrivacyAgreementDialog from './components/auth/PrivacyAgreementDialog';
import { useAppContentState } from './App.state';

function AppContent() {
  const { state, actions } = useAppContentState();
  const {
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
  } = state;
  const {
    handlePrivacyAgreed,
    handlePrivacyDisagreed,
    handleGiftArrivalConfirm,
    handleGiftArrivalClose,
    clearNotification,
    handleToastClick,
    removeTickerMessage,
    removeApprovalAlert,
    removeLeaveOverlayItem,
    handleBirthdayClose,
    handleEventClose,
    handleGoGift,
    handleCloseGiftSelection,
    handleCloseGiftPanel,
  } = actions;

  if (isCheckingAuth) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: { xs: 'var(--app-height)', md: '100vh' } }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <ScrollingTicker messages={tickerMessages} onClose={removeTickerMessage} />
      <ApprovalAlertPopup alerts={approvalAlerts} onClose={removeApprovalAlert} />
      <LeaveNotificationOverlay items={leaveOverlayItems} onClose={removeLeaveOverlayItem} />
      <BirthdayPopup
        open={birthdayPopup.open}
        message={birthdayPopup.message}
        onClose={handleBirthdayClose}
        onGoGift={handleGoGift}
      />
      <EventPopup
        open={eventPopup.open}
        title={eventPopup.title}
        message={eventPopup.message}
        onClose={handleEventClose}
        onGoGift={handleGoGift}
      />
      <GiftSelectionModal
        open={giftSelectionOpen}
        onClose={handleCloseGiftSelection}
        alertId={giftSelectionContext.alertId}
        queueName={giftSelectionContext.queueName}
        realTimeId={giftSelectionContext.realTimeId}
      />
      <GiftPanel open={giftPanelOpen} onClose={handleCloseGiftPanel} onGiftCountChange={() => { }} />
      <NotificationPanel />
      {pendingUserId && (
        <PrivacyAgreementDialog
          open={privacyDialogOpen}
          userId={pendingUserId}
          onAgreed={handlePrivacyAgreed}
          onDisagreed={handlePrivacyDisagreed}
          required={true}
        />
      )}
      <GiftArrivalPopup
        open={giftArrivalPopup.open}
        giftData={giftArrivalPopup.data}
        onConfirm={handleGiftArrivalConfirm}
        onClose={handleGiftArrivalClose}
      />
      {/* 휴가 상신 패널 - 전역 (휴가 부여 승인 시 자동 오픈) */}
      <LeaveRequestDraftPanel />

      {/* 결재 요청 알림 아이콘 - SSE leave_approval 수신 시 표시 */}
      <LeaveApprovalIcon />

      {/* 전자결재 알림 아이콘 - SSE eapproval 수신 시 표시 */}
      <EApprovalIcon />

      {/* 결재 대기 목록 패널 - 아이콘 클릭 시 열림 */}
      <LeaveApprovalListPanel />

      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/chat" replace />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/coding"
          element={
            <PrivateRoute>
              <CodingAssistantPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ai"
          element={
            <PrivateRoute>
              <AiAssistantPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/sap"
          element={
            <PrivateRoute>
              <SapPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/leave"
          element={
            <PrivateRoute>
              <LeaveManagementPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/leave-grant-history"
          element={
            <PrivateRoute>
              <LeaveGrantHistoryPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/leave-all-vacation"
          element={
            <PrivateRoute>
              <AllEmployeeVacationCalendarPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-leave"
          element={
            <PrivateRoute>
              <AdminLeaveApprovalPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/approval"
          element={
            <PrivateRoute>
              <ApprovalPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/contest"
          element={
            <PrivateRoute>
              <ContestPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Snackbar
        open={!!notification}
        autoHideDuration={5000}
        onClose={clearNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClick={clearNotification}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 9999 }}
      >
        <Alert
          onClose={clearNotification}
          severity={notification?.severity || 'info'}
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </>
  );
}

function App() {
  const { muiTheme } = useThemeStore();

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
