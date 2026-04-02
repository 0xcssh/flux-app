import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';
import { useLogStore } from '@/store/logStore';

interface ComparisonCardProps {
  dateStr: string;
  score: number;
}

export default function ComparisonCard({ dateStr, score }: ComparisonCardProps) {
  const { t } = useTranslation('dashboard');
  const logs = useLogStore((s) => s.logs);

  const { prevDayDiff, avgDiff, userAvg } = useMemo(() => {
    // Previous day
    const d = new Date(dateStr + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    const prevStr = d.toISOString().split('T')[0];
    const prevLog = logs[prevStr];
    const prevDayDiff = prevLog ? score - prevLog.vitality_score : null;

    // User average
    const allScores = Object.values(logs).map((l) => l.vitality_score);
    const avg = allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : null;
    const avgDiff = avg != null ? score - avg : null;

    return { prevDayDiff, avgDiff, userAvg: avg };
  }, [dateStr, score, logs]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('comparison_header')}</Text>

      <View style={styles.row}>
        <Text style={styles.label}>{t('comparison_vs_previous')}</Text>
        {prevDayDiff != null ? (
          <DiffBadge diff={prevDayDiff} />
        ) : (
          <Text style={styles.noData}>{t('comparison_no_data')}</Text>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.label}>
          {t('comparison_vs_average', { avg: userAvg ?? '--' })}
        </Text>
        {avgDiff != null ? (
          <DiffBadge diff={avgDiff} />
        ) : (
          <Text style={styles.noData}>{t('comparison_no_data')}</Text>
        )}
      </View>
    </View>
  );
}

function DiffBadge({ diff }: { diff: number }) {
  const isPositive = diff > 0;
  const isNeutral = diff === 0;
  const color = isNeutral
    ? darkPalette.textSecondary
    : isPositive
    ? darkPalette.secondary
    : darkPalette.error;
  const icon = isNeutral ? 'remove' : isPositive ? 'arrow-up' : 'arrow-down';
  const prefix = isPositive ? '+' : '';

  return (
    <View style={[styles.badge, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon as any} size={14} color={color} />
      <Text style={[styles.badgeText, { color }]}>
        {prefix}{diff}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: darkPalette.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: darkPalette.border,
  },
  header: {
    fontSize: 13,
    fontWeight: '700',
    color: darkPalette.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: darkPalette.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: darkPalette.border,
    marginVertical: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  noData: {
    fontSize: 13,
    color: darkPalette.textTertiary,
    fontStyle: 'italic',
  },
});
