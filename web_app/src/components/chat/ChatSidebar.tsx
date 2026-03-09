import React from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Divider,
  useTheme,
} from '@mui/material';
import {
  BusinessCenter as BusinessCenterIcon,
  Description as DescriptionIcon,
  BeachAccess as BeachAccessIcon,
  EmojiEvents as EmojiEventsIcon,
} from '@mui/icons-material';
import type { Archive } from '../../types';
import { useChatSidebarState } from './ChatSidebar.state';

interface ChatSidebarProps {
  isMobile: boolean;
  onMobileMenuClose?: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ isMobile, onMobileMenuClose }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { state, actions } = useChatSidebarState({ isMobile, onMobileMenuClose });
  const { archives, currentArchive } = state;
  const { handleArchiveClick, handleMenuClick } = actions;

  // 아카이브 아이콘 결정
  const getArchiveIcon = (archive: Archive) => {
    switch (archive.archive_type) {
      case 'code':
        return '💻';
      case 'sap':
        return '🔧';
      default:
        return '💼';
    }
  };

  // 아카이브 태그 결정
  const getArchiveTag = (archive: Archive) => {
    switch (archive.archive_type) {
      case 'code':
        return '코딩';
      case 'sap':
        return 'SAP';
      default:
        return archive.archive_name.includes('사내업무') ? '업무' :
               archive.archive_name.includes('AI Chatbot') ? 'AI' : null;
    }
  };

  // 아카이브 설명
  const getArchiveDescription = (archive: Archive) => {
    switch (archive.archive_type) {
      case 'code':
        return '프로그래밍, 코드 리뷰, 기술 질문';
      case 'sap':
        return 'SAP 시스템, 업무 프로세스';
      default:
        return archive.archive_name.includes('사내업무')
          ? '일반 업무, 문서 작성, 커뮤니케이션'
          : null;
    }
  };

  // 색상 스킴
  const colorScheme = {
    primaryColor: '#4A6CF7',
    sidebarTextColor: isDark ? '#FFFFFF' : '#374151',
    hintTextColor: isDark ? '#9CA3AF' : '#6B7280',
    textFieldBorderColor: isDark ? '#374151' : '#E5E7EB',
  };
  const desktopHoverItemSx = !isMobile ? {
    border: '1px solid transparent',
    transform: 'translateX(0) scale(1)',
    transformOrigin: 'left center',
    '&:hover': {
      bgcolor: isDark ? 'rgba(74, 108, 247, 0.16)' : 'rgba(74, 108, 247, 0.10)',
      borderColor: isDark ? 'rgba(129, 140, 248, 0.42)' : 'rgba(74, 108, 247, 0.28)',
      boxShadow: isDark
        ? '0 10px 18px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(129, 140, 248, 0.18)'
        : '0 8px 16px rgba(74, 108, 247, 0.10), 0 0 0 1px rgba(74, 108, 247, 0.08)',
      transform: 'translateX(4px) scale(1.01)',
      '& .chat-sidebar-item-icon': {
        color: isDark ? '#C7D2FE' : '#3157E1',
      },
      '& .chat-sidebar-item-label': {
        color: isDark ? '#EEF2FF' : '#1E3A8A',
      },
      '& .chat-sidebar-item-hint': {
        color: isDark ? '#CBD5E1' : '#475569',
      },
    },
  } : {
    '&:hover': {
      bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
      transform: 'translateX(2px)',
    },
  };

  return (
    <Box sx={{
      width: isMobile ? '100%' : 280,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: isDark ? '#1F2937' : '#FFFFFF',
      borderRight: !isMobile ? `1px solid ${colorScheme.textFieldBorderColor}` : 'none',
    }}>
      {/* 채팅 아카이브 섹션 */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: colorScheme.hintTextColor,
            fontWeight: 600,
            mb: 1.5,
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          채팅
        </Typography>

        <List sx={{ p: 0 }}>
          {archives.map((archive) => {
            const isSelected = currentArchive?.archive_id === archive.archive_id;
            const tag = getArchiveTag(archive);
            const description = getArchiveDescription(archive);

            return (
              <Box key={archive.archive_id}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => handleArchiveClick(archive)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    py: 1.5,
                    transition: 'background-color 180ms ease-out, border-color 180ms ease-out, box-shadow 220ms ease-out, transform 180ms ease-out',
                    ...desktopHoverItemSx,
                    '&.Mui-selected': {
                      bgcolor: isDark ? 'rgba(74, 108, 247, 0.15)' : '#e3f2fd',
                      borderLeft: isMobile ? 'none' : `4px solid ${colorScheme.primaryColor}`,
                      borderColor: 'transparent',
                      transition: 'background-color 180ms ease-out, border-color 180ms ease-out, box-shadow 220ms ease-out, transform 180ms ease-out',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(74, 108, 247, 0.26)' : '#cfe7ff',
                        boxShadow: isDark
                          ? '0 8px 14px rgba(0, 0, 0, 0.18)'
                          : '0 6px 12px rgba(74, 108, 247, 0.08)',
                        transform: isMobile ? 'translateX(2px)' : 'translateX(3px) scale(1.005)',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: isMobile ? 32 : 44,
                    fontSize: isMobile ? '1.2rem' : '1.5rem',
                    color: isSelected ? colorScheme.primaryColor : 'inherit',
                  }}>
                    <Box component="span" className="chat-sidebar-item-icon" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                      {getArchiveIcon(archive)}
                    </Box>
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isSelected ? 600 : 400,
                            fontSize: '0.9rem',
                            flex: 1,
                            color: isSelected ? (isDark ? '#E0E7FF' : '#1E40AF') : colorScheme.sidebarTextColor,
                          }}
                          className="chat-sidebar-item-label"
                        >
                          {archive.archive_name}
                        </Typography>
                        {tag && (
                          <Chip
                            label={tag}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                              bgcolor: `${colorScheme.primaryColor}20`,
                              color: colorScheme.primaryColor,
                            }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>

                {/* 설명 표시 */}
                {description && (
                  <Box sx={{ px: 2, pb: 0.5 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: colorScheme.hintTextColor,
                        fontSize: '0.7rem',
                        lineHeight: 1.3,
                        display: 'block',
                      }}
                      className="chat-sidebar-item-hint"
                    >
                      {description}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </List>
      </Box>

      <Divider sx={{ mx: 2, borderColor: colorScheme.textFieldBorderColor }} />

      {/* 업무 메뉴 섹션 */}
      <Box sx={{ flexShrink: 0, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <BusinessCenterIcon sx={{ fontSize: 16, color: colorScheme.primaryColor }} />
          <Typography
            variant="caption"
            sx={{
              color: 'text.primary',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            업무
          </Typography>
        </Box>

        <List sx={{ p: 0 }}>
          {/* 전자결재 메뉴 (임시 숨김) */}
          {/* <ListItemButton
            onClick={() => handleMenuClick('/approval')}
            selected={location.pathname === '/approval'}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              py: 1,
              transition: 'background-color 180ms ease-out, border-color 180ms ease-out, box-shadow 220ms ease-out, transform 180ms ease-out',
              ...desktopHoverItemSx,
              '&.Mui-selected': {
                bgcolor: isDark ? 'rgba(16, 185, 129, 0.14)' : 'rgba(16, 185, 129, 0.08)',
                border: '1px solid',
                borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(16, 185, 129, 0.22)' : 'rgba(16, 185, 129, 0.12)',
                  boxShadow: isDark
                    ? '0 8px 14px rgba(0, 0, 0, 0.16)'
                    : '0 6px 12px rgba(16, 185, 129, 0.08)',
                  transform: isMobile ? 'translateX(2px)' : 'translateX(3px) scale(1.005)',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <DescriptionIcon sx={{ fontSize: 20, color: '#6B7280' }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  전자결재
                </Typography>
              }
            />
          </ListItemButton> */}

          {/* 휴가관리 */}
          <ListItemButton
            onClick={() => handleMenuClick('/leave')}
            selected={location.pathname === '/leave'}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              py: 1,
              transition: 'background-color 180ms ease-out, border-color 180ms ease-out, box-shadow 220ms ease-out, transform 180ms ease-out',
              ...desktopHoverItemSx,
              '& .chat-sidebar-item-label': {
                color: location.pathname === '/leave' ? (isDark ? '#D1FAE5' : '#065F46') : colorScheme.sidebarTextColor,
              },
              '&:hover': {
                '& .chat-sidebar-item-icon': {
                  color: isDark ? '#6EE7B7' : '#059669',
                },
                '& .chat-sidebar-item-label': {
                  color: isDark ? '#D1FAE5' : '#065F46',
                },
              },
              '&.Mui-selected': {
                bgcolor: isDark ? 'rgba(16, 185, 129, 0.14)' : 'rgba(16, 185, 129, 0.08)',
                border: '1px solid',
                borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)',
                '& .MuiListItemIcon-root': {
                  color: isDark ? '#D1FAE5' : '#047857',
                },
                '& .chat-sidebar-item-label': {
                  color: isDark ? '#D1FAE5' : '#065F46',
                  fontWeight: 600,
                },
                '&:hover': {
                  bgcolor: isDark ? 'rgba(16, 185, 129, 0.22)' : 'rgba(16, 185, 129, 0.12)',
                  boxShadow: isDark
                    ? '0 8px 14px rgba(0, 0, 0, 0.16)'
                    : '0 6px 12px rgba(16, 185, 129, 0.08)',
                  transform: isMobile ? 'translateX(2px)' : 'translateX(3px) scale(1.005)',
                  '& .chat-sidebar-item-icon': {
                    color: isDark ? '#A7F3D0' : '#059669',
                  },
                  '& .chat-sidebar-item-label': {
                    color: isDark ? '#ECFDF5' : '#065F46',
                  },
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: '#10B981' }}>
              <BeachAccessIcon className="chat-sidebar-item-icon" sx={{ fontSize: 20, color: 'inherit' }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  className="chat-sidebar-item-label"
                  sx={{ fontSize: '0.875rem', color: colorScheme.sidebarTextColor }}
                >
                  휴가관리
                </Typography>
              }
            />
          </ListItemButton>

          {/* 사내AI 공모전 메뉴 (임시 숨김) */}
          {/* <ListItemButton
            onClick={() => handleMenuClick('/contest')}
            selected={location.pathname === '/contest'}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              py: 1,
              '&:hover': {
                bgcolor: 'action.hover',
                transform: 'translateX(2px)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <EmojiEventsIcon sx={{ fontSize: 20, color: '#F59E0B' }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  사내AI 공모전
                </Typography>
              }
            />
          </ListItemButton> */}
        </List>
      </Box>
    </Box>
  );
};

export default ChatSidebar;
