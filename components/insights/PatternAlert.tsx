import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { Pattern } from '@/types/insight';

const PATTERN_ICONS: Record<string, string> = {
  day_of_week: 'calendar',
  trend: 'line-chart',
  infradian_cycle: 'refresh',
};

interface PatternAlertProps {
  pattern: Pattern;
}

export default function PatternAlert({ pattern }: PatternAlertProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const iconName = PATTERN_ICONS[pattern.type] ?? 'search';
  const formatMetric = (m: string) =>
    m.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  // Build human-readable description
  let description = '';
  if (pattern.type === 'day_of_week') {
    const diff = pattern.params.avgDiff as number;
    const direction = diff > 0 ? 'higher' : 'lower';
    description = `Your ${formatMetric(pattern.metric).toLowerCase()} tends to be ${direction} on ${pattern.params.dayName}s (${diff > 0 ? '+' : ''}${diff.toFixed(1)} from average).`;
  } else if (pattern.type === 'infradian_cycle') {
    description = `A ~${pattern.params.periodDays}-day cycle detected in your ${formatMetric(pattern.metric).toLowerCase()} (${Math.round((pattern.params.confidence as number) * 100)}% confidence).`;
  } else if (pattern.type === 'trend') {
    description = `A trend was detected in your ${formatMetric(pattern.metric).toLowerCase()}.`;
  }

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <FontAwesome name={iconName as any} size={18} color="#2563EB" />
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Pattern Detected</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>
              {pattern.type.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>
        <Text style={styles.description}>{description}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  header: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
  },
  typeBadge: {
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3B82F6',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 13,
    color: '#1E3A5F',
    lineHeight: 19,
  },
});
