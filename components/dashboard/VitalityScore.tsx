import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { lightPalette } from '@/theme/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface VitalityScoreProps {
  score: number | null | undefined;
  size?: number;
}

function getScoreColor(score: number): string {
  if (score <= 30) return '#EF4444';
  if (score <= 50) return '#F59E0B';
  if (score <= 70) return '#EAB308';
  return '#10B981';
}

export default function VitalityScore({ score, size = 200 }: VitalityScoreProps) {
  const { t } = useTranslation('dashboard');
  const animatedValue = useRef(new Animated.Value(0)).current;

  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const hasScore = score != null && score > 0;
  const displayScore = hasScore ? score : 0;
  const color = hasScore ? getScoreColor(displayScore) : '#9CA3AF';

  useEffect(() => {
    animatedValue.setValue(0);
    if (hasScore) {
      Animated.timing(animatedValue, {
        toValue: displayScore / 100,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [displayScore, hasScore]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="1" />
            <Stop offset="1" stopColor={color} stopOpacity="0.6" />
          </LinearGradient>
        </Defs>
        <G rotation="-90" origin={`${center}, ${center}`}>
          {/* Background ring */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={lightPalette.border}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={hasScore ? undefined : `${strokeWidth * 1.5} ${strokeWidth * 1.5}`}
          />
          {/* Animated score ring */}
          {hasScore && (
            <AnimatedCircle
              cx={center}
              cy={center}
              r={radius}
              stroke="url(#scoreGradient)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={strokeDashoffset}
            />
          )}
        </G>
      </Svg>
      <View style={[styles.centerContent, { width: size, height: size }]}>
        <Text style={[styles.scoreText, { fontSize: size * 0.22, color }]}>
          {hasScore ? displayScore : '?'}
        </Text>
        <Text style={[styles.label, { fontSize: size * 0.07 }]}>
          {hasScore ? t('vitality_score') : t('log_today_cta')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontWeight: '700',
  },
  label: {
    color: lightPalette.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
});
