import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';
import type { PhaseType } from '@/types/log';

interface SymptomItem {
  id: string;
  label: string;
  iconName: string;
  iconSet?: 'ionicons' | 'material';
  intensity: 1 | 2 | 3;
}

interface PhaseBlock {
  phase: PhaseType;
  label: string;
  timeRange: string;
  icon: string;
  color: string;
  symptoms: SymptomItem[];
}

const PHASE_COLORS: Record<PhaseType, string> = {
  rise: '#3B82F6',
  peak: '#22C55E',
  decline: '#F59E0B',
  recovery: '#A78BFA',
};

const PHASE_ICONS: Record<PhaseType, string> = {
  rise: 'sunny',
  peak: 'flash',
  decline: 'partly-sunny',
  recovery: 'moon',
};

const PHASES: PhaseBlock[] = [
  {
    phase: 'rise',
    label: 'Rise',
    timeRange: '4-8 AM',
    icon: PHASE_ICONS.rise,
    color: PHASE_COLORS.rise,
    symptoms: [
      { id: 'rising_energy', label: 'Rising energy', iconName: 'trending-up', intensity: 2 },
      { id: 'mental_clarity', label: 'Mental clarity', iconName: 'head-lightbulb', iconSet: 'material', intensity: 1 },
      { id: 'motivation_up', label: 'Motivation boost', iconName: 'flag', intensity: 2 },
      { id: 'appetite_normal', label: 'Normal appetite', iconName: 'restaurant', intensity: 1 },
    ],
  },
  {
    phase: 'peak',
    label: 'Peak',
    timeRange: '8 AM-12 PM',
    icon: PHASE_ICONS.peak,
    color: PHASE_COLORS.peak,
    symptoms: [
      { id: 'max_strength', label: 'Max strength', iconName: 'barbell', intensity: 3 },
      { id: 'peak_focus', label: 'Peak focus', iconName: 'eye', intensity: 3 },
      { id: 'high_confidence', label: 'High confidence', iconName: 'shield-checkmark', intensity: 3 },
      { id: 'competitive_drive', label: 'Competitive drive', iconName: 'sword-cross', iconSet: 'material', intensity: 2 },
    ],
  },
  {
    phase: 'decline',
    label: 'Decline',
    timeRange: '12-8 PM',
    icon: PHASE_ICONS.decline,
    color: PHASE_COLORS.decline,
    symptoms: [
      { id: 'gradual_fatigue', label: 'Gradual fatigue', iconName: 'battery-half', intensity: 2 },
      { id: 'creativity_window', label: 'Creativity window', iconName: 'palette', iconSet: 'material', intensity: 2 },
      { id: 'possible_irritability', label: 'Possible irritability', iconName: 'thunderstorm', intensity: 1 },
      { id: 'hunger_increase', label: 'Increased hunger', iconName: 'fast-food', intensity: 2 },
    ],
  },
  {
    phase: 'recovery',
    label: 'Recovery',
    timeRange: '8 PM-4 AM',
    icon: PHASE_ICONS.recovery,
    color: PHASE_COLORS.recovery,
    symptoms: [
      { id: 'need_rest', label: 'Need for rest', iconName: 'bed', intensity: 3 },
      { id: 'lower_libido', label: 'Lower libido', iconName: 'heart-dislike', intensity: 2 },
      { id: 'reflective_mood', label: 'Reflective mood', iconName: 'thought-bubble', iconSet: 'material', intensity: 1 },
      { id: 'melatonin_rising', label: 'Melatonin rising', iconName: 'test-tube', iconSet: 'material', intensity: 2 },
    ],
  },
];

function IntensityDots({ count, color }: { count: number; color: string }) {
  return (
    <View style={styles.dotsRow}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { backgroundColor: i <= count ? color : darkPalette.border },
          ]}
        />
      ))}
    </View>
  );
}

function SymptomRow({ symptom, color }: { symptom: SymptomItem; color: string }) {
  const IconComponent = symptom.iconSet === 'material' ? MaterialCommunityIcons : Ionicons;
  return (
    <View style={styles.symptomRow}>
      <IconComponent
        name={symptom.iconName as any}
        size={16}
        color={darkPalette.textSecondary}
      />
      <Text style={styles.symptomLabel}>{symptom.label}</Text>
      <IntensityDots count={symptom.intensity} color={color} />
    </View>
  );
}

export default function SymptomTimeline() {
  const { t } = useTranslation('cycle');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('day_at_glance')}</Text>

      <View style={styles.timeline}>
        {/* Vertical line */}
        <View style={styles.lineContainer}>
          {PHASES.map((phase, index) => (
            <View
              key={phase.phase}
              style={[
                styles.lineSegment,
                {
                  backgroundColor: phase.color,
                  flex: 1,
                  borderTopLeftRadius: index === 0 ? 2 : 0,
                  borderTopRightRadius: index === 0 ? 2 : 0,
                  borderBottomLeftRadius: index === PHASES.length - 1 ? 2 : 0,
                  borderBottomRightRadius: index === PHASES.length - 1 ? 2 : 0,
                },
              ]}
            />
          ))}
        </View>

        {/* Phase blocks */}
        <View style={styles.phasesColumn}>
          {PHASES.map((phase) => (
            <View key={phase.phase} style={styles.phaseBlock}>
              {/* Phase header */}
              <View style={styles.phaseHeader}>
                <View style={styles.phaseNameRow}>
                  <View style={[styles.phaseIconBg, { backgroundColor: phase.color + '20' }]}>
                    <Ionicons name={phase.icon as any} size={16} color={phase.color} />
                  </View>
                  <Text style={[styles.phaseName, { color: phase.color }]}>{phase.label}</Text>
                </View>
                <Text style={styles.timeRange}>{phase.timeRange}</Text>
              </View>

              {/* Symptoms */}
              <View style={styles.symptomsContainer}>
                {phase.symptoms.map((symptom) => (
                  <SymptomRow key={symptom.id} symptom={symptom} color={phase.color} />
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: darkPalette.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: darkPalette.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: darkPalette.text,
    marginBottom: 16,
  },
  timeline: {
    flexDirection: 'row',
  },
  lineContainer: {
    width: 2,
    marginRight: 16,
    borderRadius: 2,
  },
  lineSegment: {
    width: 2,
  },
  phasesColumn: {
    flex: 1,
  },
  phaseBlock: {
    marginBottom: 16,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phaseIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseName: {
    fontSize: 14,
    fontWeight: '700',
  },
  timeRange: {
    fontSize: 12,
    color: darkPalette.textTertiary,
    fontWeight: '500',
  },
  symptomsContainer: {
    marginLeft: 36,
    gap: 6,
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  symptomLabel: {
    flex: 1,
    fontSize: 13,
    color: darkPalette.textSecondary,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
