import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getCurrentPhase } from '@/lib/hormoneEngine';
import type { PersonalNotificationData } from '@/lib/personalNotificationData';
import type { SmartReminder } from '@/lib/smartReminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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

export async function scheduleDailyReminder(
  hour: number,
  minute: number
): Promise<string> {
  // Cancel existing daily reminders first
  await cancelAllScheduled();

  const content = getContextualNotificationContent(hour);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: content.title,
      body: content.body,
      sound: 'default',
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

  // Set notification for 9 AM on milestone day
  milestoneDate.setHours(9, 0, 0, 0);

  // Don't schedule if the date has already passed
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

export function getPhaseAwareNotificationContent(
  hour: number,
  personalData?: PersonalNotificationData,
): { title: string; body: string } {
  const { phase } = getCurrentPhase(hour);

  switch (phase) {
    case 'rise':
      return {
        title: 'Rise Phase',
        body: 'Your testosterone is climbing. Peak energy in about 2 hours.',
      };
    case 'peak':
      return {
        title: 'Peak Performance',
        body: 'You\'re in your peak phase. Best time for training or important decisions.',
      };
    case 'decline':
      if (personalData?.lowestEnergyDay) {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        if (today === personalData.lowestEnergyDay) {
          return {
            title: 'Energy Shift',
            body: `Your energy tends to be lower on ${today}s. Take it easy and plan lighter tasks.`,
          };
        }
      }
      return {
        title: 'Natural Slowdown',
        body: 'Energy naturally dropping. Good time for creative work or lighter tasks.',
      };
    case 'recovery':
      if (personalData?.avgSleepQuality && personalData.avgSleepQuality < 5) {
        return {
          title: 'Sleep Priority',
          body: 'Your sleep quality has been low recently. Tonight, aim for 7+ hours — your hormones need it.',
        };
      }
      return {
        title: 'Recovery Time',
        body: 'Quality sleep tonight = better testosterone tomorrow. Start winding down.',
      };
  }
}

export async function schedulePhaseNotifications(
  personalData?: PersonalNotificationData,
): Promise<string[]> {
  await cancelAllScheduled();

  const phases = [
    { hour: 6, minute: 30 },   // Rise
    { hour: 9, minute: 0 },    // Peak
    { hour: 14, minute: 0 },   // Decline
    { hour: 21, minute: 0 },   // Recovery
  ];

  const ids: string[] = [];
  for (const p of phases) {
    const content = getPhaseAwareNotificationContent(p.hour, personalData);
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: content.body,
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: p.hour,
          minute: p.minute,
        },
      });
      ids.push(id);
    } catch (e) {
      console.warn('[Notifications] Failed to schedule phase notification:', e);
    }
  }
  return ids;
}

export async function scheduleSmartReminders(
  reminders: SmartReminder[],
): Promise<string[]> {
  await cancelAllScheduled();

  const ids: string[] = [];
  for (const reminder of reminders) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.body,
          sound: 'default',
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
