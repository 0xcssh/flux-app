import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

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
