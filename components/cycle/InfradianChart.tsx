import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Line as SvgLine, Circle, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { darkPalette } from '@/theme/colors';
import type { DailyLogEntry } from '@/types/log';

interface InfradianChartProps {
  logs: DailyLogEntry[];
  detectedCycle?: { periodDays: number; confidence: number } | null;
  isPremium?: boolean;
}

const CHART_WIDTH = Dimensions.get('window').width - 80;
const CHART_HEIGHT = 180;
const PAD = { top: 10, bottom: 25, left: 30, right: 10 };

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i - 1].x + pts[i].x) / 2;
    d += ` C ${cpx} ${pts[i - 1].y}, ${cpx} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }
  return d;
}

export default function InfradianChart({ logs, detectedCycle, isPremium = true }: InfradianChartProps) {
  const { t } = useTranslation('cycle');
  const navigation = useNavigation<any>();

  const sorted = useMemo(
    () => [...logs].sort((a, b) => a.log_date.localeCompare(b.log_date)).slice(-30),
    [logs],
  );

  const hasData = sorted.length > 1;
  const plotW = CHART_WIDTH - PAD.left - PAD.right;
  const plotH = CHART_HEIGHT - PAD.top - PAD.bottom;

  const avg = useMemo(() => {
    if (!hasData) return 50;
    return Math.round(sorted.reduce((s, l) => s + l.vitality_score, 0) / sorted.length);
  }, [sorted, hasData]);

  const scorePoints = useMemo(() => {
    return sorted.map((l, i) => ({
      x: PAD.left + (i / Math.max(sorted.length - 1, 1)) * plotW,
      y: PAD.top + (1 - l.vitality_score / 100) * plotH,
    }));
  }, [sorted, plotW, plotH]);

  const trendPoints = useMemo(() => {
    if (!detectedCycle) return [];
    return sorted.map((_, i) => {
      const phase = (i / detectedCycle.periodDays) * 2 * Math.PI;
      const amplitude = 15 * (detectedCycle.confidence / 100);
      const val = avg + amplitude * Math.sin(phase);
      return {
        x: PAD.left + (i / Math.max(sorted.length - 1, 1)) * plotW,
        y: PAD.top + (1 - val / 100) * plotH,
      };
    });
  }, [sorted, detectedCycle, avg, plotW, plotH]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('infradian.title')}</Text>
      <Text style={styles.description}>{t('infradian.description')}</Text>

      {detectedCycle && (
        <View style={styles.cycleInfo}>
          <Text style={styles.cycleLength}>{t('infradian.cycle_length')}: {detectedCycle.periodDays} days</Text>
          <Text style={styles.cycleConfidence}>{t('infradian.estimated')} ({detectedCycle.confidence}%)</Text>
        </View>
      )}

      <View style={styles.chartWrapper}>
        {!isPremium && (
          <View style={styles.premiumOverlay}>
            <Ionicons name="lock-closed" size={36} color="#FFFFFF" />
            <Text style={styles.premiumText}>{t('premium_required')}</Text>
            <Pressable style={styles.upgradeButton} onPress={() => navigation.navigate('Paywall')}>
              <Text style={styles.upgradeButtonText}>Upgrade</Text>
            </Pressable>
          </View>
        )}

        <View style={[!isPremium && { opacity: 0.15 }]}>
          {hasData ? (
            <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
              <Defs>
                <LinearGradient id="infGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={darkPalette.primary} stopOpacity="0.2" />
                  <Stop offset="1" stopColor={darkPalette.primary} stopOpacity="0" />
                </LinearGradient>
              </Defs>

              {/* Avg line */}
              <SvgLine
                x1={PAD.left} y1={PAD.top + (1 - avg / 100) * plotH}
                x2={PAD.left + plotW} y2={PAD.top + (1 - avg / 100) * plotH}
                stroke="#5A5A7A" strokeWidth={1} strokeDasharray="4,4"
              />

              {/* Score area */}
              {scorePoints.length > 1 && (
                <Path
                  d={`${smoothPath(scorePoints)} L ${scorePoints[scorePoints.length - 1].x} ${PAD.top + plotH} L ${scorePoints[0].x} ${PAD.top + plotH} Z`}
                  fill="url(#infGrad)"
                />
              )}

              {/* Score line */}
              <Path d={smoothPath(scorePoints)} stroke={darkPalette.primary} strokeWidth={2.5} fill="none" />

              {/* Trend line */}
              {trendPoints.length > 1 && (
                <Path d={smoothPath(trendPoints)} stroke={darkPalette.secondary} strokeWidth={2} fill="none" opacity={0.6} strokeDasharray="6,3" />
              )}

              {/* Dots */}
              {scorePoints.map((p, i) => (
                <Circle key={i} cx={p.x} cy={p.y} r={3} fill={darkPalette.primary} />
              ))}

              {/* X labels */}
              {sorted.filter((_, i) => i % Math.max(1, Math.floor(sorted.length / 5)) === 0).map((l, i, arr) => {
                const idx = sorted.indexOf(l);
                const x = PAD.left + (idx / Math.max(sorted.length - 1, 1)) * plotW;
                return <SvgText key={i} x={x} y={CHART_HEIGHT - 4} fontSize={9} fill="#5A5A7A" textAnchor="middle">{l.log_date.slice(5)}</SvgText>;
              })}

              {/* Y labels */}
              {[0, 25, 50, 75, 100].map((v) => (
                <SvgText key={v} x={PAD.left - 5} y={PAD.top + (1 - v / 100) * plotH + 3} fontSize={9} fill="#5A5A7A" textAnchor="end">{v}</SvgText>
              ))}
            </Svg>
          ) : (
            <View style={styles.noData}>
              <Text style={styles.noDataText}>{t('not_enough_data')}</Text>
            </View>
          )}
        </View>
      </View>

      {hasData && (
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{avg}</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{sorted.length}</Text>
            <Text style={styles.statLabel}>Days</Text>
          </View>
          {detectedCycle && (
            <View style={styles.stat}>
              <Text style={styles.statValue}>{detectedCycle.periodDays}d</Text>
              <Text style={styles.statLabel}>Cycle</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: darkPalette.surface, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  title: { fontSize: 18, fontWeight: '700', color: darkPalette.text, marginBottom: 4 },
  description: { fontSize: 13, lineHeight: 18, color: darkPalette.textSecondary, marginBottom: 12 },
  cycleInfo: { backgroundColor: '#252540', borderRadius: 8, padding: 10, marginBottom: 12 },
  cycleLength: { fontSize: 14, fontWeight: '600', color: darkPalette.text },
  cycleConfidence: { fontSize: 12, color: darkPalette.textSecondary, marginTop: 2 },
  chartWrapper: { position: 'relative' },
  premiumOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 10, justifyContent: 'center', alignItems: 'center' },
  premiumText: { fontSize: 14, color: darkPalette.text, textAlign: 'center', marginBottom: 16, marginTop: 8 },
  upgradeButton: { backgroundColor: darkPalette.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  upgradeButtonText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  noData: { height: 180, justifyContent: 'center', alignItems: 'center' },
  noDataText: { fontSize: 14, color: darkPalette.textSecondary },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: darkPalette.border },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: darkPalette.text },
  statLabel: { fontSize: 12, color: darkPalette.textSecondary, marginTop: 2 },
});
