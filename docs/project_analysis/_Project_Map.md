# #visualization Project Map

이 문서는 **AAA_web** 프로젝트의 주요 모듈 간 의존 관계를 시각화하기 위한 파일입니다. 옵시디언의 그래프 뷰를 통해 연결 관계를 확인하세요.

## 1. Core Flow
- [[App.tsx]] -> [[App.state.ts]]
- [[App.state.ts]] -> [[authService.ts]]
- [[App.state.ts]] -> [[notificationStore.ts]]
- [[App.state.ts]] -> [[sseService.ts]] (via hook)
- [[api.ts]] -> [[authService.ts]] (Refresh Logic)

## 2. Feature: Chat
- [[ChatPage.tsx]] -> [[chatStore.ts]]
- [[chatStore.ts]] -> [[chatService.ts]]

## 3. Feature: Leave Management
- [[LeaveManagementPage.tsx]] -> [[leaveService.ts]]
- [[AdminLeaveApprovalPage.tsx]] -> [[leaveService.ts]]
- [[LeaveApprovalListPanel.tsx]] -> [[leaveService.ts]]

## 4. Feature: Notifications
- [[notificationStore.ts]] -> [[notificationApi.ts]]
- [[notificationStore.ts]] -> [[sseService.ts]]
- [[NotificationPanel.tsx]] -> [[notificationStore.ts]]

## 5. Keywords
#react #zustand #sse #typescript #vite #axios
