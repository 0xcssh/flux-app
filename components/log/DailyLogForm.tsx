import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
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
  if (score >= 80) return '#22C55E';
  if (score >= 60) return '#3B82F6';
  if (score >= 40) return '#F59E0B';
  return '#EF4444';
}

const RING_SIZE = 80;
const RING_STROKE = 6;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const RING_CENTER = RING_SIZE / 2;

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
    notes: todayLog?.notes ?? '',
    nofap_checked: todayLog?.nofap_checked ?? false,
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastScore, setLastScore] = useState(0);

  const liveScore = useMemo(() => computeScore(formData), [formData]);
  const scoreColor = useMemo(() => getScoreColor(liveScore), [liveScore]);
  const dashOffset = useMemo(
    () => RING_CIRCUMFERENCE - (liveScore / 100) * RING_CIRCUMFERENCE,
    [liveScore]
  );

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
        {/* Live Score Preview */}
        <View style={styles.scoreRow}>
          <View style={styles.scoreRing}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              <Circle
                cx={RING_CENTER}
                cy={RING_CENTER}
                r={RING_RADIUS}
                stroke="#1A1A2E"
                strokeWidth={RING_STROKE}
                fill="none"
              />
              <Circle
                cx={RING_CENTER}
                cy={RING_CENTER}
                r={RING_RADIUS}
                stroke={scoreColor}
                strokeWidth={RING_STROKE}
                fill="none"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${RING_CENTER} ${RING_CENTER})`}
              />
            </Svg>
            <View style={styles.scoreCenter}>
              <Text style={[styles.scoreValue, { color: scoreColor }]}>
                {liveScore}
              </Text>
            </View>
          </View>
          <View style={styles.scoreInfo}>
            <Text style={styles.scoreLabel}>{t('live_score')}</Text>
            {isLogged && (
              <View style={styles.updateBadge}>
                <Text style={styles.updateBadgeText}>{t('update')}</Text>
              </View>
            )}
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

        {/* Notes */}
        <View style={styles.notesContainer}>
          <TextInput
            style={styles.notesInput}
            placeholder={t('notes_placeholder')}
            placeholderTextColor="#5A5A7A"
            multiline
            numberOfLines={3}
            value={formData.notes}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, notes: text }))
            }
            textAlignVertical="top"
          />
        </View>

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
  // Live Score Preview
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  scoreRing: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -1,
  },
  scoreInfo: {
    marginLeft: 14,
    flex: 1,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#8B8BA3',
    fontWeight: '600',
  },
  updateBadge: {
    backgroundColor: '#3B82F620',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  updateBadgeText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  // Notes
  notesContainer: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  notesInput: {
    fontSize: 14,
    color: '#FFFFFF',
    minHeight: 60,
    lineHeight: 20,
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
