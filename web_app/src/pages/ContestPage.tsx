import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  EmojiEvents as EmojiEventsIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  ThumbUp as ThumbUpIcon,
  Visibility as VisibilityIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useContestPageState } from './ContestPage.state';

export default function ContestPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { state, actions } = useContestPageState();
  const {
    loading,
    listLoading,
    error,
    success,
    viewType,
    category,
    contestList,
    remainingVotes,
    userInfo,
    selectedFiles,
    filePreviews,
    formData,
    departments,
  } = state;
  const {
    setViewType,
    setCategory,
    setFormData,
    setError,
    setSuccess,
    setSelectedFiles,
    setFilePreviews,
    handleFileSelect,
    handleFileRemove,
    handleVote,
    handleSubmit,
  } = actions;

  return (
    <Box sx={{ minHeight: { xs: 'var(--app-height)', md: '100vh' }, bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        {/* 헤더 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/chat')}
            sx={{ mr: { xs: 0, md: 2 } }}
          >
            뒤로
          </Button>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'warning.light',
              color: 'warning.contrastText',
              mr: 2,
            }}
          >
            <EmojiEventsIcon sx={{ fontSize: 32 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant={isMobile ? 'h5' : 'h4'} component="h1" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
              사내AI 공모전
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI 아이디어를 제안하고 공유하세요
              {userInfo && ` | ${userInfo.name} (${userInfo.department})`}
              {remainingVotes > 0 && ` | 남은 투표: ${remainingVotes}개`}
            </Typography>
          </Box>
        </Box>

        {/* 정렬 및 필터 */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>정렬</InputLabel>
            <Select
              value={viewType}
              label="정렬"
              onChange={(e) => setViewType(e.target.value as any)}
            >
              <MenuItem value="random">랜덤</MenuItem>
              <MenuItem value="view_count">조회수</MenuItem>
              <MenuItem value="votes">투표수</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<EmojiEventsIcon />}
            onClick={() => {
              // 신청서 작성 모달 열기 (간단하게 폼 표시)
              setFormData({ title: '', content: '' });
              setSelectedFiles([]);
              setFilePreviews([]);
              setSuccess(false);
              setError(null);
            }}
            sx={{
              bgcolor: 'warning.main',
              '&:hover': { bgcolor: 'warning.dark' },
            }}
          >
            신청하기
          </Button>
        </Box>

        {/* 성공/에러 메시지 */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(false)}>
            신청서가 성공적으로 제출되었습니다!
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 공모전 목록 */}
        {listLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : contestList.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <EmojiEventsIcon sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              등록된 공모전이 없습니다.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {contestList.map((contest: any) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={contest.contest_id || contest.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {contest.attachment_urls && contest.attachment_urls.length > 0 && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={contest.attachment_urls[0]}
                      alt={contest.title}
                      sx={{ objectFit: 'cover' }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom noWrap>
                      {contest.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip
                        icon={<VisibilityIcon />}
                        label={contest.view_count || 0}
                        size="small"
                      />
                      <Chip
                        icon={<ThumbUpIcon />}
                        label={contest.votes || contest.like_count || 0}
                        size="small"
                        color={contest.is_liked ? 'primary' : 'default'}
                      />
                      <Chip
                        icon={<CommentIcon />}
                        label={contest.comments?.length || 0}
                        size="small"
                      />
                    </Box>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ThumbUpIcon />}
                      onClick={() => handleVote(contest.contest_id || contest.id, contest.is_liked)}
                      disabled={remainingVotes === 0 && !contest.is_liked}
                    >
                      {contest.is_liked ? '투표 취소' : '투표하기'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* 신청서 작성 폼 (모달 대신 인라인) */}
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            공모전 신청서 작성
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="제목"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              fullWidth
            />

            <TextField
              label="내용"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              required
              multiline
              rows={10}
              fullWidth
              placeholder="AI 아이디어를 상세히 설명해주세요..."
            />

            {/* 이미지 업로드 */}
            <Box>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileSelect}
              />
              <label htmlFor="file-upload">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<AddPhotoAlternateIcon />}
                  fullWidth
                >
                  이미지 추가
                </Button>
              </label>
              {filePreviews.length > 0 && (
                <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                  {filePreviews.map((preview, index) => (
                    <Box key={index} sx={{ position: 'relative', width: 100, height: 100 }}>
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleFileRemove(index)}
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          bgcolor: 'error.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'error.dark' },
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setFormData({ title: '', content: '' });
                  setSelectedFiles([]);
                  setFilePreviews([]);
                }}
                disabled={loading}
              >
                초기화
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <EmojiEventsIcon />}
                sx={{
                  bgcolor: 'warning.main',
                  '&:hover': {
                    bgcolor: 'warning.dark',
                  },
                }}
              >
                {loading ? '제출 중...' : '제출하기'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
