import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { HormonalProfile, ProfileType, GoalType } from '@/lib/hormonalProfile';

interface ProfileResultProps {
  profile: HormonalProfile;
}

const PROFILE_ICONS: Record<ProfileType, keyof typeof Ionicons.glyphMap> = {
  early_riser: 'sunny',
  night_owl: 'moon',
  balanced: 'partly-sunny',
};

const PROFILE_NAME_KEYS: Record<ProfileType, string> = {
  early_riser: 'profile_early_riser',
  night_owl: 'profile_night_owl',
  balanced: 'profile_balanced',
};

const PROFILE_DESC_KEYS: Record<ProfileType, string> = {
  early_riser: 'profile_early_riser_desc',
  night_owl: 'profile_night_owl_desc',
  balanced: 'profile_balanced_desc',
};

const GOAL_ICON_MAP: Record<GoalType, keyof typeof Ionicons.glyphMap> = {
  energy: 'flash',
  performance: 'trophy',
  mood: 'happy',
  sleep: 'moon',
};

const GOAL_LABEL_KEYS: Record<GoalType, string> = {
  energy: 'goal_energy',
  performance: 'goal_performance',
  mood: 'goal_mood',
  sleep: 'goal_sleep',
};

function formatHour(h: number): string {
  const hour = Math.floor(h);
  const min = Math.round((h - hour) * 60);
  const suffix = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return min === 0 ? `${displayHour} ${suffix}` : `${displayHour}:${min.toString().padStart(2, '0')} ${suffix}`;
}

export default function ProfileResult({ profile }: ProfileResultProps) {
  const { t } = useTranslation('onboarding');

  return (
    <View style={styles.container}>
      <Text style={styles.resultTitle}>{t('quiz_result_title')}</Text>

      <View style={styles.profileCard}>
        <View style={styles.iconCircle}>
          <Ionicons
            name={PROFILE_ICONS[profile.profileType]}
            size={40}
            color="#3B82F6"
          />
        </View>

        <Text style={styles.profileName}>
          {t(PROFILE_NAME_KEYS[profile.profileType])}
        </Text>

        <Text style={styles.profileDesc}>
          {t(PROFILE_DESC_KEYS[profile.profileType])}
        </Text>

        <View style={styles.peakWindow}>
          <Ionicons name="time-outline" size={16} color="#3B82F6" />
          <Text style={styles.peakLabel}>{t('quiz_peak_window')}: </Text>
          <Text style={styles.peakValue}>
            {formatHour(profile.peakWindowStart)} - {formatHour(profile.peakWindowEnd)}
          </Text>
        </View>

        <View style={styles.goalBadge}>
          <Ionicons
            name={GOAL_ICON_MAP[profile.goal]}
            size={14}
            color="#8B8BA3"
          />
          <Text style={styles.goalText}>
            Goal: {t(GOAL_LABEL_KEYS[profile.goal])}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  profileCard: {
    width: '100%',
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A45',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#252540',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  profileDesc: {
    fontSize: 14,
    color: '#8B8BA3',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
  },
  peakWindow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252540',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 14,
    gap: 6,
  },
  peakLabel: {
    fontSize: 14,
    color: '#8B8BA3',
    fontWeight: '600',
  },
  peakValue: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '700',
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#252540',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  goalText: {
    fontSize: 13,
    color: '#8B8BA3',
    fontWeight: '500',
  },
});
