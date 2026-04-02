import { useEffect, useMemo, useState } from 'react';
import { getCurrentPhase, getContextualTipKey } from '@/lib/hormoneEngine';
import { PhaseType } from '@/types/log';

interface CircadianPhaseResult {
  phase: PhaseType;
  progress: number; // 0-1
  labelKey: string; // i18n key for phase name
  description: string; // i18n key for phase description
  tipKey: string; // i18n key for contextual tip
}

/**
 * Hook that returns the current circadian phase, updating every minute.
 */
export function useCircadianPhase(): CircadianPhaseResult {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60_000); // update every minute
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    const hour = now.getHours() + now.getMinutes() / 60;
    const { phase, progress, labelKey } = getCurrentPhase(hour);
    const description = `phase.description.${phase}`;
    const tipKey = getContextualTipKey(phase, hour);

    return { phase, progress, labelKey, description, tipKey };
  }, [now]);
}
