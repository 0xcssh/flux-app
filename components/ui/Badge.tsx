import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { Colors } from '@/lib/constants';

type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: '#EFF6FF', text: Colors.primary },
  secondary: { bg: '#ECFDF5', text: Colors.secondary },
  accent: { bg: '#F0FDFA', text: Colors.accent },
  success: { bg: '#ECFDF5', text: Colors.success },
  warning: { bg: '#FFFBEB', text: Colors.warning },
  error: { bg: '#FEF2F2', text: Colors.error },
};

export function Badge({ text, variant = 'primary', style }: BadgeProps) {
  const colors = variantColors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
