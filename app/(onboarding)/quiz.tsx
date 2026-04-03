import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import PaginationDots from '@/components/onboarding/PaginationDots';
import ProfileResult from '@/components/onboarding/ProfileResult';
import {
  QuizAnswers,
  GoalType,
  HormonalProfile,
  computeProfile,
} from '@/lib/hormonalProfile';
import { useSettingsStore } from '@/store/settingsStore';

// ── Constants ────────────────────────────────────────────────────────

const WAKE_TIMES = [
  { label: '5:30', value: 5.5 },
  { label: '6:00', value: 6 },
  { label: '6:30', value: 6.5 },
  { label: '7:00', value: 7 },
  { label: '7:30', value: 7.5 },
  { label: '8:00', value: 8 },
  { label: '8:30', value: 8.5 },
  { label: '9:00', value: 9 },
  { label: '9:30', value: 9.5 },
];

const DOT_COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#22C55E', '#10B981'];

const GOALS: {
  key: GoalType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
}[] = [
  { key: 'energy', label: 'More Energy', icon: 'flash', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  { key: 'performance', label: 'Peak Performance', icon: 'trophy', color: '#22C55E', bg: 'rgba(34,197,94,0.15)' },
  { key: 'mood', label: 'Better Mood', icon: 'happy', color: '#A78BFA', bg: 'rgba(167,139,250,0.15)' },
  { key: 'sleep', label: 'Better Sleep', icon: 'moon', color: '#6366F1', bg: 'rgba(99,102,241,0.15)' },
];

// ── Notification helper ──────────────────────────────────────────────

async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status === 'granted') {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Rise Phase',
        body: 'Your testosterone is climbing. Log your day!',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 8,
        minute: 0,
      },
    });
  }
}

// ── Selectable Dot ───────────────────────────────────────────────────

function SelectableDot({
  color,
  isSelected,
  onPress,
}: {
  color: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.dot,
        { backgroundColor: color },
        isSelected && {
          width: 28,
          height: 28,
          borderRadius: 14,
          borderWidth: 3,
          borderColor: '#FFFFFF',
        },
      ]}
      hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
    />
  );
}

// ── Component ────────────────────────────────────────────────────────

