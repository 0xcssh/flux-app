import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { Correlation } from '@/types/insight';

const METRIC_ICONS: Record<string, { name: string; color: string }> = {
  energy: { name: 'bolt', color: '#F59E0B' },
  mood: { name: 'smile-o', color: '#8B5CF6' },
  libido: { name: 'heart', color: '#EF4444' },
  sleep_quality: { name: 'moon-o', color: '#6366F1' },
  stress: { name: 'exclamation-triangle', color: '#F97316' },
  training: { name: 'trophy', color: '#10B981' },
  nofap_streak_days: { name: 'shield', color: '#0D9488' },
  vitality_score: { name: 'star', color: '#2563EB' },
};

const SIGNIFICANCE_COLORS = {
  low: '#94A3B8',
  medium: '#F59E0B',
  high: '#10B981',
};

interface InsightCardProps {
  correlation: Correlation;
}

export default function InsightCard({ correlation }: InsightCardProps) {
  const { t } = useTranslation('insights');

  const iconA = METRIC_ICONS[correlation.metric_a] ?? { name: 'circle', color: '#64748B' };
  const iconB = METRIC_ICONS[correlation.metric_b] ?? { name: 'circle', color: '#64748B' };
  const sigColor = SIGNIFICANCE_COLORS[correlation.significance];

  const rValue = correlation.r_value;
  const direction = rValue > 0 ? 'positive' : 'negative';
  const strength = correlation.significance;

  // Format metric name for display
  const formatMetric = (metric: string) =>
    metric
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  // Build description
  const description =
    rValue > 0
      ? `Higher ${formatMetric(correlation.metric_a).toLowerCase()} correlates with higher ${formatMetric(correlation.metric_b).toLowerCase()}.`
      : `Higher ${formatMetric(correlation.metric_a).toLowerCase()} correlates with lower ${formatMetric(correlation.metric_b).toLowerCase()}.`;

  // Mini bar indicator for r-value
  const absR = Math.abs(rValue);

  return (
    <View style={styles.card}>
      <View style={styles.metricsRow}>
        <View style={styles.metricBadge}>
          <FontAwesome
            name={iconA.name as any}
            size={16}
            color={iconA.color}
          />
          <Text style={styles.metricLabel}>{formatMetric(correlation.metric_a)}</Text>
        </View>

        <View style={styles.arrowContainer}>
          <FontAwesome
            name={direction === 'positive' ? 'arrows-h' : 'exchange'}
            size={14}
            color="#94A3B8"
          />
        </View>

        <View style={styles.metricBadge}>
          <FontAwesome
            name={iconB.name as any}
            size={16}
            color={iconB.color}
          />
          <Text style={styles.metricLabel}>{formatMetric(correlation.metric_b)}</Text>
        </View>
      </View>

      <Text style={styles.description}>{description}</Text>

      <View style={styles.footer}>
        <View style={styles.rValueContainer}>
          <Text style={styles.rLabel}>r = </Text>
          <Text style={[styles.rValue, { color: sigColor }]}>
            {rValue > 0 ? '+' : ''}{rValue.toFixed(2)}
          </Text>
        </View>

        <View style={[styles.significanceBadge, { backgroundColor: sigColor + '20' }]}>
          <View style={[styles.significanceDot, { backgroundColor: sigColor }]} />
          <Text style={[styles.significanceText, { color: sigColor }]}>
            {strength.charAt(0).toUpperCase() + strength.slice(1)}
          </Text>
        </View>

        {/* Mini bar chart indicator */}
        <View style={styles.miniBar}>
          <View
            style={[
              styles.miniBarFill,
              { width: `${absR * 100}%`, backgroundColor: sigColor },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#2A2A45',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252540',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  arrowContainer: {
    paddingHorizontal: 8,
  },
  description: {
    fontSize: 14,
    color: '#8B8BA3',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  rLabel: {
    fontSize: 12,
    color: '#5A5A7A',
  },
  rValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  significanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 12,
  },
  significanceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  significanceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  miniBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#2A2A45',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});
