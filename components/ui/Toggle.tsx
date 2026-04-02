import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Colors } from '@/lib/constants';

interface ToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
  disabled?: boolean;
}

export function Toggle({
  label,
  value,
  onValueChange,
  description,
  disabled = false,
}: ToggleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={[styles.label, disabled && styles.disabled]}>{label}</Text>
        {description && (
          <Text style={[styles.description, disabled && styles.disabled]}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: Colors.border, true: Colors.primary }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={Colors.border}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  disabled: {
    opacity: 0.5,
  },
});
