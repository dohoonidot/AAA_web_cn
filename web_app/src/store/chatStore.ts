import { create } from 'zustand';
import type { Archive, ChatMessage } from '../types';
import chatService from '../services/chatService';
import authService from '../services/authService';
import { createLogger } from '../utils/logger';

const logger = createLogger('ChatStore');

// 아카이브 타입 정의
export type ArchiveType = 'company' | 'ai' | 'code' | 'sap' | '';

// 아카이브 타입 상수
export const ARCHIVE_TYPES = {
  COMPANY: 'company',
  AI: 'ai',
  CODE: 'code',
  SAP: 'sap',
} as const;

// 채팅방 이름 (기본값 / 표시용)
export const ARCHIVE_NAMES = {
  WORK: '사내업무',
  CODE: '코딩어시스턴트',
  SAP: 'SAP어시스턴트',
  CHATBOT: 'AI Chatbot',
} as const;

// 아카이브 순서
export const getArchiveOrder = (archive: Archive): number => {
  const type = archive.archive_type;
  if (type === ARCHIVE_TYPES.COMPANY) return 1;
  if (type === ARCHIVE_TYPES.CODE) return 2;
  if (type === ARCHIVE_TYPES.SAP) return 3;
  if (type === ARCHIVE_TYPES.AI) return 4;
  return 5;
};

// archive_type 기반 판별 함수들
export const isChatbotArchive = (archive: Archive | null | undefined): boolean => {
  if (!archive) return false;
  return archive.archive_type === ARCHIVE_TYPES.AI;
};

export const isCompanyArchive = (archive: Archive | null | undefined): boolean => {
  if (!archive) return false;
  return archive.archive_type === ARCHIVE_TYPES.COMPANY;
};

// 아카이브 아이콘 가져오기
export const getArchiveIcon = (archive: Archive): string => {
  const type = archive.archive_type;
  if (type === ARCHIVE_TYPES.CODE) return 'code';
  if (type === ARCHIVE_TYPES.SAP) return 'business';
  if (type === ARCHIVE_TYPES.AI) return 'auto_awesome';
  if (type === ARCHIVE_TYPES.COMPANY) return 'lock';
  return 'chat';
};

// 아카이브 색상 가져오기
export const getArchiveColor = (archive: Archive, isDark: boolean = false): string => {
  const type = archive.archive_type;
  if (type === ARCHIVE_TYPES.CODE) return '#10B981';
  if (type === ARCHIVE_TYPES.SAP) return '#3B82F6';
  if (type === ARCHIVE_TYPES.AI) return isDark ? '#E879F9' : '#6B46C1';
  if (type === ARCHIVE_TYPES.COMPANY) return isDark ? '#FB923C' : '#F59E0B';
  return isDark ? '#94A3B8' : '#64748B';
};

// 아카이브 태그 가져오기
export const getArchiveTag = (archive: Archive): string => {
  const type = archive.archive_type;
  if (type === ARCHIVE_TYPES.CODE) return 'CODE';
  if (type === ARCHIVE_TYPES.SAP) return 'SAP';
  return '';
};

// 기본 아카이브 여부 확인 (archive_type이 정해진 4종류)
export const isDefaultArchive = (archive: Archive): boolean => {
  const type = archive.archive_type;
  return type === ARCHIVE_TYPES.COMPANY || type === ARCHIVE_TYPES.AI ||
    type === ARCHIVE_TYPES.CODE || type === ARCHIVE_TYPES.SAP;
};

// 아카이브 설명
export const getArchiveDescription = (archive: Archive): string => {
  const type = archive.archive_type;
  if (type === ARCHIVE_TYPES.CODE) return '개발자를 위한 AI 도우미, 코드 작성, 디버깅, 최적화 지원';
  if (type === ARCHIVE_TYPES.SAP) return 'SAP 시스템 관련 질문에 모듈별 최적화된 답변 제공';
  return '';
};

// ChatState 인터페이스 (Flutter ChatState와 동일)
interface ChatState {
  // 데이터
  archives: Archive[];
  currentArchive: Archive | null;
  messages: ChatMessage[];

  // UI 상태
  isSidebarVisible: boolean;
  isDashboardVisible: boolean;

  // 스트리밍 상태
  isStreaming: boolean;
  streamingMessage: string;

  // 입력 상태
  inputMessage: string;
  selectedModel: string;
  isWebSearchEnabled: boolean;
  selectedSapModule: string;

  // 검색 상태
  searchKeyword: string | null;
  highlightedChatId: number | null;

