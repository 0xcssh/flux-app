import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';

interface LogConfirmationProps {
  score: number;
  onClose: () => void;
}

function getScoreColor(score: number): string {
  if (score >= 75) return '#10B981';
  if (score >= 50) return '#2563EB';
  if (score >= 25) return '#F59E0B';
  return '#EF4444';
}

function getScoreMessage(score: number): string {
  if (score >= 80) return 'Excellent! You are thriving today.';
  if (score >= 60) return 'Good day! Keep up the momentum.';
  if (score >= 40) return 'Decent day. Small wins matter.';
  return 'Tough day. Rest and recovery are part of the process.';
}

export default function LogConfirmation({ score, onClose }: LogConfirmationProps) {
  const { t } = useTranslation('log');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => onClose());
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const color = getScoreColor(score);

  return (
    <TouchableOpacity
      style={styles.overlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <View style={[styles.scoreBadge, { backgroundColor: color + '15' }]}>
          <Text style={[styles.scoreNumber, { color }]}>{score}</Text>
          <Text style={styles.scoreLabel}>Vitality Score</Text>
        </View>
        <Text style={styles.message}>{getScoreMessage(score)}</Text>
        <Text style={styles.successText}>{t('success')}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  scoreBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: '800',
  },
  scoreLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  successText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
});
