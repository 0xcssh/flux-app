import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';
import { useLogStore } from '@/store/logStore';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface DayAverage {
  day: number;
  label: string;
  avg: number;
  count: number;
}

export default function BestDaysCard() {
  const { t } = useTranslation('insights');
  const logs = useLogStore((s) => s.logs);

  const { dayAverages, bestDay, worstDay } = useMemo(() => {
    const totals: { sum: number; count: number }[] = Array.from(
      { length: 7 },
      () => ({ sum: 0, count: 0 }),
    );

    for (const log of Object.values(logs)) {
      const dayOfWeek = new Date(log.log_date + 'T12:00:00').getDay();
      totals[dayOfWeek].sum += log.vitality_score;
      totals[dayOfWeek].count += 1;
    }

    const averages: DayAverage[] = totals.map((t, i) => ({
      day: i,
      label: DAY_LABELS[i],
      avg: t.count > 0 ? Math.round(t.sum / t.count) : 0,
      count: t.count,
    }));

    // Reorder to Mon-Sun
    const ordered = [...averages.slice(1), averages[0]];

    const withData = ordered.filter((d) => d.count > 0);
    const best =
      withData.length > 0
        ? withData.reduce((a, b) => (a.avg > b.avg ? a : b))
        : null;
    const worst =
      withData.length > 0
        ? withData.reduce((a, b) => (a.avg < b.avg ? a : b))
        : null;

    return { dayAverages: ordered, bestDay: best, worstDay: worst };
  }, [logs]);

  const maxScore = Math.max(...dayAverages.map((d) => d.avg), 1);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('best_worst_days')}</Text>

      <View style={styles.barsContainer}>
        {dayAverages.map((day) => {
          const isBest = bestDay && day.day === bestDay.day;
          const isWorst = worstDay && day.day === worstDay.day;
          const barColor = isBest
            ? darkPalette.secondary
            : isWorst
              ? darkPalette.error
              : darkPalette.primary;
          const barWidth = day.avg > 0 ? (day.avg / maxScore) * 100 : 0;

          return (
            <View key={day.day} style={styles.barRow}>
              <Text style={styles.dayLabel}>{day.label}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${barWidth}%`, backgroundColor: barColor },
                  ]}
                />
              </View>
              <Text style={styles.scoreLabel}>
                {day.count > 0 ? day.avg : '-'}
              </Text>
            </View>
          );
        })}
      </View>

      {bestDay && worstDay && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            <Text style={{ color: darkPalette.secondary }}>
              {t('best_day')}: {bestDay.label} ({bestDay.avg})
            </Text>
            {'  '}
            <Text style={{ color: darkPalette.error }}>
              {t('worst_day')}: {worstDay.label} ({worstDay.avg})
            </Text>
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: darkPalette.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: darkPalette.border,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: darkPalette.text,
    marginBottom: 16,
  },
  barsContainer: {
    gap: 8,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayLabel: {
    width: 36,
    fontSize: 12,
    fontWeight: '600',
    color: darkPalette.textSecondary,
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: darkPalette.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  scoreLabel: {
    width: 28,
    fontSize: 12,
    fontWeight: '700',
    color: darkPalette.text,
    textAlign: 'right',
  },
  summaryRow: {
    marginTop: 12,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 12,
    color: darkPalette.textSecondary,
  },
});
