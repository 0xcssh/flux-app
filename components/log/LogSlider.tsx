import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

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
        onValueChange={onValueChange}
        minimumTrackTintColor={color}
        maximumTrackTintColor="#E2E8F0"
        thumbTintColor={color}
      />
      <View style={styles.labelsRow}>
        <Text style={styles.emojiLabel}>{minLabel}</Text>
        <Text style={styles.emojiLabel}>{maxLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  valueBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '700',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  emojiLabel: {
    fontSize: 13,
    color: '#64748B',
  },
});
