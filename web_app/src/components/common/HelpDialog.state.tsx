import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Help as HelpIcon, Info as InfoIcon } from '@mui/icons-material';

interface HelpSection {
  title: string;
  icon: ReactNode;
  items: HelpItem[];
}

interface HelpItem {
  title: string;
  description: string;
  keywords?: string[];
}

export const useHelpDialogState = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | false>('기본 기능');

  const helpSections: HelpSection[] = useMemo(
    () => [
      {
        title: '기본 기능',
        icon: <HelpIcon />,
        items: [
          {
            title: 'AI 모델 선택',
            description:
              '채팅 입력창 상단의 드롭다운에서 AI 모델을 선택할 수 있습니다. Gemini, GPT, Claude 등을 지원합니다.',
            keywords: ['모델', 'ai', 'gemini', 'gpt', 'claude', 'model'],
          },
          {
            title: '파일 첨부',
            description:
              '이미지, PDF 등의 파일을 드래그 앤 드롭하거나 📎 버튼을 클릭하여 첨부할 수 있습니다.',
            keywords: ['파일', '첨부', 'file', 'attach', 'upload', '이미지', 'pdf'],
          },
          {
            title: '채팅방 관리',
            description:
              '사이드바에서 채팅방을 생성, 선택, 이름 변경, 삭제할 수 있습니다. 채팅방을 우클릭하면 컨텍스트 메뉴가 나타납니다.',
            keywords: ['채팅방', '대화', 'chat', 'archive', '생성', '삭제', 'create', 'delete'],
          },
          {
            title: '검색',
            description:
              '사이드바 상단의 검색 아이콘을 클릭하거나 Ctrl+K를 눌러 대화 내용을 검색할 수 있습니다.',
            keywords: ['검색', 'search', 'find', '찾기'],
          },
          {
            title: '웹 검색 모드',
            description:
              'AI 응답에 실시간 웹 검색 결과를 포함하려면 입력창의 웹 검색 토글을 활성화하세요.',
            keywords: ['웹', '검색', 'web', 'search', 'internet'],
          },
        ],
      },
      {
        title: '업무 기능',
        icon: <InfoIcon />,
        items: [
          {
            title: '휴가관리',
            description:
              '휴가 신청, 승인 현황 조회, 휴가 내역 확인 기능을 제공합니다. 사이드바의 "휴가 관리" 메뉴를 클릭하세요.',
            keywords: ['휴가', 'leave', 'vacation', '신청', '연차'],
          },
          {
            title: '받은선물함',
            description:
              '우측 상단의 선물함 아이콘(보라색)을 클릭하여 받은 쿠폰과 선물을 확인할 수 있습니다.',
            keywords: ['선물', '선물함', 'gift', '쿠폰', 'coupon'],
          },
        ],
      },
      {
        title: 'AI 채팅방 종류',
        icon: <InfoIcon />,
        items: [
          {
            title: '사내업무',
            description: '일반적인 업무 관련 질문과 대화를 위한 기본 채팅방입니다.',
            keywords: ['사내업무', '업무', 'work', '기본'],
          },
          {
            title: '코딩어시스턴트',
            description:
              '프로그래밍, 코드 작성, 디버깅, 코드 리뷰 등 개발 관련 질문에 특화된 AI 어시스턴트입니다.',
            keywords: ['코딩', '프로그래밍', 'coding', 'programming', 'code', '개발', '디버깅'],
          },
          {
            title: 'SAP어시스턴트',
            description: 'SAP 시스템 관련 질문에 모듈별로 최적화된 답변을 제공하는 전문 AI입니다.',
            keywords: ['sap', '모듈', 'module', '어시스턴트', 'erp'],
          },
          {
            title: 'AI Chatbot',
            description: '다양한 주제에 대해 자유롭게 대화할 수 있는 범용 AI 챗봇입니다.',
            keywords: ['chatbot', '챗봇', 'ai', '대화'],
          },
        ],
      },
      {
        title: '테마 및 설정',
        icon: <InfoIcon />,
        items: [
          {
            title: '다크 모드',
            description: '설정 페이지에서 Light / Dark / System 테마를 선택할 수 있습니다.',
            keywords: ['테마', '다크', 'dark', 'theme', 'light', 'system'],
          },
          {
            title: '알림 설정',
            description: '생일, 선물, 결재 등의 알림을 설정 페이지에서 관리할 수 있습니다.',
            keywords: ['알림', 'notification', 'alert', '설정'],
          },
          {
            title: '계정 정보',
            description: '설정 페이지에서 계정 정보를 확인하고 비밀번호를 변경할 수 있습니다.',
            keywords: ['계정', 'account', '정보', '비밀번호', 'password'],
          },
        ],
      },
    ],
    []
  );

  const filteredSections = useMemo(() => {
    if (!searchQuery) {
      return helpSections;
    }

    const query = searchQuery.toLowerCase();
    return helpSections
      .map((section) => {
        const filteredItems = section.items.filter((item) => {
          const inTitle = item.title.toLowerCase().includes(query);
          const inDescription = item.description.toLowerCase().includes(query);
          const inKeywords = item.keywords?.some((keyword) =>
            keyword.toLowerCase().includes(query)
          );
          return inTitle || inDescription || inKeywords;
        });

        if (filteredItems.length === 0) {
          return null;
        }

        return {
          ...section,
          items: filteredItems,
        };
      })
      .filter((section): section is HelpSection => section !== null);
  }, [helpSections, searchQuery]);

  return {
    state: {
      searchQuery,
      expandedSection,
      helpSections,
      filteredSections,
    },
    actions: {
      setSearchQuery,
      setExpandedSection,
    },
  };
};

export type HelpDialogStateHook = ReturnType<typeof useHelpDialogState>;
