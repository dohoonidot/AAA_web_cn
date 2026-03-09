import { useEffect, useState } from 'react';
import chatService from '../services/chatService';
import authService from '../services/authService';
import { useChatStore } from '../store/chatStore';
import { createLogger } from '../utils/logger';
import type { Archive } from '../types';

const logger = createLogger('SapPage');

export const useSapPageState = () => {
  const [currentArchive, setCurrentArchive] = useState<Archive | null>(null);
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiModel, setAiModel] = useState('gemini-flash-2.5');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const setGlobalCurrentArchive = useChatStore((s) => s.setCurrentArchive);

  useEffect(() => {
    loadArchives();
  }, []);

  const loadArchives = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = authService.getCurrentUser();
      if (!user) {
        setError('사용자 정보를 찾을 수 없습니다.');
        return;
      }

      logger.dev('SAP 아카이브 로드 시작:', user.userId);

      const archiveList = await chatService.getArchiveList(user.userId);
      logger.dev('로드된 아카이브 목록:', archiveList);

      let sapArchive = archiveList.find(archive =>
        archive.archive_name.toLowerCase().includes('sap') ||
        archive.archive_name.toLowerCase().includes('sap 어시스턴트')
      );

      if (!sapArchive) {
        logger.dev('SAP 아카이브가 없어서 생성합니다.');
        const response = await chatService.createArchive(
          user.userId,
          'SAP 어시스턴트',
          'sap'
        );
        sapArchive = response.archive;
        logger.dev('생성된 SAP 아카이브:', sapArchive);
      }

      setArchives(archiveList);
      setCurrentArchive(sapArchive ?? null);
      setGlobalCurrentArchive(sapArchive ?? null);

    } catch (err: any) {
      logger.error('SAP 아카이브 로드 실패:', err);
      setError(err.message || 'SAP 아카이브를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!currentArchive) return;

    try {
      const user = authService.getCurrentUser();
      if (!user) {
        setError('사용자 정보를 찾을 수 없습니다.');
        return;
      }

      await chatService.sendMessage({
        userId: user.userId,
        archiveId: currentArchive.archive_id,
        message,
        aiModel,
        archiveName: currentArchive.archive_name,
        module: selectedModule || '',
      });
    } catch (err: any) {
      logger.error('메시지 전송 실패:', err);
      setError(err.message || '메시지 전송에 실패했습니다.');
    }
  };

  return {
    state: {
      currentArchive,
      archives,
      loading,
      error,
      aiModel,
      selectedModule,
    },
    actions: {
      setAiModel,
      setSelectedModule,
      handleSendMessage,
      loadArchives,
    },
  };
};

export type SapPageStateHook = ReturnType<typeof useSapPageState>;
