import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';

interface DailyTipCardProps {
  tipKey: string;
}

const FALLBACK_TIPS: Record<string, string> = {
  'tip.rise_early_hydrate': 'Start your day with water. Hydration supports testosterone production.',
  'tip.rise_plan_day': 'Energy is building. Plan your most important tasks now.',
  'tip.peak_morning_workout': 'Peak testosterone window. Ideal time for strength training.',
  'tip.peak_focus_work': 'You are at peak performance. Tackle your hardest challenges.',
  'tip.decline_light_activity': 'Energy is declining. Switch to lighter tasks and activities.',
  'tip.decline_wind_down': 'Start winding down. Avoid intense stimulation before evening.',
  'tip.recovery_sleep': 'Prioritize sleep. Growth hormone surges during deep sleep.',
  'tip.recovery_relax': 'Rest and recovery are essential. Your body is resetting.',
};

export default function DailyTipCard({ tipKey }: DailyTipCardProps) {
  const { t } = useTranslation('dashboard');

  const tipText = t(tipKey, { defaultValue: '' });
  const displayText = tipText && tipText !== tipKey
    ? tipText
    : FALLBACK_TIPS[tipKey] || 'Track your daily metrics to receive personalized tips.';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bulb" size={20} color="#F59E0B" />
        <Text style={styles.title}>{t('daily_tip')}</Text>
      </View>
      <Text style={styles.tipText}>{displayText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: darkPalette.surface,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: darkPalette.accent,
    borderWidth: 1,
    borderColor: darkPalette.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  icon: { },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: darkPalette.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 21,
    color: darkPalette.text,
    opacity: 0.9,
  },
});
