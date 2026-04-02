import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CartesianChart, Line } from 'victory-native';
import { lightPalette } from '@/theme/colors';
import type { DailyLogEntry } from '@/types/log';

interface InfradianChartProps {
  logs: DailyLogEntry[];
  detectedCycle?: { periodDays: number; confidence: number } | null;
  isPremium?: boolean;
}

export default function InfradianChart({
  logs,
  detectedCycle,
  isPremium = true,
}: InfradianChartProps) {
  const { t } = useTranslation('cycle');

  const chartData = useMemo(() => {
    // Sort logs by date and take last 30
    const sorted = [...logs]
      .sort((a, b) => a.log_date.localeCompare(b.log_date))
      .slice(-30);

    if (sorted.length === 0) {
      // Generate mock empty data
      const data = [];
      for (let i = 0; i < 30; i++) {
        data.push({ day: i + 1, score: 0, trend: 50 });
      }
      return data;
    }

    const avg =
      sorted.reduce((sum, l) => sum + l.vitality_score, 0) / sorted.length;

    return sorted.map((log, i) => {
      let trend = avg;
      if (detectedCycle) {
        const phase = (i / detectedCycle.periodDays) * 2 * Math.PI;
        const amplitude = 15 * (detectedCycle.confidence / 100);
        trend = avg + amplitude * Math.sin(phase);
      }
      return {
        day: i + 1,
        score: log.vitality_score,
        trend: Math.round(trend),
      };
    });
  }, [logs, detectedCycle]);

  const avg = useMemo(() => {
    const scores = chartData.filter((d) => d.score > 0).map((d) => d.score);
    return scores.length > 0
      ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
      : 0;
  }, [chartData]);

  const hasData = logs.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('infradian.title')}</Text>
      <Text style={styles.description}>{t('infradian.description')}</Text>

      {detectedCycle && (
        <View style={styles.cycleInfo}>
          <Text style={styles.cycleLength}>
            {t('infradian.cycle_length')}: {detectedCycle.periodDays} {t('common:time.days', { defaultValue: 'days' })}
          </Text>
          <Text style={styles.cycleConfidence}>
            {t('infradian.estimated')} ({detectedCycle.confidence}%)
          </Text>
        </View>
      )}

      <View style={styles.chartWrapper}>
        {!isPremium && (
          <View style={styles.premiumOverlay}>
            <View style={styles.premiumContent}>
              <Text style={styles.lockIcon}>{'\uD83D\uDD12'}</Text>
              <Text style={styles.premiumText}>{t('premium_required')}</Text>
              <Pressable style={styles.upgradeButton}>
                <Text style={styles.upgradeButtonText}>
                  {t('common:buttons.upgrade', { defaultValue: 'Upgrade' })}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={[styles.chartContainer, !isPremium && styles.chartBlurred]}>
          {hasData ? (
            <CartesianChart
              data={chartData}
              xKey="day"
              yKeys={['score', 'trend']}
              domainPadding={{ top: 20, bottom: 10, left: 10, right: 10 }}
              domain={{ y: [0, 100] }}
              axisOptions={{
                tickCount: { x: 6, y: 5 },
                formatXLabel: (v: number) => `${Math.round(v)}`,
                formatYLabel: (v: number) => `${Math.round(v)}`,
                labelColor: lightPalette.textSecondary,
                lineColor: lightPalette.border,
              }}
            >
              {({ points }) => (
                <>
                  {detectedCycle && (
                    <Line
                      points={points.trend}
                      color={lightPalette.secondary}
                      strokeWidth={2}
                      curveType="natural"
                      opacity={0.5}
                      animate={{ type: 'timing', duration: 800 }}
                    />
                  )}
                  <Line
                    points={points.score}
                    color={lightPalette.primary}
                    strokeWidth={2.5}
                    curveType="natural"
                    animate={{ type: 'timing', duration: 800 }}
                  />
                </>
              )}
            </CartesianChart>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>{t('not_enough_data')}</Text>
            </View>
          )}
        </View>
      </View>

      {hasData && (
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{avg}</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{logs.length}</Text>
            <Text style={styles.statLabel}>Days Logged</Text>
          </View>
          {detectedCycle && (
            <View style={styles.stat}>
              <Text style={styles.statValue}>{detectedCycle.periodDays}d</Text>
              <Text style={styles.statLabel}>Cycle</Text>
            </View>
          )}
        </View>
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: lightPalette.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    color: lightPalette.textSecondary,
    marginBottom: 12,
  },
  cycleInfo: {
    backgroundColor: lightPalette.surfaceVariant,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  cycleLength: {
    fontSize: 14,
    fontWeight: '600',
    color: lightPalette.text,
  },
  cycleConfidence: {
    fontSize: 12,
    color: lightPalette.textSecondary,
    marginTop: 2,
  },
  chartWrapper: {
    position: 'relative',
  },
  chartContainer: {
    height: 220,
    marginHorizontal: -8,
  },
  chartBlurred: {
    opacity: 0.15,
  },
  premiumOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  lockIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  premiumText: {
    fontSize: 14,
    lineHeight: 20,
    color: lightPalette.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: lightPalette.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noDataText: {
    fontSize: 14,
    color: lightPalette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: lightPalette.border,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: lightPalette.text,
  },
  statLabel: {
    fontSize: 12,
    color: lightPalette.textSecondary,
    marginTop: 2,
  },
});
