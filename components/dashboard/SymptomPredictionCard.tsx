import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';
import { useSymptomPredictions } from '@/hooks/useSymptomPredictions';
import type { PhaseType } from '@/types/log';

const PHASE_COLORS: Record<PhaseType, string> = {
  rise: '#3B82F6',
  peak: '#22C55E',
  decline: '#F59E0B',
  recovery: '#A78BFA',
};

const PHASE_EMOJIS: Record<PhaseType, string> = {
  rise: '🌅',
  peak: '☀️',
  decline: '🌇',
  recovery: '🌙',
};

const MAX_INTENSITY = 3;

export default function SymptomPredictionCard() {
  const { t } = useTranslation('dashboard');
  const { prediction } = useSymptomPredictions();
  const phaseColor = PHASE_COLORS[prediction.phase];

  return (
    <View style={[styles.card, { borderColor: phaseColor + '4D', borderLeftColor: phaseColor }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.phaseEmoji}>{PHASE_EMOJIS[prediction.phase]}</Text>
        <Text style={[styles.headerText, { color: phaseColor }]}>
          {t('symptom_header').toUpperCase()}
        </Text>
      </View>

      {/* Symptom list */}
      <View style={styles.symptomList}>
        {prediction.symptoms.map((symptom) => (
          <View key={symptom.id} style={styles.symptomRow}>
            <Text style={styles.symptomIcon}>{symptom.icon}</Text>
            <Text style={styles.symptomLabel}>{t(symptom.labelKey)}</Text>
            <View style={styles.intensityDots}>
              {Array.from({ length: MAX_INTENSITY }, (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        i < symptom.intensity ? phaseColor : '#2A2A45',
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Personal note */}
      {prediction.personalNote && (
        <Text style={styles.personalNote}>
          {t(prediction.personalNote.key, prediction.personalNote.params)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: darkPalette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  phaseEmoji: {
    fontSize: 16,
  },
  headerText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  symptomList: {
    gap: 12,
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symptomIcon: {
    fontSize: 20,
    width: 30,
  },
  symptomLabel: {
    fontSize: 14,
    color: darkPalette.text,
    flex: 1,
  },
  intensityDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  personalNote: {
    fontSize: 12,
    color: darkPalette.textSecondary,
    fontStyle: 'italic',
    marginTop: 14,
  },
});