export default function QuizScreen() {
  const router = useRouter();
  const setHormonalProfile = useSettingsStore((s) => s.setHormonalProfile);
  const setNofapEnabled = useSettingsStore((s) => s.setNofapEnabled);

  // Form state
  const [age, setAge] = useState('25');
  const [wakeTime, setWakeTime] = useState<number>(7);
  const [activityLevel, setActivityLevel] = useState<number>(3);
  const [sleepQuality, setSleepQuality] = useState<number>(3);
  const [goal, setGoal] = useState<GoalType>('energy');
  const [nofap, setNofap] = useState(true);
  const [ageFocused, setAgeFocused] = useState(false);

  // Result state
  const [profile, setProfile] = useState<HormonalProfile | null>(null);

  const scrollRef = useRef<ScrollView>(null);

  // ── Handlers ─────────────────────────────────────────────────────

  function handleWakeTimeSelect(value: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWakeTime(value);
  }

  function handleActivitySelect(level: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActivityLevel(level);
  }

  function handleSleepSelect(level: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSleepQuality(level);
  }

  function handleGoalSelect(g: GoalType) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGoal(g);
  }

  async function handleSubmit() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const parsedAge = parseInt(age, 10) || 25;
    const quizAnswers: QuizAnswers = {
      age: parsedAge,
      wakeUpHour: wakeTime,
      activityLevel,
      sleepQuality,
      goal,
    };

    const computed = computeProfile(quizAnswers);
    setHormonalProfile(computed);
    setNofapEnabled(nofap);

    // Request notification permission + schedule
    await requestNotificationPermission();

    setProfile(computed);
  }

  function handleContinue() {
    router.push('/(onboarding)/trial');
  }

  // ── Render: Profile Result ───────────────────────────────────────

  if (profile !== null) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.resultScroll}
          contentContainerStyle={styles.resultScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ProfileResult profile={profile} />
        </ScrollView>

        <View style={styles.footer}>
          <PaginationDots total={5} current={3} />
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>Continue</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render: Form ─────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text style={styles.title}>Personalize Flux</Text>
        <Text style={styles.subtitle}>Tell us about yourself</Text>

        {/* ── YOUR PROFILE ── */}
        <Text style={styles.sectionLabel}>YOUR PROFILE</Text>

        {/* Age */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>How old are you?</Text>
          <TextInput
            style={[
              styles.ageInput,
              ageFocused && styles.ageInputFocused,
            ]}
            value={age}
            onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            maxLength={3}
            onFocus={() => setAgeFocused(true)}
            onBlur={() => setAgeFocused(false)}
            placeholderTextColor="#5A5A7A"
            selectionColor="#3B82F6"
          />
        </View>

        {/* Wake up time */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>What time do you usually wake up?</Text>
          <View style={styles.chipGrid}>
            {WAKE_TIMES.map((wt) => {
              const selected = wakeTime === wt.value;
              return (
                <TouchableOpacity
                  key={wt.value}
                  style={[
                    styles.chip,
                    selected && styles.chipSelected,
                  ]}
                  onPress={() => handleWakeTimeSelect(wt.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected && styles.chipTextSelected,
                    ]}
                  >
                    {wt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Activity level */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>How active are you?</Text>
          <View style={styles.dotRow}>
            {DOT_COLORS.map((color, i) => (
              <SelectableDot
                key={i}
                color={color}
                isSelected={activityLevel === i + 1}
                onPress={() => handleActivitySelect(i + 1)}
              />
            ))}
          </View>
          <View style={styles.dotLabels}>
            <Text style={styles.dotLabelLeft}>Low</Text>
            <Text style={styles.dotLabelRight}>High</Text>
          </View>
        </View>

        {/* Sleep quality */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>How's your sleep lately?</Text>
          <View style={styles.dotRow}>
            {DOT_COLORS.map((color, i) => (
              <SelectableDot
                key={i}
                color={color}
                isSelected={sleepQuality === i + 1}
                onPress={() => handleSleepSelect(i + 1)}
              />
            ))}
          </View>
          <View style={styles.dotLabels}>
            <Text style={styles.dotLabelLeft}>Poor</Text>
            <Text style={styles.dotLabelRight}>Excellent</Text>
          </View>
        </View>

        {/* Goal */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Your main goal?</Text>
          <View style={styles.goalGrid}>
            {GOALS.map((g) => {
              const selected = goal === g.key;
              return (
                <TouchableOpacity
                  key={g.key}
                  style={[
                    styles.goalCard,
                    { backgroundColor: g.bg },
                    selected && {
                      backgroundColor: g.bg.replace('0.15', '0.3'),
                      borderColor: g.color,
                    },
                  ]}
                  onPress={() => handleGoalSelect(g.key)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={g.icon} size={24} color={g.color} />
                  <Text style={[styles.goalLabel, { color: g.color }]}>
                    {g.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── PREFERENCES ── */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>

        {/* NoFap toggle */}
        <View style={styles.nofapCard}>
          <View style={styles.nofapLeft}>
            <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
            <Text style={styles.nofapLabel}>NoFap tracking</Text>
          </View>
          <Switch
            value={nofap}
            onValueChange={setNofap}
            trackColor={{ false: '#2A2A45', true: '#3B82F6' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Spacer for CTA */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed footer */}
      <View style={styles.footer}>
        <PaginationDots total={5} current={3} />
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>See My Profile</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#8B8BA3',
    marginTop: 4,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#CCCCDD',
    marginBottom: 12,
  },

  // Age input
  ageInput: {
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2A2A45',
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    alignSelf: 'center',
    width: 120,
  },
  ageInputFocused: {
    borderColor: '#3B82F6',
  },

  // Time chips
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#0A0A0F',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#2A2A45',
  },
  chipSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B8BA3',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },

  // Dots (activity / sleep)
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 8,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  dotLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  dotLabelLeft: {
    fontSize: 11,
    color: '#5A5A7A',
    fontWeight: '600',
  },
  dotLabelRight: {
    fontSize: 11,
    color: '#5A5A7A',
    fontWeight: '600',
  },

  // Goal grid
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  goalCard: {
    width: '47%',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  goalLabel: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },

  // NoFap
  nofapCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  nofapLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nofapLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#CCCCDD',
  },

  // Result
  resultScroll: {
    flex: 1,
  },
  resultScrollContent: {
    paddingTop: 24,
    paddingBottom: 16,
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#0A0A0F',
  },
  ctaButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
