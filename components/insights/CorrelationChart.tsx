import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';
import type { DailyLogEntry } from '@/types/log';

const CHART_WIDTH = Dimensions.get('window').width - 96;
const CHART_HEIGHT = 160;
const PAD = { top: 10, bottom: 20, left: 30, right: 10 };

const METRIC_COLORS: Record<string, string> = {
  energy: '#F59E0B',
  mood: '#8B5CF6',
  libido: '#EF4444',
  sleep_quality: '#6366F1',
  stress: '#F97316',
  training: '#10B981',
  vitality_score: '#2563EB',
};

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i - 1].x + pts[i].x) / 2;
    d += ` C ${cpx} ${pts[i - 1].y}, ${cpx} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }
  return d;
}

interface CorrelationChartProps {
  logs: DailyLogEntry[];
  metricA: string;
  metricB: string;
}

export default function CorrelationChart({ logs, metricA, metricB }: CorrelationChartProps) {
  const colorA = METRIC_COLORS[metricA] ?? '#2563EB';
  const colorB = METRIC_COLORS[metricB] ?? '#10B981';
  const formatMetric = (m: string) => m.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const sorted = useMemo(
    () => [...logs].sort((a, b) => a.log_date.localeCompare(b.log_date)),
    [logs],
  );

  const plotW = CHART_WIDTH - PAD.left - PAD.right;
  const plotH = CHART_HEIGHT - PAD.top - PAD.bottom;

  const pointsA = useMemo(() => sorted.map((l, i) => ({
    x: PAD.left + (i / Math.max(sorted.length - 1, 1)) * plotW,
    y: PAD.top + (1 - ((l as any)[metricA] ?? 0) / 10) * plotH,
  })), [sorted, metricA, plotW, plotH]);

  const pointsB = useMemo(() => sorted.map((l, i) => ({
    x: PAD.left + (i / Math.max(sorted.length - 1, 1)) * plotW,
    y: PAD.top + (1 - ((l as any)[metricB] ?? 0) / 10) * plotH,
  })), [sorted, metricB, plotW, plotH]);

  if (sorted.length < 2) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Not enough data to display chart</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colorA }]} />
          <Text style={styles.legendText}>{formatMetric(metricA)}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colorB }]} />
          <Text style={styles.legendText}>{formatMetric(metricB)}</Text>
        </View>
      </View>

      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Path d={smoothPath(pointsA)} stroke={colorA} strokeWidth={2.5} fill="none" />
        <Path d={smoothPath(pointsB)} stroke={colorB} strokeWidth={2.5} fill="none" />
        {pointsA.map((p, i) => <Circle key={`a${i}`} cx={p.x} cy={p.y} r={2.5} fill={colorA} />)}
        {pointsB.map((p, i) => <Circle key={`b${i}`} cx={p.x} cy={p.y} r={2.5} fill={colorB} />)}

        {[0, 5, 10].map((v) => (
          <SvgText key={v} x={PAD.left - 5} y={PAD.top + (1 - v / 10) * plotH + 3} fontSize={9} fill="#5A5A7A" textAnchor="end">{v}</SvgText>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#1A1A2E', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2A2A45' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { fontSize: 12, color: '#8B8BA3', fontWeight: '500' },
  emptyContainer: { height: 120, justifyContent: 'center', alignItems: 'center', backgroundColor: '#16162A', borderRadius: 12, marginBottom: 12 },
  emptyText: { fontSize: 14, color: '#5A5A7A' },
});
