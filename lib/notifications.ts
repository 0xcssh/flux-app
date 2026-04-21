import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import type { ReminderTemplate } from '@/lib/smartReminders';
import i18n from '@/i18n';

type NotifType = 'daily-reminder' | 'smart-reminder' | 'milestone';

export function initNotificationHandler(): void {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (e) {
    console.warn('[Notifications] Failed to set notification handler:', e);
  }
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-reminder', {
      name: 'Daily Reminder',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}

async function cancelByType(type: NotifType): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      const data = notif.content.data as { type?: string } | undefined;
      if (data?.type === type) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }
  } catch (e) {
    console.warn('[Notifications] Failed to cancel by type:', e);
  }
}

export async function scheduleDailyReminder(
  hour: number,
  minute: number
): Promise<string> {
  await cancelByType('daily-reminder');

  const content = getContextualNotificationContent(hour);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: content.title,
      body: content.body,
      sound: 'default',
      data: { type: 'daily-reminder' as NotifType },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  return id;
}

export async function cancelAllScheduled(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleMilestoneNotification(
  milestoneDays: number,
  streakStartDate: string
): Promise<string | null> {
  const startDate = new Date(streakStartDate + 'T00:00:00');
  const milestoneDate = new Date(startDate);
  milestoneDate.setDate(milestoneDate.getDate() + milestoneDays);
  milestoneDate.setHours(9, 0, 0, 0);

  if (milestoneDate.getTime() <= Date.now()) {
    return null;
  }

  const milestoneLabels: Record<number, string> = {
    7: '1 Week',
    14: '2 Weeks',
    30: '1 Month',
    60: '2 Months',
    90: '90 Days',
  };

  const label = milestoneLabels[milestoneDays] ?? `${milestoneDays} Days`;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Milestone Reached: ${label}!`,
      body: `Congratulations! You've maintained your streak for ${milestoneDays} days. Keep going!`,
      sound: 'default',
      data: { type: 'milestone' as NotifType, milestoneDays },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: milestoneDate,
    },
  });

  return id;
}

export function getContextualNotificationContent(hour: number): {
  title: string;
  body: string;
} {
  if (hour >= 5 && hour < 12) {
    return {
      title: 'Good Morning!',
      body: 'Log your morning energy and start your day with intention.',
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      title: 'Afternoon Check-in',
      body: 'How is your energy holding up? Take a moment to log.',
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      title: 'Evening Reflection',
      body: "How was your day? Log your metrics before winding down.",
    };
  } else {
    return {
      title: 'Daily Check-in',
      body: "Don't forget to log today's metrics. It only takes 30 seconds.",
    };
  }
}

export async function scheduleSmartReminders(
  reminders: ReminderTemplate[],
): Promise<string[]> {
  await cancelByType('smart-reminder');

  const ids: string[] = [];
  for (const reminder of reminders) {
    try {
      const title = i18n.t(
        `notifications:${reminder.templateKey}.title`,
        reminder.params,
      );
      const body = i18n.t(
        `notifications:${reminder.templateKey}.body`,
        reminder.params,
      );

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          data: { type: 'smart-reminder' as NotifType, templateKey: reminder.templateKey },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: reminder.hour,
          minute: reminder.minute,
        },
      });
      ids.push(id);
    } catch (e) {
      console.warn('[Notifications] Failed to schedule smart reminder:', e);
    }
  }
  return ids;
}
