import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { lightPalette } from '@/theme/colors';
import type { PhaseType } from '@/types/log';

interface PhaseIndicatorProps {
  currentPhase: PhaseType;
  progress: number; // 0-1 within current phase
}

const PHASES: { key: PhaseType; color: string; dimColor: string }[] = [
  { key: 'rise', color: '#2563EB', dimColor: '#DBEAFE' },
  { key: 'peak', color: '#10B981', dimColor: '#D1FAE5' },
  { key: 'decline', color: '#F59E0B', dimColor: '#FEF3C7' },
  { key: 'recovery', color: '#8B5CF6', dimColor: '#EDE9FE' },
];

export default function PhaseIndicator({ currentPhase, progress }: PhaseIndicatorProps) {
  const { t } = useTranslation('cycle');
  const markerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(markerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [currentPhase, progress]);

  const currentIndex = PHASES.findIndex((p) => p.key === currentPhase);

  return (
    <View style={styles.container}>
      <View style={styles.barRow}>
        {PHASES.map((phase, index) => {
          const isCurrent = phase.key === currentPhase;
          return (
            <View key={phase.key} style={styles.segmentWrapper}>
              <View
                style={[
                  styles.segment,
                  {
                    backgroundColor: isCurrent ? phase.color : phase.dimColor,
                    opacity: isCurrent ? 1 : 0.6,
                  },
                ]}
              >
                {isCurrent && (
                  <Animated.View
                    style={[
                      styles.marker,
                      {
                        left: markerAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', `${Math.max(0, Math.min(progress * 100, 95))}%`],
                        }),
                      },
                    ]}
                  >
                    <View style={[styles.markerDot, { backgroundColor: '#FFFFFF' }]} />
                  </Animated.View>
                )}
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.labelRow}>
        {PHASES.map((phase) => {
          const isCurrent = phase.key === currentPhase;
          return (
            <Text
              key={phase.key}
              style={[
                styles.label,
                { color: isCurrent ? phase.color : lightPalette.textTertiary },
                isCurrent && styles.labelActive,
              ]}
              numberOfLines={1}
            >
              {t(`phase_labels.${phase.key}`)}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: lightPalette.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  barRow: {
    flexDirection: 'row',
    gap: 4,
    height: 12,
  },
  segmentWrapper: {
    flex: 1,
  },
  segment: {
    flex: 1,
    borderRadius: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  marker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  labelRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4,
  },
  label: {
    flex: 1,
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },
  labelActive: {
    fontWeight: '700',
  },
});
