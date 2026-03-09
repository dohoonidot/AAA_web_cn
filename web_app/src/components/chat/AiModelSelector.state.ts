import { useState } from 'react';
import { useChatStore } from '../../store/chatStore';

export const useAiModelSelectorState = () => {
  const selectedModel = useChatStore((s) => s.selectedModel);
  const setSelectedModel = useChatStore((s) => s.setSelectedModel);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (modelId: string) => {
    setSelectedModel(modelId);
    handleClose();
  };

  const open = Boolean(anchorEl);

  return {
    state: {
      selectedModel,
      anchorEl,
      open,
    },
    actions: {
      handleClick,
      handleClose,
      handleSelect,
    },
  };
};

export type AiModelSelectorStateHook = ReturnType<typeof useAiModelSelectorState>;
