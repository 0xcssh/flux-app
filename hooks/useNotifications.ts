import { useCallback, useEffect, useRef, useState } from 'react';
import {
  registerForPushNotifications,
  scheduleDailyReminder,
  cancelAllScheduled,
  scheduleMilestoneNotification,
  schedulePhaseNotifications,
} from '@/lib/notifications';
import { MILESTONE_DAYS } from '@/types/nofap';
import { useLogStore } from '@/store/logStore';
import { computePersonalNotificationData } from '@/lib/personalNotificationData';

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
