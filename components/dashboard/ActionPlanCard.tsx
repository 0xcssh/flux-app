import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';
import { useSubscription } from '@/hooks/useSubscription';
import { useLogStore } from '@/store/logStore';
import { generateDailyPlan } from '@/lib/actionPlan';
import { useSettingsStore } from '@/store/settingsStore';
import type { TimeBlock } from '@/lib/actionPlan';

const PHASE_COLORS: Record<string, string> = {
  rise: '#3B82F6',
  peak: '#22C55E',
  decline: '#F59E0B',
  recovery: '#A78BFA',
};

const PHASE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  rise: 'sunny',
  peak: 'flash',
  decline: 'trending-down',
  recovery: 'moon',
};

function getCurrentPhaseIndex(wakeUpHour?: number): number {
  const hour = new Date().getHours();
  const offset = (wakeUpHour ?? 6) - 6;
  const riseStart = ((4 + offset) % 24 + 24) % 24;
  const peakStart = ((8 + offset) % 24 + 24) % 24;
  const declineStart = ((12 + offset) % 24 + 24) % 24;
  const recoveryStart = ((20 + offset) % 24 + 24) % 24;

  // Normalize hour for comparison when boundaries wrap around midnight
  const h = hour;
  if (riseStart <= peakStart) {
    if (h >= riseStart && h < peakStart) return 0;
  } else {
    if (h >= riseStart || h < peakStart) return 0;
  }
  if (peakStart <= declineStart) {
    if (h >= peakStart && h < declineStart) return 1;
  } else {
    if (h >= peakStart || h < declineStart) return 1;
  }
  if (declineStart <= recoveryStart) {
    if (h >= declineStart && h < recoveryStart) return 2;
  } else {
    if (h >= declineStart || h < recoveryStart) return 2;
  }
  return 3;
}

export default function ActionPlanCard() {
  const { t } = useTranslation('dashboard');
  const navigation = useNavigation<any>();
  const { canAccess } = useSubscription();
  const logs = useLogStore((s) => s.logs);
  const hasPremium = canAccess('action_plan');
  const hormonalProfile = useSettingsStore((s) => s.hormonalProfile);

  const plan = useMemo(() => {
    const hour = new Date().getHours();
    const allLogs = Object.values(logs);
    return generateDailyPlan(hour, allLogs, hormonalProfile?.wakeUpHour);
  }, [logs, hormonalProfile]);

  const currentPhaseIndex = getCurrentPhaseIndex(hormonalProfile?.wakeUpHour);
  const currentBlock = plan.timeBlocks[currentPhaseIndex];
  const logCount = Object.keys(logs).length;
  const isPersonalized = hasPremium && logCount >= 7 && plan.personalizedCount > 0;

  if (hasPremium) {
    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('action_plan_title')}</Text>
          {isPersonalized && (
            <View style={styles.personalizedBadgeContainer}>
              <Text style={styles.personalizedBadge}>
                {t('action_plan_personalized', { count: plan.personalizedCount })}
              </Text>
            </View>
          )}
        </View>

        {/* Current phase block */}
        {currentBlock && (
          <CurrentPhaseBlock block={currentBlock} />
        )}

        {/* See full plan CTA */}
        <Pressable
          style={styles.seeFullButton}
          onPress={() => navigation.navigate('ActionPlan')}
        >
          <Text style={styles.seeFullText}>{t('action_plan_see_full')}</Text>
          <Ionicons name="chevron-forward" size={14} color={darkPalette.primary} />
        </Pressable>
      </View>
    );
  }

  // Free user layout
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('action_plan_title')}</Text>
        <Text style={styles.currentPhaseLabel}>{t('action_plan_current_phase')}</Text>
      </View>

      {/* Current phase block — fully visible */}
      {currentBlock && (
        <CurrentPhaseBlock block={currentBlock} />
      )}

      {/* 3 blurred placeholder blocks */}
      <View style={styles.blurredSection}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.blurredBlock}>
            <View style={styles.blurredBar} />
            <View style={styles.blurredBarShort} />
          </View>
        ))}
        <View style={styles.lockOverlay}>
          <Ionicons name="lock-closed" size={16} color={darkPalette.textTertiary} />
        </View>
      </View>

      {/* CTA */}
      <Pressable
        style={styles.ctaButton}
        onPress={() => navigation.navigate('Paywall')}
      >
        <Ionicons name="lock-closed" size={14} color={darkPalette.primary} />
        <Text style={styles.ctaText}>{t('action_plan_morning_cta')}</Text>
      </Pressable>
    </View>
  );
}

function CurrentPhaseBlock({ block }: { block: TimeBlock }) {
  const { t } = useTranslation('dashboard');
  const phaseColor = PHASE_COLORS[block.phase] ?? darkPalette.primary;
  const phaseIcon = PHASE_ICONS[block.phase] ?? 'ellipse';

  return (
    <View style={[styles.currentBlock, { borderLeftColor: phaseColor }]}>
      <View style={styles.blockHeader}>
        <Ionicons name={phaseIcon} size={16} color={phaseColor} />
        <Text style={styles.blockLabel}>{block.label}</Text>
        <Text style={styles.blockTime}>{block.timeRange}</Text>
      </View>
      <View style={styles.actionsList}>
        {block.actions.slice(0, 3).map((action, i) => (
          <View key={i} style={styles.actionItem}>
            <Ionicons
              name={(action.iconName as keyof typeof Ionicons.glyphMap) ?? 'ellipse'}
              size={14}
              color={phaseColor}
            />
            <Text style={styles.actionText} numberOfLines={1}>
              {action.text}
            </Text>
          </View>
        ))}
      </View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: darkPalette.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  currentPhaseLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: darkPalette.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  personalizedBadgeContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  personalizedBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: darkPalette.secondary,
  },
  currentBlock: {
    borderLeftWidth: 3,
    borderLeftColor: darkPalette.primary,
    paddingLeft: 12,
    paddingVertical: 8,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  blockLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: darkPalette.text,
  },
  blockTime: {
    fontSize: 11,
    color: darkPalette.textSecondary,
    marginLeft: 'auto',
  },
  actionsList: {
    gap: 6,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 12,
    color: darkPalette.textSecondary,
    flex: 1,
  },
  // Blurred section for free users
  blurredSection: {
    marginTop: 10,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 8,
  },
  blurredBlock: {
    height: 48,
    backgroundColor: 'rgba(37, 37, 64, 0.3)',
    borderRadius: 8,
    marginBottom: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  blurredBar: {
    height: 8,
    width: '60%',
    backgroundColor: 'rgba(139, 139, 163, 0.12)',
    borderRadius: 4,
    marginBottom: 6,
  },
  blurredBarShort: {
    height: 6,
    width: '40%',
    backgroundColor: 'rgba(139, 139, 163, 0.08)',
    borderRadius: 3,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '600',
    color: darkPalette.primary,
  },
  seeFullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
    paddingVertical: 8,
  },
  seeFullText: {
    fontSize: 13,
    fontWeight: '600',
    color: darkPalette.primary,
  },
});
