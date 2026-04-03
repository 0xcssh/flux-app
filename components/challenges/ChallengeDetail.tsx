import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';
import type { Challenge } from '@/lib/challenges';
import type { ChallengeProgress } from '@/store/challengeStore';
import DailyTaskCard from './DailyTaskCard';
import { useLogStore } from '@/store/logStore';

interface ChallengeDetailProps {
  challenge: Challenge;
  progress: ChallengeProgress;
  currentDayNumber: number;
  onCompleteDay: (dayNumber: number) => void;
  onAbandon: () => void;
}

export default function ChallengeDetail({
  challenge,
  progress,
  currentDayNumber,
  onCompleteDay,
  onAbandon,
}: ChallengeDetailProps) {
  const { t } = useTranslation('insights');
  const [expanded, setExpanded] = useState(false);

  const todayLog = useLogStore((s) => s.getTodayLog());
  const completedCount = progress.completedDays.length;
  const progressRatio = completedCount / challenge.duration;
  const isFinished = completedCount >= challenge.duration;

  // Check if today's log meets the target for a given task
  const canCompleteTask = (task: typeof challenge.dailyTasks[number]): boolean => {
    if (!todayLog) return false;
    if (!task.targetMetric || task.targetValue == null) return true;
    const metricValue = (todayLog as unknown as Record<string, unknown>)[task.targetMetric];
    if (typeof metricValue !== 'number') return false;
    if (task.targetDirection === 'below') return metricValue <= task.targetValue;
    return metricValue >= task.targetValue;
  };

  const handleAbandon = () => {
    Alert.alert(
      t('challenge_abandon'),
      t('challenge_abandon_confirm'),
      [
        { text: 'Cancel', style: 'cancel' },
        { text: t('challenge_abandon'), style: 'destructive', onPress: onAbandon },
      ],
    );
  };

  // Current day's task
  const todayTask = challenge.dailyTasks.find((task) => task.day === currentDayNumber);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: challenge.color + '20' }]}>
          <Ionicons
            name={challenge.iconName as keyof typeof Ionicons.glyphMap}
            size={24}
            color={challenge.color}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{challenge.title}</Text>
          <Text style={styles.subtitle}>
            {isFinished
              ? t('challenge_completed')
              : t('challenge_day', {
                  current: Math.min(currentDayNumber, challenge.duration),
                  total: challenge.duration,
                })}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(100, progressRatio * 100)}%`,
                backgroundColor: challenge.color,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: challenge.color }]}>
          {completedCount}/{challenge.duration}
        </Text>
      </View>

      {/* Today's task (if within range and not finished) */}
      {todayTask && !isFinished && (
        <View style={styles.todaySection}>
          <Text style={styles.todaySectionTitle}>Today</Text>
          <DailyTaskCard
            task={todayTask}
            challengeColor={challenge.color}
            isCompleted={progress.completedDays.includes(todayTask.day)}
            canComplete={canCompleteTask(todayTask)}
            onComplete={() => onCompleteDay(todayTask.day)}
          />
        </View>
      )}

      {/* Expand/collapse all tasks */}
      <TouchableOpacity
        style={styles.expandButton}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.expandText}>
          {expanded ? 'Hide all tasks' : 'Show all tasks'}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={darkPalette.textSecondary}
        />
      </TouchableOpacity>

      {/* All tasks list */}
      {expanded && (
        <View style={styles.taskList}>
          {challenge.dailyTasks.map((task) => {
            const isTaskCompleted = progress.completedDays.includes(task.day);
            const isCurrent = task.day === currentDayNumber;
            const isFuture = task.day > currentDayNumber;

            return (
              <View key={task.day} style={styles.taskRow}>
                <View style={styles.taskIndicator}>
                  {isTaskCompleted ? (
                    <View style={[styles.dot, { backgroundColor: darkPalette.secondary }]}>
                      <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                    </View>
                  ) : isCurrent ? (
                    <View style={[styles.dot, { backgroundColor: challenge.color }]} />
                  ) : (
                    <View style={[styles.dot, { backgroundColor: darkPalette.textTertiary }]} />
                  )}
                  {task.day < challenge.duration && <View style={styles.taskLine} />}
                </View>
                <View style={[styles.taskContent, isFuture && styles.taskFuture]}>
                  <Text style={styles.taskDay}>Day {task.day}</Text>
                  <Text
                    style={[
                      styles.taskTitle,
                      isTaskCompleted && styles.taskTitleCompleted,
                    ]}
                  >
                    {task.title}
                  </Text>
                  <Text style={styles.taskDescription} numberOfLines={2}>
                    {task.description}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Abandon button */}
      {!isFinished && (
        <TouchableOpacity
          style={styles.abandonButton}
          onPress={handleAbandon}
          activeOpacity={0.7}
        >
          <Ionicons name="close-circle-outline" size={16} color={darkPalette.error} />
          <Text style={styles.abandonText}>{t('challenge_abandon')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: darkPalette.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: darkPalette.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: darkPalette.text,
  },
  subtitle: {
    fontSize: 13,
    color: darkPalette.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  progressBar: {
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
  },
  todaySection: {
    marginBottom: 12,
  },
  todaySectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: darkPalette.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: darkPalette.border,
  },
  expandText: {
    fontSize: 13,
    color: darkPalette.textSecondary,
    fontWeight: '500',
  },
  taskList: {
    marginTop: 8,
  },
  taskRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  taskIndicator: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskLine: {
    width: 2,
    flex: 1,
    backgroundColor: darkPalette.border,
    marginVertical: 2,
  },
  taskContent: {
    flex: 1,
    marginLeft: 10,
    paddingBottom: 16,
  },
  taskFuture: {
    opacity: 0.5,
  },
  taskDay: {
    fontSize: 11,
    fontWeight: '600',
    color: darkPalette.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: darkPalette.text,
    marginBottom: 2,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: darkPalette.textSecondary,
  },
  taskDescription: {
    fontSize: 12,
    color: darkPalette.textTertiary,
    lineHeight: 17,
  },
  abandonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: darkPalette.border,
  },
  abandonText: {
    fontSize: 13,
    color: darkPalette.error,
    fontWeight: '500',
  },
});
