import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { lightPalette } from '@/theme/colors';
import type { DailyLogEntry } from '@/types/log';

interface HistoryComparisonProps {
  todayLog: DailyLogEntry | null;
  yesterdayLog: DailyLogEntry | null;
  weekAgoLog: DailyLogEntry | null;
}

type CompareTab = 'today' | 'yesterday' | 'week';

function ScoreBar({ label, score, color }: { label: string; score: number | null; color: string }) {
  const hasScore = score != null && score > 0;

  return (
    <View style={styles.scoreBarRow}>
      <Text style={styles.scoreBarLabel}>{label}</Text>
      <View style={styles.scoreBarTrack}>
        <View
          style={[
            styles.scoreBarFill,
            {
              width: hasScore ? `${score}%` : '0%',
              backgroundColor: color,
            },
          ]}
        />
      </View>
      <Text style={styles.scoreBarValue}>
        {hasScore ? score : '-'}
      </Text>
    </View>
  );
}

export default function HistoryComparison({
  todayLog,
  yesterdayLog,
  weekAgoLog,
}: HistoryComparisonProps) {
  const { t } = useTranslation('cycle');
  const [activeTab, setActiveTab] = useState<CompareTab>('today');

  const tabs: { key: CompareTab; label: string }[] = [
    { key: 'today', label: t('common:time.today', { defaultValue: 'Today' }) },
    { key: 'yesterday', label: t('comparison.vs_yesterday') },
    { key: 'week', label: t('comparison.vs_last_week') },
  ];

  const getLog = (tab: CompareTab): DailyLogEntry | null => {
    switch (tab) {
      case 'today':
        return todayLog;
      case 'yesterday':
        return yesterdayLog;
      case 'week':
        return weekAgoLog;
    }
  };

  const todayScore = todayLog?.vitality_score ?? null;
  const compareLog = getLog(activeTab);
  const compareScore = compareLog?.vitality_score ?? null;

  const diff =
    todayScore != null && compareScore != null && activeTab !== 'today'
      ? todayScore - compareScore
      : null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        {t('comparison.title', { defaultValue: 'Comparison' })}
      </Text>

      {/* Tab buttons */}
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

      {/* Score bars */}
      <View style={styles.barsContainer}>
        <ScoreBar
          label={t('common:time.today', { defaultValue: 'Today' })}
          score={todayScore}
          color={lightPalette.primary}
        />
        {activeTab !== 'today' && (
          <ScoreBar
            label={tabs.find((tb) => tb.key === activeTab)?.label ?? ''}
            score={compareScore}
            color={lightPalette.textTertiary}
          />
        )}
      </View>

      {/* Difference indicator */}
      {diff != null && (
        <View style={styles.diffRow}>
          <Text
            style={[
              styles.diffText,
              { color: diff >= 0 ? lightPalette.success : lightPalette.error },
            ]}
          >
            {diff >= 0 ? '+' : ''}{diff} points
          </Text>
        </View>
      )}

      {!todayLog && (
        <Text style={styles.noDataText}>
          {t('not_enough_data', { defaultValue: 'Log today to see comparisons.' })}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: lightPalette.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: lightPalette.text,
    marginBottom: 12,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: lightPalette.surfaceVariant,
    borderRadius: 8,
    padding: 3,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: lightPalette.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: lightPalette.textSecondary,
  },
  tabTextActive: {
    color: lightPalette.primary,
    fontWeight: '600',
  },
  barsContainer: {
    gap: 12,
  },
  scoreBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreBarLabel: {
    width: 80,
    fontSize: 12,
    color: lightPalette.textSecondary,
    fontWeight: '500',
  },
  scoreBarTrack: {
    flex: 1,
    height: 10,
    backgroundColor: lightPalette.borderLight,
    borderRadius: 5,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  scoreBarValue: {
    width: 32,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
    color: lightPalette.text,
  },
  diffRow: {
    alignItems: 'center',
    marginTop: 12,
  },
  diffText: {
    fontSize: 16,
    fontWeight: '700',
  },
  noDataText: {
    fontSize: 13,
    color: lightPalette.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});
