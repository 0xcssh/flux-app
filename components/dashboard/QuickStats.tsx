import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { darkPalette } from '@/theme/colors';
import type { PhaseType } from '@/types/log';

interface QuickStatsProps {
  phase: PhaseType;
  phaseLabel: string;
  yesterdayScore: number | null;
  todayScore: number | null;
  noFapStreakDays: number;
}

const PHASE_ICONS: Record<PhaseType, { iconName: string; color: string }> = {
  rise: { iconName: 'sunny', color: darkPalette.primary },
  peak: { iconName: 'flash', color: darkPalette.secondary },
  decline: { iconName: 'partly-sunny', color: darkPalette.accent },
  recovery: { iconName: 'moon', color: '#A78BFA' },
};

function getStreakColor(days: number): string {
  if (days >= 30) return '#F59E0B'; // gold
  if (days >= 14) return '#E879F9'; // purple
  if (days >= 7) return '#3B82F6';  // blue
  return '#22C55E';                  // green — always vibrant
}

export default function QuickStats({ phase, phaseLabel, yesterdayScore, todayScore, noFapStreakDays }: QuickStatsProps) {
  const phaseInfo = PHASE_ICONS[phase];
  const trend = todayScore != null && yesterdayScore != null ? todayScore - yesterdayScore : null;
  const streakColor = noFapStreakDays === 0 ? '#8B8BA3' : getStreakColor(noFapStreakDays);

  return (
    <View style={styles.row}>
      {/* NoFap Streak */}
      <View style={styles.card}>
        <Ionicons name="shield-checkmark" size={20} color={streakColor} />
        <Text style={[styles.cardValue, { color: streakColor }]}>Day {noFapStreakDays}</Text>
        <Text style={styles.cardLabel}>NoFap</Text>
      </View>

      {/* Current Phase */}
      <View style={[styles.card, { borderColor: phaseInfo.color + '40' }]}>
        <Ionicons name={phaseInfo.iconName as any} size={20} color={phaseInfo.color} />
        <Text style={[styles.cardValue, { color: phaseInfo.color }]}>{phaseLabel}</Text>
        <Text style={styles.cardLabel}>Phase</Text>
      </View>

      {/* Trend */}
      <View style={styles.card}>
        {trend != null ? (
          <>
            <FontAwesome
              name={trend >= 0 ? 'arrow-up' : 'arrow-down'}
              size={18}
              color={trend >= 0 ? darkPalette.secondary : darkPalette.error}
            />
            <Text style={[styles.cardValue, { color: trend >= 0 ? darkPalette.secondary : darkPalette.error }]}>
              {trend >= 0 ? '+' : ''}{trend}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.cardIcon}>—</Text>
            <Text style={styles.cardValue}>—</Text>
          </>
        )}
        <Text style={styles.cardLabel}>vs Yesterday</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  card: {
    flex: 1,
    backgroundColor: darkPalette.surface,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: darkPalette.border,
    gap: 4,
  },
  cardIcon: { fontSize: 20 },
  cardValue: { fontSize: 16, fontWeight: '800', color: darkPalette.text },
  cardLabel: { fontSize: 10, color: darkPalette.textTertiary, fontWeight: '600', textTransform: 'uppercase' },
});
