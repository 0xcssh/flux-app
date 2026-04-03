import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import LogSlider from './LogSlider';
import NoFapCheckbox from './NoFapCheckbox';
import LogConfirmation from './LogConfirmation';
import { useDailyLog } from '@/hooks/useDailyLog';
import type { LogFormData } from '@/types/log';

interface DailyLogFormProps {
  userId: string;
  showNofap?: boolean;
}

const SLIDER_CONFIG = [
  {
    key: 'energy' as const,
    color: '#F59E0B',
    minLabel: 'Exhausted',
    maxLabel: 'Unstoppable',
  },
  {
    key: 'mood' as const,
    color: '#2563EB',
    minLabel: 'Very Low',
    maxLabel: 'Excellent',
  },
  {
    key: 'libido' as const,
    color: '#EF4444',
    minLabel: 'Low',
    maxLabel: 'High',
  },
  {
    key: 'sleep_quality' as const,
    color: '#8B5CF6',
    minLabel: 'Terrible',
    maxLabel: 'Perfect',
  },
  {
    key: 'stress' as const,
    color: '#EF4444',
    minLabel: 'Calm',
    maxLabel: 'Stressed',
  },
  {
    key: 'training' as const,
    color: '#10B981',
    minLabel: 'Rest Day',
    maxLabel: 'Max Effort',
  },
];

const SCORE_STACK_CONFIG = [
  { key: 'energy', label: 'Energy', weight: 0.20, color: '#F59E0B' },
  { key: 'mood', label: 'Mood', weight: 0.20, color: '#A78BFA' },
  { key: 'libido', label: 'Libido', weight: 0.15, color: '#EF4444' },
  { key: 'sleep', label: 'Sleep', weight: 0.20, color: '#6366F1' },
  { key: 'stress', label: 'Stress', weight: 0.15, color: '#F97316' },
  { key: 'training', label: 'Training', weight: 0.10, color: '#22C55E' },
] as const;

function computeScore(data: LogFormData): number {
  const raw =
    data.energy * 0.2 +
    data.mood * 0.2 +
    data.libido * 0.15 +
    data.sleep_quality * 0.2 +
    (10 - data.stress) * 0.15 +
    data.training * 0.1;
  return Math.round(((raw - 1) / 9) * 100);
}

function getScoreColor(score: number): string {
  if (score >= 71) return '#22C55E';
  if (score >= 51) return '#3B82F6';
  if (score >= 31) return '#F59E0B';
  return '#EF4444';
}

export default function DailyLogForm({
  userId,
  showNofap = true,
}: DailyLogFormProps) {
  const { t } = useTranslation('log');
  const { todayLog, isLogged, submitLog } = useDailyLog(userId);

  const [formData, setFormData] = useState<LogFormData>({
    energy: todayLog?.energy ?? 5,
    mood: todayLog?.mood ?? 5,
    libido: todayLog?.libido ?? 5,
    sleep_quality: todayLog?.sleep_quality ?? 5,
    stress: todayLog?.stress ?? 5,
    training: todayLog?.training ?? 5,
    notes: '',
    nofap_checked: todayLog?.nofap_checked ?? false,
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastScore, setLastScore] = useState(0);

  const liveScore = useMemo(() => computeScore(formData), [formData]);
  const scoreColor = useMemo(() => getScoreColor(liveScore), [liveScore]);

  const handleSliderChange = useCallback(
    (key: keyof LogFormData, value: number) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    submitLog(formData);
    const score = computeScore(formData);
    setLastScore(score);

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowConfirmation(true);
  }, [formData, submitLog]);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Already Logged Badge */}
        {isLogged && (
          <View style={styles.alreadyLoggedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
            <Text style={styles.alreadyLoggedText}>Already logged — updating</Text>
          </View>
        )}

        {/* Score Stack */}
        <View style={styles.scoreStackContainer}>
          <Text style={styles.scoreStackLabel}>YOUR SCORE</Text>
          <View style={styles.scoreStackRow}>
            <View style={styles.scoreStackBars}>
              {SCORE_STACK_CONFIG.map((c) => {
                const rawValue = c.key === 'stress'
                  ? 10 - formData.stress
                  : c.key === 'sleep'
                    ? formData.sleep_quality
                    : formData[c.key as keyof LogFormData] as number;
                const contribution = Math.round(((rawValue - 1) / 9) * c.weight * 100);
                return (
                  <View key={c.key} style={styles.barRow}>
                    <Text style={styles.barLabel}>{c.label}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${(rawValue / 10) * 100}%`, backgroundColor: c.color }]} />
                    </View>
                    <Text style={[styles.barContrib, { color: c.color }]}>+{contribution}</Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.scoreStackTotal}>
              <Text style={[styles.scoreStackValue, { color: scoreColor }]}>{liveScore}</Text>
            </View>
          </View>
        </View>

        {/* Sliders */}
        {SLIDER_CONFIG.map((config) => (
          <LogSlider
            key={config.key}
            label={t(`labels.${config.key}`)}
            value={formData[config.key] as number}
            onValueChange={(v) => handleSliderChange(config.key, v)}
            minLabel={config.minLabel}
            maxLabel={config.maxLabel}
            color={config.color}
          />
        ))}

        {/* NoFap Toggle Card */}
        {showNofap && (
          <NoFapCheckbox
            checked={formData.nofap_checked}
            onToggle={() =>
              setFormData((prev) => ({
                ...prev,
                nofap_checked: !prev.nofap_checked,
              }))
            }
          />
        )}

        {/* Submit */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>
            {isLogged ? t('update') : t('submit')}
          </Text>
          <View style={styles.submitScore}>
            <Text style={styles.submitScoreText}>{liveScore}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {showConfirmation && (
        <LogConfirmation
          score={lastScore}
          onClose={() => setShowConfirmation(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  // Already Logged Badge
  alreadyLoggedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#252540',
    borderWidth: 1,
    borderColor: '#2A2A45',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    marginBottom: 8,
  },
  alreadyLoggedText: {
    fontSize: 12,
    color: '#5A5A7A',
  },
  // Score Stack
  scoreStackContainer: {
    marginBottom: 20,
  },
  scoreStackLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5A5A7A',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  scoreStackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreStackBars: {
    flex: 1,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  barLabel: {
    width: 60,
    fontSize: 11,
    color: '#8B8BA3',
    fontWeight: '500',
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#252540',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barContrib: {
    width: 30,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'right',
  },
  scoreStackTotal: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  scoreStackValue: {
    fontSize: 42,
    fontWeight: '900',
  },
  // Submit
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  submitScore: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  submitScoreText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 20,
  },
});
