import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { lightPalette } from '@/theme/colors';
import { useLogStore } from '@/store/logStore';
import { useNoFapStore } from '@/store/nofapStore';
import { useCircadianPhase } from '@/hooks/useCircadianPhase';
import { useVitalityScore } from '@/hooks/useVitalityScore';
import VitalityScore from '@/components/dashboard/VitalityScore';
import IndicatorRow from '@/components/dashboard/IndicatorRow';
import CircadianPhaseCard from '@/components/dashboard/CircadianPhaseCard';
import DailyTipCard from '@/components/dashboard/DailyTipCard';

export default function DashboardScreen() {
  const { t } = useTranslation('dashboard');
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const todayLog = useLogStore((s) => s.getTodayLog());
  const todayLogged = useLogStore((s) => s.todayLogged);
  const { phase, progress, tipKey } = useCircadianPhase();
  const vitality = useVitalityScore(todayLog);
  const streakDays = useNoFapStore((s) => s.getStreakDays());
  const hasStreak = useNoFapStore((s) => s.currentStreak != null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Allow stores to re-evaluate
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  }, []);

  const handleLogPress = useCallback(() => {
    router.push('/(tabs)/log' as any);
  }, [router]);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={lightPalette.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Flux</Text>
          <Text style={styles.headerSubtitle}>
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Vitality Score */}
        <View style={styles.scoreContainer}>
          <VitalityScore
            score={todayLog ? vitality.score : null}
            size={200}
          />
          {todayLog && (
            <Text style={[styles.scoreLabel, { color: vitality.color }]}>
              {t('score_label')}
            </Text>
          )}
        </View>

        {/* Today's Metrics */}
        <View style={styles.section}>
          <IndicatorRow log={todayLog} />
        </View>

        {/* Current Phase */}
        <View style={styles.section}>
          <CircadianPhaseCard phase={phase} progress={progress} />
        </View>

        {/* Daily Tip */}
        <View style={styles.section}>
          <DailyTipCard tipKey={tipKey} />
        </View>

        {/* NoFap Streak Card */}
        {hasStreak && (
          <Pressable
            style={styles.streakCard}
            onPress={() => router.push('/(tabs)/profile' as any)}
          >
            <View style={styles.streakHeader}>
              <Text style={styles.streakIcon}>{'\uD83D\uDD25'}</Text>
              <Text style={styles.streakTitle}>{t('streak')}</Text>
            </View>
            <Text style={styles.streakDays}>
              {t('streak_days', { count: streakDays })}
            </Text>
          </Pressable>
        )}

        {/* Logged status */}
        {todayLogged && (
          <View style={styles.loggedBadge}>
            <Text style={styles.loggedIcon}>{'\u2705'}</Text>
            <Text style={styles.loggedText}>{t('logged_today')}</Text>
          </View>
        )}

        {/* Spacer for FAB */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Floating Action Button */}
      {!todayLogged && (
        <Pressable style={styles.fab} onPress={handleLogPress}>
          <Text style={styles.fabIcon}>+</Text>
          <Text style={styles.fabLabel}>{t('log_today_cta')}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: lightPalette.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: lightPalette.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: lightPalette.textSecondary,
    marginTop: 4,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  section: {
    marginBottom: 16,
  },
  streakCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  streakIcon: {
    fontSize: 20,
  },
  streakTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: lightPalette.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  streakDays: {
    fontSize: 22,
    fontWeight: '700',
    color: '#B45309',
    marginLeft: 28,
  },
  loggedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: lightPalette.successLight,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  loggedIcon: {
    fontSize: 16,
  },
  loggedText: {
    fontSize: 14,
    fontWeight: '600',
    color: lightPalette.secondaryDark,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: lightPalette.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: lightPalette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fabLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
