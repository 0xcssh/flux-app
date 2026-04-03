import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Line as SvgLine } from 'react-native-svg';
import { darkPalette } from '@/theme/colors';
import type { DailyLogEntry } from '@/types/log';
import { formatLocalDate } from '@/lib/dateUtils';

interface WeeklySummaryProps {
  logs: DailyLogEntry[];
}

function getScoreColor(score: number): string {
  if (score >= 70) return darkPalette.secondary;
  if (score >= 50) return darkPalette.primary;
  if (score >= 30) return darkPalette.accent;
  return darkPalette.error;
}

export default function WeeklySummary({ logs }: WeeklySummaryProps) {
  const last7 = useMemo(() => {
    const days: (DailyLogEntry | null)[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatLocalDate(d);
      const log = logs.find((l) => l.log_date === dateStr);
      days.push(log || null);
    }
    return days;
  }, [logs]);

  const dayLabels = useMemo(() => {
    const labels: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]);
    }
    return labels;
  }, []);

  const daysLogged = last7.filter(Boolean).length;
  const scores = last7.filter(Boolean).map((l) => l!.vitality_score);
  const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const barW = 28;
  const barGap = 10;
  const chartW = 7 * barW + 6 * barGap;
  const chartH = 80;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>This Week</Text>
        <Text style={styles.subtitle}>{daysLogged}/7 logged · Avg {avg}</Text>
      </View>

      <View style={styles.chartContainer}>
        <Svg width={chartW} height={chartH}>
          {/* Average line */}
          {avg > 0 && (
            <SvgLine
              x1={0} y1={chartH - (avg / 100) * chartH}
              x2={chartW} y2={chartH - (avg / 100) * chartH}
              stroke={darkPalette.textTertiary} strokeWidth={1} strokeDasharray="4,4"
            />
          )}
          {/* Bars */}
          {last7.map((log, i) => {
            const x = i * (barW + barGap);
            const score = log?.vitality_score ?? 0;
            const height = Math.max((score / 100) * chartH, 3);
            const color = log ? getScoreColor(score) : darkPalette.border;
            return (
              <Rect
                key={i}
                x={x}
                y={chartH - height}
                width={barW}
                height={height}
                rx={6}
                fill={color}
                opacity={log ? 1 : 0.3}
              />
            );
          })}
        </Svg>
        <View style={styles.dayLabels}>
          {dayLabels.map((label, i) => (
            <Text key={i} style={[styles.dayLabel, { width: barW, marginRight: i < 6 ? barGap : 0 }]}>
              {label}
            </Text>
          ))}
        </View>
      </View>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 16, fontWeight: '700', color: darkPalette.text },
  subtitle: { fontSize: 12, color: darkPalette.textTertiary, fontWeight: '500' },
  chartContainer: { alignItems: 'center' },
  dayLabels: { flexDirection: 'row', marginTop: 8 },
  dayLabel: { fontSize: 10, color: darkPalette.textTertiary, textAlign: 'center', fontWeight: '500' },
});
