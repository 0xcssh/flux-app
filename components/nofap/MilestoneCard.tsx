import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NoFapMilestone } from '@/types/nofap';

interface MilestoneCardProps {
  milestone: NoFapMilestone;
}

export default function MilestoneCard({ milestone }: MilestoneCardProps) {
  const { t } = useTranslation('nofap');

  const milestoneName = t(`milestones.${milestone.days}d.name`);
  const milestoneMessage = t(`milestones.${milestone.days}d.message`);

  return (
    <View
      style={[
        styles.container,
        milestone.achieved ? styles.achievedContainer : styles.futureContainer,
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconCircle,
            milestone.achieved ? styles.achievedIcon : styles.futureIcon,
          ]}
        >
          <Text style={styles.iconText}>
            {milestone.achieved ? '\u2713' : `${milestone.days}`}
          </Text>
        </View>
        <View style={styles.headerText}>
          <Text
            style={[
              styles.title,
              !milestone.achieved && styles.futureTitle,
            ]}
          >
            {milestoneName}
          </Text>
          <Text style={styles.daysLabel}>{milestone.days} days</Text>
        </View>
        {milestone.achieved && milestone.achieved_date && (
          <Text style={styles.achievedDate}>
            {new Date(milestone.achieved_date + 'T00:00:00').toLocaleDateString(
              'en-US',
              { month: 'short', day: 'numeric' }
            )}
          </Text>
        )}
      </View>
      <Text
        style={[styles.message, !milestone.achieved && styles.futureMessage]}
      >
        {milestoneMessage}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  achievedContainer: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  futureContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    opacity: 0.65,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievedIcon: {
    backgroundColor: '#10B981',
  },
  futureIcon: {
    backgroundColor: '#CBD5E1',
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#065F46',
  },
  futureTitle: {
    color: '#64748B',
  },
  daysLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  achievedDate: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    color: '#047857',
  },
  futureMessage: {
    color: '#94A3B8',
  },
});
