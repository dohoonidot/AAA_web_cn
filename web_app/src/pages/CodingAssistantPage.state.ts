import { useEffect, useState } from 'react';
import chatService from '../services/chatService';
import authService from '../services/authService';
import { useChatStore } from '../store/chatStore';
import type { Archive } from '../types';

export const useCodingAssistantPageState = () => {
  const [currentArchive, setCurrentArchive] = useState<Archive | null>(null);
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiModel, setAiModel] = useState('gemini-flash-2.5');
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

      console.log('코딩 어시스턴트 아카이브 로드 시작:', user.userId);

      const archiveList = await chatService.getArchiveList(user.userId);
      console.log('로드된 아카이브 목록:', archiveList);

      let codingArchive = archiveList.find(archive =>
        archive.archive_name.toLowerCase().includes('코딩') ||
        archive.archive_name.toLowerCase().includes('coding') ||
        archive.archive_name.toLowerCase().includes('코딩 어시스턴트')
      );

      if (!codingArchive) {
        console.log('코딩 어시스턴트 아카이브가 없어서 생성합니다.');
        const response = await chatService.createArchive(
          user.userId,
          '코딩 어시스턴트',
          'coding'
        );
        codingArchive = response.archive;
        console.log('생성된 코딩 어시스턴트 아카이브:', codingArchive);
      }

      setArchives(archiveList);
      setCurrentArchive(codingArchive ?? null);
      setGlobalCurrentArchive(codingArchive ?? null);

    } catch (err: any) {
      console.error('코딩 어시스턴트 아카이브 로드 실패:', err);
      setError(err.message || '코딩 어시스턴트 아카이브를 불러오는데 실패했습니다.');
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
      });
    } catch (err: any) {
      console.error('메시지 전송 실패:', err);
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
    },
    actions: {
      setAiModel,
      handleSendMessage,
      loadArchives,
    },
  };
};

export type CodingAssistantPageStateHook = ReturnType<typeof useCodingAssistantPageState>;
