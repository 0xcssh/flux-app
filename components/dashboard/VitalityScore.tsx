import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { darkPalette } from '@/theme/colors';

interface VitalityScoreProps {
  score: number | null;
  size?: number;
}

function getScoreInfo(score: number) {
  if (score >= 80) return { label: 'Excellent', color: darkPalette.secondary, glow: darkPalette.glowSuccess };
  if (score >= 60) return { label: 'Good', color: darkPalette.primary, glow: darkPalette.glowPrimary };
  if (score >= 40) return { label: 'Fair', color: darkPalette.accent, glow: darkPalette.glowAccent };
  return { label: 'Low', color: darkPalette.error, glow: 'rgba(239, 68, 68, 0.3)' };
}

export default function VitalityScore({ score, size = 200 }: VitalityScoreProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const info = score != null ? getScoreInfo(score) : null;

  // Animation
  const animValue = useRef(new Animated.Value(0)).current;
  const [displayScore, setDisplayScore] = useState(0);
  const [displayOffset, setDisplayOffset] = useState(circumference);

  useEffect(() => {
    if (score != null) {
      animValue.setValue(0);

      const listenerId = animValue.addListener(({ value }) => {
        setDisplayScore(Math.round(value));
        const progress = (value / 100) * circumference;
        setDisplayOffset(circumference - progress);
      });

      Animated.timing(animValue, {
        toValue: score,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();

      return () => {
        animValue.removeListener(listenerId);
      };
    } else {
      setDisplayScore(0);
      setDisplayOffset(circumference);
    }
  }, [score]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {info && (
        <View style={[styles.glow, {
          width: size + 40,
          height: size + 40,
          borderRadius: (size + 40) / 2,
          backgroundColor: info.glow,
        }]} />
      )}

      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={info?.color ?? darkPalette.border} stopOpacity="1" />
            <Stop offset="1" stopColor={info?.color ?? darkPalette.border} stopOpacity="0.5" />
          </LinearGradient>
        </Defs>

        <Circle cx={center} cy={center} r={radius} stroke={darkPalette.border} strokeWidth={strokeWidth} fill="none" />

        {score != null && (
          <Circle
            cx={center} cy={center} r={radius}
            stroke="url(#scoreGrad)" strokeWidth={strokeWidth} fill="none"
            strokeDasharray={circumference} strokeDashoffset={displayOffset}
            strokeLinecap="round" transform={`rotate(-90 ${center} ${center})`}
          />
        )}
      </Svg>

      <View style={[styles.centerText, { width: size, height: size }]}>
        {score != null ? (
          <>
            <Text style={[styles.score, { color: info!.color }]}>{displayScore}</Text>
            <Text style={styles.label}>Vitality</Text>
            <Text style={[styles.quality, { color: info!.color }]}>{info!.label}</Text>
          </>
        ) : (
          <>
            <Text style={styles.scoreEmpty}>?</Text>
            <Text style={styles.label}>Log today</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', opacity: 0.15 },
  centerText: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  score: { fontSize: 52, fontWeight: '900', letterSpacing: -2 },
  scoreEmpty: { fontSize: 48, fontWeight: '800', color: darkPalette.textTertiary },
  label: { fontSize: 13, color: darkPalette.textSecondary, fontWeight: '600', marginTop: -2 },
  quality: { fontSize: 14, fontWeight: '700', marginTop: 4 },
});
