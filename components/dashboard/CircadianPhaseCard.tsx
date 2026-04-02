import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';
import type { PhaseType } from '@/types/log';

interface CircadianPhaseCardProps {
  phase: PhaseType;
  progress: number;
}

const PHASE_CONFIG: Record<PhaseType, { icon: string; color: string }> = {
  rise: { icon: '☀️', color: '#3B82F6' },
  peak: { icon: '⚡', color: '#22C55E' },
  decline: { icon: '🌅', color: '#F59E0B' },
  recovery: { icon: '🌙', color: '#A78BFA' },
};

export default function CircadianPhaseCard({ phase, progress }: CircadianPhaseCardProps) {
  const { t } = useTranslation('dashboard');
  const config = PHASE_CONFIG[phase];

  return (
    <View style={[styles.container, { borderColor: config.color + '30' }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{config.icon}</Text>
        <View style={styles.headerText}>
          <Text style={styles.sectionLabel}>{t('current_phase')}</Text>
          <Text style={[styles.phaseName, { color: config.color }]}>
            {t(`phases.${phase}.name`)}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.round(progress * 100)}%`,
                backgroundColor: config.color,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(progress * 100)}%
        </Text>
      </View>

      <Text style={styles.description}>
        {t(`phases.${phase}.description`)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: darkPalette.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: darkPalette.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  icon: { fontSize: 32 },
  headerText: { flex: 1 },
  sectionLabel: {
    fontSize: 11,
    color: darkPalette.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  phaseName: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  progressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: darkPalette.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: darkPalette.textSecondary,
    width: 36,
    textAlign: 'right',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: darkPalette.text,
    opacity: 0.85,
  },
});
