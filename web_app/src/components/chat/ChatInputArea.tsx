import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Stack,
  Switch,
  FormControlLabel,
  Tooltip,
  Popover,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  Web as WebIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useChatStore, ARCHIVE_NAMES, ARCHIVE_TYPES, isDefaultArchive } from '../../store/chatStore';
import { useThemeStore } from '../../store/themeStore';
import AiModelSelector from './AiModelSelector';
import FileService, { ALLOWED_CHAT_ATTACHMENT_EXTENSIONS, type FileAttachment } from '../../services/fileService';
import chatService from '../../services/chatService';
import authService from '../../services/authService';
import { useLeaveRequestDraftStore } from '../../store/leaveRequestDraftStore';
import { useElectronicApprovalStore } from '../../store/electronicApprovalStore';
const DEBUG_TRACE = false;
const debugLog = (...args: unknown[]) => {
  if (!DEBUG_TRACE) return;
  console.log(...args);
};
import { useLeaveCancelDraftStore } from '../../store/leaveCancelDraftStore';
import type { ChatMessage } from '../../types';
import type { LeaveTriggerData } from '../../types/leaveRequest';
const SAP_MODULES = ['BC', 'CO', 'FI', 'HR', 'IS', 'MM', 'PM', 'PP', 'PS', 'QM', 'SD', 'TR', 'WF', 'General'];

