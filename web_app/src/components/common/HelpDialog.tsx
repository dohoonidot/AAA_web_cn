import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useThemeStore } from '../../store/themeStore';
import { useHelpDialogState } from './HelpDialog.state';

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function HelpDialog({ open, onClose }: HelpDialogProps) {
  const { colorScheme } = useThemeStore();
  const { state, actions } = useHelpDialogState();
  const { searchQuery, expandedSection, filteredSections } = state;
  const { setSearchQuery, setExpandedSection } = actions;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '80vh',
        },
      }}
    >
      {/* 헤더 */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: colorScheme.primaryColor,
          color: 'white',
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HelpIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            도움말
          </Typography>
        </Box>

        <IconButton
          onClick={onClose}
          sx={{
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.1)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* 검색바 */}
        <Box sx={{ p: 2, pb: 1 }}>
          <TextField
            fullWidth
            placeholder="도움말 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Box>

        <Divider />

        {/* 도움말 섹션 */}
        <Box sx={{ p: 2 }}>
          {filteredSections.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                color: 'text.secondary',
              }}
            >
              <Typography>검색 결과가 없습니다.</Typography>
            </Box>
          ) : (
            filteredSections.map((section, index) => (
              <Accordion
                key={index}
                expanded={expandedSection === section.title}
                onChange={() =>
                  setExpandedSection(
                    expandedSection === section.title ? false : section.title
                  )
                }
                sx={{
                  mb: 1,
                  '&:before': {
                    display: 'none',
                  },
                  boxShadow: 1,
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    bgcolor: 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {section.icon}
                    <Typography sx={{ fontWeight: 600 }}>
                      {section.title}
                    </Typography>
                    <Chip
                      label={section.items.length}
                      size="small"
                      sx={{ height: 20, minWidth: 20 }}
                    />
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {section.items.map((item, itemIndex) => (
                      <Box key={itemIndex}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: colorScheme.primaryColor }}
                          >
                            {item.title}
                          </Typography>

                        </Box>

                        <Typography
                          variant="body2"
                          sx={{ color: 'text.secondary', fontSize: '0.85rem' }}
                        >
                          {item.description}
                        </Typography>

                        {itemIndex < section.items.length - 1 && (
                          <Divider sx={{ mt: 2 }} />
                        )}
                      </Box>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
