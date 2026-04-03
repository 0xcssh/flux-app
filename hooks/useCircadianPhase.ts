import { useEffect, useMemo, useState } from 'react';
import { getCurrentPhase, getContextualTipKey } from '@/lib/hormoneEngine';
import { useSettingsStore } from '@/store/settingsStore';
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
 * Uses the hormonal profile's adjusted acrophase if available.
 */
export function useCircadianPhase(): CircadianPhaseResult {
  const [now, setNow] = useState(() => new Date());
  const hormonalProfile = useSettingsStore((s) => s.hormonalProfile);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    const hour = now.getHours() + now.getMinutes() / 60;
    const options = hormonalProfile?.adjustedAcrophase
      ? { acrophase: hormonalProfile.adjustedAcrophase }
      : undefined;
    const { phase, progress, labelKey } = getCurrentPhase(hour, options);
    const description = `phase.description.${phase}`;
    const tipKey = getContextualTipKey(phase, hour);

    return { phase, progress, labelKey, description, tipKey };
  }, [now, hormonalProfile]);
}
