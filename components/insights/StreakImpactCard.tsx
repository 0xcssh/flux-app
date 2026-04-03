import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';
import { useLogStore } from '@/store/logStore';
import { formatLocalDate } from '@/lib/dateUtils';

export default function StreakImpactCard() {
  const { t } = useTranslation('insights');
  const logs = useLogStore((s) => s.logs);

  const { streakAvg, isolatedAvg, diff, hasEnoughData } = useMemo(() => {
    const sortedLogs = Object.values(logs).sort((a, b) =>
      a.log_date.localeCompare(b.log_date),
    );

    if (sortedLogs.length < 3) {
      return { streakAvg: 0, isolatedAvg: 0, diff: 0, hasEnoughData: false };
    }

    // Identify consecutive logging days
    const dates = sortedLogs.map((l) => l.log_date);
    const dateSet = new Set(dates);

    // For each log, count consecutive days around it
    const streakScores: number[] = [];
    const isolatedScores: number[] = [];

    for (const log of sortedLogs) {
      const logDate = new Date(log.log_date + 'T12:00:00');

      // Check days before and after
      let consecutiveBefore = 0;
      let consecutiveAfter = 0;

      for (let i = 1; i <= 7; i++) {
        const prev = new Date(logDate);
        prev.setDate(prev.getDate() - i);
        const prevStr = formatLocalDate(prev);
        if (dateSet.has(prevStr)) {
          consecutiveBefore++;
        } else {
          break;
        }
      }

      for (let i = 1; i <= 7; i++) {
        const next = new Date(logDate);
        next.setDate(next.getDate() + i);
        const nextStr = formatLocalDate(next);
        if (dateSet.has(nextStr)) {
          consecutiveAfter++;
        } else {
          break;
        }
      }

      const totalStreak = consecutiveBefore + 1 + consecutiveAfter;

      if (totalStreak >= 3) {
        streakScores.push(log.vitality_score);
      } else {
        isolatedScores.push(log.vitality_score);
      }
    }

    const sAvg =
      streakScores.length > 0
        ? Math.round(
            streakScores.reduce((s, v) => s + v, 0) / streakScores.length,
          )
        : 0;
    const iAvg =
      isolatedScores.length > 0
        ? Math.round(
            isolatedScores.reduce((s, v) => s + v, 0) / isolatedScores.length,
          )
        : 0;

    const hasData = streakScores.length > 0 && isolatedScores.length > 0;

    return {
      streakAvg: sAvg,
      isolatedAvg: iAvg,
      diff: sAvg - iAvg,
      hasEnoughData: hasData,
    };
  }, [logs]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('consistency_impact')}</Text>

      {hasEnoughData ? (
        <>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t('during_streaks')}</Text>
              <Text style={[styles.statValue, { color: darkPalette.secondary }]}>
                {streakAvg}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t('isolated_days')}</Text>
              <Text style={[styles.statValue, { color: darkPalette.textSecondary }]}>
                {isolatedAvg}
              </Text>
            </View>
          </View>

          <View style={styles.diffBadge}>
            <Ionicons
              name={diff >= 0 ? 'arrow-up' : 'arrow-down'}
              size={16}
              color={diff >= 0 ? darkPalette.secondary : darkPalette.error}
            />
            <Text
              style={[
                styles.diffText,
                { color: diff >= 0 ? darkPalette.secondary : darkPalette.error },
              ]}
            >
              {diff >= 0 ? '+' : ''}
              {diff} points
            </Text>
          </View>

          <Text style={styles.motivational}>{t('streak_motivational')}</Text>
        </>
      ) : (
        <Text style={styles.noData}>
          Keep logging daily to see your streak impact
        </Text>
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: darkPalette.surfaceElevated,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: darkPalette.textSecondary,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  diffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 8,
  },
  diffText: {
    fontSize: 15,
    fontWeight: '700',
  },
  motivational: {
    fontSize: 12,
    color: darkPalette.textTertiary,
    textAlign: 'center',
  },
  noData: {
    fontSize: 13,
    color: darkPalette.textTertiary,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
