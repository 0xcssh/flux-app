import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import PaginationDots from '@/components/onboarding/PaginationDots';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation('onboarding');

  // Animations
  const titleScale = useRef(new Animated.Value(0.8)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const descOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // FLUX title: fade in + spring scale
    Animated.parallel([
      Animated.spring(titleScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtitle: slide up + fade in with 300ms delay
    Animated.parallel([
      Animated.timing(subtitleTranslateY, {
        toValue: 0,
        duration: 500,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 500,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Description: fade in with 600ms delay
    Animated.timing(descOpacity, {
      toValue: 1,
      duration: 500,
      delay: 600,
      useNativeDriver: true,
    }).start();

    // Footer: fade in with 800ms delay
    Animated.timing(footerOpacity, {
      toValue: 1,
      duration: 400,
      delay: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: titleOpacity,
              transform: [{ scale: titleScale }],
            },
          ]}
        >
          FLUX
        </Animated.Text>

        <Animated.Text
          style={[
            styles.subtitle,
            {
              opacity: subtitleOpacity,
              transform: [{ translateY: subtitleTranslateY }],
            },
          ]}
        >
          Your hormonal rhythm tracker
        </Animated.Text>

        <Animated.Text style={[styles.description, { opacity: descOpacity }]}>
          Understand your energy, mood, and performance{'\n'}patterns with science.
        </Animated.Text>
      </View>

      <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
        <PaginationDots total={6} current={0} />
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/(onboarding)/circadian')}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>Get Started</Text>
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
  title: {
    fontSize: 60,
    fontWeight: '900',
    color: '#3B82F6',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B8BA3',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#5A5A7A',
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 280,
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
