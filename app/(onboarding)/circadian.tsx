import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import PaginationDots from '@/components/onboarding/PaginationDots';

const BAR_HEIGHTS = [20, 45, 85, 95, 90, 75, 60, 50, 42, 38, 35, 30, 28, 25, 22, 20];

export default function CircadianScreen() {
  const router = useRouter();
  const { t } = useTranslation('onboarding');

  // Bar stagger animations
  const barAnims = useRef(BAR_HEIGHTS.map(() => new Animated.Value(0))).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Stagger bars growing in
    const barAnimations = barAnims.map((anim) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
    );
    Animated.stagger(40, barAnimations).start(() => {
      // After bars finish, fade in text
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
              {BAR_HEIGHTS.map((h, i) => (
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
                        h > 80 ? '#2563EB' : h > 50 ? '#3B82F6' : '#93C5FD',
                    },
                  ]}
                />
              ))}
            </View>
            <View style={styles.timeLabels}>
              <Text style={styles.timeLabel}>4AM</Text>
              <Text style={[styles.timeLabel, styles.peakLabel]}>8AM</Text>
              <Text style={styles.timeLabel}>12PM</Text>
              <Text style={styles.timeLabel}>6PM</Text>
              <Text style={styles.timeLabel}>12AM</Text>
            </View>
          </View>

          <Animated.View style={[styles.badge, { opacity: textOpacity }]}>
            <Text style={styles.badgeText}>Peak: 5:30-8:00 AM</Text>
          </Animated.View>
        </View>

        <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
          <Text style={styles.title}>Your 24-Hour Cycle</Text>
          <Text style={styles.description}>
            Testosterone peaks in the morning and drops by evening.
          </Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
        <PaginationDots total={6} current={1} />
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/(onboarding)/infradian')}
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
    height: 160,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'flex-end',
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 110,
    paddingBottom: 16,
  },
  bar: {
    flex: 1,
    borderRadius: 3,
    minWidth: 4,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 6,
    left: 12,
    right: 12,
  },
  timeLabel: {
    fontSize: 10,
    color: '#5A5A7A',
    fontWeight: '500',
  },
  peakLabel: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#1E3A5F',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 10,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3B82F6',
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
