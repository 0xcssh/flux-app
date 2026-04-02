import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { CartesianChart, Line, Area } from 'victory-native';
import { useTranslation } from 'react-i18next';
import type { DailyLogEntry } from '@/types/log';
import PremiumGate from '@/components/insights/PremiumGate';

const CHART_HEIGHT = 180;

type RangeKey = '7d' | '30d' | '90d' | '180d' | '1y';

const RANGES: { key: RangeKey; label: string; days: number }[] = [
  { key: '7d', label: '7D', days: 7 },
  { key: '30d', label: '30D', days: 30 },
  { key: '90d', label: '90D', days: 90 },
  { key: '180d', label: '6M', days: 180 },
  { key: '1y', label: '1Y', days: 365 },
];

interface HistoryChartProps {
  logs: DailyLogEntry[];
  range?: RangeKey;
}

export default function HistoryChart({ logs, range: initialRange }: HistoryChartProps) {
  const { t } = useTranslation('profile');
  const [range, setRange] = useState<RangeKey>(initialRange ?? '7d');

  const selectedDays = RANGES.find((r) => r.key === range)?.days ?? 7;

  const chartData = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - selectedDays);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    return [...logs]
      .filter((l) => l.log_date >= cutoffStr)
      .sort((a, b) => a.log_date.localeCompare(b.log_date))
      .map((log, index) => ({
        x: index,
        vitality: log.vitality_score,
        label: log.log_date.slice(5),
      }));
  }, [logs, selectedDays]);

  const isFreeRange = range === '7d';

  const renderChart = () => {
    if (chartData.length < 2) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('sections.history')}: No data for this period</Text>
        </View>
      );
    }

    return (
      <View style={styles.chartWrapper}>
        <CartesianChart
          data={chartData}
          xKey="x"
          yKeys={['vitality']}
          domainPadding={{ top: 16, bottom: 16, left: 8, right: 8 }}
          axisOptions={{
            tickCount: { x: Math.min(chartData.length, 6), y: 5 },
            font: null,
            formatXLabel: (val: number) => {
              const idx = Math.round(val);
              return chartData[idx]?.label ?? '';
            },
            formatYLabel: (val: number) => `${Math.round(val)}`,
          }}
        >
          {({ points, chartBounds }) => (
            <>
              <Area
                points={points.vitality}
                y0={chartBounds.bottom}
                color="#2563EB"
                opacity={0.1}
                curveType="natural"
              />
              <Line
                points={points.vitality}
                color="#2563EB"
                strokeWidth={2.5}
                curveType="natural"
              />
            </>
          )}
        </CartesianChart>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('sections.history')}</Text>

      <View style={styles.rangeSelector}>
        {RANGES.map((r) => {
          const isSelected = r.key === range;
          return (
            <TouchableOpacity
              key={r.key}
              style={[styles.rangeButton, isSelected && styles.rangeButtonActive]}
              onPress={() => setRange(r.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.rangeText, isSelected && styles.rangeTextActive]}
              >
                {r.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isFreeRange ? (
        renderChart()
      ) : (
        <PremiumGate feature="unlimited_history">
          {renderChart()}
        </PremiumGate>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  rangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  rangeButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  rangeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  rangeTextActive: {
    color: '#2563EB',
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
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
  },
});
