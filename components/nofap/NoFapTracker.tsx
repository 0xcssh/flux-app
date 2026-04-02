import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle } from 'react-native-svg';
import { useNoFapStreak } from '@/hooks/useNoFapStreak';
import { MILESTONE_DAYS } from '@/types/nofap';

interface NoFapTrackerProps {
  compact?: boolean;
}

export default function NoFapTracker({ compact = false }: NoFapTrackerProps) {
  const { t } = useTranslation('nofap');
  const { streakDays, currentStreak, startStreak, endStreak, longestStreak } =
    useNoFapStreak();

  // Find next milestone
  const nextMilestone =
    MILESTONE_DAYS.find((m) => m > streakDays) ?? MILESTONE_DAYS[MILESTONE_DAYS.length - 1];
  const progress = Math.min(streakDays / nextMilestone, 1);

  const handleReset = () => {
    Alert.alert(t('reset_button'), t('reset_confirm'), [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => endStreak(),
      },
    ]);
  };

  const handleStart = () => {
    startStreak();
  };

  // Progress ring dimensions
  const size = compact ? 80 : 140;
  const strokeWidth = compact ? 6 : 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactRing}>
          <Svg width={size} height={size}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#E2E8F0"
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#10B981"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          </Svg>
          <View style={styles.compactCenter}>
            <Text style={styles.compactDays}>{streakDays}</Text>
            <Text style={styles.compactLabel}>days</Text>
          </View>
        </View>
        <View style={styles.compactInfo}>
          <Text style={styles.compactTitle}>{t('current_streak')}</Text>
          <Text style={styles.compactSubtitle}>
            {t('longest_streak')}: {longestStreak}d
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('title')}</Text>

      <View style={styles.ringWrapper}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#10B981"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={styles.centerText}>
          <Text style={styles.dayNumber}>{streakDays}</Text>
          <Text style={styles.dayLabel}>
            {t('streak_label', { count: streakDays })}
          </Text>
        </View>
      </View>

      <Text style={styles.nextMilestone}>
        Next: {nextMilestone} days ({nextMilestone - streakDays} to go)
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{streakDays}</Text>
          <Text style={styles.statLabel}>{t('current_streak')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{longestStreak}</Text>
          <Text style={styles.statLabel}>{t('longest_streak')}</Text>
        </View>
      </View>

      {currentStreak ? (
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
          activeOpacity={0.7}
        >
          <Text style={styles.resetButtonText}>{t('reset_button')}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStart}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>Start Streak</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
  },
  ringWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 42,
    fontWeight: '800',
    color: '#10B981',
  },
  dayLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: -2,
  },
  nextMilestone: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  startButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  compactRing: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  compactCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  compactDays: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10B981',
  },
  compactLabel: {
    fontSize: 9,
    color: '#64748B',
    marginTop: -1,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  compactSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
});
