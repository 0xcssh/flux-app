import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { lightPalette } from '@/theme/colors';
import type { DailyLogEntry, MetricKey } from '@/types/log';

interface IndicatorRowProps {
  log: DailyLogEntry | null;
}

interface MetricConfig {
  key: MetricKey;
  icon: string;
  labelKey: string;
  inverted?: boolean;
}

const METRICS: MetricConfig[] = [
  { key: 'energy', icon: '\u26A1', labelKey: 'indicators.energy' },
  { key: 'mood', icon: '\uD83D\uDE0A', labelKey: 'indicators.mood' },
  { key: 'libido', icon: '\uD83D\uDD25', labelKey: 'indicators.libido' },
  { key: 'sleep_quality', icon: '\uD83D\uDE34', labelKey: 'indicators.sleep' },
  { key: 'stress', icon: '\uD83D\uDE30', labelKey: 'indicators.stress', inverted: true },
  { key: 'training', icon: '\uD83D\uDCAA', labelKey: 'indicators.training' },
];

function getBarColor(value: number, inverted: boolean): string {
  const effective = inverted ? 11 - value : value;
  if (effective <= 3) return '#EF4444';
  if (effective <= 5) return '#F59E0B';
  if (effective <= 7) return '#EAB308';
  return '#10B981';
}

function MetricBar({ config, value }: { config: MetricConfig; value: number | null }) {
  const { t } = useTranslation('dashboard');
  const displayValue = value ?? 0;
  const hasValue = value != null;
  const barColor = hasValue
    ? getBarColor(displayValue, !!config.inverted)
    : lightPalette.border;

  return (
    <View style={styles.metricItem}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricIcon}>{config.icon}</Text>
        <Text style={styles.metricLabel} numberOfLines={1}>
          {t(config.labelKey)}
        </Text>
        <Text style={styles.metricValue}>
          {hasValue ? displayValue : '-'}
        </Text>
      </View>
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            {
              width: hasValue ? `${(displayValue / 10) * 100}%` : '0%',
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

export default function IndicatorRow({ log }: IndicatorRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {METRICS.map((config) => (
          <MetricBar
            key={config.key}
            config={config}
            value={log ? log[config.key] : null}
          />
        ))}
      </View>
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
  grid: {
    gap: 12,
  },
  metricItem: {
    gap: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricIcon: {
    fontSize: 14,
    width: 20,
    textAlign: 'center',
  },
  metricLabel: {
    flex: 1,
    fontSize: 13,
    color: lightPalette.textSecondary,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '600',
    color: lightPalette.text,
    width: 24,
    textAlign: 'right',
  },
  barBackground: {
    height: 6,
    backgroundColor: lightPalette.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginLeft: 26,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});
