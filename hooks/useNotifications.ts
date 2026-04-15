import { useCallback, useEffect, useRef, useState } from 'react';
import {
  registerForPushNotifications,
  scheduleDailyReminder,
  cancelAllScheduled,
  scheduleMilestoneNotification,
  schedulePhaseNotifications,
  scheduleSmartReminders,
} from '@/lib/notifications';
import { MILESTONE_DAYS } from '@/types/nofap';
import { useLogStore } from '@/store/logStore';
import { computePersonalNotificationData } from '@/lib/personalNotificationData';
import { generateSmartReminders } from '@/lib/smartReminders';
import { useSubscription } from '@/hooks/useSubscription';
import { useSettingsStore } from '@/store/settingsStore';
import { formatLocalDate } from '@/lib/dateUtils';

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
      await cancelAllScheduled();
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

export function usePhaseNotifications() {
  const [isScheduled, setIsScheduled] = useState(false);
  const logs = useLogStore((s) => s.logs);
  const prevLogCountRef = useRef(0);

  useEffect(() => {
    const allLogs = Object.values(logs).sort((a, b) =>
      a.log_date.localeCompare(b.log_date)
    );
    const logCount = allLogs.length;
    const crossedThreshold =
      prevLogCountRef.current < 7 && logCount >= 7;
    const isFirstRun = prevLogCountRef.current === 0;
    prevLogCountRef.current = logCount;

    if (!isFirstRun && !crossedThreshold && isScheduled) return;

    const personalData = computePersonalNotificationData(allLogs);

    (async () => {
      try {
        const token = await registerForPushNotifications();
        if (!token) return;
        await schedulePhaseNotifications(personalData);
        setIsScheduled(true);
      } catch (e) {
        console.warn('[PhaseNotifications] Failed to schedule:', e);
      }
    })();
  }, [logs, isScheduled]);

  return { isScheduled };
}

export function useSmartReminders() {
  const [isScheduled, setIsScheduled] = useState(false);
  const logs = useLogStore((s) => s.logs);
  const { isPremium } = useSubscription();
  const smartRemindersEnabled = useSettingsStore((s) => s.smartRemindersEnabled);
  const prevLogCountRef = useRef(0);
  const prevIsPremiumRef = useRef(isPremium);

  useEffect(() => {
    if (!smartRemindersEnabled) return;

    const allLogs = Object.values(logs).sort((a, b) =>
      a.log_date.localeCompare(b.log_date)
    );
    const logCount = allLogs.length;

    const premiumChanged = prevIsPremiumRef.current !== isPremium;
    const crossedThreshold =
      prevLogCountRef.current < 7 && logCount >= 7;
    const isFirstRun = prevLogCountRef.current === 0;

    prevLogCountRef.current = logCount;
    prevIsPremiumRef.current = isPremium;

    if (!isFirstRun && !crossedThreshold && !premiumChanged && isScheduled) return;

    // Compute logging streak (consecutive days ending yesterday or today)
    let streakDays = 0;
    const today = new Date();
    const checkDate = new Date(today);
    for (let i = 0; i < 365; i++) {
      const dateStr = formatLocalDate(checkDate);
      if (logs[dateStr]) {
        streakDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // Today not logged yet, check from yesterday
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      } else {
        break;
      }
    }

    const reminders = generateSmartReminders(allLogs, streakDays, isPremium);

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
  }, [logs, isPremium, smartRemindersEnabled, isScheduled]);

  return { isScheduled };
}
