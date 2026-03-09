import { useEffect, useRef, useState } from 'react';
import { fetchVacationRecommendation } from '../../services/vacationRecommendationService';
import type { VacationRecommendationResponse } from '../../types/leave';

export const useVacationRecommendationState = ({
  open,
  userId,
  year,
}: {
  open: boolean;
  userId: string;
  year: number;
}) => {
  const [state, setState] = useState<VacationRecommendationResponse>({
    reasoningContents: '',
    finalResponseContents: '',
    recommendedDates: [],
    monthlyDistribution: {},
    consecutivePeriods: [],
    isComplete: false,
    streamingProgress: 0,
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [targetProgress, setTargetProgress] = useState(0);
  const progressTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    progressTimerRef.current = window.setInterval(() => {
      setAnimatedProgress((prev) => {
        if (prev < targetProgress) {
          return Math.min(targetProgress, prev + 0.01);
        }
        if (prev > targetProgress) {
          return targetProgress;
        }
        return prev;
      });
    }, 500);

    return () => {
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, [open, targetProgress]);

  useEffect(() => {
    if (!open || !userId) return;
    startRecommendation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId, year]);

  useEffect(() => {
    if (state.isComplete) {
      setTargetProgress(1.0);
      return;
    }
    if (isLoading) {
      setTargetProgress(0.3);
      return;
    }
    setTargetProgress(state.streamingProgress || 0.0);
  }, [state.isComplete, state.streamingProgress, isLoading]);

  const startRecommendation = async () => {
    setError(null);
    setIsLoading(true);
    setAnimatedProgress(0);
    setTargetProgress(0);
    setState({
      reasoningContents: '',
      finalResponseContents: '',
      recommendedDates: [],
      monthlyDistribution: {},
      consecutivePeriods: [],
      isComplete: false,
      streamingProgress: 0,
    });

    try {
      const generator = fetchVacationRecommendation(userId, year);
      for await (const update of generator) {
        setIsLoading(false);
        setState(update);
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || '추천 데이터를 가져오는 중 에러가 발생했습니다.');
    }
  };

  return {
    state: {
      state,
      error,
      isLoading,
      animatedProgress,
      targetProgress,
    },
    actions: {
      setError,
      setIsLoading,
      setAnimatedProgress,
      setTargetProgress,
      setState,
      startRecommendation,
    },
  };
};

export type VacationRecommendationStateHook = ReturnType<typeof useVacationRecommendationState>;
