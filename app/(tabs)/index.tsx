import React, { useCallback, useMemo, useState } from 'react';
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
import { darkPalette } from '@/theme/colors';
import { useLogStore } from '@/store/logStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useCircadianPhase } from '@/hooks/useCircadianPhase';
import { useVitalityScore } from '@/hooks/useVitalityScore';
import VitalityScore from '@/components/dashboard/VitalityScore';
import IndicatorRow from '@/components/dashboard/IndicatorRow';
import CircadianPhaseCard from '@/components/dashboard/CircadianPhaseCard';
import DailyTipCard from '@/components/dashboard/DailyTipCard';
import StreakBar from '@/components/dashboard/StreakBar';
import QuickStats from '@/components/dashboard/QuickStats';
import WeeklySummary from '@/components/dashboard/WeeklySummary';
import ArticleSuggestion from '@/components/dashboard/ArticleSuggestion';

export default function DashboardScreen() {
  const { t } = useTranslation('dashboard');
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const todayLog = useLogStore((s) => s.getTodayLog());
  const todayLogged = useLogStore((s) => s.todayLogged);
  const logs = useLogStore((s) => s.logs);
  const { phase, progress, labelKey, tipKey } = useCircadianPhase();
  const vitality = useVitalityScore(todayLog);
  const nofapEnabled = useSettingsStore((s) => s.nofapEnabled);

  // Logging streak (how many consecutive days logged)
  const loggingStreak = useMemo(() => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (logs[dateStr]) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [logs]);

  // Yesterday's score for trend
  const yesterdayScore = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const dateStr = d.toISOString().split('T')[0];
    return logs[dateStr]?.vitality_score ?? null;
  }, [logs]);

  const allLogs = useMemo(() => Object.values(logs), [logs]);

  const phaseLabel = useMemo(() => {
    const labels: Record<string, string> = {
      rise: 'Rise', peak: 'Peak', decline: 'Decline', recovery: 'Recovery'
    };
    return labels[phase] ?? phase;
  }, [phase]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  }, []);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={darkPalette.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.date}>
            {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>

        {/* Vitality Score */}
        <View style={styles.scoreContainer}>
          <VitalityScore score={todayLog ? vitality.score : null} size={210} />
        </View>

        {/* Logging Streak */}
        <View style={styles.section}>
          <StreakBar days={loggingStreak} />
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <QuickStats
            phase={phase}
            phaseLabel={phaseLabel}
            yesterdayScore={yesterdayScore}
            todayScore={todayLog?.vitality_score ?? null}
          />
        </View>

        {/* Today's Metrics */}
        <View style={styles.section}>
          <IndicatorRow log={todayLog} />
        </View>

        {/* Current Phase */}
        <View style={styles.section}>
          <CircadianPhaseCard phase={phase} progress={progress} />
        </View>

        {/* Weekly Summary */}
        <View style={styles.section}>
          <WeeklySummary logs={allLogs} />
        </View>

        {/* Daily Tip */}
        <View style={styles.section}>
          <DailyTipCard tipKey={tipKey} />
        </View>

        {/* Article Suggestion */}
        <View style={styles.section}>
          <ArticleSuggestion />
        </View>

        {/* Logged badge */}
        {todayLogged && (
          <View style={styles.loggedBadge}>
            <Text style={styles.loggedText}>✅ Logged today</Text>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Floating Log Button */}
      {!todayLogged && (
        <Pressable style={styles.fab} onPress={() => router.push('/(tabs)/log' as any)}>
          <Text style={styles.fabIcon}>+</Text>
          <Text style={styles.fabLabel}>{t('log_today_cta')}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: darkPalette.background },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 32 },
  header: { marginBottom: 24 },
  greeting: { fontSize: 28, fontWeight: '800', color: darkPalette.text, letterSpacing: -0.5 },
  date: { fontSize: 14, color: darkPalette.textSecondary, marginTop: 4 },
  scoreContainer: { alignItems: 'center', marginBottom: 20 },
  section: { marginBottom: 16 },
  loggedBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    marginBottom: 16,
  },
  loggedText: { fontSize: 14, fontWeight: '600', color: darkPalette.secondary },
  fab: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: darkPalette.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: darkPalette.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  fabIcon: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  fabLabel: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
