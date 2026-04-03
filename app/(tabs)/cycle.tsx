import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';
import { useLogStore } from '@/store/logStore';
import { useCircadianPhase } from '@/hooks/useCircadianPhase';
import { detectInfradianCycle } from '@/lib/hormoneEngine';
import CircadianChart from '@/components/cycle/CircadianChart';
import InfradianChart from '@/components/cycle/InfradianChart';
import PhaseIndicator from '@/components/cycle/PhaseIndicator';
import HistoryComparison from '@/components/cycle/HistoryComparison';
import WeeklySummary from '@/components/dashboard/WeeklySummary';
import SymptomTimeline from '@/components/cycle/SymptomTimeline';
import PhaseCalendar from '@/components/cycle/PhaseCalendar';

type TabKey = 'circadian' | 'infradian';

function getDateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export default function CycleScreen() {
  const { t } = useTranslation('cycle');
  const [activeTab, setActiveTab] = useState<TabKey>('circadian');

  const { phase, progress } = useCircadianPhase();
  const logs = useLogStore((s) => s.logs);

  const todayLog = useLogStore((s) => s.getTodayLog());

  const yesterdayLog = useMemo(() => {
    const key = getDateString(1);
    return logs[key] ?? null;
  }, [logs]);

  const weekAgoLog = useMemo(() => {
    const key = getDateString(7);
    return logs[key] ?? null;
  }, [logs]);

  // Get last 30 days of logs for the infradian chart
  const last30Logs = useMemo(() => {
    const startDate = getDateString(30);
    const today = getDateString(0);
    return Object.values(logs)
      .filter((l) => l.log_date >= startDate && l.log_date <= today)
      .sort((a, b) => a.log_date.localeCompare(b.log_date));
  }, [logs]);

  // Detect cycle from vitality scores
  const detectedCycle = useMemo(() => {
    const allLogs = Object.values(logs).sort((a, b) =>
      a.log_date.localeCompare(b.log_date)
    );
    const scores = allLogs.map((l) => l.vitality_score);
    return detectInfradianCycle(scores);
  }, [logs]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'circadian', label: t('tabs.circadian') },
    { key: 'infradian', label: t('tabs.infradian') },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Tab Selector */}
      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart Area */}
      <View style={styles.section}>
        {activeTab === 'circadian' ? (
          <CircadianChart />
        ) : (
          <InfradianChart
            logs={last30Logs}
            detectedCycle={detectedCycle}
            isPremium={true}
          />
        )}
      </View>

      {/* Weekly Summary */}
      <View style={styles.section}>
        <WeeklySummary logs={last30Logs} />
      </View>

      {/* Phase Indicator */}
      <View style={styles.section}>
        <PhaseIndicator currentPhase={phase} progress={progress} />
      </View>

      {/* Symptom Timeline */}
      <View style={styles.section}>
        <SymptomTimeline />
      </View>

      {/* Phase Calendar */}
      <View style={styles.section}>
        <PhaseCalendar />
      </View>

      {/* History Comparison */}
      <View style={styles.section}>
        <HistoryComparison
          todayLog={todayLog}
          yesterdayLog={yesterdayLog}
          weekAgoLog={weekAgoLog}
        />
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: darkPalette.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: darkPalette.surfaceVariant,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: darkPalette.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: darkPalette.textSecondary,
  },
  tabTextActive: {
    color: darkPalette.primary,
    fontWeight: '700',
  },
  section: {
    marginBottom: 16,
  },
});