function ChatInputArea() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme.name === 'Dark';

  // Zustand selectors - only subscribe to what we need
  const inputMessage = useChatStore((s) => s.inputMessage);
  const setInputMessage = useChatStore((s) => s.setInputMessage);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const selectedModel = useChatStore((s) => s.selectedModel);
  const selectedSapModule = useChatStore((s) => s.selectedSapModule);
  const isWebSearchEnabled = useChatStore((s) => s.isWebSearchEnabled);
  const setSelectedSapModule = useChatStore((s) => s.setSelectedSapModule);
  const setWebSearchEnabled = useChatStore((s) => s.setWebSearchEnabled);
  const setStreaming = useChatStore((s) => s.setStreaming);
  const setStreamingMessage = useChatStore((s) => s.setStreamingMessage);
  const appendStreamingMessage = useChatStore((s) => s.appendStreamingMessage);
  const addMessage = useChatStore((s) => s.addMessage);
  const currentArchive = useChatStore((s) => s.currentArchive);
  const archives = useChatStore((s) => s.archives);
  const messages = useChatStore((s) => s.messages);
  const setArchives = useChatStore((s) => s.setArchives);
  const setCurrentArchive = useChatStore((s) => s.setCurrentArchive);

  const { openPanel } = useLeaveRequestDraftStore();
  const { openPanel: openElectronicApproval } = useElectronicApprovalStore();
  const { openPanel: openLeaveCancelPanel } = useLeaveCancelDraftStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textFieldRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wasStreamingRef = useRef(false);

  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<HTMLElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);

  const user = authService.getCurrentUser();

  const focusTextField = useCallback(() => {
    try {
      inputRef.current?.focus();
    } catch (error) {
      console.warn('포커스 설정 중 에러 (무시 가능):', error);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(focusTextField, 100);
    return () => clearTimeout(timer);
  }, [currentArchive, focusTextField]);

  useEffect(() => {
    const wasStreaming = wasStreamingRef.current;
    wasStreamingRef.current = isStreaming;

    if (wasStreaming && !isStreaming) {
      const timer = setTimeout(focusTextField, 50);
      return () => clearTimeout(timer);
    }
  }, [isStreaming, focusTextField]);

  useEffect(() => {
    return () => {
      Object.values(imagePreviews).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  const isModelSelectorArchive = useCallback(() => {
    if (!currentArchive) return false;
    const t = currentArchive.archive_type;
    return t === 'code' || t === 'sap' || t === 'ai';
  }, [currentArchive]);

  const isSapArchive = useCallback(() => {
    if (!currentArchive) return false;
    return currentArchive.archive_type === 'sap';
  }, [currentArchive]);

  const handleSend = useCallback(async () => {
    if (!inputMessage.trim() || isStreaming || !currentArchive || !user) return;
    const outgoingFiles = attachedFiles;

    const messageAttachments = outgoingFiles.map((file) => ({
      id: file.id,
      name: file.name,
      size: file.size,
      type: file.type,
      extension: file.extension,
      previewUrl: imagePreviews[file.id],
    }));

    const userMessage: ChatMessage = {
      chat_id: Date.now(),
      archive_id: currentArchive.archive_id,
      message: inputMessage.trim(),
      role: 0,
      timestamp: new Date().toISOString(),
      ...(messageAttachments.length > 0 ? { attachments: messageAttachments } : {}),
    };

    const isFirstUserMessage = messages.filter((msg) => msg.role === 0).length === 0;

    addMessage(userMessage);
    const messageText = inputMessage.trim();
    setInputMessage('');
    if (outgoingFiles.length > 0) {
      // 사용자 버블에 첨부 표시가 생긴 직후 입력창 첨부영역은 비운다.
      setAttachedFiles([]);
      setImagePreviews({});
    }

    setStreaming(true);
    setStreamingMessage('');

    const type = currentArchive.archive_type || '';
    const baseNameByType: Record<string, string> = {
      [ARCHIVE_TYPES.COMPANY]: ARCHIVE_NAMES.WORK,
      [ARCHIVE_TYPES.CODE]: ARCHIVE_NAMES.CODE,
      [ARCHIVE_TYPES.SAP]: ARCHIVE_NAMES.SAP,
      [ARCHIVE_TYPES.AI]: ARCHIVE_NAMES.CHATBOT,
    };
    const isDefaultChild = !!type && isDefaultArchive(currentArchive) && currentArchive.archive_name !== baseNameByType[type];
    const isNewChat = !type && /^new chat(?: \d+)?$/i.test(currentArchive.archive_name.trim());
    const shouldAutoTitle = isFirstUserMessage && (isDefaultChild || isNewChat);

    if (shouldAutoTitle) {
      void chatService.getAutoTitleStream(
        user.userId,
        currentArchive.archive_id,
        messageText,
        () => { },
        (fullTitle: string) => {
          const trimmedTitle = fullTitle.trim();
          if (!trimmedTitle) return;

          setArchives(archives.map((archive) => (
            archive.archive_id === currentArchive.archive_id
              ? { ...archive, archive_name: trimmedTitle }
              : archive
          )));

          setCurrentArchive({ ...currentArchive, archive_name: trimmedTitle });
        },
        (error: Error) => {
          console.warn('자동 타이틀 업데이트 실패:', error);
        }
      );
    }

    let chunkBuffer = '';
    let flushRafId: number | null = null;
    const flushChunks = () => {
      if (chunkBuffer) {
        appendStreamingMessage(chunkBuffer);
        chunkBuffer = '';
      }
      flushRafId = null;
    };
    const onChunk = (chunk: string) => {
      chunkBuffer += chunk;
      if (flushRafId === null) {
        flushRafId = requestAnimationFrame(flushChunks);
      }
    };

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

      const isSap = isSapArchive();
      const moduleValue = isSap && selectedSapModule ? selectedSapModule.toLowerCase() : '';

      if (outgoingFiles.length > 0) {
        debugLog('📎 파일 첨부 메시지 전송 - 모듈 상태:', {
          isSapArchive: isSap,
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
            outgoingFiles,
            selectedModel,
            currentArchive.archive_type || '',
            moduleValue,
            isWebSearchEnabled
          )
          : await FileService.sendMessageWithFiles(
            currentArchive.archive_id,
            user.userId,
            messageText,
            outgoingFiles,
            currentArchive.archive_type || '',
            moduleValue,
            isWebSearchEnabled
          );

        fullResponse = await chatService.processStream({
          stream,
          onChunk,
          onLeaveTrigger: handleLeaveTrigger,
          onApprovalTrigger: handleApprovalTrigger,
        });
      } else {
        debugLog('💬 텍스트 메시지 전송 - 모듈 상태:', {
          isSapArchive: isSap,
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
          archiveType: currentArchive.archive_type || '',
          isWebSearchEnabled,
          module: moduleValue,
          onChunk,
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
      if (flushRafId !== null) cancelAnimationFrame(flushRafId);
      if (chunkBuffer) appendStreamingMessage(chunkBuffer);
      setStreaming(false);
      setStreamingMessage('');
    }
  }, [inputMessage, isStreaming, currentArchive, user, messages, archives, selectedModel, selectedSapModule, isWebSearchEnabled, attachedFiles, imagePreviews]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
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
  }, [handleSend]);

  const handleFileAttach = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const isAllowedChatAttachment = useCallback((file: File) => {
    return FileService.validateFileType(file, [...ALLOWED_CHAT_ATTACHMENT_EXTENSIONS]);
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles: FileAttachment[] = [];
    const newPreviews: Record<string, string> = {};

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!isAllowedChatAttachment(file)) continue;
      const fileAttachment = FileService.createFileAttachment(file);
      newFiles.push(fileAttachment);

      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        newPreviews[fileAttachment.id] = previewUrl;
      }
    }

    if (newFiles.length === 0) {
      alert('허용된 파일 형식만 첨부 가능합니다 (pdf, png, jpg, jpeg, webp, heic, heif).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
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
  }, [isAllowedChatAttachment, isModelSelectorArchive]);

  // 공통 파일 추가 헬퍼 (paste, drop, file input 에서 공용)
  const addFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;

    const newFiles: FileAttachment[] = [];
    const newPreviews: Record<string, string> = {};

    for (const file of files) {
      if (!isAllowedChatAttachment(file)) continue;
      const fileAttachment = FileService.createFileAttachment(file);
      newFiles.push(fileAttachment);

      if (file.type.startsWith('image/')) {
        newPreviews[fileAttachment.id] = URL.createObjectURL(file);
      }
    }

    if (newFiles.length === 0) {
      alert('허용된 파일 형식만 첨부 가능합니다 (pdf, png, jpg, jpeg, webp, heic, heif).');
      return;
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
  }, [isAllowedChatAttachment, isModelSelectorArchive]);

  useEffect(() => {
    const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types || []).includes('Files');

    const onDragEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragCounterRef.current += 1;
      setIsDragOver(true);
    };

    const onDragOver = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      setIsDragOver(true);
    };

    const onDragLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
      if (dragCounterRef.current === 0) {
        setIsDragOver(false);
      }
    };

    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDragOver(false);

      const droppedFiles = Array.from(e.dataTransfer?.files || []);
      if (droppedFiles.length === 0) return;
      addFiles(droppedFiles);
    };

    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);

    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, [addFiles]);

  // 클립보드 붙여넣기 (Ctrl+V) - 이미지 전용
  const handlePaste = useCallback((event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }

    if (imageFiles.length > 0) {
      event.preventDefault(); // 이미지가 텍스트로 붙여넣기되는 것 방지
      addFiles(imageFiles);
    }
  }, [addFiles]);

  // 드래그 & 드롭 핸들러
  const handleDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current += 1;
    if (event.dataTransfer?.types?.includes('Files')) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragOver(false);

    const droppedFiles = event.dataTransfer?.files;
    if (!droppedFiles || droppedFiles.length === 0) return;

    const validFiles: File[] = [];
    for (let i = 0; i < droppedFiles.length; i++) {
      const file = droppedFiles[i];
      if (isAllowedChatAttachment(file)) {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      alert('허용된 파일 형식만 드래그 & 드롭으로 첨부할 수 있습니다 (pdf, png, jpg, jpeg, webp, heic, heif).');
      return;
    }

    addFiles(validFiles);
  }, [addFiles, isAllowedChatAttachment]);

  const handleFileRemove = useCallback((fileId: string) => {
    setAttachedFiles((prev) => prev.filter((file) => file.id !== fileId));

    setImagePreviews((prev) => {
      if (prev[fileId]) {
        URL.revokeObjectURL(prev[fileId]);
        const newPreviews = { ...prev };
        delete newPreviews[fileId];
        return newPreviews;
      }
      return prev;
    });
  }, []);

  const handleSettingsMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  }, []);

  const handleSettingsMenuClose = useCallback(() => {
    setSettingsAnchorEl(null);
  }, []);

  const handleWebSearchToggle = useCallback(() => {
    const newState = !isWebSearchEnabled;
    setWebSearchEnabled(newState);
    debugLog(`🌐 웹검색 토글: ${newState ? 'ON' : 'OFF'}`);
  }, [isWebSearchEnabled, setWebSearchEnabled]);

  const settingsMenuOpen = Boolean(settingsAnchorEl);

  if (!currentArchive) return null;

  const inputGlassBg = isDark ? 'rgba(30,41,59,0.72)' : 'rgba(255,255,255,0.9)';
  const inputBorderColor = isDark ? 'rgba(148,163,184,0.38)' : 'rgba(148,163,184,0.3)';
  const inputHoverBorderColor = isDark ? 'rgba(125,211,252,0.45)' : 'rgba(99,102,241,0.32)';

  return (
    <>
      {/* 파일 첨부 목록 */}
      {attachedFiles.length > 0 && (
        <Box
          sx={{
            p: 1.5,
            bgcolor: isDark ? 'rgba(30,41,59,0.58)' : 'rgba(248,250,252,0.9)',
            borderBottom: `1px solid ${colorScheme.textFieldBorderColor}`,
            borderTop: `1px solid ${colorScheme.textFieldBorderColor}`,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              mb: 1,
              display: 'block',
              fontWeight: 700,
              fontSize: '0.7rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            첨부된 파일 ({attachedFiles.length}개)
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {attachedFiles.map((file) => {
              const isImage = file.type.startsWith('image/');
              const previewUrl = imagePreviews[file.id];

              return (
                <Box key={file.id} sx={{ position: 'relative', display: 'inline-block', mr: 1, mb: 1 }}>
                  {isImage && previewUrl ? (
                    <Box
                      sx={{
                        position: 'relative',
                        borderRadius: 2.5,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(129,140,248,0.32)' : 'rgba(99,102,241,0.28)',
                        boxShadow: isDark ? '0 8px 18px rgba(2,6,23,0.28)' : '0 6px 12px rgba(15,23,42,0.08)',
                        transition: 'all 0.18s ease-in-out',
                        '&:hover': {
                          boxShadow: isDark ? '0 10px 22px rgba(2,6,23,0.36)' : '0 8px 16px rgba(15,23,42,0.12)',
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={previewUrl}
                        alt={file.name}
                        sx={{
                          width: 80,
                          height: 80,
                          objectFit: 'cover',
                          display: 'block',
                          backgroundColor: 'grey.100',
                        }}
                      />
                      <IconButton
                        onClick={() => handleFileRemove(file.id)}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(255,255,255,0.9)',
                          color: '#475569',
                          boxShadow: '0 2px 6px rgba(15,23,42,0.2)',
                          '&:hover': {
                            bgcolor: 'white',
                            color: '#dc2626',
                          },
                          width: 24,
                          height: 24,
                        }}
                      >
                        <CloseIcon sx={{ fontSize: '1rem' }} />
                      </IconButton>
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          bgcolor: 'rgba(30,41,59,0.75)',
                          p: 0.5,
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'white',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            display: 'block',
                            textAlign: 'center',
                          }}
                        >
                          {FileService.formatFileSize(file.size)}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Chip
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AttachFileIcon sx={{ fontSize: '1rem' }} />
                          <Box>
                            <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                              {file.name}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                              {FileService.formatFileSize(file.size)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      onDelete={() => handleFileRemove(file.id)}
                      deleteIcon={<CloseIcon />}
                      variant="outlined"
                      size="small"
                      sx={{
                        height: 'auto',
                        py: 0.7,
                        px: 1.1,
                        borderColor: isDark ? 'rgba(129,140,248,0.34)' : 'rgba(99,102,241,0.3)',
                        borderRadius: '10px',
                        bgcolor: isDark ? 'rgba(30,41,59,0.46)' : 'rgba(255,255,255,0.8)',
                        '& .MuiChip-label': {
                          px: 0,
                        },
                        '&:hover': {
                          borderColor: isDark ? 'rgba(129,140,248,0.5)' : 'rgba(99,102,241,0.45)',
                          bgcolor: isDark ? 'rgba(30,41,59,0.6)' : 'rgba(248,250,252,1)',
                        },
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Stack>
        </Box>
      )}

      {/* 입력 영역 */}
      <Paper
        elevation={isDragOver ? 8 : 3}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          p: { xs: 1, md: 1.25 },
          borderRadius: 0,
          display: 'flex',
          gap: { xs: 0.75, md: 0.75 },
          alignItems: 'flex-end',
          borderTop: `1px solid ${isDragOver ? theme.palette.primary.main : colorScheme.textFieldBorderColor}`,
          bgcolor: isDragOver
            ? (isDark ? 'rgba(25, 118, 210, 0.15)' : 'rgba(25, 118, 210, 0.08)')
            : colorScheme.chatInputBackgroundColor,
          transition: 'all 0.18s ease',
          position: 'relative',
        }}
      >
        {/* 파일 첨부 버튼 */}
        <Tooltip title="파일 첨부" placement="top">
          <span>
            <IconButton
              color="primary"
              onClick={handleFileAttach}
              disabled={isStreaming}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                color: isDark ? '#a5b4fc' : '#4f46e5',
                border: '1px solid',
                borderColor: inputBorderColor,
                bgcolor: inputGlassBg,
                '&:hover': {
                  borderColor: inputHoverBorderColor,
                  bgcolor: isDark ? 'rgba(30,41,59,0.78)' : 'rgba(248,250,252,0.98)',
                  color: isDark ? '#c7d2fe' : '#4338ca',
                },
              }}
            >
              <AttachFileIcon fontSize={isMobile ? 'small' : 'medium'} />
            </IconButton>
          </span>
        </Tooltip>

        {/* 숨겨진 파일 입력 */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept=".pdf,.png,.jpg,.jpeg,.webp,.heic,.heif,.json"
        />

        <TextField
          ref={textFieldRef}
          fullWidth
          multiline
          maxRows={isMobile ? 3 : 4}
          minRows={1}
          placeholder={isDragOver ? '여기에 파일을 놓으세요...' : '메시지를 입력하세요...'}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          onPaste={handlePaste}
          disabled={isStreaming}
          variant="outlined"
          size={isMobile ? 'small' : 'medium'}
          autoFocus={true}
          inputRef={inputRef}
          InputProps={{
            startAdornment: isModelSelectorArchive() ? (
              <>
                {/* 모바일: 설정 메뉴 아이콘만 표시 */}
                {isMobile ? (
                  <Tooltip title="모델/검색 설정" placement="top">
                    <span>
                      <IconButton
                        size="small"
                        onClick={handleSettingsMenuOpen}
                        disabled={isStreaming}
                        sx={{
                          mr: 0.5,
                          color: isDark ? '#a5b4fc' : '#4f46e5',
                          border: '1px solid',
                          borderColor: inputBorderColor,
                          bgcolor: inputGlassBg,
                          '&:hover': {
                            borderColor: inputHoverBorderColor,
                            bgcolor: isDark ? 'rgba(30,41,59,0.78)' : 'rgba(248,250,252,0.98)',
                            color: isDark ? '#c7d2fe' : '#4338ca',
                          },
                        }}
                      >
                        <SettingsIcon sx={{ fontSize: '1.2rem' }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                ) : (
                  /* 데스크톱: 기존 레이아웃 유지 */
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      flexDirection: 'row',
                      gap: 1,
                      mr: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      {isSapArchive() && (
                        <FormControl
                          size="small"
                          sx={{
                            minWidth: 100,
                            '& .MuiOutlinedInput-root': {
                              height: 36,
                            },
                          }}
                        >
                          <Select
                            value={selectedSapModule}
                            onChange={(e) => setSelectedSapModule(e.target.value)}
                            displayEmpty
                            disabled={isStreaming}
                            sx={{
                              fontSize: '0.875rem',
                              height: 36,
                              '& .MuiSelect-select': {
                                py: 0.75,
                                px: 1.5,
                              },
                            }}
                          >
                            <MenuItem value="" sx={{ fontSize: '0.875rem' }}>
                              <em>모듈</em>
                            </MenuItem>
                            {SAP_MODULES.map((module) => (
                              <MenuItem key={module} value={module} sx={{ fontSize: '0.875rem' }}>
                                {module}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}

                      <AiModelSelector size="small" />
                    </Box>

                    <Tooltip title="웹검색 사용">
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.5,
                        }}
                      >
                        <WebIcon
                          sx={{
                            fontSize: '1.2rem',
                            color: isWebSearchEnabled ? '#6B46C1' : 'grey.500',
                          }}
                        />
                        <Switch
                          checked={isWebSearchEnabled}
                          onChange={handleWebSearchToggle}
                          size="small"
                          color="primary"
                          disabled={isStreaming}
                          sx={{
                            '& .MuiSwitch-switchBase': {
                              '&.Mui-checked': {
                                color: '#6B46C1',
                                '& + .MuiSwitch-track': {
                                  backgroundColor: '#6B46C1',
                                },
                              },
                            },
                          }}
                        />
                      </Box>
                    </Tooltip>
                  </Box>
                )}
              </>
            ) : undefined,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              minHeight: { xs: 36, md: 44 },
              padding: { xs: '7px 12px', md: '8px 14px' },
              bgcolor: inputGlassBg,
              backdropFilter: 'blur(8px)',
              border: '1px solid',
              borderColor: inputBorderColor,
              transition: 'all 0.16s ease',
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover': {
                borderColor: inputHoverBorderColor,
              },
              '&.Mui-focused': {
                borderColor: inputHoverBorderColor,
                boxShadow: isDark
                  ? '0 0 0 3px rgba(99,102,241,0.2)'
                  : '0 0 0 3px rgba(99,102,241,0.12)',
              },
              '& .MuiInputBase-input': {
                padding: 0,
                fontSize: isMobile ? '0.92rem' : '0.95rem',
              },
            },
          }}
        />

        <Tooltip title="메시지 전송" placement="top">
          <span>
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={(!inputMessage.trim() && attachedFiles.length === 0) || isStreaming}
              size={isMobile ? 'medium' : 'large'}
              sx={{
                bgcolor: isDark ? '#4f46e5' : '#4338ca',
                color: 'white',
                minWidth: { xs: 36, md: 44 },
                minHeight: { xs: 36, md: 44 },
                borderRadius: '11px',
                boxShadow: isDark
                  ? '0 8px 18px rgba(79,70,229,0.4)'
                  : '0 8px 16px rgba(67,56,202,0.28)',
                '&:hover': {
                  bgcolor: isDark ? '#6366f1' : '#4f46e5',
                  transform: 'translateY(-1px)',
                },
                '&.Mui-disabled': {
                  bgcolor: isDark ? 'rgba(71,85,105,0.55)' : 'rgba(203,213,225,0.9)',
                  color: isDark ? 'rgba(226,232,240,0.55)' : 'rgba(71,85,105,0.6)',
                  boxShadow: 'none',
                },
              }}
            >
              {isStreaming ? (
                <CircularProgress size={isMobile ? 20 : 24} sx={{ color: 'white' }} />
              ) : (
                <SendIcon fontSize={isMobile ? 'small' : 'medium'} />
              )}
            </IconButton>
          </span>
        </Tooltip>
      </Paper>

      {/* 모바일 설정 메뉴 팝오버 */}
      {isMobile && isModelSelectorArchive() && (
        <Popover
          open={settingsMenuOpen}
          anchorEl={settingsAnchorEl}
          onClose={handleSettingsMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          PaperProps={{
            sx: {
              mt: -1,
              minWidth: 280,
              bgcolor: isDark ? 'rgba(30,41,59,0.94)' : 'rgba(255,255,255,0.96)',
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: isDark ? 'rgba(148,163,184,0.24)' : 'rgba(148,163,184,0.24)',
              boxShadow: isDark ? '0 18px 30px rgba(2,6,23,0.4)' : '0 14px 24px rgba(15,23,42,0.12)',
              backdropFilter: 'blur(8px)',
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: isDark ? '#c7d2fe' : '#4f46e5',
                fontSize: '0.8rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              설정
            </Typography>

            {isSapArchive() && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mb: 1,
                    color: isDark ? '#888888' : '#666666',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                >
                  SAP 모듈
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedSapModule}
                    onChange={(e) => {
                      setSelectedSapModule(e.target.value);
                      handleSettingsMenuClose();
                    }}
                    displayEmpty
                    disabled={isStreaming}
                    sx={{
                      fontSize: '0.875rem',
                      borderRadius: '10px',
                      bgcolor: isDark ? 'rgba(30,41,59,0.6)' : 'rgba(248,250,252,0.9)',
                    }}
                  >
                    <MenuItem value="">
                      <em>모듈 선택</em>
                    </MenuItem>
                    {SAP_MODULES.map((module) => (
                      <MenuItem key={module} value={module}>
                        {module}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mb: 1,
                  color: isDark ? '#888888' : '#666666',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                AI 모델
              </Typography>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '10px',
                  bgcolor: isDark ? 'rgba(30,41,59,0.6)' : 'rgba(248,250,252,0.9)',
                  border: `1px solid ${isDark ? 'rgba(148,163,184,0.2)' : 'rgba(148,163,184,0.25)'}`,
                }}
              >
                <AiModelSelector size="small" />
              </Box>
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mb: 1,
                  color: isDark ? '#888888' : '#666666',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                웹검색
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={isWebSearchEnabled}
                    onChange={handleWebSearchToggle}
                    size="medium"
                    color="primary"
                    disabled={isStreaming}
                    sx={{
                      '& .MuiSwitch-switchBase': {
                        '&.Mui-checked': {
                          color: '#6B46C1',
                          '& + .MuiSwitch-track': {
                            backgroundColor: '#6B46C1',
                          },
                        },
                      },
                    }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WebIcon
                      sx={{
                        fontSize: '1rem',
                        color: isWebSearchEnabled ? '#6B46C1' : 'grey.500',
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.875rem',
                        color: isDark ? '#FFFFFF' : '#000000',
                      }}
                    >
                      {isWebSearchEnabled ? '활성화됨' : '비활성화됨'}
                    </Typography>
                  </Box>
                }
                sx={{ margin: 0 }}
              />
            </Box>
          </Box>
        </Popover>
      )}
    </>
  );
}

export default React.memo(ChatInputArea);
