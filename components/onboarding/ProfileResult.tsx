import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';
import {
  HormonalProfile,
  ProfileType,
  GoalType,
} from '@/lib/hormonalProfile';

interface ProfileResultProps {
  profile: HormonalProfile;
}

const PROFILE_ICONS: Record<ProfileType, keyof typeof Ionicons.glyphMap> = {
  early_riser: 'sunny',
  night_owl: 'moon',
  balanced: 'partly-sunny',
};

const PROFILE_COLORS: Record<ProfileType, string> = {
  early_riser: '#F59E0B',
  night_owl: '#A78BFA',
  balanced: '#3B82F6',
};

const PROFILE_NAME_KEYS: Record<ProfileType, string> = {
  early_riser: 'profile_early_riser',
  night_owl: 'profile_night_owl',
  balanced: 'profile_balanced',
};

const PROFILE_DESC_KEYS: Record<ProfileType, string> = {
  early_riser: 'profile_early_riser_desc',
  night_owl: 'profile_night_owl_desc',
  balanced: 'profile_balanced_desc',
};

const GOAL_ICON_MAP: Record<GoalType, keyof typeof Ionicons.glyphMap> = {
  energy: 'flash',
  performance: 'trophy',
  mood: 'happy',
  sleep: 'moon',
};

const GOAL_LABELS: Record<GoalType, string> = {
  energy: 'More Energy',
  performance: 'Peak Performance',
  mood: 'Better Mood',
  sleep: 'Better Sleep',
};

const SLEEP_TARGETS: Record<ProfileType, string> = {
  early_riser: '10:30 PM',
  balanced: '11:30 PM',
  night_owl: '12:30 AM',
};

function formatHour(h: number): string {
  const hour = Math.floor(h);
  const min = Math.round((h - hour) * 60);
  const suffix = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return min === 0
    ? `${displayHour} ${suffix}`
    : `${displayHour}:${min.toString().padStart(2, '0')} ${suffix}`;
}

// ── Mini Circadian Curve ─────────────────────────────────────────────

function MiniCircadianCurve({ acrophase }: { acrophase: number }) {
  const width = 280;
  const height = 60;
  const padding = 8;
  const curveW = width - padding * 2;
  const curveH = height - padding * 2;

  // Generate 24 points (0-23h), sine-like curve peaking at acrophase
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= 24; i++) {
    const hourDiff = i - acrophase;
    // Gaussian-like curve
    const value = Math.exp(-0.5 * Math.pow(hourDiff / 4, 2));
    const x = padding + (i / 24) * curveW;
    const y = padding + curveH - value * curveH;
    points.push({ x, y });
  }

  // Build SVG path
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx1 = prev.x + (curr.x - prev.x) / 3;
    const cpx2 = prev.x + (2 * (curr.x - prev.x)) / 3;
    d += ` C ${cpx1} ${prev.y} ${cpx2} ${curr.y} ${curr.x} ${curr.y}`;
  }

  return (
    <View style={curveStyles.container}>
      <Svg width={width} height={height}>
        <Path d={d} stroke="#3B82F6" strokeWidth={2} fill="none" />
      </Svg>
      <View style={curveStyles.labels}>
        <Text style={curveStyles.label}>12 AM</Text>
        <Text style={curveStyles.label}>6 AM</Text>
        <Text style={curveStyles.label}>12 PM</Text>
        <Text style={curveStyles.label}>6 PM</Text>
        <Text style={curveStyles.label}>12 AM</Text>
      </View>
    </View>
  );
}

const curveStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 16,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 280,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  label: {
    fontSize: 10,
    color: '#5A5A7A',
    fontWeight: '500',
  },
});

// ── Data Row Component ───────────────────────────────────────────────

interface DataRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
  animatedStyle: { opacity: Animated.Value; translateY: Animated.Value };
}

function DataRow({ icon, label, value, color, animatedStyle }: DataRowProps) {
  return (
    <Animated.View
      style={[
        styles.dataRow,
        {
          opacity: animatedStyle.opacity,
          transform: [{ translateY: animatedStyle.translateY }],
        },
      ]}
    >
      <View style={styles.dataRowLeft}>
        <Ionicons name={icon} size={18} color={color} />
        <Text style={styles.dataRowLabel}>{label}</Text>
      </View>
      <Text style={[styles.dataRowValue, { color }]}>{value}</Text>
    </Animated.View>
  );
}

