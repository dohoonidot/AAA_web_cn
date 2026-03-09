import { useMemo, useState } from 'react';
import dayjs from 'dayjs';

export const useVacationCalendarGridState = ({
  recommendedDates,
}: {
  recommendedDates: string[];
}) => {
  const initialYear = recommendedDates.length > 0
    ? dayjs(recommendedDates[0]).year()
    : dayjs().year();
  const [displayYear, setDisplayYear] = useState(initialYear);
  const [displayMonth, setDisplayMonth] = useState(0);

  const recommendedSet = useMemo(() => new Set(recommendedDates), [recommendedDates]);

  const handlePrev = () => {
    setDisplayMonth((prev) => {
      if (prev === 0) {
        setDisplayYear((year) => year - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNext = () => {
    setDisplayMonth((prev) => {
      if (prev === 11) {
        setDisplayYear((year) => year + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  return {
    state: {
      displayYear,
      displayMonth,
      recommendedSet,
    },
    actions: {
      handlePrev,
      handleNext,
      setDisplayYear,
      setDisplayMonth,
    },
  };
};

export type VacationCalendarGridStateHook = ReturnType<typeof useVacationCalendarGridState>;
