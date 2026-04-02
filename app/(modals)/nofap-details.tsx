import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import NoFapTracker from '@/components/nofap/NoFapTracker';
import MilestoneCard from '@/components/nofap/MilestoneCard';
import StreakChart from '@/components/nofap/StreakChart';
import CommunityComparison from '@/components/nofap/CommunityComparison';
import { useNoFapStreak } from '@/hooks/useNoFapStreak';

export default function NoFapDetailsScreen() {
  const { t } = useTranslation('nofap');
  const router = useRouter();
  const { milestones } = useNoFapStreak();
  const [moduleEnabled, setModuleEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backButton}>{'\u2190'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <NoFapTracker compact={false} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Milestones</Text>
          {milestones.map((milestone) => (
            <MilestoneCard key={milestone.days} milestone={milestone} />
          ))}
        </View>

        <View style={styles.section}>
          <StreakChart />
        </View>

        <View style={styles.section}>
          <CommunityComparison isPremium={false} />
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable NoFap Module</Text>
              <Text style={styles.settingDesc}>
                Show NoFap tracking in your daily log and dashboard
              </Text>
            </View>
            <Switch
              value={moduleEnabled}
              onValueChange={setModuleEnabled}
              trackColor={{ false: '#2A2A45', true: '#064E3B' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1A1A2E',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A45',
  },
  backButton: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 48,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  section: {
    gap: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  settingsSection: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
    color: '#8B8BA3',
    lineHeight: 16,
  },
  bottomSpacer: {
    height: 40,
  },
});
