import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
// Using a basic approach since @react-native-community/slider may not be installed
// We'll use a touchable-based slider or the built-in one
import { Colors } from '@/lib/constants';
import { SliderConfig } from '@/lib/constants';

interface SliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
  hint?: string;
}

export function MetricSlider({
  label,
  value,
  onValueChange,
  min = SliderConfig.min,
  max = SliderConfig.max,
  step = SliderConfig.step,
  minLabel,
  maxLabel,
  hint,
}: SliderProps) {
  // Simple step-based selector using touchable circles
  const steps = [];
  for (let i = min; i <= max; i += step) {
    steps.push(i);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueBadge}>
          <Text style={styles.valueText}>{value}</Text>
        </View>
      </View>
      {hint && <Text style={styles.hint}>{hint}</Text>}
      <View style={styles.trackContainer}>
        {steps.map((s) => (
          <View
            key={s}
            style={[
              styles.step,
              s <= value && styles.stepActive,
              s === value && styles.stepCurrent,
            ]}
            onTouchEnd={() => onValueChange(s)}
          />
        ))}
      </View>
      <View style={styles.labelsRow}>
        {minLabel && <Text style={styles.minMaxLabel}>{minLabel}</Text>}
        <View style={styles.spacer} />
        {maxLabel && <Text style={styles.minMaxLabel}>{maxLabel}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  valueBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    minWidth: 32,
    alignItems: 'center',
  },
  valueText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  trackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    paddingVertical: 8,
  },
  step: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  stepActive: {
    backgroundColor: Colors.primary,
    opacity: 0.5,
  },
  stepCurrent: {
    backgroundColor: Colors.primary,
    opacity: 1,
    height: 12,
    borderRadius: 6,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  minMaxLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  spacer: {
    flex: 1,
  },
});
