import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import contestService from '../services/contestService';

export const useContestPageState = () => {
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [viewType, setViewType] = useState<'random' | 'view_count' | 'votes'>('random');
  const [category, setCategory] = useState('');
  const [contestList, setContestList] = useState<any[]>([]);
  const [remainingVotes, setRemainingVotes] = useState(0);
  const [userInfo, setUserInfo] = useState<{ name: string; department: string; job_position: string } | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  const departments = [
    '경영관리실',
    'New Tech사업부',
    '솔루션사업부',
    'FCM사업부',
    'SCM사업부',
    'Innovation Center',
    'Biz AI사업부',
    'HRS사업부',
    'DTE본부',
    'PUBLIC CLOUD사업부',
    'ITS사업부',
    'BAC사업부',
    'NGE본부',
    'BDS사업부',
    '남부지사',
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadContestList();
  }, [viewType, category]);

  const loadInitialData = async () => {
    try {
      const [votes, info] = await Promise.all([
        contestService.getRemainingVotes(),
        contestService.getUserInfo().catch(() => null),
      ]);
      setRemainingVotes(votes);
      if (info) {
        setUserInfo(info);
      }
    } catch (error) {
      console.error('초기 데이터 로드 실패:', error);
    }
  };

  const loadContestList = async () => {
    try {
      setListLoading(true);
      const data = await contestService.getContestList({ viewType, category });
      setContestList(data?.documents || []);
    } catch (error: any) {
      console.error('공모전 목록 로드 실패:', error);
      setError(error.message || '공모전 목록을 불러오는데 실패했습니다.');
    } finally {
      setListLoading(false);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    const newFiles = [...selectedFiles, ...imageFiles];
    setSelectedFiles(newFiles);

    const newPreviews = [...filePreviews];
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        newPreviews.push(event.target?.result as string);
        setFilePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileRemove = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = filePreviews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setFilePreviews(newPreviews);
  };

  const handleVote = async (documentId: number, isLiked: boolean) => {
    try {
      await contestService.voteContest({
        documentId,
        action: isLiked ? 'unlike' : 'like',
      });
      await loadContestList();
      await loadInitialData();
    } catch (error: any) {
      setError(error.message || '투표에 실패했습니다.');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.title || !formData.content) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const message = `제목: ${formData.title}\n\n내용:\n${formData.content}`;

      await contestService.submitContest({
        message,
        files: selectedFiles,
        fileNames: selectedFiles.map(f => f.name),
      });

      setSuccess(true);
      setFormData({
        title: '',
        content: '',
      });
      setSelectedFiles([]);
      setFilePreviews([]);
      await loadContestList();
      await loadInitialData();
    } catch (err: any) {
      setError(err.message || '신청서 제출에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return {
    state: {
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
    },
    actions: {
      setLoading,
      setListLoading,
      setError,
      setSuccess,
      setViewType,
      setCategory,
      setContestList,
      setRemainingVotes,
      setUserInfo,
      setSelectedFiles,
      setFilePreviews,
      setFormData,
      loadInitialData,
      loadContestList,
      handleFileSelect,
      handleFileRemove,
      handleVote,
      handleSubmit,
    },
  };
};

export type ContestPageStateHook = ReturnType<typeof useContestPageState>;
