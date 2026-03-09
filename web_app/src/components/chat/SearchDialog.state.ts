import { useEffect, useMemo, useState } from 'react';
import chatService from '../../services/chatService';
import authService from '../../services/authService';
import type { Archive } from '../../types';

export interface SearchResult {
  chat_id: number;
  archive_id: string;
  archive_name: string;
  message: string;
  role: number;
  timestamp: string;
  archive_time?: string;
}

export const useSearchDialogState = ({
  archives,
  onClose,
  onSelectArchive,
  onSelectMessage,
}: {
  archives: Archive[];
  onClose: () => void;
  onSelectArchive: (archive: Archive) => void;
  onSelectMessage: (archiveId: string, chatId: number) => void;
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  const performSearch = async (keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const user = authService.getCurrentUser();
      if (!user) return;

      const results = await chatService.searchArchiveContent(
        keyword,
        archives,
        user.userId
      );
      setSearchResults(results.map((r: any) => ({
        ...r,
        timestamp: r.timestamp || r.archive_time || '',
      })));
    } catch (error) {
      console.error('검색 실패:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchKeyword.trim()) {
        performSearch(searchKeyword);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  const handleClose = () => {
    setSearchKeyword('');
    setSearchResults([]);
    setSelectedTab(0);
    onClose();
  };

  const groupedResults = useMemo(() => {
    const grouped: Record<string, SearchResult[]> = {};
    searchResults.forEach((result) => {
      const archiveName = result.archive_name;
      if (!grouped[archiveName]) {
        grouped[archiveName] = [];
      }
      grouped[archiveName].push(result);
    });
    return grouped;
  }, [searchResults]);

  const sortedArchiveNames = useMemo(() => {
    const archiveNames = Object.keys(groupedResults);

    const defaultArchives: string[] = [];
    const customArchives: string[] = [];

    archiveNames.forEach((name) => {
      if (
        name === '사내업무' ||
        name === '코딩어시스턴트' ||
        name === '코딩 어시스턴트' ||
        name === 'SAP어시스턴트' ||
        name === 'SAP 어시스턴트' ||
        name === 'AI Chatbot'
      ) {
        defaultArchives.push(name);
      } else {
        customArchives.push(name);
      }
    });

    defaultArchives.sort((a, b) => {
      const getOrder = (name: string) => {
        if (name === '사내업무') return 1;
        if (name === '코딩어시스턴트' || name === '코딩 어시스턴트') return 2;
        if (name === 'SAP어시스턴트' || name === 'SAP 어시스턴트') return 3;
        if (name === 'AI Chatbot') return 4;
        return 5;
      };
      return getOrder(a) - getOrder(b);
    });

    customArchives.sort((a, b) => {
      const aTime = groupedResults[a]?.[0]?.archive_time || '';
      const bTime = groupedResults[b]?.[0]?.archive_time || '';
      return bTime.localeCompare(aTime);
    });

    return [...defaultArchives, ...customArchives];
  }, [groupedResults]);

  const currentArchiveName = sortedArchiveNames[selectedTab];
  const currentResults = currentArchiveName
    ? groupedResults[currentArchiveName] || []
    : [];

  const handleMessageClick = (result: SearchResult) => {
    const archive = archives.find((a) => a.archive_id === result.archive_id);
    if (archive) {
      onSelectArchive(archive);
      onSelectMessage(result.archive_id, result.chat_id);
    }
    handleClose();
  };

  return {
    state: {
      searchKeyword,
      searchResults,
      isSearching,
      selectedTab,
      groupedResults,
      sortedArchiveNames,
      currentArchiveName,
      currentResults,
    },
    actions: {
      setSearchKeyword,
      setSearchResults,
      setIsSearching,
      setSelectedTab,
      performSearch,
      handleClose,
      handleMessageClick,
    },
  };
};

export type SearchDialogStateHook = ReturnType<typeof useSearchDialogState>;
