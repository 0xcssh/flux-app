import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Path, Line as SvgLine, Circle, Defs, LinearGradient, Stop, Rect, Text as SvgText } from 'react-native-svg';
import { darkPalette } from '@/theme/colors';
import { getCircadianCurve } from '@/lib/hormoneEngine';

interface CircadianChartProps {
  birthYear?: number;
  currentHour?: number;
}

const CHART_WIDTH = Dimensions.get('window').width - 80;
const CHART_HEIGHT = 180;
const PADDING = { top: 10, bottom: 25, left: 35, right: 10 };

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

export default function CircadianChart({ birthYear, currentHour }: CircadianChartProps) {
  const { t } = useTranslation('cycle');
  const now = new Date();
  const hour = currentHour ?? now.getHours() + now.getMinutes() / 60;

  const curveData = useMemo(() => {
    const raw = getCircadianCurve(birthYear);
    return raw.filter((_, i) => i % 4 === 0);
  }, [birthYear]);

  const plotW = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotH = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const points = useMemo(() => {
    return curveData.map((p) => ({
      x: PADDING.left + (p.hour / 24) * plotW,
      y: PADDING.top + (1 - p.value) * plotH,
    }));
  }, [curveData, plotW, plotH]);

  const linePath = useMemo(() => buildSmoothPath(points), [points]);
  const areaPath = useMemo(() => {
    if (!linePath) return '';
    const bottom = PADDING.top + plotH;
    return `${linePath} L ${points[points.length - 1].x} ${bottom} L ${points[0].x} ${bottom} Z`;
  }, [linePath, points, plotH]);

  // Current time marker
  const currentX = PADDING.left + (hour / 24) * plotW;
  const currentIdx = Math.min(Math.floor((hour / 24) * curveData.length), curveData.length - 1);
  const currentY = PADDING.top + (1 - (curveData[currentIdx]?.value ?? 0.5)) * plotH;

  // Phase background zones — brighter for visibility
  const phases = [
    { start: 0, end: 4, color: '#312E81' },     // recovery - purple
    { start: 4, end: 8, color: '#1E3A5F' },      // rise - blue
    { start: 8, end: 12, color: '#14532D' },      // peak - green
    { start: 12, end: 20, color: '#713F12' },     // decline - amber
    { start: 20, end: 24, color: '#312E81' },     // recovery - purple
  ];

  const phaseLabels = [
    { label: t('phase_labels.rise'), color: '#3B82F6', bg: '#1E3A5F' },
    { label: t('phase_labels.peak'), color: '#22C55E', bg: '#14532D' },
    { label: t('phase_labels.decline'), color: '#F59E0B', bg: '#713F12' },
    { label: t('phase_labels.recovery'), color: '#A78BFA', bg: '#312E81' },
  ];

  const xLabels = [0, 6, 12, 18, 24];
  const yLabels = ['Low', 'Med', 'High'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('circadian.title')}</Text>
      <Text style={styles.description}>{t('circadian.description')}</Text>

      <View style={styles.phaseLabelsRow}>
        {phaseLabels.map((p) => (
          <View key={p.label} style={[styles.phaseLabel, { backgroundColor: p.bg, borderColor: p.color + '40' }]}>
            <Text style={[styles.phaseLabelText, { color: p.color }]}>{p.label}</Text>
          </View>
        ))}
      </View>

      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={darkPalette.primary} stopOpacity="0.25" />
            <Stop offset="1" stopColor={darkPalette.primary} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {/* Phase background zones */}
        {phases.map((p, i) => (
          <Rect
            key={i}
            x={PADDING.left + (p.start / 24) * plotW}
            y={PADDING.top}
            width={((p.end - p.start) / 24) * plotW}
            height={plotH}
            fill={p.color}
            opacity={0.4}
          />
        ))}

        {/* Grid lines */}
        {yLabels.map((_, i) => {
          const y = PADDING.top + (i / (yLabels.length - 1)) * plotH;
          return (
            <SvgLine key={`grid-${i}`} x1={PADDING.left} y1={y} x2={PADDING.left + plotW} y2={y} stroke="#2A2A45" strokeWidth={1} strokeDasharray="4,4" />
          );
        })}

        {/* Area fill */}
        <Path d={areaPath} fill="url(#areaGrad)" />

        {/* Curve line */}
        <Path d={linePath} stroke={darkPalette.primary} strokeWidth={2.5} fill="none" />

        {/* Current time marker */}
        <SvgLine x1={currentX} y1={PADDING.top} x2={currentX} y2={PADDING.top + plotH} stroke={darkPalette.primary} strokeWidth={1.5} strokeDasharray="4,3" />
        <Circle cx={currentX} cy={currentY} r={5} fill={darkPalette.primary} />
        <Circle cx={currentX} cy={currentY} r={8} fill={darkPalette.primary} opacity={0.2} />

        {/* X axis labels */}
        {xLabels.map((h) => (
          <SvgText key={`x-${h}`} x={PADDING.left + (h / 24) * plotW} y={CHART_HEIGHT - 4} fontSize={10} fill={darkPalette.textSecondary} textAnchor="middle">{h}h</SvgText>
        ))}

        {/* Y axis labels */}
        {yLabels.map((label, i) => {
          const y = PADDING.top + ((yLabels.length - 1 - i) / (yLabels.length - 1)) * plotH;
          return (
            <SvgText key={`y-${i}`} x={PADDING.left - 6} y={y + 3} fontSize={9} fill={darkPalette.textSecondary} textAnchor="end">{label}</SvgText>
          );
        })}
      </Svg>

      <View style={styles.currentTimeRow}>
        <View style={[styles.currentTimeDot, { backgroundColor: darkPalette.primary }]} />
        <Text style={styles.currentTimeText}>
          Now - {Math.floor(hour)}:{String(Math.floor((hour % 1) * 60)).padStart(2, '0')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: darkPalette.surface,
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
    color: darkPalette.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    color: darkPalette.textSecondary,
    marginBottom: 12,
  },
  phaseLabelsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  phaseLabel: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  phaseLabelText: {
    fontSize: 11,
    fontWeight: '700',
  },
  currentTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  currentTimeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  currentTimeText: {
    fontSize: 13,
    color: darkPalette.textSecondary,
    fontWeight: '500',
  },
});
