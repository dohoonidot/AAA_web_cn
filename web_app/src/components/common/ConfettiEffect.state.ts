import { useEffect, useState } from 'react';

export const useConfettiEffectState = ({
  active,
  duration = 5000,
  onComplete,
}: {
  active: boolean;
  duration?: number;
  onComplete?: () => void;
}) => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (active && duration > 0) {
      const timer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration, onComplete]);

  return {
    state: {
      windowSize,
    },
  };
};

export type ConfettiEffectStateHook = ReturnType<typeof useConfettiEffectState>;

export const useConfettiState = ({ duration = 5000 }: { duration?: number }) => {
  const [active, setActive] = useState(false);

  const triggerConfetti = () => {
    setActive(true);
  };

  const handleComplete = () => {
    setActive(false);
  };

  return {
    state: {
      active,
      duration,
    },
    actions: {
      triggerConfetti,
      handleComplete,
      setActive,
    },
  };
};

export type ConfettiStateHook = ReturnType<typeof useConfettiState>;
