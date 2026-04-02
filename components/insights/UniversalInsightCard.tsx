import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';
import type { UniversalInsight } from '@/types/insight';

const CATEGORY_COLORS: Record<string, string> = {
  circadian: darkPalette.primary,
  hormone: darkPalette.accent,
  sleep: darkPalette.sleep,
  training: darkPalette.training,
};

interface UniversalInsightCardProps {
  insight: UniversalInsight;
}

export default function UniversalInsightCard({ insight }: UniversalInsightCardProps) {
  const { t } = useTranslation('insights');
  const accentColor = CATEGORY_COLORS[insight.category] || darkPalette.primary;

  return (
    <View style={[styles.card, { borderLeftColor: accentColor }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{insight.icon}</Text>
        <Text style={styles.title}>{t(insight.titleKey)}</Text>
      </View>
      <Text style={styles.body}>{t(insight.bodyKey)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: darkPalette.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: darkPalette.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: darkPalette.text,
    flex: 1,
  },
  body: {
    fontSize: 13,
    color: darkPalette.textSecondary,
    lineHeight: 19,
  },
});
