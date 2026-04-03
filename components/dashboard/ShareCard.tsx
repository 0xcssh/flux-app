import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Ionicons from '@expo/vector-icons/Ionicons';
import { darkPalette } from '@/theme/colors';

export interface ShareCardProps {
  score: number;
  date: string;
  streakDays: number;
  phase: string;
}

function getScoreInfo(score: number) {
  if (score >= 80) return { label: 'Excellent', color: darkPalette.secondary };
  if (score >= 60) return { label: 'Good', color: darkPalette.primary };
  if (score >= 40) return { label: 'Fair', color: darkPalette.accent };
  return { label: 'Low', color: darkPalette.error };
}

const phaseIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Rise: 'trending-up',
  Peak: 'sunny',
  Decline: 'trending-down',
  Recovery: 'moon',
};

const ShareCard = React.forwardRef<View, ShareCardProps>(
  ({ score, date, streakDays, phase }, ref) => {
    const info = getScoreInfo(score);

    const ringSize = 180;
    const strokeWidth = 10;
    const radius = (ringSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;
    const dashOffset = circumference - progress;
    const center = ringSize / 2;

    const formattedDate = (() => {
      const d = new Date(date + 'T12:00:00');
      return d.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
    })();

    const phaseIcon = phaseIcons[phase] ?? 'ellipse';

    return (
      <View ref={ref} style={styles.card} collapsable={false}>
        {/* Top branding */}
        <View style={styles.topSection}>
          <Text style={styles.logo}>FLUX</Text>
          <Text style={styles.tagline}>Track your rhythm</Text>
        </View>

        {/* Hero ring */}
        <View style={styles.heroSection}>
          <View style={styles.ringContainer}>
            <Svg width={ringSize} height={ringSize}>
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={darkPalette.border}
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={info.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${center} ${center})`}
              />
            </Svg>
            <View style={styles.ringCenter}>
              <Text style={[styles.scoreText, { color: info.color }]}>
                {score}
              </Text>
              <Text style={styles.vitalityLabel}>Vitality</Text>
            </View>
          </View>
          <Text style={[styles.qualityLabel, { color: info.color }]}>
            {info.label}
          </Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          {streakDays > 0 && (
            <View style={styles.statRow}>
              <Ionicons name="flame" size={18} color={darkPalette.accent} />
              <Text style={styles.statText}>
                Day {streakDays} streak
              </Text>
            </View>
          )}
          <View style={styles.statRow}>
            <Ionicons name={phaseIcon} size={18} color={darkPalette.primary} />
            <Text style={styles.statText}>{phase} Phase</Text>
          </View>
        </View>

        {/* Bottom branding */}
        <View style={styles.bottomSection}>
          <Text style={styles.branding}>flux-app.com</Text>
        </View>
      </View>
    );
  },
);

ShareCard.displayName = 'ShareCard';

export default ShareCard;

const styles = StyleSheet.create({
  card: {
    width: 360,
    height: 640,
    backgroundColor: darkPalette.background,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: '900',
    color: darkPalette.primary,
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 13,
    color: darkPalette.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  heroSection: {
    alignItems: 'center',
  },
  ringContainer: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: -2,
  },
  vitalityLabel: {
    fontSize: 13,
    color: darkPalette.textSecondary,
    fontWeight: '600',
    marginTop: -2,
  },
  qualityLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  dateText: {
    fontSize: 14,
    color: darkPalette.textSecondary,
    marginTop: 6,
  },
  statsSection: {
    backgroundColor: darkPalette.surface,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statText: {
    fontSize: 16,
    fontWeight: '600',
    color: darkPalette.text,
  },
  bottomSection: {
    alignItems: 'center',
  },
  branding: {
    fontSize: 13,
    color: darkPalette.textTertiary,
    fontWeight: '500',
    letterSpacing: 1,
  },
});
