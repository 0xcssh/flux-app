import { useCallback, useEffect, useState } from 'react';
import {
  registerForPushNotifications,
  scheduleDailyReminder,
  cancelAllScheduled,
  scheduleMilestoneNotification,
} from '@/lib/notifications';
import { MILESTONE_DAYS } from '@/types/nofap';

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
