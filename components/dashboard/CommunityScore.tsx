import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Svg, { Path, Line, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';

interface CommunityScoreProps {
  score: number;
}

function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804 * Math.exp((-x * x) / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.3302744))));
  return x > 0 ? 1 - p : p;
}

function getPercentile(score: number): number {
  const z = (score - 55) / 15;
  return Math.round(normalCDF(z) * 100);
}

function getPercentileColor(topPercent: number): string {
  if (topPercent <= 30) return darkPalette.secondary;
  if (topPercent <= 60) return darkPalette.primary;
  if (topPercent <= 80) return darkPalette.accent;
  return darkPalette.error;
}

const BAR_WIDTH = 200;
const BAR_HEIGHT = 40;

export default function CommunityScore({ score }: CommunityScoreProps) {
  const { t } = useTranslation('dashboard');

  const { percentile, topPercent, color, markerX } = useMemo(() => {
    const pctl = getPercentile(score);
    const top = Math.max(1, 100 - pctl);
    const clr = getPercentileColor(top);
    const mx = (pctl / 100) * BAR_WIDTH;
    return { percentile: pctl, topPercent: top, color: clr, markerX: mx };
  }, [score]);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons
          name="people"
          size={14}
          color={darkPalette.textSecondary}
        />
        <Text style={styles.headerText}>{t('community_title')}</Text>
      </View>

      {/* Main stat */}
      <Text style={[styles.mainStat, { color }]}>
        {t('community_top', { percent: topPercent })}
      </Text>
      <Text style={styles.subtitle}>{t('community_subtitle')}</Text>

      {/* Bell curve visualization */}
      <View style={styles.chartContainer}>
        {/* Score label above marker */}
        <View style={[styles.scoreLabelContainer, { left: markerX - 12 }]}>
          <Text style={[styles.scoreLabel, { color }]}>{score}</Text>
        </View>

        <Svg
          width={BAR_WIDTH}
          height={BAR_HEIGHT + 8}
          viewBox={`0 0 ${BAR_WIDTH} ${BAR_HEIGHT + 8}`}
        >
          <Defs>
            <LinearGradient id="bellGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={darkPalette.primary} stopOpacity="0.05" />
              <Stop offset="0.5" stopColor={darkPalette.primary} stopOpacity="0.35" />
              <Stop offset="1" stopColor={darkPalette.primary} stopOpacity="0.05" />
            </LinearGradient>
          </Defs>

          {/* Bell curve shape */}
          <Path
            d="M 0,40 C 30,40 50,35 70,20 C 90,5 110,5 130,20 C 150,35 170,40 200,40 Z"
            fill="url(#bellGrad)"
          />
          <Path
            d="M 0,40 C 30,40 50,35 70,20 C 90,5 110,5 130,20 C 150,35 170,40 200,40"
            stroke={darkPalette.primary}
            strokeWidth={1.5}
            strokeOpacity={0.4}
            fill="none"
          />

          {/* Marker line */}
          <Line
            x1={markerX}
            y1={4}
            x2={markerX}
            y2={BAR_HEIGHT}
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Marker dot */}
          <Circle
            cx={markerX}
            cy={4}
            r={3.5}
            fill={color}
          />
        </Svg>

        {/* Scale labels */}
        <View style={styles.scaleRow}>
          <Text style={styles.scaleLabel}>0</Text>
          <Text style={styles.scaleLabel}>100</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: darkPalette.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: darkPalette.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  headerText: {
    fontSize: 11,
    fontWeight: '700',
    color: darkPalette.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  mainStat: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: darkPalette.textSecondary,
    marginTop: 2,
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  scoreLabelContainer: {
    position: 'absolute',
    top: 0,
    width: 24,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: BAR_WIDTH,
    marginTop: 4,
  },
  scaleLabel: {
    fontSize: 10,
    color: darkPalette.textTertiary,
  },
});
