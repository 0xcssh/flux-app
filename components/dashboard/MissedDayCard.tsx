import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
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
  const navigation = useNavigation<any>();
  const label = formatDateLabel(dateStr);

  const handleLogThisDay = () => {
    navigation.navigate('Log', { date: dateStr });
  };

  return (
    <View style={styles.container}>
      <Ionicons name="calendar-outline" size={48} color={darkPalette.textTertiary} />
      <Text style={styles.title}>{t('missed_day_title', { date: label })}</Text>
      <Text style={styles.subtitle}>{t('missed_day_subtitle')}</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogThisDay} activeOpacity={0.8}>
        <Ionicons name="create-outline" size={16} color="#FFFFFF" />
        <Text style={styles.buttonText}>Log this day</Text>
      </TouchableOpacity>
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
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
