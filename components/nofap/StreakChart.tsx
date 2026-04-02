import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useNoFapStreak } from '@/hooks/useNoFapStreak';

function getBarColor(days: number): string {
  if (days >= 30) return '#10B981';
  if (days >= 7) return '#F59E0B';
  return '#EF4444';
}

export default function StreakChart() {
  const { t } = useTranslation('nofap');
  const { history, currentStreak, streakDays } = useNoFapStreak();

  // Build data: completed streaks + current
  const streaks = [
    ...(currentStreak
      ? [
          {
            label: 'Current',
            days: streakDays,
            isCurrent: true,
            startDate: currentStreak.startDate,
          },
        ]
      : []),
    ...history.slice(0, 10).map((s) => ({
      label: s.start_date,
      days: s.streak_days,
      isCurrent: false,
      startDate: s.start_date,
    })),
  ];

  if (streaks.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Streak History</Text>
        <Text style={styles.emptyText}>
          No streak history yet. Start your first streak!
        </Text>
      </View>
    );
  }

  const maxDays = Math.max(...streaks.map((s) => s.days), 7);
  const barHeight = 28;
  const barGap = 8;
  const chartWidth = 280;
  const labelWidth = 70;
  const svgHeight = streaks.length * (barHeight + barGap) + barGap;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Streak History</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartWrapper}>
          <Svg
            width={chartWidth + labelWidth + 40}
            height={svgHeight}
          >
            {streaks.map((streak, index) => {
              const y = index * (barHeight + barGap) + barGap;
              const barWidth = Math.max(
                (streak.days / maxDays) * chartWidth,
                4
              );
              const color = getBarColor(streak.days);

              const dateLabel = streak.isCurrent
                ? 'Current'
                : new Date(streak.startDate + 'T00:00:00').toLocaleDateString(
                    'en-US',
                    { month: 'short', day: 'numeric' }
                  );

              return (
                <React.Fragment key={`${streak.startDate}-${index}`}>
                  <SvgText
                    x={0}
                    y={y + barHeight / 2 + 4}
                    fontSize={11}
                    fill="#8B8BA3"
                    fontWeight="500"
                  >
                    {dateLabel}
                  </SvgText>
                  <Rect
                    x={labelWidth}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx={6}
                    fill={color}
                    opacity={streak.isCurrent ? 1 : 0.8}
                  />
                  <SvgText
                    x={labelWidth + barWidth + 8}
                    y={y + barHeight / 2 + 4}
                    fontSize={12}
                    fill="#FFFFFF"
                    fontWeight="600"
                  >
                    {streak.days}d
                  </SvgText>
                </React.Fragment>
              );
            })}
          </Svg>
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>&lt;7d</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>7-30d</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>&gt;30d</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  chartWrapper: {
    paddingVertical: 4,
  },
  emptyText: {
    fontSize: 13,
    color: '#5A5A7A',
    textAlign: 'center',
    paddingVertical: 24,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: '#8B8BA3',
  },
});
