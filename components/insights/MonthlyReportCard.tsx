import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';
import { useLogStore } from '@/store/logStore';
import type { InsightData } from '@/types/insight';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getScoreColor(score: number): string {
  if (score >= 80) return darkPalette.secondary;
  if (score >= 60) return darkPalette.primary;
  if (score >= 40) return darkPalette.accent;
  return darkPalette.error;
}

interface MonthlyReportCardProps {
  deepInsights?: InsightData;
}

export default function MonthlyReportCard({ deepInsights }: MonthlyReportCardProps) {
  const { t } = useTranslation('insights');
  const logs = useLogStore((s) => s.logs);

  const report = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Current month logs
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const currentMonthLogs = Object.values(logs)
      .filter((l) => l.log_date.startsWith(monthPrefix))
      .sort((a, b) => a.log_date.localeCompare(b.log_date));

    if (currentMonthLogs.length === 0) return null;

    const scores = currentMonthLogs.map((l) => l.vitality_score);
    const avgScore = Math.round(
      scores.reduce((s, v) => s + v, 0) / scores.length,
    );

    const bestLog = currentMonthLogs.reduce((a, b) =>
      a.vitality_score > b.vitality_score ? a : b,
    );
    const worstLog = currentMonthLogs.reduce((a, b) =>
      a.vitality_score < b.vitality_score ? a : b,
    );

    // Previous month comparison
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevPrefix = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}`;
    const prevMonthLogs = Object.values(logs).filter((l) =>
      l.log_date.startsWith(prevPrefix),
    );
    let trend: number | null = null;
    if (prevMonthLogs.length > 0) {
      const prevAvg = Math.round(
        prevMonthLogs.reduce((s, l) => s + l.vitality_score, 0) /
          prevMonthLogs.length,
      );
      trend = avgScore - prevAvg;
    }

    // Top pattern from deep insights
    let topPattern: string | null = null;
    if (deepInsights && deepInsights.patterns.length > 0) {
      const p = deepInsights.patterns[0];
      const metric = p.metric.replace(/_/g, ' ');
      topPattern = `${metric} ${p.type.replace(/_/g, ' ')}`;
    }

    return {
      monthName: MONTH_NAMES[currentMonth],
      year: currentYear,
      avgScore,
      bestDay: {
        date: bestLog.log_date.split('-').slice(1).join('/'),
        score: bestLog.vitality_score,
      },
      worstDay: {
        date: worstLog.log_date.split('-').slice(1).join('/'),
        score: worstLog.vitality_score,
      },
      daysLogged: currentMonthLogs.length,
      daysInMonth,
      trend,
      topPattern,
    };
  }, [logs, deepInsights]);

  if (!report) {
    return null;
  }

  const scoreColor = getScoreColor(report.avgScore);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.monthName}>{report.monthName}</Text>
        <Text style={styles.year}>{report.year}</Text>
      </View>

      <View style={styles.mainScore}>
        <Text style={[styles.avgScore, { color: scoreColor }]}>
          {report.avgScore}
        </Text>
        <Text style={styles.avgLabel}>avg vitality</Text>
        {report.trend !== null && (
          <View style={styles.trendRow}>
            <Ionicons
              name={report.trend >= 0 ? 'trending-up' : 'trending-down'}
              size={16}
              color={report.trend >= 0 ? darkPalette.secondary : darkPalette.error}
            />
            <Text
              style={[
                styles.trendText,
                {
                  color:
                    report.trend >= 0
                      ? darkPalette.secondary
                      : darkPalette.error,
                },
              ]}
            >
              {report.trend >= 0 ? '+' : ''}
              {report.trend} {t('vs_last_month')}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>{t('best_day')}</Text>
          <Text style={styles.gridValue}>{report.bestDay.date}</Text>
          <Text style={[styles.gridScore, { color: darkPalette.secondary }]}>
            {report.bestDay.score}
          </Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>{t('worst_day')}</Text>
          <Text style={styles.gridValue}>{report.worstDay.date}</Text>
          <Text style={[styles.gridScore, { color: darkPalette.error }]}>
            {report.worstDay.score}
          </Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>{t('days_logged_month')}</Text>
          <Text style={styles.gridValue}>
            {report.daysLogged}/{report.daysInMonth}
          </Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>{t('top_pattern')}</Text>
          <Text style={styles.gridValue} numberOfLines={2}>
            {report.topPattern || 'Logging...'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: darkPalette.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: darkPalette.primary + '40',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 16,
  },
  monthName: {
    fontSize: 22,
    fontWeight: '800',
    color: darkPalette.text,
    letterSpacing: -0.5,
  },
  year: {
    fontSize: 16,
    fontWeight: '600',
    color: darkPalette.textTertiary,
  },
  mainScore: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avgScore: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -2,
  },
  avgLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: darkPalette.textSecondary,
    marginTop: -4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  trendText: {
    fontSize: 13,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    width: '47%',
    backgroundColor: darkPalette.surfaceElevated,
    borderRadius: 12,
    padding: 12,
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: darkPalette.textTertiary,
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 14,
    fontWeight: '700',
    color: darkPalette.text,
  },
  gridScore: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
});
