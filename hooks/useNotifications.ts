import { useCallback, useEffect, useRef, useState } from 'react';
import {
  registerForPushNotifications,
  scheduleDailyReminder,
  cancelAllScheduled,
  scheduleMilestoneNotification,
  scheduleSmartReminders,
} from '@/lib/notifications';
import { MILESTONE_DAYS } from '@/types/nofap';
import { useLogStore } from '@/store/logStore';
import { generateSmartReminders } from '@/lib/smartReminders';
import { useSubscription } from '@/hooks/useSubscription';
import { useSettingsStore } from '@/store/settingsStore';
import { useNoFapStore } from '@/store/nofapStore';
import { formatLocalDate } from '@/lib/dateUtils';
import i18n from '@/i18n';

export function useNotifications() {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestPermission = useCallback(async () => {
    const token = await registerForPushNotifications();
    if (token) {
      setPushToken(token);
      setPermissionGranted(true);
    }
    return !!token;
  }, []);

  const scheduleReminder = useCallback(
    async (hour: number, minute: number) => {
      if (!permissionGranted) {
        const granted = await requestPermission();
        if (!granted) return null;
      }
      return scheduleDailyReminder(hour, minute);
    },
    [permissionGranted, requestPermission]
  );

  const rescheduleReminder = useCallback(
    async (hour: number, minute: number) => {
      return scheduleReminder(hour, minute);
    },
    [scheduleReminder]
  );

  const scheduleMilestoneNotifications = useCallback(
    async (streakStartDate: string) => {
      if (!permissionGranted) {
        const granted = await requestPermission();
        if (!granted) return;
      }

      for (const days of MILESTONE_DAYS) {
        await scheduleMilestoneNotification(days, streakStartDate);
      }
    },
    [permissionGranted, requestPermission]
  );

  const cancelAll = useCallback(async () => {
    await cancelAllScheduled();
  }, []);

  return {
    pushToken,
    permissionGranted,
    requestPermission,
    scheduleReminder,
    rescheduleReminder,
    scheduleMilestoneNotifications,
    cancelAll,
  };
}

export function useSmartReminders() {
  const [isScheduled, setIsScheduled] = useState(false);
  const logs = useLogStore((s) => s.logs);
  const { isPremium } = useSubscription();
  const smartRemindersEnabled = useSettingsStore((s) => s.smartRemindersEnabled);
  const hormonalProfile = useSettingsStore((s) => s.hormonalProfile);
  const nofapStreakDays = useNoFapStore((s) => s.getStreakDays());
  const prevLogCountRef = useRef(0);
  const prevIsPremiumRef = useRef(isPremium);
  const prevNofapStreakRef = useRef(nofapStreakDays);
  const prevWakeUpHourRef = useRef<number | null>(null);
  const prevLanguageTickRef = useRef(0);
  const [languageTick, setLanguageTick] = useState(0);

  useEffect(() => {
    const onLanguageChanged = () => {
      setLanguageTick((t) => t + 1);
    };
    i18n.on('languageChanged', onLanguageChanged);
    return () => {
      i18n.off('languageChanged', onLanguageChanged);
    };
  }, []);

  useEffect(() => {
    if (!smartRemindersEnabled || !isPremium) return;

    const wakeUpHour = hormonalProfile?.wakeUpHour ?? 7;

    const allLogs = Object.values(logs).sort((a, b) =>
      a.log_date.localeCompare(b.log_date)
    );
    const logCount = allLogs.length;

    const premiumChanged = prevIsPremiumRef.current !== isPremium;
    const crossedThreshold =
      prevLogCountRef.current < 7 && logCount >= 7;
    const nofapChanged = prevNofapStreakRef.current !== nofapStreakDays;
    const wakeUpChanged = prevWakeUpHourRef.current !== wakeUpHour;
    const languageChanged = prevLanguageTickRef.current !== languageTick;
    const isFirstRun = prevLogCountRef.current === 0 && prevWakeUpHourRef.current === null;

    prevLogCountRef.current = logCount;
    prevIsPremiumRef.current = isPremium;
    prevNofapStreakRef.current = nofapStreakDays;
    prevWakeUpHourRef.current = wakeUpHour;
    prevLanguageTickRef.current = languageTick;

    const shouldReschedule =
      isFirstRun ||
      crossedThreshold ||
      premiumChanged ||
      nofapChanged ||
      wakeUpChanged ||
      languageChanged ||
      !isScheduled;

    if (!shouldReschedule) return;

    let streakDays = 0;
    const today = new Date();
    const checkDate = new Date(today);
    for (let i = 0; i < 365; i++) {
      const dateStr = formatLocalDate(checkDate);
      if (logs[dateStr]) {
        streakDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      } else {
        break;
      }
    }

    const reminders = generateSmartReminders({
      logs: allLogs,
      streakDays,
      nofapStreakDays,
      wakeUpHour,
      isPremium,
    });

    (async () => {
      try {
        const token = await registerForPushNotifications();
        if (!token) return;
        await scheduleSmartReminders(reminders);
        setIsScheduled(true);
      } catch (e) {
        console.warn('[SmartReminders] Failed to schedule:', e);
      }
    })();
  }, [logs, isPremium, smartRemindersEnabled, isScheduled, hormonalProfile, nofapStreakDays, languageTick]);

  return { isScheduled };
}
