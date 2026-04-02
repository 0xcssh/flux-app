import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CartesianChart, Line, Area } from 'victory-native';
import { useFont } from '@shopify/react-native-skia';
import { lightPalette } from '@/theme/colors';
import { getCircadianCurve } from '@/lib/hormoneEngine';

interface CircadianChartProps {
  birthYear?: number;
  currentHour?: number;
}

const CHART_WIDTH = Dimensions.get('window').width - 48;

export default function CircadianChart({ birthYear, currentHour }: CircadianChartProps) {
  const { t } = useTranslation('cycle');
  const now = new Date();
  const hour = currentHour ?? now.getHours() + now.getMinutes() / 60;

  const curveData = useMemo(() => {
    const raw = getCircadianCurve(birthYear);
    // Sample every 4th point for performance (24 points)
    return raw.filter((_, i) => i % 4 === 0).map((p) => ({
      hour: p.hour,
      value: p.value,
    }));
  }, [birthYear]);

  // Phase zones for background coloring
  const phaseZones = [
    { start: 4, end: 8, label: t('phase_labels.rise'), color: '#DBEAFE' },
    { start: 8, end: 12, label: t('phase_labels.peak'), color: '#D1FAE5' },
    { start: 12, end: 20, label: t('phase_labels.decline'), color: '#FEF3C7' },
    { start: 20, end: 24, label: t('phase_labels.recovery'), color: '#EDE9FE' },
    { start: 0, end: 4, label: '', color: '#EDE9FE' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('circadian.title')}</Text>
      <Text style={styles.description}>{t('circadian.description')}</Text>

      {/* Phase zone labels */}
      <View style={styles.phaseLabels}>
        {phaseZones
          .filter((z) => z.label)
          .map((zone) => (
            <View key={zone.label} style={[styles.phaseLabel, { backgroundColor: zone.color }]}>
              <Text style={styles.phaseLabelText}>{zone.label}</Text>
            </View>
          ))}
      </View>

      <View style={styles.chartContainer}>
        <CartesianChart
          data={curveData}
          xKey="hour"
          yKeys={['value']}
          domainPadding={{ top: 20, bottom: 10, left: 10, right: 10 }}
          axisOptions={{
            tickCount: { x: 5, y: 4 },
            formatXLabel: (v: number) => `${Math.round(v)}h`,
            formatYLabel: (v: number) => {
              if (v >= 0.7) return 'High';
              if (v >= 0.4) return 'Med';
              return 'Low';
            },
            labelColor: lightPalette.textSecondary,
            lineColor: lightPalette.border,
          }}
        >
          {({ points, chartBounds }) => (
            <>
              <Area
                points={points.value}
                y0={chartBounds.bottom}
                color={lightPalette.primary}
                opacity={0.15}
                curveType="natural"
                animate={{ type: 'timing', duration: 800 }}
              />
              <Line
                points={points.value}
                color={lightPalette.primary}
                strokeWidth={2.5}
                curveType="natural"
                animate={{ type: 'timing', duration: 800 }}
              />
            </>
          )}
        </CartesianChart>
      </View>

      {/* Current time indicator */}
      <View style={styles.currentTimeRow}>
        <View style={[styles.currentTimeDot, { backgroundColor: lightPalette.primary }]} />
        <Text style={styles.currentTimeText}>
          {t('circadian.optimal_window')} - {Math.floor(hour)}:{String(Math.floor((hour % 1) * 60)).padStart(2, '0')}
        </Text>
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
  phaseLabels: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  phaseLabel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  phaseLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: lightPalette.textSecondary,
  },
  chartContainer: {
    height: 220,
    marginHorizontal: -8,
  },
  currentTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  currentTimeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  currentTimeText: {
    fontSize: 13,
    color: lightPalette.textSecondary,
    fontWeight: '500',
  },
});
