import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { darkPalette } from '@/theme/colors';

interface StreakBarProps {
  days: number;
}

function getStreakTier(days: number) {
  if (days >= 30) return { label: 'Legendary', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' };
  if (days >= 14) return { label: 'Silver', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.12)' };
  if (days >= 7) return { label: 'Bronze', color: '#CD7F32', bg: 'rgba(205, 127, 50, 0.12)' };
  return { label: '', color: darkPalette.textSecondary, bg: darkPalette.surface };
}

export default function StreakBar({ days }: StreakBarProps) {
  const tier = getStreakTier(days);

  return (
    <View style={[styles.container, { backgroundColor: tier.bg, borderColor: tier.color + '30' }]}>
      <Ionicons name="flame" size={20} color={tier.color} />
      <Text style={[styles.days, { color: tier.color }]}>{days}</Text>
      <Text style={styles.label}>day streak</Text>
      {days > 0 && <Text style={styles.message}>Keep going!</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  fire: { },
  days: { fontSize: 22, fontWeight: '800' },
  label: { fontSize: 14, color: darkPalette.textSecondary, fontWeight: '500' },
  message: { marginLeft: 'auto', fontSize: 12, color: darkPalette.textTertiary, fontWeight: '600' },
});
