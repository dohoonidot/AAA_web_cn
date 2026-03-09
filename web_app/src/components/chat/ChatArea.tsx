import { useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  CircularProgress,
  Avatar,
  useMediaQuery,
  useTheme,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  SmartToy as BotIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  AutoAwesome as AutoAwesomeIcon,
  PictureAsPdf as PictureAsPdfIcon,
  InsertDriveFile as InsertDriveFileIcon,
} from '@mui/icons-material';
import { useChatStore } from '../../store/chatStore';
import { useThemeStore } from '../../store/themeStore';
import MessageRenderer from './MessageRenderer';
import ChatInputArea from './ChatInputArea';
import type { ChatMessageAttachment } from '../../types';

export default function ChatArea() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme.name === 'Dark';

  // Only subscribe to message/display-related state (NOT inputMessage)
  const currentArchive = useChatStore((s) => s.currentArchive);
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const streamingMessage = useChatStore((s) => s.streamingMessage);
  const archives = useChatStore((s) => s.archives);
  const setCurrentArchive = useChatStore((s) => s.setCurrentArchive);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<number | null>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior) => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // 메시지 완료 시 smooth scroll
  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, scrollToBottom]);

  // 스트리밍 중 instant scroll (debounced, 80ms)
  useEffect(() => {
    if (!streamingMessage) return;
    if (scrollTimerRef.current !== null) return;
    scrollTimerRef.current = window.setTimeout(() => {
      scrollToBottom('auto');
      scrollTimerRef.current = null;
    }, 80);
  }, [streamingMessage, scrollToBottom]);

  const isSpecialChatRoom =
    currentArchive?.archive_type === 'code' ||
    currentArchive?.archive_type === 'sap';

  const handleBackToDefault = () => {
    const defaultArchive = archives.find(
      (archive) => archive.archive_type === 'company'
    );

    if (defaultArchive) {
      setCurrentArchive(defaultArchive);
    } else {
      if (archives.length > 0) {
        setCurrentArchive(archives[0]);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex += 1;
    }
    return `${size >= 10 || unitIndex === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`;
  };

  const isImageAttachment = (attachment: ChatMessageAttachment) => {
    return attachment.type?.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'heic', 'heif'].includes((attachment.extension || '').toLowerCase());
  };

  const isPdfAttachment = (attachment: ChatMessageAttachment) => {
    return attachment.type === 'application/pdf' || (attachment.extension || '').toLowerCase() === 'pdf';
  };

  // 아카이브가 선택되지 않은 경우
  if (!currentArchive) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          채팅방을 선택해주세요
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {/* 헤더: 뒤로가기 버튼 + AI 모델 선택 (데스크톱에서만 표시) */}
      <Paper
        elevation={2}
        sx={{
          p: { xs: 1.5, md: 2 },
          borderRadius: 0,
          display: { xs: 'none', md: 'flex' }, // 모바일에서는 숨김 (AppBar가 있음)
          alignItems: 'center',
          gap: 2,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        {/* 뒤로가기 버튼 (특수 채팅방에서만 표시) */}
        {isSpecialChatRoom && (
          <Tooltip title="기본 채팅방으로" placement="bottom">
            <IconButton
              onClick={handleBackToDefault}
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
        )}

        <Typography
          variant={isMobile ? 'subtitle1' : 'h6'}
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {currentArchive.archive_name}
        </Typography>

      </Paper>

      {/* 메시지 영역 */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0, // flex item이 content 크기 아래로 줄어들 수 있게 허용
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 2, md: 3 },
          background: isDark
            ? 'linear-gradient(180deg, #0B1220 0%, #0F172A 40%, #111827 100%)'
            : '#F1F5F9',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'grey.100',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'grey.400',
            borderRadius: '4px',
            '&:hover': {
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'grey.500',
            },
          },
        }}
      >
        {messages.length === 0 && !isStreaming ? (
          <Box
            sx={{
              flex: 1, // flex:1 로 영역 채움 (height:100% 대신)
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: isDark ? '#CBD5E1' : '#475569',
            }}
          >
            <BotIcon sx={{ fontSize: 80, mb: 2, opacity: 0.5 }} />
            {currentArchive.archive_type === 'company' && (
              <>
                <Typography variant="h6" gutterBottom>
                  안녕하세요. 저는 ASPN AI Agent입니다.🤖
                </Typography>
                <Box sx={{ maxWidth: 600, textAlign: 'left', mt: 2 }}>
                  <Typography variant="body2" paragraph>
                    저희는 아래와 같은 서비스를 통해 전문적인 도움을 드리고 있습니다!
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2 }}>
                    CSR 서비스
                  </Typography>
                  <Typography variant="body2">
                    ➜ 사용자의 권한을 확인하여 현재 진행 상황 및 담당자를 조회할 수 있습니다.<br />
                    ➜ 접수된 CSR 요청서에 대해 해결 방안과 과거 유사 이력을 확인할 수 있습니다.
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2 }}>
                    ASPN 서비스
                  </Typography>
                  <Typography variant="body2">
                    ➜ 회사 규정 관련 문의에 대해 정보를 제공합니다.<br />
                    ➜ 조직도와 임직원 연락처, 메일 주소 등의 정보를 제공합니다.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 3, fontWeight: 600, textAlign: 'center' }}>
                    무엇을 도와드릴까요?
                  </Typography>
                </Box>
              </>
            )}

            {currentArchive.archive_type === 'code' && (
              <>
                <Typography variant="h6" gutterBottom>
                  코딩 어시스턴트에 오신 것을 환영합니다! 🚀
                </Typography>
                <Box sx={{ maxWidth: 600, textAlign: 'left', mt: 2 }}>
                  <Typography variant="body2" paragraph>
                    저는 프로그래밍과 코딩 관련 질문에 답변해드리는 AI 어시스턴트입니다.
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2 }}>
                    제가 도와드릴 수 있는 것들:
                  </Typography>
                  <Typography variant="body2" component="div">
                    <ul style={{ paddingLeft: 20, margin: 0 }}>
                      <li>코드 작성 및 디버깅</li>
                      <li>알고리즘 설명 및 최적화</li>
                      <li>프로그래밍 언어 문법 질문</li>
                      <li>코드 리뷰 및 개선 제안</li>
                      <li>개발 환경 설정 도움</li>
                    </ul>
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 3, fontWeight: 600, textAlign: 'center' }}>
                    어떤 코딩 관련 질문이 있으신가요?
                  </Typography>
                </Box>
              </>
            )}

            {currentArchive.archive_type === 'sap' && (
              <>
                <Typography variant="h6" gutterBottom>
                  SAP 어시스턴트에 오신 것을 환영합니다! 💼
                </Typography>
                <Box sx={{ maxWidth: 600, textAlign: 'left', mt: 2 }}>
                  <Typography variant="body2" paragraph>
                    저는 SAP 시스템과 관련된 질문에 답변해드리는 AI 어시스턴트입니다.
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2 }}>
                    제가 도와드릴 수 있는 것들:
                  </Typography>
                  <Typography variant="body2" component="div">
                    <ul style={{ paddingLeft: 20, margin: 0 }}>
                      <li>SAP 모듈별 기능 설명</li>
                      <li>SAP 시스템 문제 해결</li>
                      <li>SAP 설정 및 구성 도움</li>
                      <li>SAP 업무 프로세스 설명</li>
                      <li>SAP 관련 모범 사례 안내</li>
                    </ul>
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 3, fontWeight: 600, textAlign: 'center' }}>
                    어떤 SAP 관련 질문이 있으신가요?
                  </Typography>
                </Box>
              </>
            )}
            {currentArchive.archive_type === 'ai' && (
              <>
                <Typography variant="h6" gutterBottom>
                  AI Chatbot에 오신 것을 환영합니다! 🤖
                </Typography>
                <Box sx={{ maxWidth: 600, textAlign: 'left', mt: 2 }}>
                  <Typography variant="body2" paragraph>
                    현재 유료 버전인 AI 모델들을 무료로 사용하실 수 있습니다!
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      ✅ Gemini Pro 3.1
                    </Typography>
                    <Typography variant="body2" sx={{ ml: 1, fontSize: '0.85rem' }}>
                      🚀 구글의 최신 고성능 대형 언어 모델!<br />
                      강력한 추론 능력과 창의성을 겸비한 다양한 작업에 최적화된 올인원 AI입니다.<br />
                      복잡한 분석과 창의적 작업에 탁월합니다.
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      🔍 GPT-5.4
                    </Typography>
                    <Typography variant="body2" sx={{ ml: 1, fontSize: '0.85rem' }}>
                      🧠 가장 최신이자 강화된 OpenAI 언어 모델!<br />
                      깊이 있는 추론 능력과 폭넓은 지식을 갖추어 전문적인 문제 해결과 고급 분석에 최적입니다.<br />
                      다소 시간이 걸릴 수 있습니다.
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      💻 Claude Sonnet 4.6
                    </Typography>
                    <Typography variant="body2" sx={{ ml: 1, fontSize: '0.85rem' }}>
                      🛠️ 코딩과 개발에 특화된 전문가 모델!<br />
                      코드 작성, 디버깅, 최적화에 탁월하며 기술 문서 작성과 시스템 설계에도 강합니다.
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ mt: 3, fontWeight: 600, textAlign: 'center' }}>
                    무엇을 도와드릴까요?
                  </Typography>
                </Box>
              </>
            )}
            {/* 나머지 아카이브 (기본 메시지) - 위 4개 타입에 해당하지 않는 경우 */
              currentArchive.archive_type !== 'company' &&
              currentArchive.archive_type !== 'code' &&
              currentArchive.archive_type !== 'sap' &&
              currentArchive.archive_type !== 'ai' && (
                <>
                  <Typography variant="h6" gutterBottom>
                    {currentArchive.archive_name}에 오신 것을 환영합니다
                  </Typography>
                  <Typography variant="body2">
                    무엇을 도와드릴까요?
                  </Typography>
                </>
              )}
          </Box>
        ) : (
          <>
            {/* spacer: 메시지가 적을 때 최신 메시지가 항상 하단에 위치하도록 빈 공간 확보.
                메시지가 많아서 overflow 시에는 flex:1인 spacer가 0px로 수축하고 스크롤 가능. */}
            <Box sx={{ flex: 1, minHeight: 0 }} />
            {messages.map((msg, index) => (
              <Box
                key={msg.chat_id || index}
                sx={{
                  display: 'flex',
                  mb: 3,
                  flexDirection: msg.role === 0 ? 'row-reverse' : 'row',
                }}
              >
                {/* 아바타 */}
                {msg.role === 0 ? (
                  // 유저 아바타: 인디고 그라디언트
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: '12px',
                      background: isDark
                        ? '#334155'
                        : 'linear-gradient(135deg, #6366f1, #818cf8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 1,
                      flexShrink: 0,
                      boxShadow: isDark
                        ? '0 2px 8px rgba(0,0,0,0.5)'
                        : '0 2px 8px rgba(99,102,241,0.35)',
                      border: '2px solid',
                      borderColor: isDark ? '#475569' : 'rgba(199,210,254,0.8)',
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 20, color: 'white' }} />
                  </Box>
                ) : (
                  // AI 아바타: 보라-라벤더 그라디언트 (유저와 같은 계열, 밝은 톤)
                  <Box sx={{ position: 'relative', mx: 1, flexShrink: 0 }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '12px',
                        background: isDark
                          ? '#1E293B'
                          : 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isDark
                          ? '0 2px 8px rgba(0,0,0,0.5)'
                          : '0 2px 8px rgba(139,92,246,0.35)',
                        border: '2px solid',
                        borderColor: isDark ? '#334155' : 'rgba(221,214,254,0.8)',
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      <AutoAwesomeIcon sx={{ fontSize: 18, color: 'white' }} />
                    </Box>
                  </Box>
                )}

                {/* 메시지 버블 */}
                <Paper
                  elevation={1}
                  sx={{
                    p: { xs: 1.5, md: 2 },
                    maxWidth: { xs: '85%', sm: '75%', md: '70%', lg: '60%' },
                    bgcolor: msg.role === 0
                      ? colorScheme.chatUserBubbleColor
                      : colorScheme.chatAiBubbleColor,
                    color: msg.role === 0
                      ? colorScheme.userMessageTextColor
                      : colorScheme.aiMessageTextColor,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: msg.role === 0
                      ? (isDark ? 'rgba(148,163,184,0.38)' : 'rgba(148,163,184,0.24)')
                      : (isDark ? 'rgba(148,163,184,0.30)' : 'rgba(148,163,184,0.20)'),
                    boxShadow: isDark
                      ? '0 8px 20px rgba(2, 6, 23, 0.34)'
                      : '0 6px 14px rgba(15, 23, 42, 0.09)',
                    wordBreak: 'break-word',
                    userSelect: 'text !important',
                    cursor: 'text !important',
                    WebkitUserSelect: 'text !important',
                    MozUserSelect: 'text !important',
                    msUserSelect: 'text !important',
                    '& *': {
                      userSelect: 'text !important',
                      WebkitUserSelect: 'text !important',
                      MozUserSelect: 'text !important',
                      msUserSelect: 'text !important',
                    },
                  }}
                >
                  {msg.role === 1 ? (
                    <MessageRenderer
                      message={msg.message}
                      isStreaming={false}
                      archiveType={currentArchive?.archive_type}
                    />
                  ) : (
                    <>
                      {msg.attachments && msg.attachments.length > 0 && (() => {
                        const imageAttachments = msg.attachments!.filter(isImageAttachment);
                        const pdfAttachments = msg.attachments!.filter(isPdfAttachment);

                        return (
                          <Box sx={{ mb: msg.message ? 1.25 : 0 }}>
                            {imageAttachments.length > 0 && (
                              <Box
                                sx={{
                                  display: 'grid',
                                  gridTemplateColumns: imageAttachments.length === 1
                                    ? '1fr'
                                    : imageAttachments.length === 2
                                      ? 'repeat(2, minmax(0, 1fr))'
                                      : 'repeat(2, minmax(0, 1fr))',
                                  gap: 0.75,
                                  mb: pdfAttachments.length > 0 ? 0.75 : 0,
                                  maxWidth: 320,
                                }}
                              >
                                {imageAttachments.slice(0, 4).map((attachment) => (
                                  <Box
                                    key={attachment.id}
                                    sx={{
                                      position: 'relative',
                                      borderRadius: '10px',
                                      overflow: 'hidden',
                                      border: `1px solid ${isDark ? 'rgba(148,163,184,0.22)' : 'rgba(148,163,184,0.18)'}`,
                                      bgcolor: isDark ? 'rgba(30,41,59,0.62)' : 'rgba(248,250,252,0.95)',
                                      aspectRatio: imageAttachments.length === 1 ? '16 / 10' : '1 / 1',
                                    }}
                                  >
                                    {attachment.previewUrl ? (
                                      <Box
                                        component="img"
                                        src={attachment.previewUrl}
                                        alt={attachment.name}
                                        sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                      />
                                    ) : (
                                      <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <InsertDriveFileIcon sx={{ fontSize: 20, color: isDark ? '#CBD5E1' : '#475569' }} />
                                      </Box>
                                    )}
                                  </Box>
                                ))}
                              </Box>
                            )}

                            {pdfAttachments.length > 0 && (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {pdfAttachments.map((attachment) => (
                                  <Box
                                    key={attachment.id}
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.75,
                                      p: 0.9,
                                      borderRadius: '10px',
                                      border: `1px solid ${isDark ? 'rgba(148,163,184,0.22)' : 'rgba(148,163,184,0.18)'}`,
                                      bgcolor: isDark ? 'rgba(30,41,59,0.56)' : 'rgba(248,250,252,0.92)',
                                      minWidth: 0,
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: isDark ? 'rgba(239,68,68,0.14)' : 'rgba(239,68,68,0.08)',
                                        border: `1px solid ${isDark ? 'rgba(248,113,113,0.20)' : 'rgba(248,113,113,0.14)'}`,
                                        flexShrink: 0,
                                      }}
                                    >
                                      <PictureAsPdfIcon sx={{ fontSize: 16, color: isDark ? '#FCA5A5' : '#DC2626' }} />
                                    </Box>
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                      <Typography sx={{ fontSize: '12px', fontWeight: 600, lineHeight: 1.2 }} noWrap>
                                        {attachment.name}
                                      </Typography>
                                      <Typography sx={{ fontSize: '10px', color: isDark ? '#CBD5E1' : '#475569' }}>
                                        PDF · {formatFileSize(attachment.size)}
                                      </Typography>
                                    </Box>
                                  </Box>
                                ))}
                              </Box>
                            )}
                          </Box>
                        );
                      })()}

                      {msg.message && (
                        <Typography
                          variant="body1"
                          sx={{
                            userSelect: 'text !important',
                            cursor: 'text !important',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {msg.message}
                        </Typography>
                      )}
                    </>
                  )}
                </Paper>
              </Box>
            ))}

            {/* 스트리밍 중인 메시지 */}
            {isStreaming && (
              <Box sx={{ display: 'flex', mb: 3 }}>
                {/* AI 스트리밍 아바타 */}
                <Box sx={{ position: 'relative', mx: 1, flexShrink: 0 }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: '12px',
                      background: isDark
                        ? '#1E293B'
                        : 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isDark
                        ? '0 2px 8px rgba(0,0,0,0.5)'
                        : '0 2px 8px rgba(139,92,246,0.35)',
                      border: '2px solid',
                      borderColor: isDark ? '#334155' : 'rgba(221,214,254,0.8)',
                      position: 'relative',
                      zIndex: 1,
                      '@keyframes ai-pulse': {
                        '0%': { boxShadow: isDark ? '0 0 0 0 rgba(0,0,0,0.5)' : '0 0 0 0 rgba(139,92,246,0.35)' },
                        '70%': { boxShadow: isDark ? '0 0 0 8px rgba(0,0,0,0)' : '0 0 0 8px rgba(139,92,246,0)' },
                        '100%': { boxShadow: isDark ? '0 0 0 0 rgba(0,0,0,0)' : '0 0 0 0 rgba(139,92,246,0)' },
                      },
                      animation: 'ai-pulse 1.8s ease-out infinite',
                    }}
                  >
                    <AutoAwesomeIcon sx={{ fontSize: 18, color: 'white' }} />
                  </Box>
                </Box>

                <Paper
                  elevation={1}
                  sx={{
                    p: { xs: 1.5, md: 2 },
                    maxWidth: { xs: '85%', sm: '75%', md: '70%', lg: '60%' },
                    bgcolor: colorScheme.chatAiBubbleColor,
                    color: colorScheme.aiMessageTextColor,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(148,163,184,0.30)' : 'rgba(148,163,184,0.20)',
                    boxShadow: isDark
                      ? '0 8px 20px rgba(2, 6, 23, 0.34)'
                      : '0 6px 14px rgba(15, 23, 42, 0.09)',
                    wordBreak: 'break-word',
                    userSelect: 'text !important',
                    cursor: 'text !important',
                    WebkitUserSelect: 'text !important',
                    MozUserSelect: 'text !important',
                    msUserSelect: 'text !important',
                    '& *': {
                      userSelect: 'text !important',
                      WebkitUserSelect: 'text !important',
                      MozUserSelect: 'text !important',
                      msUserSelect: 'text !important',
                    },
                  }}
                >
                  {streamingMessage ? (
                    <MessageRenderer
                      message={streamingMessage}
                      isStreaming={true}
                      archiveType={currentArchive?.archive_type}
                    />
                  ) : (
                    <CircularProgress size={20} />
                  )}
                </Paper>
              </Box>
            )}

            <Box ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* 입력 영역 */}
      <Box
        sx={{
          flexShrink: 0,
          // 키보드 닫힘 시: 홈 인디케이터(iPhone) 위에 입력창이 오도록 safe-area-bottom 확보
          // 키보드 열림 시: --effective-sab = 0px (홈 인디케이터 가려지므로 여백 불필요)
          pb: isMobile ? 'var(--effective-sab)' : 0,
        }}
      >
        <ChatInputArea />
      </Box>
    </Box>
  );
}
