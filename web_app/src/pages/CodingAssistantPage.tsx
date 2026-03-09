import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Chip,
} from '@mui/material';
import {
  Code as CodeIcon,
} from '@mui/icons-material';
import MobileMainLayout from '../components/layout/MobileMainLayout';
import ChatAreaBase from '../components/chat/ChatArea';
const ChatArea = ChatAreaBase as any;
import { useCodingAssistantPageState } from './CodingAssistantPage.state';

export default function CodingAssistantPage() {
  const { state, actions } = useCodingAssistantPageState();
  const { currentArchive, loading, error, aiModel } = state;
  const { setAiModel, handleSendMessage } = actions;

  return (
    <MobileMainLayout>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 코딩 어시스턴트 설정 영역 - AI 모델 선택 */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* AI 모델 선택 - 왼쪽에 위치 */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>AI 모델</InputLabel>
              <Select
                value={aiModel}
                label="AI 모델"
                onChange={(e) => setAiModel(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="gemini-flash-2.5">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="⚡" size="small" sx={{ bgcolor: '#4285F4', color: 'white', fontSize: '0.7rem' }} />
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>Gemini Flash 2.5</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="gpt-5">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="🚀" size="small" sx={{ bgcolor: '#10A37F', color: 'white', fontSize: '0.7rem' }} />
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>GPT-5</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="claude-sonnet-4">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="🧠" size="small" sx={{ bgcolor: '#FF6B35', color: 'white', fontSize: '0.7rem' }} />
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>Claude Sonnet 4</Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {/* 오른쪽 빈공간 */}
            <Box sx={{ flex: 1 }} />
          </Box>
        </Box>

        {/* 채팅 영역 - 더 큰 공간 */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <ChatArea
            currentArchive={currentArchive}
            onSendMessage={handleSendMessage}
            showAiModelSelection={false}
            aiModel={aiModel}
            onAiModelChange={setAiModel}
            loading={loading}
            error={error}
          />
        </Box>
      </Box>
    </MobileMainLayout>
  );
}