  // Actions
  setArchives: (archives: Archive[]) => void;
  setCurrentArchive: (archive: Archive | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  loadArchives: () => Promise<void>;

  setSidebarVisible: (visible: boolean) => void;
  setDashboardVisible: (visible: boolean) => void;

  setStreaming: (streaming: boolean) => void;
  setStreamingMessage: (message: string | ((prev: string) => string)) => void;
  appendStreamingMessage: (chunk: string) => void;

  setInputMessage: (message: string) => void;
  setSelectedModel: (model: string) => void;
  setWebSearchEnabled: (enabled: boolean) => void;
  setSelectedSapModule: (module: string) => void;

  setSearchKeyword: (keyword: string | null) => void;
  setHighlightedChatId: (chatId: number | null) => void;

  // 아카이브 관리 함수들
  selectArchive: (archive: Archive) => void;
  createArchive: (userId: string, title: string, archiveType: string) => Promise<void>;
  deleteArchive: (archiveId: string) => Promise<void>;
  renameArchive: (userId: string, archiveId: string, newName: string) => Promise<void>;

  // 복합 액션
  clearMessages: () => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // 초기 상태
  archives: [],
  currentArchive: null,
  messages: [],

  isSidebarVisible: true,
  isDashboardVisible: true,

  isStreaming: false,
  streamingMessage: '',

  inputMessage: '',
  selectedModel: 'Gemini-Pro-3.1',

  // 웹검색 토글 상태 (Flutter와 동일)
  isWebSearchEnabled: false,

  // SAP 모듈 선택 상태
  selectedSapModule: '',

  searchKeyword: null,
  highlightedChatId: null,

  // Actions
  setArchives: (archives) => set({ archives }),
  setCurrentArchive: (archive) => {
    logger.dev('setCurrentArchive 호출:', archive?.archive_name);
    // SAP 아카이브가 아닌 다른 아카이브로 변경 시 모듈 선택 초기화
    const isSapArchive = archive?.archive_type === ARCHIVE_TYPES.SAP;
    set({
      currentArchive: archive,
      selectedSapModule: isSapArchive ? get().selectedSapModule : '' // SAP가 아니면 초기화
    });
    logger.dev('setCurrentArchive 완료');
  },
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  loadArchives: async () => {
    const user = authService.getCurrentUser();
    if (!user) return;

    try {
      const archiveList = await chatService.getArchiveList(user.userId);
      const uniqueArchives = archiveList.filter((archive, index, self) =>
        index === self.findIndex((a) => a.archive_id === archive.archive_id)
      );

      const sorted = [...uniqueArchives].sort((a, b) => {
        const orderA = getArchiveOrder(a);
        const orderB = getArchiveOrder(b);
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.archive_time).getTime() - new Date(a.archive_time).getTime();
      });

      set({ archives: sorted });
    } catch (error) {
      logger.error('Failed to load archives:', error);
    }
  },

  setSidebarVisible: (visible) => set({ isSidebarVisible: visible }),
  setDashboardVisible: (visible) => set({ isDashboardVisible: visible }),

  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setStreamingMessage: (message) => set((state) => ({
    streamingMessage: typeof message === 'function' ? message(state.streamingMessage) : message,
  })),
  appendStreamingMessage: (chunk) => set((state) => ({
    streamingMessage: state.streamingMessage + chunk
  })),

  setInputMessage: (message) => set({ inputMessage: message }),
  setSelectedModel: (model) => set({ selectedModel: model }),

  // 웹검색 토글 액션 (Flutter와 동일)
  setWebSearchEnabled: (enabled) => set({ isWebSearchEnabled: enabled }),

  // SAP 모듈 선택 액션
  setSelectedSapModule: (module) => set({ selectedSapModule: module }),

  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  setHighlightedChatId: (chatId) => set({ highlightedChatId: chatId }),

  // 아카이브 관리 함수들
  selectArchive: (archive) => {
    set({ currentArchive: archive });
  },

  createArchive: async (userId, title, archiveType) => {
    try {
      await chatService.createArchive(userId, title, archiveType);
      // 아카이브 목록 새로고침
      await get().loadArchives();
    } catch (error) {
      logger.error('아카이브 생성 실패:', error);
      throw error;
    }
  },

  deleteArchive: async (archiveId) => {
    try {
      await chatService.deleteArchive(archiveId);
      // 아카이브 목록 새로고침
      await get().loadArchives();

      // 삭제된 아카이브가 현재 선택된 아카이브였다면 첫 번째 아카이브 선택
      const state = get();
      if (state.currentArchive?.archive_id === archiveId && state.archives.length > 0) {
        set({ currentArchive: state.archives[0] });
      }
    } catch (error) {
      logger.error('아카이브 삭제 실패:', error);
      throw error;
    }
  },

  renameArchive: async (userId, archiveId, newName) => {
    try {
      await chatService.updateArchive(userId, archiveId, newName);
      // 아카이브 목록 새로고침
      await get().loadArchives();

      // 현재 선택된 아카이브의 이름도 업데이트
      const state = get();
      if (state.currentArchive?.archive_id === archiveId) {
        set({
          currentArchive: {
            ...state.currentArchive,
            archive_name: newName
          }
        });
      }

    } catch (error) {
      logger.error('아카이브 이름 변경 실패:', error);
      throw error;
    }
  },

  clearMessages: () => set({ messages: [], streamingMessage: '' }),
  reset: () => set({
    archives: [],
    currentArchive: null,
    messages: [],
    isSidebarVisible: true,
    isDashboardVisible: true,
    isStreaming: false,
    streamingMessage: '',
    inputMessage: '',
    selectedSapModule: '',
    searchKeyword: null,
    highlightedChatId: null,
  }),
}));
