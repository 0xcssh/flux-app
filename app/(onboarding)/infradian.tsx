import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import PaginationDots from '@/components/onboarding/PaginationDots';

const CYCLE_BARS = [
  40, 45, 55, 65, 72, 80, 88, 92, 95, 90, 82, 75, 68,
  60, 52, 48, 45, 42, 40, 42, 48, 55, 65, 75, 82,
];

export default function InfradianScreen() {
  const router = useRouter();
  const { t } = useTranslation('onboarding');

  // Bar stagger animations
  const barAnims = useRef(CYCLE_BARS.map(() => new Animated.Value(0))).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const barAnimations = barAnims.map((anim) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
    );
    Animated.stagger(40, barAnimations).start(() => {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(footerOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Animated bar chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartBackground}>
            <View style={styles.barChart}>
              {CYCLE_BARS.map((h, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.bar,
                    {
                      height: barAnims[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', `${h}%`],
                      }),
                      backgroundColor:
                        h > 85
                          ? '#10B981'
                          : h > 65
                            ? '#34D399'
                            : h > 50
                              ? '#6EE7B7'
                              : '#A7F3D0',
                    },
                  ]}
                />
              ))}
            </View>
            <View style={styles.dayLabels}>
              <Text style={styles.dayLabel}>Day 1</Text>
              <Text style={[styles.dayLabel, styles.peakDayLabel]}>Day 8-10</Text>
              <Text style={styles.dayLabel}>Day 25</Text>
            </View>
          </View>

          <Animated.View style={[styles.badge, { opacity: textOpacity }]}>
            <Text style={styles.badgeText}>~20-30 day cycle</Text>
          </Animated.View>
        </View>

        <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
          <Text style={styles.title}>Your Monthly Rhythm</Text>
          <Text style={styles.description}>
            Log daily and we'll detect your personal cycle.
          </Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
        <PaginationDots total={5} current={2} />
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/(onboarding)/quiz')}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>Next</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  chartContainer: {
    width: '100%',
    marginBottom: 28,
    alignItems: 'center',
  },
  chartBackground: {
    width: '100%',
    height: 140,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'flex-end',
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 100,
    paddingBottom: 16,
  },
  bar: {
    flex: 1,
    borderRadius: 2,
    minWidth: 3,
  },
  dayLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 4,
    left: 12,
    right: 12,
  },
  dayLabel: {
    fontSize: 10,
    color: '#5A5A7A',
    fontWeight: '500',
  },
  peakDayLabel: {
    color: '#22C55E',
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#134E4A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 10,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#14B8A6',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#8B8BA3',
    textAlign: 'center',
    lineHeight: 21,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  ctaButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
