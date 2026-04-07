import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { darkPalette } from '@/theme/colors';
import { useLogStore } from '@/store/logStore';
import { generateDailyPlan } from '@/lib/actionPlan';
import PremiumGate from '@/components/insights/PremiumGate';
import type { TimeBlock, ActionItem } from '@/lib/actionPlan';

const PHASE_COLORS: Record<string, string> = {
  rise: '#3B82F6',
  peak: '#22C55E',
  decline: '#F59E0B',
  recovery: '#A78BFA',
};

const PHASE_ICONS: Record<string, string> = {
  rise: 'sunny',
  peak: 'flash',
  decline: 'partly-sunny',
  recovery: 'moon',
};

function ActionPlanContent() {
  const navigation = useNavigation<any>();
  const logs = useLogStore((s) => s.logs);

  const plan = useMemo(() => {
    const hour = new Date().getHours();
    const allLogs = Object.values(logs);
    return generateDailyPlan(hour, allLogs);
  }, [logs]);

  const dateStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your Daily Plan</Text>
          <Text style={styles.subtitle}>{dateStr}</Text>
        </View>
        <Pressable
          style={styles.closeButton}
          onPress={() => { if (navigation.canGoBack()) navigation.goBack(); }}
        >
          <Ionicons name="close" size={22} color={darkPalette.textSecondary} />
        </Pressable>
      </View>

      {plan.personalizedCount > 0 && (
        <View style={styles.personalizedBanner}>
          <Ionicons name="sparkles" size={14} color={darkPalette.secondary} />
          <Text style={styles.personalizedText}>
            {plan.personalizedCount} personalized action{plan.personalizedCount !== 1 ? 's' : ''} based on your data
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {plan.timeBlocks.map((block) => (
          <TimeBlockCard key={block.phase} block={block} />
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TimeBlockCard({ block }: { block: TimeBlock }) {
  const phaseColor = PHASE_COLORS[block.phase] ?? darkPalette.primary;
  const phaseIcon = PHASE_ICONS[block.phase] ?? 'ellipse';

  return (
    <View style={[styles.blockCard, { borderLeftColor: phaseColor }]}>
      {/* Block header */}
      <View style={styles.blockHeader}>
        <Ionicons name={phaseIcon as any} size={18} color={phaseColor} />
        <Text style={[styles.blockLabel, { color: phaseColor }]}>{block.label}</Text>
        <Text style={styles.blockTime}>{block.timeRange}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actionsList}>
        {block.actions.map((action: ActionItem, i: number) => (
          <View key={i} style={styles.actionRow}>
            <View style={styles.actionIconWrap}>
              <Ionicons
                name={(action.iconName as any) ?? 'ellipse'}
                size={16}
                color={darkPalette.text}
              />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionText}>{action.text}</Text>
              {action.reason && (
                <Text style={styles.actionReason}>{action.reason}</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ActionPlanModal() {
  return (
    <PremiumGate feature="action_plan">
      <ActionPlanContent />
    </PremiumGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkPalette.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: darkPalette.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: darkPalette.textSecondary,
    marginTop: 4,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: darkPalette.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personalizedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  personalizedText: {
    fontSize: 12,
    fontWeight: '600',
    color: darkPalette.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  blockCard: {
    backgroundColor: darkPalette.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: darkPalette.border,
    borderLeftWidth: 4,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  blockLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  blockTime: {
    fontSize: 12,
    color: darkPalette.textSecondary,
    marginLeft: 'auto',
  },
  actionsList: {
    gap: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: darkPalette.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: darkPalette.text,
    lineHeight: 18,
  },
  actionReason: {
    fontSize: 11,
    color: darkPalette.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
});
