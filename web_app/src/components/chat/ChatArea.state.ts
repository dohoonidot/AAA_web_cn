import { useEffect, useRef, useState } from 'react';
import { isDefaultArchive, useChatStore } from '../../store/chatStore';
import { useLeaveRequestDraftStore } from '../../store/leaveRequestDraftStore';
import { useElectronicApprovalStore } from '../../store/electronicApprovalStore';
import { useLeaveCancelDraftStore } from '../../store/leaveCancelDraftStore';
import chatService from '../../services/chatService';
import authService from '../../services/authService';
import FileService, { type FileAttachment } from '../../services/fileService';
import type { ChatMessage } from '../../types';
import type { LeaveTriggerData } from '../../types/leaveRequest';
const DEBUG_TRACE = false;
const debugLog = (...args: unknown[]) => {
  if (!DEBUG_TRACE) return;
  console.log(...args);
};

const SAP_MODULES = ['BC', 'CO', 'FI', 'HR', 'IS', 'MM', 'PM', 'PP', 'PS', 'QM', 'SD', 'TR', 'WF', 'General'];

export const useChatAreaState = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textFieldRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { openPanel } = useLeaveRequestDraftStore();
  const { openPanel: openElectronicApproval } = useElectronicApprovalStore();
  const { openPanel: openLeaveCancelPanel } = useLeaveCancelDraftStore();

  const {
    currentArchive,
    archives,
    messages,
    inputMessage,
    selectedModel,
    selectedSapModule,
    isWebSearchEnabled,
    isStreaming,
    streamingMessage,
    setInputMessage,
    setSelectedModel,
    setWebSearchEnabled,
    setSelectedSapModule,
    setStreaming,
    setStreamingMessage,
    appendStreamingMessage,
    addMessage,
    setMessages,
    setArchives,
    setCurrentArchive,
  } = useChatStore();

  const user = authService.getCurrentUser();

  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<HTMLElement | null>(null);

  const loadArchiveMessages = async (archive: any) => {
    try {
      const loadedMessages = await chatService.getArchiveDetail(archive.archive_id);
      setMessages(loadedMessages);
    } catch (error) {
      console.error('ChatArea: 메시지 로드 실패:', error);
      setMessages([]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  useEffect(() => {
    const focusTextField = () => {
      try {
        if (inputRef.current) {
          inputRef.current.focus();
          if (inputRef.current.value !== undefined && inputRef.current.value !== null) {
            const length = inputRef.current.value.length || 0;
            inputRef.current.setSelectionRange(length, length);
          }
        }
      } catch (error) {
        console.warn('초기 포커스 설정 중 에러 (무시 가능):', error);
      }
    };

    const timer = setTimeout(() => {
      focusTextField();
    }, 500);

    return () => clearTimeout(timer);
  }, [currentArchive]);

  useEffect(() => {
    if (currentArchive) {
      loadArchiveMessages(currentArchive);
    }
  }, [currentArchive]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      Object.values(imagePreviews).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  const handleSend = async () => {
    if (!inputMessage.trim() || isStreaming || !currentArchive || !user) return;

    const userMessage: ChatMessage = {
      chat_id: Date.now(),
      archive_id: currentArchive.archive_id,
      message: inputMessage.trim(),
      role: 0,
      timestamp: new Date().toISOString(),
    };

    const isFirstUserMessage = messages.filter((msg) => msg.role === 0).length === 0;

    addMessage(userMessage);
    const messageText = inputMessage.trim();
    setInputMessage('');

    setStreaming(true);
    setStreamingMessage('');

    if (isFirstUserMessage && !isDefaultArchive(currentArchive)) {
      let autoTitleBuffer = '';
      void chatService.getAutoTitleStream(
        user.userId,
        currentArchive.archive_id,
        messageText,
        (chunk: string) => {
          autoTitleBuffer += chunk;
          const trimmedTitle = autoTitleBuffer.trim();
          if (!trimmedTitle) return;

          setArchives(archives.map((archive) =>
            archive.archive_id === currentArchive.archive_id
              ? { ...archive, archive_name: trimmedTitle }
              : archive
          ));

          setCurrentArchive({ ...currentArchive, archive_name: trimmedTitle });
        },
        (fullTitle: string) => {
          const trimmedTitle = fullTitle.trim();
          if (!trimmedTitle) return;

          setArchives(archives.map((archive) =>
            archive.archive_id === currentArchive.archive_id
              ? { ...archive, archive_name: trimmedTitle }
              : archive
          ));

          setCurrentArchive({ ...currentArchive, archive_name: trimmedTitle });
        },
        (error: Error) => {
          console.warn('자동 타이틀 업데이트 실패:', error);
        }
      );
    }

    try {
      let fullResponse: string;
      const normalizeHalfDaySlot = (value?: string): 'ALL' | 'AM' | 'PM' => {
        if (value === 'AM' || value === 'PM' || value === 'ALL') return value;
        return 'ALL';
      };

      const handleLeaveTrigger = (triggerData: LeaveTriggerData) => {
        debugLog('[ChatArea] 휴가 트리거 수신:', triggerData);

        const formatDate = (isoDate: string): string => {
          if (!isoDate) return '';
          return isoDate.split('T')[0];
        };

        openPanel({
          userId: triggerData.user_id,
          startDate: formatDate(triggerData.start_date),
          endDate: formatDate(triggerData.end_date),
          leaveType: triggerData.leave_type,
          reason: triggerData.reason || '',
          halfDaySlot: normalizeHalfDaySlot(triggerData.half_day_slot),
          approvalLine: triggerData.approval_line?.map((approver) => ({
            approverId: approver.approver_id,
            approverName: approver.approver_name,
            approvalSeq: approver.approval_seq,
          })) || [],
          ccList: triggerData.cc_list?.map((cc) => ({
            name: cc.name,
            userId: cc.user_id,
            department: '',
          })) || [],
          leaveStatus: triggerData.leave_status?.map((status) => ({
            leaveType: status.leave_type,
            totalDays: status.total_days,
            remainDays: status.remain_days,
          })) || [],
        });
      };

      const handleApprovalTrigger = (approvalData: any) => {
        if (!approvalData?.approval_type) return;
        debugLog('[ChatArea] 결재 트리거 수신:', approvalData);
        if (approvalData.approval_type === 'hr_leave_cancel') {
          openLeaveCancelPanel(approvalData);
        } else {
          openElectronicApproval(approvalData);
        }
      };

      if (attachedFiles.length > 0) {
        const moduleValue = isSapArchive() && selectedSapModule ? selectedSapModule.toLowerCase() : '';

        debugLog('📎 파일 첨부 메시지 전송 - 모듈 상태:', {
          isSapArchive: isSapArchive(),
          selectedSapModule,
          moduleValue,
          archiveName: currentArchive.archive_name,
          archiveType: currentArchive.archive_type,
        });

        const stream = isModelSelectorArchive()
          ? await FileService.sendMessageWithModelAndFiles(
            currentArchive.archive_id,
            user.userId,
            messageText,
            attachedFiles,
            selectedModel,
            currentArchive.archive_type || '',
            moduleValue,
            isWebSearchEnabled
          )
          : await FileService.sendMessageWithFiles(
            currentArchive.archive_id,
            user.userId,
            messageText,
            attachedFiles,
            currentArchive.archive_type || '',
            moduleValue,
            isWebSearchEnabled
          );

        fullResponse = await chatService.processStream({
          stream,
          onChunk: (chunk: string) => {
            appendStreamingMessage(chunk);
          },
          onLeaveTrigger: handleLeaveTrigger,
          onApprovalTrigger: handleApprovalTrigger,
        });

        setAttachedFiles([]);
        setImagePreviews({});
      } else {
        const moduleValue = isSapArchive() && selectedSapModule ? selectedSapModule.toLowerCase() : '';

        debugLog('💬 텍스트 메시지 전송 - 모듈 상태:', {
          isSapArchive: isSapArchive(),
          selectedSapModule,
          moduleValue,
          archiveName: currentArchive.archive_name,
          archiveType: currentArchive.archive_type,
        });

        fullResponse = await chatService.sendMessage({
          userId: user.userId,
          archiveId: currentArchive.archive_id,
          message: messageText,
          aiModel: selectedModel,
          archiveType: currentArchive.archive_type,
          isWebSearchEnabled,
          module: moduleValue,
          onChunk: (chunk: string) => {
            appendStreamingMessage(chunk);
          },
          onLeaveTrigger: handleLeaveTrigger,
          onApprovalTrigger: handleApprovalTrigger,
        });
      }

      const aiMessage: ChatMessage = {
        chat_id: Date.now() + 1,
        archive_id: currentArchive.archive_id,
        message: fullResponse,
        role: 1,
        timestamp: new Date().toISOString(),
      };

      addMessage(aiMessage);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    } finally {
      setStreaming(false);
      setStreamingMessage('');
    }
  };

  const focusTextField = () => {
    if (isStreaming) return;

    if (inputRef.current) {
      requestAnimationFrame(() => {
        try {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        } catch (error) {
          console.warn('포커스 설정 중 에러 (무시 가능):', error);
        }
      });
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();

      requestAnimationFrame(() => {
        try {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        } catch (error) {
          console.warn('엔터 키 포커스 설정 중 에러 (무시 가능):', error);
        }
      });
    }
  };

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const isModelSelectorArchive = () => {
    if (!currentArchive) return false;

    const archiveName = currentArchive.archive_name.toLowerCase();
    const archiveType = currentArchive.archive_type?.toLowerCase() || '';

    return (
      archiveName.includes('코딩') ||
      archiveName.includes('sap') ||
      archiveName.includes('ai chatbot') ||
      archiveType === 'code' ||
      archiveType === 'sap'
    );
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles: FileAttachment[] = [];
    const newPreviews: Record<string, string> = {};

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileAttachment = FileService.createFileAttachment(file);
      newFiles.push(fileAttachment);

      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        newPreviews[fileAttachment.id] = previewUrl;
      }
    }

    const validation = isModelSelectorArchive()
      ? FileService.validateModelFiles(newFiles)
      : FileService.validateInternalFiles(newFiles);

    if (!validation.valid) {
      alert(validation.error);
      Object.values(newPreviews).forEach((url) => URL.revokeObjectURL(url));
      return;
    }

    setAttachedFiles((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => ({ ...prev, ...newPreviews }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileRemove = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((file) => file.id !== fileId));

    if (imagePreviews[fileId]) {
      URL.revokeObjectURL(imagePreviews[fileId]);
      setImagePreviews((prev) => {
        const newPreviews = { ...prev };
        delete newPreviews[fileId];
        return newPreviews;
      });
    }
  };

  const isSapArchive = () => {
    if (!currentArchive) return false;
    const archiveName = currentArchive.archive_name;
    const archiveType = currentArchive.archive_type;
    return archiveType === 'sap' || archiveName === 'SAP어시스턴트' || archiveName === 'SAP 어시스턴트';
  };

  const handleSettingsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsMenuClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleWebSearchToggle = () => {
    const newState = !isWebSearchEnabled;
    setWebSearchEnabled(newState);
    debugLog(`🌐 웹검색 토글: ${newState ? 'ON' : 'OFF'}`);
  };

  const handleBackToDefault = () => {
    const defaultArchive = archives.find(
      (archive) => archive.archive_name === '사내업무'
    );

    if (defaultArchive) {
      setCurrentArchive(defaultArchive);
    } else {
      if (archives.length > 0) {
        setCurrentArchive(archives[0]);
      }
    }
  };

  const isSpecialChatRoom =
    currentArchive?.archive_name === '코딩어시스턴트' ||
    currentArchive?.archive_name === 'SAP어시스턴트' ||
    currentArchive?.archive_name === 'AI Chatbot';

  const isAIChatbot = currentArchive?.archive_name === 'AI Chatbot';

  return {
    state: {
      currentArchive,
      archives,
      messages,
      inputMessage,
      selectedModel,
      selectedSapModule,
      isWebSearchEnabled,
      isStreaming,
      streamingMessage,
      attachedFiles,
      imagePreviews,
      settingsAnchorEl,
      isSpecialChatRoom,
      isAIChatbot,
      user,
      SAP_MODULES,
    },
    actions: {
      setInputMessage,
      setSelectedModel,
      setSelectedSapModule,
      setWebSearchEnabled,
      setCurrentArchive,
      handleSend,
      handleKeyPress,
      handleFileAttach,
      handleFileSelect,
      handleFileRemove,
      handleSettingsMenuOpen,
      handleSettingsMenuClose,
      handleWebSearchToggle,
      handleBackToDefault,
      focusTextField,
    },
    refs: {
      messagesEndRef,
      fileInputRef,
      textFieldRef,
      inputRef,
    },
    derived: {
      isModelSelectorArchive,
      isSapArchive,
    },
  };
};

export type ChatAreaStateHook = ReturnType<typeof useChatAreaState>;
