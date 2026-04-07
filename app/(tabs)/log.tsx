import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import DailyLogForm from '@/components/log/DailyLogForm';
import { useAuthStore } from '@/store/authStore';

export default function LogScreen() {
  const { t } = useTranslation('log');

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? 'local-user';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t('checkin_title')}</Text>
            <Text style={styles.date}>{dateString}</Text>
          </View>
          <View style={styles.timeBadge}>
            <Ionicons name="time-outline" size={14} color="#8B8BA3" />
            <Text style={styles.timeText}>{t('time_badge')}</Text>
          </View>
        </View>
        <DailyLogForm userId={userId} showNofap />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  date: {
    fontSize: 13,
    color: '#8B8BA3',
    marginTop: 2,
    fontWeight: '500',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#8B8BA3',
    fontWeight: '600',
  },
});
