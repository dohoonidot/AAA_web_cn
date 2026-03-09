import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import chatService from '../services/chatService';
import authService from '../services/authService';

export const useAiAssistantPageState = () => {
  const navigate = useNavigate();
  const archives = useChatStore((s) => s.archives);
  const setCurrentArchive = useChatStore((s) => s.setCurrentArchive);
  const loadArchives = useChatStore((s) => s.loadArchives);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const handleAiAssistant = async () => {
      console.log('AI Chatbot 페이지 진입');
      console.log('현재 아카이브 목록:', archives);

      let aiChatbotArchive = archives.find(
        (archive) => archive.archive_name === 'AI Chatbot' && archive.archive_type === ''
      );

      console.log('AI Chatbot 아카이브:', aiChatbotArchive);

      if (!aiChatbotArchive) {
        console.log('AI Chatbot 아카이브가 없습니다. 생성합니다...');
        setIsCreating(true);

        try {
          const user = authService.getCurrentUser();
          if (!user) {
            console.error('사용자 정보가 없습니다.');
            navigate('/login', { replace: true });
            return;
          }

          const response = await chatService.createArchive(user.userId, '', '');
          console.log('AI Chatbot 생성 응답:', response);

          if (response.archive.archive_name !== 'AI Chatbot') {
            await chatService.updateArchive(user.userId, response.archive.archive_id, 'AI Chatbot');
            response.archive.archive_name = 'AI Chatbot';
          }

          await loadArchives();

          aiChatbotArchive = archives.find(
            (archive) => archive.archive_name === 'AI Chatbot' && archive.archive_type === ''
          );
        } catch (error) {
          console.error('AI Chatbot 아카이브 생성 실패:', error);
          navigate('/chat', { replace: true });
          return;
        } finally {
          setIsCreating(false);
        }
      }

      if (aiChatbotArchive) {
        console.log('AI Chatbot 아카이브로 전환:', aiChatbotArchive);

        setCurrentArchive(aiChatbotArchive);

        console.log('setCurrentArchive 호출 완료');

        await new Promise(resolve => setTimeout(resolve, 200));

        navigate('/chat', { replace: true });
      } else {
        navigate('/chat', { replace: true });
      }
    };

    handleAiAssistant();
  }, [archives, setCurrentArchive, navigate, loadArchives]);

  return {
    state: {
      isCreating,
    },
  };
};

export type AiAssistantPageStateHook = ReturnType<typeof useAiAssistantPageState>;