// ── Main Component ───────────────────────────────────────────────────

export default function ProfileResult({ profile }: ProfileResultProps) {
  const { t } = useTranslation('onboarding');
  const profileColor = PROFILE_COLORS[profile.profileType];

  // Icon bounce animation
  const iconScale = useRef(new Animated.Value(0)).current;

  // Stagger animations for data rows (4 rows)
  const rowAnims = useRef(
    Array.from({ length: 4 }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(10),
    }))
  ).current;

  // Curve fade-in
  const curveFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Icon bounce
    Animated.spring(iconScale, {
      toValue: 1,
      friction: 4,
      tension: 60,
      useNativeDriver: true,
    }).start();

    // Stagger rows with 100ms delay
    const rowAnimations = rowAnims.map((anim, index) =>
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 300,
          delay: 400 + index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: 300,
          delay: 400 + index * 100,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel(rowAnimations).start();

    // Curve fade in after rows
    Animated.timing(curveFade, {
      toValue: 1,
      duration: 400,
      delay: 900,
      useNativeDriver: true,
    }).start();
  }, []);

  const bestTrainingStart = profile.adjustedAcrophase + 1.5;
  const bestTrainingEnd = profile.adjustedAcrophase + 3.5;

  const dataRows = [
    {
      icon: 'time-outline' as keyof typeof Ionicons.glyphMap,
      label: 'Peak Window',
      value: `${formatHour(profile.peakWindowStart)} - ${formatHour(profile.peakWindowEnd)}`,
      color: '#3B82F6',
    },
    {
      icon: 'barbell-outline' as keyof typeof Ionicons.glyphMap,
      label: 'Best Training',
      value: `${formatHour(bestTrainingStart)} - ${formatHour(bestTrainingEnd)}`,
      color: '#22C55E',
    },
    {
      icon: 'moon-outline' as keyof typeof Ionicons.glyphMap,
      label: 'Sleep Target',
      value: SLEEP_TARGETS[profile.profileType],
      color: '#A78BFA',
    },
    {
      icon: 'flash-outline' as keyof typeof Ionicons.glyphMap,
      label: 'Your Goal',
      value: GOAL_LABELS[profile.goal],
      color: '#F59E0B',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Section title */}
      <Text style={styles.sectionTitle}>Your Hormonal Profile</Text>

      {/* Profile icon with bounce */}
      <Animated.View
        style={[
          styles.iconCircle,
          { backgroundColor: `${profileColor}15`, transform: [{ scale: iconScale }] },
        ]}
      >
        <Ionicons
          name={PROFILE_ICONS[profile.profileType]}
          size={44}
          color={profileColor}
        />
      </Animated.View>

      {/* Profile name */}
      <Text style={[styles.profileName, { color: profileColor }]}>
        {t(PROFILE_NAME_KEYS[profile.profileType])}
      </Text>

      {/* Description */}
      <Text style={styles.profileDesc}>
        {t(PROFILE_DESC_KEYS[profile.profileType])}
      </Text>

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Your Personalized Data</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Data rows */}
      {dataRows.map((row, index) => (
        <DataRow
          key={row.label}
          icon={row.icon}
          label={row.label}
          value={row.value}
          color={row.color}
          animatedStyle={rowAnims[index]}
        />
      ))}

      {/* Mini circadian curve */}
      <Animated.View style={{ opacity: curveFade }}>
        <MiniCircadianCurve acrophase={profile.adjustedAcrophase} />
      </Animated.View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A5A7A',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 24,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  profileDesc: {
    fontSize: 14,
    color: '#8B8BA3',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#252540',
  },
  dividerText: {
    fontSize: 12,
    color: '#5A5A7A',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#252540',
  },
  dataRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dataRowLabel: {
    fontSize: 14,
    color: '#8B8BA3',
    fontWeight: '600',
  },
  dataRowValue: {
    fontSize: 14,
    fontWeight: '700',
  },
});
