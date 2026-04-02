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
    backgroundColor: '#064E3B',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  futureContainer: {
    backgroundColor: '#16162A',
    borderWidth: 1,
    borderColor: '#2A2A45',
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
    backgroundColor: '#5A5A7A',
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
    color: '#4ADE80',
  },
  futureTitle: {
    color: '#8B8BA3',
  },
  daysLabel: {
    fontSize: 12,
    color: '#8B8BA3',
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
    color: '#22C55E',
  },
  futureMessage: {
    color: '#5A5A7A',
  },
});
