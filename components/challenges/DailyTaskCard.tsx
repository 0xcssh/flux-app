import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';
import type { DailyTask } from '@/lib/challenges';

const METRIC_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  sleep_quality: 'moon',
  energy: 'flash',
  stress: 'pulse',
  training: 'barbell',
};

const METRIC_LABELS: Record<string, string> = {
  sleep_quality: 'Sleep Quality',
  energy: 'Energy',
  stress: 'Stress',
  training: 'Training',
};

interface DailyTaskCardProps {
  task: DailyTask;
  challengeColor: string;
  isCompleted: boolean;
  canComplete: boolean;
  onComplete: () => void;
}

export default function DailyTaskCard({
  task,
  challengeColor,
  isCompleted,
  canComplete,
  onComplete,
}: DailyTaskCardProps) {
  const { t } = useTranslation('insights');

  const directionLabel = task.targetDirection === 'below' ? '<=' : '>=';
  const metricLabel = task.targetMetric ? METRIC_LABELS[task.targetMetric] ?? task.targetMetric : '';

  return (
    <View style={[styles.card, isCompleted && styles.cardCompleted]}>
      <View style={styles.header}>
        <View
          style={[
            styles.statusCircle,
            isCompleted
              ? { backgroundColor: darkPalette.secondary }
              : { borderColor: challengeColor, borderWidth: 2 },
          ]}
        >
          {isCompleted && (
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          )}
        </View>
        <Text style={[styles.title, isCompleted && styles.titleCompleted]}>
          {task.title}
        </Text>
      </View>

      <Text style={styles.description}>{task.description}</Text>

      {task.targetMetric && task.targetValue != null && (
        <View style={styles.targetContainer}>
          <Ionicons
            name={METRIC_ICONS[task.targetMetric] ?? 'analytics'}
            size={14}
            color={challengeColor}
          />
          <Text style={[styles.targetText, { color: challengeColor }]}>
            {t('challenge_target', {
              metric: metricLabel,
              direction: directionLabel,
              value: task.targetValue,
            })}
          </Text>
        </View>
      )}

      {!isCompleted && canComplete && (
        <TouchableOpacity
          style={[styles.completeButton, { backgroundColor: challengeColor + '20' }]}
          onPress={onComplete}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark-circle-outline" size={16} color={challengeColor} />
          <Text style={[styles.completeText, { color: challengeColor }]}>
            {t('challenge_mark_complete')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: darkPalette.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: darkPalette.border,
  },
  cardCompleted: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: darkPalette.text,
    flex: 1,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: darkPalette.textSecondary,
  },
  description: {
    fontSize: 13,
    color: darkPalette.textSecondary,
    lineHeight: 19,
    marginBottom: 10,
    marginLeft: 32,
  },
  targetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 32,
    marginBottom: 10,
  },
  targetText: {
    fontSize: 12,
    fontWeight: '600',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 4,
  },
  completeText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
