import { useSearchDialogState } from './SearchDialog.state';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import type { Archive } from '../../types';
import { useThemeStore } from '../../store/themeStore';
import { formatServerDateTime } from '../../pages/admin/AdminLeaveApproval.shared';

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
  archives: Archive[];
  onSelectArchive: (archive: Archive) => void;
  onSelectMessage: (archiveId: string, chatId: number) => void;
}

export default function SearchDialog({
  open,
  onClose,
  archives,
  onSelectArchive,
  onSelectMessage,
}: SearchDialogProps) {
  const { colorScheme } = useThemeStore();

  const { state, actions } = useSearchDialogState({
    archives,
    onClose,
    onSelectArchive,
    onSelectMessage,
  });
  const {
    searchKeyword,
    searchResults,
    isSearching,
    selectedTab,
    groupedResults,
    sortedArchiveNames,
    currentResults,
  } = state;
  const {
    setSearchKeyword,
    setSelectedTab,
    handleClose,
    handleMessageClick,
  } = actions;

  const highlightText = (text: string, keyword: string) => {
    if (!keyword.trim()) return text;

    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <Box
          key={index}
          component="span"
          sx={{
            bgcolor: ((colorScheme as any).warningColor || '#FFA726') + '40',
            fontWeight: 600,
          }}
        >
          {part}
        </Box>
      ) : (
        part
      )
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: colorScheme.backgroundColor,
          minHeight: '500px',
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SearchIcon sx={{ color: colorScheme.primaryColor }} />
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, color: colorScheme.textColor }}
          >
            대화 내용 검색
          </Typography>
          {searchResults.length > 0 && !isSearching && (
            <Chip
              label={`${searchResults.length}개 결과`}
              size="small"
              sx={{
                bgcolor: colorScheme.primaryColor + '20',
                color: colorScheme.primaryColor,
                fontWeight: 600,
              }}
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* 검색 필드 */}
        <TextField
          fullWidth
          placeholder="검색어를 입력하세요"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          autoFocus
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            endAdornment: searchKeyword && (
              <IconButton
                size="small"
                onClick={() => setSearchKeyword('')}
                sx={{ mr: -1 }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            ),
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              bgcolor: colorScheme.textFieldFillColor,
              borderRadius: 2,
            },
          }}
        />

        {/* 검색 중 표시 */}
        {isSearching && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={40} />
            <Typography sx={{ ml: 2, color: colorScheme.textColor }}>
              검색 중...
            </Typography>
          </Box>
        )}

        {/* 검색 결과 없음 */}
        {!isSearching && searchKeyword.trim() && searchResults.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography sx={{ color: colorScheme.hintTextColor }}>
              검색 결과가 없습니다.
            </Typography>
          </Box>
        )}

        {/* 검색 결과 */}
        {!isSearching && searchResults.length > 0 && (
          <Box>
            {/* 아카이브 탭 */}
            {sortedArchiveNames.length > 1 && (
              <Tabs
                value={selectedTab}
                onChange={(_, newValue) => setSelectedTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  mb: 2,
                  borderBottom: `1px solid ${colorScheme.textFieldBorderColor}`,
                }}
              >
                {sortedArchiveNames.map((name, index) => (
                  <Tab
                    key={name}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ChatIcon sx={{ fontSize: '1rem' }} />
                        <Typography variant="body2">{name}</Typography>
                        <Chip
                          label={groupedResults[name]?.length || 0}
                          size="small"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                    }
                  />
                ))}
              </Tabs>
            )}

            {/* 현재 선택된 아카이브의 결과 목록 */}
            {currentResults.length > 0 && (
              <List>
                {currentResults.map((result, index) => (
                  <Box key={`${result.chat_id}-${index}`}>
                    <ListItemButton
                      onClick={() => handleMessageClick(result)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        '&:hover': {
                          bgcolor: colorScheme.chatAiBubbleColor,
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{
                              color: colorScheme.textColor,
                              mb: 0.5,
                            }}
                          >
                            {highlightText(result.message, searchKeyword)}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            sx={{ color: colorScheme.hintTextColor }}
                          >
                            {formatServerDateTime(result.timestamp)}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                    {index < currentResults.length - 1 && (
                      <Divider sx={{ my: 0.5 }} />
                    )}
                  </Box>
                ))}
              </List>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
