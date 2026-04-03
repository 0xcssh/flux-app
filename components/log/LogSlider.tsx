import React, { useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';

interface LogSliderProps {
  label: string;
  value: number;
  onValueChange: (v: number) => void;
  minLabel: string;
  maxLabel: string;
  color?: string;
}

export default function LogSlider({
  label,
  value,
  onValueChange,
  minLabel,
  maxLabel,
  color = '#2563EB',
}: LogSliderProps) {
  const prevStep = useRef(Math.round(value));

  const handleValueChange = (v: number) => {
    const rounded = Math.round(v);
    if (rounded !== prevStep.current) {
      prevStep.current = rounded;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onValueChange(v);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.valueBadge, { backgroundColor: color + '20' }]}>
          <Text style={[styles.valueText, { color }]}>{Math.round(value)}</Text>
        </View>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={value}
        onValueChange={handleValueChange}
        minimumTrackTintColor={color}
        maximumTrackTintColor="#2A2A45"
        thumbTintColor={color}
      />
      <View style={styles.labelsRow}>
        <Text style={styles.rangeLabel}>{minLabel}</Text>
        <Text style={styles.rangeLabel}>{maxLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  valueBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 13,
    fontWeight: '700',
  },
  slider: {
    width: '100%',
    height: 36,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  rangeLabel: {
    fontSize: 11,
    color: '#5A5A7A',
    fontWeight: '500',
  },
});
