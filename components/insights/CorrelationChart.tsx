import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { CartesianChart, Line, useChartPressState } from 'victory-native';
import type { DailyLogEntry, MetricKey } from '@/types/log';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_HEIGHT = 200;

const METRIC_COLORS: Record<string, string> = {
  energy: '#F59E0B',
  mood: '#8B5CF6',
  libido: '#EF4444',
  sleep_quality: '#6366F1',
  stress: '#F97316',
  training: '#10B981',
  vitality_score: '#2563EB',
};

interface CorrelationChartProps {
  logs: DailyLogEntry[];
  metricA: string;
  metricB: string;
}

export default function CorrelationChart({
  logs,
  metricA,
  metricB,
}: CorrelationChartProps) {
  const colorA = METRIC_COLORS[metricA] ?? '#2563EB';
  const colorB = METRIC_COLORS[metricB] ?? '#10B981';

  const formatMetric = (m: string) =>
    m.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const chartData = useMemo(() => {
    const sorted = [...logs].sort((a, b) => a.log_date.localeCompare(b.log_date));
    return sorted.map((log, index) => ({
      x: index,
      valueA: (log as any)[metricA] ?? 0,
      valueB: (log as any)[metricB] ?? 0,
      label: log.log_date.slice(5),
    }));
  }, [logs, metricA, metricB]);

  if (chartData.length < 2) {
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

      <View style={styles.chartWrapper}>
        <CartesianChart
          data={chartData}
          xKey="x"
          yKeys={['valueA', 'valueB']}
          domainPadding={{ top: 16, bottom: 16, left: 8, right: 8 }}
          axisOptions={{
            tickCount: { x: Math.min(chartData.length, 6), y: 5 },
            font: null,
            formatXLabel: (val: number) => {
              const idx = Math.round(val);
              return chartData[idx]?.label ?? '';
            },
          }}
        >
          {({ points }) => (
            <>
              <Line
                points={points.valueA}
                color={colorA}
                strokeWidth={2.5}
                curveType="natural"
              />
              <Line
                points={points.valueB}
                color={colorB}
                strokeWidth={2.5}
                curveType="natural"
              />
            </>
          )}
        </CartesianChart>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  chartWrapper: {
    height: CHART_HEIGHT,
    width: '100%',
  },
  emptyContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
  },
});
