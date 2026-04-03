import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';
import { useSubscription } from '@/hooks/useSubscription';
import { useLogStore } from '@/store/logStore';
import { generateDailyPlan } from '@/lib/actionPlan';
import type { TimeBlock } from '@/lib/actionPlan';

const PHASE_COLORS: Record<string, string> = {
  rise: '#3B82F6',
  peak: '#22C55E',
  decline: '#F59E0B',
  recovery: '#A78BFA',
};

export default function ActionPlanCard() {
  const { t } = useTranslation('dashboard');
  const router = useRouter();
  const { canAccess } = useSubscription();
  const logs = useLogStore((s) => s.logs);
  const hasPremium = canAccess('action_plan');

  const plan = useMemo(() => {
    const hour = new Date().getHours();
    const allLogs = Object.values(logs);
    return generateDailyPlan(hour, allLogs);
  }, [logs]);

  const visibleBlocks = hasPremium ? plan.timeBlocks : plan.timeBlocks.slice(0, 2);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('action_plan_title')}</Text>
        {hasPremium && plan.personalizedCount > 0 && (
          <Text style={styles.personalizedBadge}>
            {t('action_plan_personalized', { count: plan.personalizedCount })}
          </Text>
        )}
      </View>

      {/* Time blocks */}
      {visibleBlocks.map((block, idx) => (
        <TimeBlockRow
          key={block.phase}
          block={block}
          isLast={idx === visibleBlocks.length - 1}
          blurred={!hasPremium && idx > 0}
        />
      ))}

      {/* CTA */}
      {!hasPremium ? (
        <Pressable
          style={styles.ctaButton}
          onPress={() => router.push('/(modals)/paywall' as any)}
        >
          <Ionicons name="lock-closed" size={14} color={darkPalette.primary} />
          <Text style={styles.ctaText}>{t('action_plan_unlock')}</Text>
        </Pressable>
      ) : (
        <Pressable
          style={styles.seeFullButton}
          onPress={() => router.push('/(modals)/action-plan' as any)}
        >
          <Text style={styles.seeFullText}>{t('action_plan_see_full')}</Text>
          <Ionicons name="chevron-forward" size={14} color={darkPalette.primary} />
        </Pressable>
      )}
    </View>
  );
}

function TimeBlockRow({
  block,
  isLast,
  blurred,
}: {
  block: TimeBlock;
  isLast: boolean;
  blurred: boolean;
}) {
  const phaseColor = PHASE_COLORS[block.phase] ?? darkPalette.primary;

  return (
    <View style={[styles.blockRow, !isLast && styles.blockRowBorder, blurred && styles.blurred]}>
      <View style={styles.blockHeader}>
        <View style={[styles.phaseDot, { backgroundColor: phaseColor }]} />
        <Text style={styles.blockLabel}>{block.label}</Text>
        <Text style={styles.blockTime}>{block.timeRange}</Text>
      </View>
      <View style={styles.actionsList}>
        {block.actions.slice(0, 3).map((action, i) => (
          <View key={i} style={styles.actionItem}>
            <Ionicons
              name={(action.iconName as any) ?? 'ellipse'}
              size={14}
              color={darkPalette.textSecondary}
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
  personalizedBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: darkPalette.secondary,
  },
  blockRow: {
    paddingVertical: 10,
  },
  blockRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: darkPalette.borderLight,
  },
  blurred: {
    opacity: 0.35,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  blockLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: darkPalette.text,
  },
  blockTime: {
    fontSize: 11,
    color: darkPalette.textSecondary,
    marginLeft: 'auto',
  },
  actionsList: {
    paddingLeft: 16,
    gap: 4,
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
