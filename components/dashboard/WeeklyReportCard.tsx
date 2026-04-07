import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';
import { useSubscription } from '@/hooks/useSubscription';
import { useLogStore } from '@/store/logStore';
import { generateWeeklyReport } from '@/lib/weeklyReport';
import type { WeeklyReport } from '@/lib/weeklyReport';

export default function WeeklyReportCard() {
  const { t } = useTranslation('dashboard');
  const navigation = useNavigation<any>();
  const { canAccess } = useSubscription();
  const logs = useLogStore((s) => s.logs);
  const [dismissed, setDismissed] = useState(false);

  const hasPremium = canAccess('action_plan');

  const report: WeeklyReport | null = useMemo(() => {
    const allLogs = Object.values(logs);
    return generateWeeklyReport(allLogs);
  }, [logs]);

  if (!report || dismissed) {
    return null;
  }

  // Format date range for display
  const formatRange = (start: string, end: string) => {
    const s = new Date(start + 'T12:00:00');
    const e = new Date(end + 'T12:00:00');
    const sMonth = s.toLocaleDateString('en-US', { month: 'short' });
    const eMonth = e.toLocaleDateString('en-US', { month: 'short' });
    if (sMonth === eMonth) {
      return `${sMonth} ${s.getDate()} - ${e.getDate()}`;
    }
    return `${sMonth} ${s.getDate()} - ${eMonth} ${e.getDate()}`;
  };

  const dateRange = formatRange(report.weekStartDate, report.weekEndDate);

  const getScoreColor = (score: number) => {
    if (score >= 70) return darkPalette.secondary;
    if (score >= 40) return darkPalette.accent;
    return darkPalette.error;
  };

  if (!hasPremium) {
    // Free user teaser
    return (
      <View style={styles.card}>
        {/* Blurred content */}
        <View style={styles.blurredContent}>
          <View style={styles.header}>
            <Text style={[styles.title, { opacity: 0.15 }]}>
              {t('weekly_report_title')}
            </Text>
            <Text style={[styles.dateRange, { opacity: 0.15 }]}>{dateRange}</Text>
          </View>
          <View style={{ opacity: 0.15 }}>
            <Text style={styles.scoreText}>72</Text>
            <View style={styles.blurredBar} />
            <View style={styles.blurredBarShort} />
            <View style={styles.blurredBar} />
          </View>
        </View>

        {/* Lock overlay */}
        <View style={styles.lockOverlay}>
          <Ionicons name="lock-closed" size={24} color={darkPalette.textTertiary} />
          <Text style={styles.lockText}>{t('weekly_report_ready')}</Text>
          <Pressable
            style={styles.unlockButton}
            onPress={() => navigation.navigate('Paywall')}
          >
            <Text style={styles.unlockButtonText}>
              {t('weekly_report_unlock')}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Premium user full report
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('weekly_report_title')}</Text>
        <Text style={styles.dateRange}>{dateRange}</Text>
      </View>

      {/* Score + Trend */}
      <View style={styles.scoreRow}>
        <Text style={[styles.scoreText, { color: getScoreColor(report.avgScore) }]}>
          {report.avgScore}
        </Text>
        <Text style={styles.scoreLabel}>avg vitality</Text>
        {report.prevWeekAvgScore !== null && report.trend !== 0 && (
          <View style={styles.trendBadge}>
            <Ionicons
              name={report.trend > 0 ? 'trending-up' : 'trending-down'}
              size={14}
              color={report.trend > 0 ? darkPalette.secondary : darkPalette.error}
            />
            <Text
              style={[
                styles.trendText,
                { color: report.trend > 0 ? darkPalette.secondary : darkPalette.error },
              ]}
            >
              {report.trend > 0
                ? t('weekly_report_trend_up', { percent: report.trend })
                : t('weekly_report_trend_down', { percent: report.trend })}
            </Text>
          </View>
        )}
      </View>

      {/* Best / Worst Day */}
      <View style={styles.daysRow}>
        {report.bestDay && (
          <View style={styles.dayItem}>
            <Ionicons name="arrow-up-circle" size={16} color={darkPalette.secondary} />
            <Text style={styles.dayLabel}>{t('weekly_report_best')}</Text>
            <Text style={styles.dayValue}>
              {report.bestDay.dayName} ({report.bestDay.score})
            </Text>
          </View>
        )}
        {report.worstDay && (
          <View style={styles.dayItem}>
            <Ionicons name="arrow-down-circle" size={16} color={darkPalette.error} />
            <Text style={styles.dayLabel}>{t('weekly_report_worst')}</Text>
            <Text style={styles.dayValue}>
              {report.worstDay.dayName} ({report.worstDay.score})
            </Text>
          </View>
        )}
      </View>

      {/* Top Pattern */}
      {report.topPattern && (
        <View style={styles.patternRow}>
          <Ionicons name="analytics" size={14} color={darkPalette.primary} />
          <Text style={styles.patternText}>{report.topPattern}</Text>
        </View>
      )}

      {/* Actions */}
      {report.actions.length > 0 && (
        <View style={styles.actionsSection}>
          <Text style={styles.actionsTitle}>{t('weekly_report_actions')}</Text>
          {report.actions.map((action, i) => (
            <View key={i} style={styles.actionItem}>
              <Ionicons
                name={action.iconName as keyof typeof Ionicons.glyphMap}
                size={16}
                color={darkPalette.primary}
              />
              <Text style={styles.actionText}>{action.text}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Dismiss */}
      <Pressable style={styles.dismissButton} onPress={() => setDismissed(true)}>
        <Text style={styles.dismissText}>{t('weekly_report_dismiss')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: darkPalette.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: darkPalette.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dateRange: {
    fontSize: 11,
    fontWeight: '500',
    color: darkPalette.textSecondary,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 14,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: '800',
    color: darkPalette.text,
  },
  scoreLabel: {
    fontSize: 13,
    color: darkPalette.textSecondary,
    fontWeight: '500',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  daysRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  dayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  dayLabel: {
    fontSize: 11,
    color: darkPalette.textSecondary,
    fontWeight: '600',
  },
  dayValue: {
    fontSize: 12,
    color: darkPalette.text,
    fontWeight: '600',
  },
  patternRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  patternText: {
    fontSize: 12,
    color: darkPalette.textSecondary,
    flex: 1,
  },
  actionsSection: {
    marginBottom: 8,
  },
  actionsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: darkPalette.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  actionText: {
    fontSize: 13,
    color: darkPalette.text,
    flex: 1,
  },
  dismissButton: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  dismissText: {
    fontSize: 12,
    color: darkPalette.textTertiary,
    fontWeight: '500',
  },
  // Free user teaser styles
  blurredContent: {
    opacity: 1,
  },
  blurredBar: {
    height: 10,
    width: '70%',
    backgroundColor: 'rgba(139, 139, 163, 0.12)',
    borderRadius: 5,
    marginBottom: 8,
  },
  blurredBarShort: {
    height: 8,
    width: '45%',
    backgroundColor: 'rgba(139, 139, 163, 0.08)',
    borderRadius: 4,
    marginBottom: 8,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 15, 0.7)',
  },
  lockText: {
    fontSize: 15,
    fontWeight: '700',
    color: darkPalette.text,
    marginTop: 8,
  },
  unlockButton: {
    marginTop: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  unlockButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: darkPalette.primary,
  },
});
