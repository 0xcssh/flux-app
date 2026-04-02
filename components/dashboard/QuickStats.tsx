import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { darkPalette } from '@/theme/colors';
import type { PhaseType } from '@/types/log';

interface QuickStatsProps {
  phase: PhaseType;
  phaseLabel: string;
  yesterdayScore: number | null;
  todayScore: number | null;
}

const PHASE_ICONS: Record<PhaseType, { icon: string; color: string }> = {
  rise: { icon: '☀️', color: darkPalette.primary },
  peak: { icon: '⚡', color: darkPalette.secondary },
  decline: { icon: '🌅', color: darkPalette.accent },
  recovery: { icon: '🌙', color: '#A78BFA' },
};

export default function QuickStats({ phase, phaseLabel, yesterdayScore, todayScore }: QuickStatsProps) {
  const phaseInfo = PHASE_ICONS[phase];
  const trend = todayScore != null && yesterdayScore != null ? todayScore - yesterdayScore : null;

  return (
    <View style={styles.row}>
      {/* Peak Window */}
      <View style={styles.card}>
        <Text style={styles.cardIcon}>⏰</Text>
        <Text style={styles.cardValue}>6-10 AM</Text>
        <Text style={styles.cardLabel}>Peak Window</Text>
      </View>

      {/* Current Phase */}
      <View style={[styles.card, { borderColor: phaseInfo.color + '40' }]}>
        <Text style={styles.cardIcon}>{phaseInfo.icon}</Text>
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
