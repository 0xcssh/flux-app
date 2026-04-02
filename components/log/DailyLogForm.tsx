import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
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
    minLabel: '\u{1F634} Exhausted',
    maxLabel: '\u{26A1} Unstoppable',
  },
  {
    key: 'mood' as const,
    color: '#2563EB',
    minLabel: '\u{1F61E} Very Low',
    maxLabel: '\u{1F604} Excellent',
  },
  {
    key: 'libido' as const,
    color: '#EF4444',
    minLabel: '\u{2744}\u{FE0F} Low',
    maxLabel: '\u{1F525} High',
  },
  {
    key: 'sleep_quality' as const,
    color: '#8B5CF6',
    minLabel: '\u{1F635} Terrible',
    maxLabel: '\u{1F634}\u{1F4A4} Perfect',
  },
  {
    key: 'stress' as const,
    color: '#EF4444',
    minLabel: '\u{1F60C} Calm',
    maxLabel: '\u{1F630} Stressed',
  },
  {
    key: 'training' as const,
    color: '#10B981',
    minLabel: '\u{1F6CB}\u{FE0F} Rest Day',
    maxLabel: '\u{1F4AA} Max Effort',
  },
];

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

  const handleSliderChange = useCallback(
    (key: keyof LogFormData, value: number) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    submitLog(formData);

    // Compute score for display
    const raw =
      formData.energy * 0.2 +
      formData.mood * 0.2 +
      formData.libido * 0.15 +
      formData.sleep_quality * 0.2 +
      (10 - formData.stress) * 0.15 +
      formData.training * 0.1;
    const score = Math.round(((raw - 1) / 9) * 100);
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
        {isLogged && (
          <View style={styles.updateBanner}>
            <Text style={styles.updateBannerText}>{t('already_logged')}</Text>
          </View>
        )}

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

        <View style={styles.notesContainer}>
          <TextInput
            style={styles.notesInput}
            placeholder={t('notes_placeholder')}
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            value={formData.notes}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, notes: text }))
            }
            textAlignVertical="top"
          />
        </View>

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

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>
            {isLogged ? t('update') : t('submit')}
          </Text>
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
  updateBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
  },
  updateBannerText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '500',
  },
  notesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  notesInput: {
    fontSize: 14,
    color: '#0F172A',
    minHeight: 72,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#2563EB',
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
  bottomSpacer: {
    height: 20,
  },
});
