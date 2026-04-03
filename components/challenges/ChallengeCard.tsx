import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';
import type { Challenge } from '@/lib/challenges';
import type { ChallengeProgress } from '@/store/challengeStore';

interface ChallengeCardProps {
  challenge: Challenge;
  progress: ChallengeProgress | null;
  isCompleted: boolean;
  onPress: () => void;
}

export default function ChallengeCard({
  challenge,
  progress,
  isCompleted,
  onPress,
}: ChallengeCardProps) {
  const { t } = useTranslation('insights');

  const isActive = progress?.isActive ?? false;
  const completedCount = progress?.completedDays.length ?? 0;
  const progressRatio = completedCount / challenge.duration;

  let statusText = t('challenge_available');
  let statusColor = darkPalette.textTertiary;
  let ctaText = t('challenge_start');

  if (isCompleted) {
    statusText = t('challenge_completed');
    statusColor = darkPalette.secondary;
    ctaText = t('challenge_completed');
  } else if (isActive && progress) {
    statusText = t('challenge_day', {
      current: progress.currentDay,
      total: challenge.duration,
    });
    statusColor = challenge.color;
    ctaText = t('challenge_continue');
  }

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: challenge.color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: challenge.color + '20' }]}>
          <Ionicons
            name={challenge.iconName as keyof typeof Ionicons.glyphMap}
            size={22}
            color={challenge.color}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{challenge.title}</Text>
          <Text style={styles.duration}>{challenge.duration} days</Text>
        </View>
        {isCompleted && (
          <Ionicons name="checkmark-circle" size={22} color={darkPalette.secondary} />
        )}
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {challenge.description}
      </Text>

      {isActive && progress && (
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
      )}

      <View style={styles.footer}>
        <Text style={[styles.status, { color: statusColor }]}>{statusText}</Text>
        <View
          style={[
            styles.ctaButton,
            {
              backgroundColor: isCompleted
                ? darkPalette.surfaceElevated
                : challenge.color + '20',
            },
          ]}
        >
          <Text
            style={[
              styles.ctaText,
              { color: isCompleted ? darkPalette.textTertiary : challenge.color },
            ]}
          >
            {ctaText}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
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
    borderLeftWidth: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: darkPalette.text,
  },
  duration: {
    fontSize: 12,
    color: darkPalette.textTertiary,
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: darkPalette.textSecondary,
    lineHeight: 19,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
  },
  ctaButton: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
