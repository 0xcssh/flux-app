import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { lightPalette } from '@/theme/colors';
import type { PhaseType } from '@/types/log';

interface CircadianPhaseCardProps {
  phase: PhaseType;
  progress: number; // 0-1
}

const PHASE_CONFIG: Record<PhaseType, { icon: string; color: string; bgColor: string }> = {
  rise: { icon: '\u2600\uFE0F', color: '#2563EB', bgColor: '#EFF6FF' },
  peak: { icon: '\uD83C\uDF1F', color: '#10B981', bgColor: '#ECFDF5' },
  decline: { icon: '\uD83C\uDF05', color: '#F59E0B', bgColor: '#FFFBEB' },
  recovery: { icon: '\uD83C\uDF19', color: '#8B5CF6', bgColor: '#F5F3FF' },
};

export default function CircadianPhaseCard({ phase, progress }: CircadianPhaseCardProps) {
  const { t } = useTranslation('dashboard');
  const config = PHASE_CONFIG[phase];

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{config.icon}</Text>
        <View style={styles.headerText}>
          <Text style={styles.sectionLabel}>{t('current_phase')}</Text>
          <Text style={[styles.phaseName, { color: config.color }]}>
            {t(`phases.${phase}.name`)}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
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
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  icon: {
    fontSize: 32,
  },
  headerText: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 12,
    color: lightPalette.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  phaseName: {
    fontSize: 20,
    fontWeight: '700',
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
    backgroundColor: 'rgba(0,0,0,0.08)',
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
    color: lightPalette.textSecondary,
    width: 36,
    textAlign: 'right',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: lightPalette.textSecondary,
  },
});
