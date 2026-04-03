import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';
import { useLogStore } from '@/store/logStore';
import { computeSymptomAccuracy } from '@/lib/symptomAccuracy';

const RING_SIZE = 100;
const STROKE_WIDTH = 8;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = RING_SIZE / 2;

function getScoreColor(score: number): string {
  if (score >= 70) return darkPalette.secondary; // green
  if (score >= 50) return darkPalette.accent; // amber
  return darkPalette.error; // red
}

export default function SymptomAccuracyCard() {
  const { t } = useTranslation('insights');
  const logs = useLogStore((s) => s.logs);

  const accuracy = useMemo(() => {
    const sortedLogs = Object.values(logs).sort((a, b) =>
      a.log_date.localeCompare(b.log_date),
    );
    return computeSymptomAccuracy(sortedLogs);
  }, [logs]);

  const color = getScoreColor(accuracy.overallScore);
  const progress = (accuracy.overallScore / 100) * CIRCUMFERENCE;
  const dashOffset = CIRCUMFERENCE - progress;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('prediction_accuracy')}</Text>

      <View style={styles.content}>
        <View style={styles.ringContainer}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke={darkPalette.border}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke={color}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
            />
          </Svg>
          <View style={styles.ringCenter}>
            <Text style={[styles.percentage, { color }]}>
              {accuracy.overallScore}%
            </Text>
          </View>
        </View>

        <Text style={styles.matchText}>
          {accuracy.correctPredictions}/{accuracy.totalPredictions}{' '}
          {t('predictions_matched')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: darkPalette.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: darkPalette.border,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: darkPalette.text,
    marginBottom: 16,
  },
  content: {
    alignItems: 'center',
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -1,
  },
  matchText: {
    fontSize: 13,
    color: darkPalette.textSecondary,
    marginTop: 12,
  },
});
