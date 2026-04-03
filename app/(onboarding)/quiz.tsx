import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import PaginationDots from '@/components/onboarding/PaginationDots';
import ProfileResult from '@/components/onboarding/ProfileResult';
import {
  QuizAnswers,
  GoalType,
  HormonalProfile,
  computeProfile,
} from '@/lib/hormonalProfile';
import { useSettingsStore } from '@/store/settingsStore';

// ── Question definitions ──────────────────────────────────────────────

interface OptionDef {
  label: string;
  value: number | string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface QuestionDef {
  key: string;
  titleKey: string;
  options: OptionDef[];
}

const QUESTIONS: QuestionDef[] = [
  {
    key: 'age',
    titleKey: 'quiz_age',
    options: [
      { label: '18-24', value: 21 },
      { label: '25-34', value: 30 },
      { label: '35-44', value: 40 },
      { label: '45+', value: 50 },
    ],
  },
  {
    key: 'wakeUpHour',
    titleKey: 'quiz_wake',
    options: [
      { label: 'Before 6 AM', value: 5.5 },
      { label: '6-7 AM', value: 6.5 },
      { label: '7-8 AM', value: 7.5 },
      { label: '8-9 AM', value: 8.5 },
      { label: 'After 9 AM', value: 9.5 },
    ],
  },
  {
    key: 'activityLevel',
    titleKey: 'quiz_activity',
    options: [
      { label: 'Sedentary', value: 1, icon: 'bed' },
      { label: 'Light', value: 2, icon: 'walk' },
      { label: 'Moderate', value: 3, icon: 'bicycle' },
      { label: 'Active', value: 4, icon: 'barbell' },
      { label: 'Very Active', value: 5, icon: 'fitness' },
    ],
  },
  {
    key: 'sleepQuality',
    titleKey: 'quiz_sleep',
    options: [
      { label: 'Poor', value: 1 },
      { label: 'Below Average', value: 2 },
      { label: 'Average', value: 3 },
      { label: 'Good', value: 4 },
      { label: 'Excellent', value: 5 },
    ],
  },
  {
    key: 'goal',
    titleKey: 'quiz_goal',
    options: [
      { label: 'More Energy', value: 'energy', icon: 'flash' },
      { label: 'Peak Performance', value: 'performance', icon: 'trophy' },
      { label: 'Better Mood', value: 'mood', icon: 'happy' },
      { label: 'Better Sleep', value: 'sleep', icon: 'moon' },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────

export default function QuizScreen() {
  const router = useRouter();
  const { t } = useTranslation('onboarding');
  const setHormonalProfile = useSettingsStore((s) => s.setHormonalProfile);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [profile, setProfile] = useState<HormonalProfile | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const isShowingResult = profile !== null;
  const totalQuestions = QUESTIONS.length;

  function animateTransition(callback: () => void) {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      callback();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }

  function selectOption(questionKey: string, value: number | string) {
    const newAnswers = { ...answers, [questionKey]: value };
    setAnswers(newAnswers);

    // Auto-advance after brief delay
    setTimeout(() => {
      if (step < totalQuestions - 1) {
        animateTransition(() => setStep(step + 1));
      } else {
        // Last question answered: compute profile
        const quizAnswers: QuizAnswers = {
          age: newAnswers.age as number,
          wakeUpHour: newAnswers.wakeUpHour as number,
          activityLevel: newAnswers.activityLevel as number,
          sleepQuality: newAnswers.sleepQuality as number,
          goal: newAnswers.goal as GoalType,
        };
        const computed = computeProfile(quizAnswers);
        setHormonalProfile(computed);
        animateTransition(() => setProfile(computed));
      }
    }, 250);
  }

  function handleContinue() {
    router.push('/(onboarding)/setup');
  }

  // ── Render ──────────────────────────────────────────────────────────

  if (isShowingResult) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <ProfileResult profile={profile} />
        </Animated.View>

        <View style={styles.footer}>
          <PaginationDots total={6} current={3} />
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

  const currentQuestion = QUESTIONS[step];
  const selectedValue = answers[currentQuestion.key];

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.stepIndicator}>
          {step + 1} / {totalQuestions}
        </Text>

        <Text style={styles.questionTitle}>
          {t(currentQuestion.titleKey)}
        </Text>

        <ScrollView
          style={styles.optionsScroll}
          contentContainerStyle={styles.optionsContainer}
          showsVerticalScrollIndicator={false}
        >
          {currentQuestion.options.map((option) => {
            const isSelected = selectedValue === option.value;
            return (
              <TouchableOpacity
                key={String(option.value)}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
                onPress={() =>
                  selectOption(currentQuestion.key, option.value)
                }
                activeOpacity={0.7}
              >
                {option.icon && (
                  <Ionicons
                    name={option.icon}
                    size={22}
                    color={isSelected ? '#3B82F6' : '#8B8BA3'}
                    style={styles.optionIcon}
                  />
                )}
                <Text
                  style={[
                    styles.optionLabel,
                    isSelected && styles.optionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

      <View style={styles.footer}>
        <PaginationDots total={6} current={3} />
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  stepIndicator: {
    fontSize: 14,
    color: '#5A5A7A',
    fontWeight: '600',
    marginBottom: 12,
  },
  questionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 28,
    letterSpacing: -0.3,
  },
  optionsScroll: {
    width: '100%',
    maxHeight: 380,
  },
  optionsContainer: {
    gap: 10,
    paddingBottom: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: '#2A2A45',
  },
  optionCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  optionIcon: {
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#CCCCDD',
  },
  optionLabelSelected: {
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 24,
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
