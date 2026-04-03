import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';
import { useChallengeStore } from '@/store/challengeStore';
import { useLogStore } from '@/store/logStore';
import { useSubscription } from '@/hooks/useSubscription';
import { CHALLENGES, getChallengeById } from '@/lib/challenges';
import type { Challenge } from '@/lib/challenges';
import { getTodayDate, formatLocalDate } from '@/lib/dateUtils';

function getSuggestedChallenge(logs: Record<string, any>): Challenge {
  const now = new Date();
  const recentLogs: any[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = formatLocalDate(d);
    if (logs[dateStr]) recentLogs.push(logs[dateStr]);
  }

  if (recentLogs.length > 0) {
    const avgSleep =
      recentLogs.reduce((sum, l) => sum + (l.sleep_quality ?? 0), 0) /
      recentLogs.length;
    const avgEnergy =
      recentLogs.reduce((sum, l) => sum + (l.energy ?? 0), 0) /
      recentLogs.length;

    if (avgSleep < 6) return CHALLENGES[0]; // Sleep Reset
    if (avgEnergy < 5) return CHALLENGES[1]; // Energy Boost
  }

  return CHALLENGES[2]; // Peak Performance
}

export default function ChallengeWidget() {
  const { t } = useTranslation('dashboard');
  const router = useRouter();
  const { canAccess } = useSubscription();
  const isPremiumUnlocked = canAccess('challenges');

  const activeChallenge = useChallengeStore((s) => s.activeChallenge);
  const startChallenge = useChallengeStore((s) => s.startChallenge);
  const completeDay = useChallengeStore((s) => s.completeDay);
  const getCurrentDayNumber = useChallengeStore((s) => s.getCurrentDayNumber);

  const logs = useLogStore((s) => s.logs);
  const todayLog = logs[getTodayDate()] ?? null;

  const suggested = useMemo(() => getSuggestedChallenge(logs), [logs]);

  // Active challenge view
  if (activeChallenge && activeChallenge.isActive) {
    const challenge = getChallengeById(activeChallenge.challengeId);
    if (!challenge) return null;

    const currentDay = getCurrentDayNumber();
    const task = challenge.dailyTasks.find((t) => t.day === currentDay);
    const completedCount = activeChallenge.completedDays.length;
    const progressRatio = completedCount / challenge.duration;
    const isDayCompleted = activeChallenge.completedDays.includes(currentDay);

    // Check if today's metric meets the threshold
    let canComplete = false;
    if (todayLog && task?.targetMetric && task.targetValue != null) {
      const metricValue = (todayLog as any)[task.targetMetric] ?? 0;
      if (task.targetDirection === 'below') {
        canComplete = metricValue <= task.targetValue;
      } else {
        canComplete = metricValue >= task.targetValue;
      }
    }

    return (
      <View style={[styles.card, { borderLeftColor: challenge.color }]}>
        {/* Header */}
        <View style={styles.header}>
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: challenge.color + '20' },
            ]}
          >
            <Ionicons
              name={challenge.iconName as keyof typeof Ionicons.glyphMap}
              size={18}
              color={challenge.color}
            />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>{challenge.title}</Text>
            <Text style={[styles.dayLabel, { color: challenge.color }]}>
              Day {currentDay}/{challenge.duration}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressRow}>
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

        {/* Today's task */}
        {task && (
          <View style={styles.taskSection}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskDesc} numberOfLines={2}>
              {task.description}
            </Text>
          </View>
        )}

        {/* Complete button */}
        {task && !isDayCompleted && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: canComplete
                  ? challenge.color
                  : darkPalette.surfaceElevated,
              },
            ]}
            onPress={() => {
              if (canComplete) completeDay(currentDay);
            }}
            activeOpacity={canComplete ? 0.7 : 1}
            disabled={!canComplete}
          >
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={canComplete ? '#FFFFFF' : darkPalette.textTertiary}
            />
            <Text
              style={[
                styles.actionButtonText,
                {
                  color: canComplete ? '#FFFFFF' : darkPalette.textTertiary,
                },
              ]}
            >
              {t('challenge_widget_complete')}
            </Text>
          </TouchableOpacity>
        )}

        {isDayCompleted && (
          <View style={styles.completedBadge}>
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={darkPalette.secondary}
            />
            <Text style={styles.completedText}>Completed today</Text>
          </View>
        )}
      </View>
    );
  }

  // Suggestion view
  const challenge = suggested;

  const handleStart = () => {
    if (!isPremiumUnlocked) {
      router.push('/(modals)/paywall' as any);
      return;
    }
    startChallenge(challenge.id);
  };

  return (
    <View style={[styles.card, { borderLeftColor: challenge.color }]}>
      <View style={styles.header}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: challenge.color + '20' },
          ]}
        >
          <Ionicons
            name={challenge.iconName as keyof typeof Ionicons.glyphMap}
            size={18}
            color={challenge.color}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{challenge.title}</Text>
          <Text style={styles.suggestedLabel}>
            {t('challenge_widget_based_on')}
          </Text>
        </View>
        {!isPremiumUnlocked && (
          <View style={styles.premiumBadge}>
            <Ionicons name="lock-closed" size={10} color="#F59E0B" />
            <Text style={styles.premiumBadgeText}>
              {t('challenge_widget_premium')}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.taskDesc} numberOfLines={2}>
        {challenge.description}
      </Text>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: challenge.color }]}
        onPress={handleStart}
        activeOpacity={0.7}
      >
        {!isPremiumUnlocked && (
          <Ionicons name="lock-closed" size={14} color="#FFFFFF" />
        )}
        <Text style={styles.actionButtonText}>
          {t('challenge_widget_start')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: darkPalette.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: darkPalette.border,
    borderLeftWidth: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: darkPalette.text,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  suggestedLabel: {
    fontSize: 11,
    color: darkPalette.textTertiary,
    marginTop: 1,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 5,
    backgroundColor: darkPalette.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
  },
  taskSection: {
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: darkPalette.text,
    marginBottom: 3,
  },
  taskDesc: {
    fontSize: 12,
    color: darkPalette.textSecondary,
    lineHeight: 17,
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: darkPalette.secondary,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
  },
});
