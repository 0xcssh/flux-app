import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Text as SvgText, Line as SvgLine } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import type { DailyLogEntry } from '@/types/log';
import PremiumGate from '@/components/insights/PremiumGate';

const CHART_WIDTH = Dimensions.get('window').width - 96;
const CHART_HEIGHT = 160;
const PAD = { top: 10, bottom: 20, left: 30, right: 10 };

type RangeKey = '7d' | '30d' | '90d' | '180d' | '1y';

const RANGES: { key: RangeKey; label: string; days: number }[] = [
  { key: '7d', label: '7D', days: 7 },
  { key: '30d', label: '30D', days: 30 },
  { key: '90d', label: '90D', days: 90 },
  { key: '180d', label: '6M', days: 180 },
  { key: '1y', label: '1Y', days: 365 },
];

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i - 1].x + pts[i].x) / 2;
    d += ` C ${cpx} ${pts[i - 1].y}, ${cpx} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }
  return d;
}

interface HistoryChartProps {
  logs: DailyLogEntry[];
  range?: RangeKey;
}

export default function HistoryChart({ logs, range: initialRange }: HistoryChartProps) {
  const { t } = useTranslation('profile');
  const [range, setRange] = useState<RangeKey>(initialRange ?? '7d');
  const selectedDays = RANGES.find((r) => r.key === range)?.days ?? 7;

  const filtered = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - selectedDays);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return [...logs].filter((l) => l.log_date >= cutoffStr).sort((a, b) => a.log_date.localeCompare(b.log_date));
  }, [logs, selectedDays]);

  const plotW = CHART_WIDTH - PAD.left - PAD.right;
  const plotH = CHART_HEIGHT - PAD.top - PAD.bottom;

  const points = useMemo(
    () => filtered.map((l, i) => ({
      x: PAD.left + (i / Math.max(filtered.length - 1, 1)) * plotW,
      y: PAD.top + (1 - l.vitality_score / 100) * plotH,
    })),
    [filtered, plotW, plotH],
  );

  const linePath = smoothPath(points);
  const areaPath = points.length > 1
    ? `${linePath} L ${points[points.length - 1].x} ${PAD.top + plotH} L ${points[0].x} ${PAD.top + plotH} Z`
    : '';

  const isFreeRange = range === '7d';

  const renderChart = () => {
    if (filtered.length < 2) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('sections.history')}: No data</Text>
        </View>
      );
    }

    return (
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#3B82F6" stopOpacity="0.2" />
            <Stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {[0, 25, 50, 75, 100].map((v) => {
          const y = PAD.top + (1 - v / 100) * plotH;
          return (
            <React.Fragment key={v}>
              <SvgLine x1={PAD.left} y1={y} x2={PAD.left + plotW} y2={y} stroke="#2A2A45" strokeWidth={0.5} />
              <SvgText x={PAD.left - 5} y={y + 3} fontSize={9} fill="#5A5A7A" textAnchor="end">{v}</SvgText>
            </React.Fragment>
          );
        })}

        <Path d={areaPath} fill="url(#histGrad)" />
        <Path d={linePath} stroke="#3B82F6" strokeWidth={2.5} fill="none" />
        {points.map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r={3} fill="#3B82F6" />)}
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('sections.history')}</Text>

      <View style={styles.rangeSelector}>
        {RANGES.map((r) => (
          <TouchableOpacity
            key={r.key}
            style={[styles.rangeButton, r.key === range && styles.rangeButtonActive]}
            onPress={() => setRange(r.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.rangeText, r.key === range && styles.rangeTextActive]}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isFreeRange ? renderChart() : <PremiumGate feature="unlimited_history">{renderChart()}</PremiumGate>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#1A1A2E', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 2 },
  title: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 },
  rangeSelector: { flexDirection: 'row', backgroundColor: '#16162A', borderRadius: 10, padding: 3, marginBottom: 16 },
  rangeButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  rangeButtonActive: { backgroundColor: '#252540', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 1 },
  rangeText: { fontSize: 13, fontWeight: '600', color: '#5A5A7A' },
  rangeTextActive: { color: '#3B82F6' },
  emptyContainer: { height: 120, justifyContent: 'center', alignItems: 'center', backgroundColor: '#16162A', borderRadius: 12 },
  emptyText: { fontSize: 14, color: '#5A5A7A' },
});
