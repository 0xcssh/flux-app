import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';
import type { EarlyPattern } from '@/types/insight';

const METRIC_ICON: Record<string, string> = {
  energy: 'flash',
  mood: 'happy',
  libido: 'flame',
  sleep_quality: 'moon',
  stress: 'pulse',
  training: 'barbell',
};

const METRIC_COLOR: Record<string, string> = {
  energy: darkPalette.energy,
  mood: darkPalette.mood,
  libido: darkPalette.libido,
  sleep_quality: darkPalette.sleep,
  stress: darkPalette.stress,
  training: darkPalette.training,
};

interface EarlyPatternCardProps {
  pattern: EarlyPattern;
}

export default function EarlyPatternCard({ pattern }: EarlyPatternCardProps) {
  const { t } = useTranslation('insights');
  const iconName = METRIC_ICON[pattern.metric] || 'analytics';
  const color = METRIC_COLOR[pattern.metric] || darkPalette.primary;

  const trendIcon = pattern.trend === 'improving' ? '↑' : pattern.trend === 'declining' ? '↓' : '→';
  const trendColor =
    pattern.trend === 'improving'
      ? darkPalette.success
      : pattern.trend === 'declining'
        ? darkPalette.error
        : darkPalette.textTertiary;

  const metricLabel = pattern.metric.replace('_', ' ');

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name={iconName as any} size={18} color={color} style={styles.iconStyle} />
        <Text style={[styles.metricName, { color }]}>
          {metricLabel.charAt(0).toUpperCase() + metricLabel.slice(1)}
        </Text>
        <Text style={[styles.trend, { color: trendColor }]}>
          {trendIcon} {t(`early.${pattern.trend}`)}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t('early.average')}</Text>
          <Text style={[styles.statValue, { color }]}>{pattern.average}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t('early.best')}</Text>
          <Text style={[styles.statValue, { color: darkPalette.success }]}>
            {pattern.best.value}
          </Text>
          <Text style={styles.statDate}>{pattern.best.date}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t('early.worst')}</Text>
          <Text style={[styles.statValue, { color: darkPalette.error }]}>
            {pattern.worst.value}
          </Text>
          <Text style={styles.statDate}>{pattern.worst.date}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: darkPalette.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: darkPalette.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconStyle: {
    marginRight: 8,
  },
  metricName: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  trend: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: darkPalette.textTertiary,
    fontWeight: '600',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statDate: {
    fontSize: 10,
    color: darkPalette.textTertiary,
    marginTop: 2,
  },
});
