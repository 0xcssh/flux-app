import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';

interface MissedDayCardProps {
  dateStr: string;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function MissedDayCard({ dateStr }: MissedDayCardProps) {
  const { t } = useTranslation('dashboard');
  const label = formatDateLabel(dateStr);

  return (
    <View style={styles.container}>
      <Ionicons name="calendar-outline" size={48} color={darkPalette.textTertiary} />
      <Text style={styles.title}>{t('missed_day_title', { date: label })}</Text>
      <Text style={styles.subtitle}>{t('missed_day_subtitle')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: darkPalette.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: darkPalette.border,
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: darkPalette.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    color: darkPalette.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
