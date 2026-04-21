import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import DailyLogForm from '@/components/log/DailyLogForm';
import { useAuthStore } from '@/store/authStore';
import { getTodayDate } from '@/lib/dateUtils';

export default function LogScreen() {
  const { t } = useTranslation('log');
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const routeDate = route.params?.date as string | undefined;
  const today = getTodayDate();
  const isBackfill = !!routeDate && routeDate !== today;
  const activeDate = routeDate ?? today;

  const displayDate = new Date(activeDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? 'local-user';

  const handleBackToToday = () => {
    navigation.setParams({ date: undefined });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {isBackfill && (
              <TouchableOpacity onPress={handleBackToToday} style={styles.backButton} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={18} color="#8B8BA3" />
                <Text style={styles.backText}>Today</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.title}>
              {isBackfill ? 'Log previous day' : t('checkin_title')}
            </Text>
            <Text style={styles.date}>{displayDate}</Text>
          </View>
          {!isBackfill && (
            <View style={styles.timeBadge}>
              <Ionicons name="time-outline" size={14} color="#8B8BA3" />
              <Text style={styles.timeText}>{t('time_badge')}</Text>
            </View>
          )}
        </View>
        <DailyLogForm
          key={activeDate}
          userId={userId}
          showNofap
          targetDate={isBackfill ? activeDate : undefined}
        />
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
  headerLeft: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 13,
    color: '#8B8BA3',
    fontWeight: '500',
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
