import { useCallback, useState } from 'react';
import { canShowReviewPrompt, recordPromptShown } from '@/lib/reviewPrompt';

export function useReviewPrompt() {
  const [visible, setVisible] = useState(false);

  const trigger = useCallback((): boolean => {
    if (!canShowReviewPrompt()) return false;
    recordPromptShown();
    setVisible(true);
    return true;
  }, []);

  const close = useCallback(() => {
    setVisible(false);
  }, []);

  return { visible, trigger, close };
}
