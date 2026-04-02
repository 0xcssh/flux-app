import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNoFapStreak } from '@/hooks/useNoFapStreak';

interface CommunityComparisonProps {
  isPremium?: boolean;
}

// Mock community data - will connect to Supabase materialized view later
const MOCK_COMMUNITY = {
  averageStreak: 12,
  medianStreak: 8,
  totalParticipants: 1247,
};

export default function CommunityComparison({
  isPremium = false,
}: CommunityComparisonProps) {
  const { t } = useTranslation('nofap');
  const { streakDays } = useNoFapStreak();

  const maxBar = Math.max(streakDays, MOCK_COMMUNITY.averageStreak, 1);
  const yourWidth = (streakDays / maxBar) * 100;
  const communityWidth = (MOCK_COMMUNITY.averageStreak / maxBar) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('community.title')}</Text>

      {!isPremium && (
        <View style={styles.blurOverlay}>
          <View style={styles.blurContent}>
            <Text style={styles.lockIcon}>{'\u{1F512}'}</Text>
            <Text style={styles.premiumText}>Premium Feature</Text>
            <Text style={styles.premiumSubtext}>
              Upgrade to compare your progress with the community
            </Text>
          </View>
        </View>
      )}

      <View style={[styles.barsContainer, !isPremium && styles.blurred]}>
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>You</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                styles.yourBar,
                { width: `${Math.max(yourWidth, 5)}%` },
              ]}
            />
          </View>
          <Text style={styles.barValue}>{streakDays}d</Text>
        </View>

        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Avg</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                styles.communityBar,
                { width: `${Math.max(communityWidth, 5)}%` },
              ]}
            />
          </View>
          <Text style={styles.barValue}>
            {MOCK_COMMUNITY.averageStreak}d
          </Text>
        </View>

        <View style={styles.statsFooter}>
          <Text style={styles.footerText}>
            {MOCK_COMMUNITY.totalParticipants.toLocaleString()} participants
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  barsContainer: {
    gap: 12,
  },
  blurred: {
    opacity: 0.15,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B8BA3',
    width: 32,
  },
  barTrack: {
    flex: 1,
    height: 24,
    backgroundColor: '#16162A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 12,
  },
  yourBar: {
    backgroundColor: '#3B82F6',
  },
  communityBar: {
    backgroundColor: '#5A5A7A',
  },
  barValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    width: 36,
    textAlign: 'right',
  },
  statsFooter: {
    alignItems: 'center',
    marginTop: 4,
  },
  footerText: {
    fontSize: 11,
    color: '#5A5A7A',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 10, 15, 0.8)',
    borderRadius: 16,
    top: 40,
  },
  blurContent: {
    alignItems: 'center',
    padding: 20,
  },
  lockIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  premiumText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  premiumSubtext: {
    fontSize: 12,
    color: '#8B8BA3',
    textAlign: 'center',
    maxWidth: 200,
  },
});
