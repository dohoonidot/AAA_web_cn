import { useEffect, useState } from 'react';
import type { TickerMessage } from './ScrollingTicker';

export const useScrollingTickerState = ({
  messages,
  onClose,
}: {
  messages: TickerMessage[];
  onClose?: (messageId: string) => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const currentMessage = messages[currentIndex];

  useEffect(() => {
    if (messages.length <= 1) return;
    if (currentMessage?.autoClose) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [messages.length, currentMessage?.autoClose]);

  useEffect(() => {
    if (!currentMessage?.autoClose) return;

    const duration = currentMessage.duration || 10000;
    const timeout = setTimeout(() => {
      handleClose(currentMessage.id);
    }, duration);

    return () => clearTimeout(timeout);
  }, [currentMessage]);

  const handleClose = (messageId: string) => {
    setIsVisible(false);
    if (onClose) {
      onClose(messageId);
    }
    setTimeout(() => {
      setIsVisible(true);
    }, 300);
  };

  return {
    state: {
      currentIndex,
      isVisible,
      currentMessage,
    },
    actions: {
      setCurrentIndex,
      setIsVisible,
      handleClose,
    },
  };
};

export type ScrollingTickerStateHook = ReturnType<typeof useScrollingTickerState>;
