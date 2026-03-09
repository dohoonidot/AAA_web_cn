import {
  Box,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Check as CheckIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material';
import { useThemeStore } from '../../store/themeStore';
import { useAiModelSelectorState } from './AiModelSelector.state';

import geminiIcon from '../../assets/ai_models/gemini_icon.png';
import chatgptIcon from '../../assets/ai_models/chatgpt_icon.png';
import claudeIcon from '../../assets/ai_models/claude_icon.png';

// AI 모델 정의 (모든 아카이브 통합 반환)
const getAiModels = () => {
  return [
    {
      id: 'Gemini-Pro-3.1',
      name: 'Gemini Pro 3.1',
      icon: geminiIcon,
      description: 'Google의 최신 고성능 AI',
    },
    {
      id: 'Claude-Sonnet-4.6',
      name: 'Claude Sonnet 4.6',
      icon: claudeIcon,
      description: 'Anthropic의 안전한 AI',
    },
    {
      id: 'Gpt-5.4',
      name: 'GPT-5.4',
      icon: chatgptIcon,
      description: 'OpenAI의 최신 언어 모델',
    },
  ];
};

interface AiModelSelectorProps {
  size?: 'small' | 'medium';
}


export default function AiModelSelector({ size = 'small' }: AiModelSelectorProps) {
  const { colorScheme } = useThemeStore();
  const currentModels = getAiModels();
  const { state, actions } = useAiModelSelectorState();
  const { selectedModel, anchorEl, open } = state;
  const { handleClick, handleClose, handleSelect } = actions;
  const isDark = colorScheme.name === 'Dark';

  const currentModel = currentModels.find((m) => m.id === selectedModel) || currentModels[0];

  return (
    <>
      <Box
        component="button"
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          padding: size === 'small' ? '4px 8px' : '6px 12px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          borderRadius: 1,
          '&:hover': {
            bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          },
        }}
      >
        <Box
          component="img"
          src={currentModel.icon}
          alt={currentModel.name}
          sx={{
            width: size === 'small' ? 14 : 16,
            height: size === 'small' ? 14 : 16,
            objectFit: 'contain',
            borderRadius: '2px', // 이미지 모서리를 부드럽게
          }}
        />
        <Typography
          sx={{
            fontSize: size === 'small' ? '0.6875rem' : '0.75rem',
            color: isDark ? '#B19CD9' : '#6B46C1',
            fontWeight: 600,
          }}
        >
          {currentModel.name}
        </Typography>
        <KeyboardArrowDownIcon
          sx={{
            fontSize: size === 'small' ? '0.75rem' : '0.875rem',
            color: isDark ? '#8B5CF6' : '#6B46C1',
          }}
        />
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            mt: 0.5,
            minWidth: 250,
            bgcolor: isDark ? '#2D2D30' : '#FFFFFF',
            borderRadius: 1,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        }}
      >
        <List sx={{ py: 0.5 }}>
          {currentModels.map((model) => {
            const isSelected = selectedModel === model.id;
            return (
              <ListItem key={model.id} disablePadding>
                <ListItemButton
                  onClick={() => handleSelect(model.id)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    minHeight: 60,
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, display: 'flex', alignItems: 'center' }}>
                    <Box
                      component="img"
                      src={model.icon}
                      alt={model.name}
                      sx={{
                        width: 20,
                        height: 20,
                        objectFit: 'contain',
                        borderRadius: '4px',
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          color: isDark ? '#B19CD9' : '#000000',
                        }}
                      >
                        {model.name}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        sx={{
                          fontSize: '0.625rem',
                          color: isDark ? '#888888' : '#666666',
                          mt: 0.25,
                        }}
                      >
                        {model.description}
                      </Typography>
                    }
                  />
                  {isSelected && (
                    <CheckIcon
                      sx={{
                        fontSize: '0.75rem',
                        color: isDark ? '#8B5CF6' : '#6B46C1',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Popover>
    </>
  );
}

