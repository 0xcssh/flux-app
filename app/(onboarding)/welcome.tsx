import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import PaginationDots from '@/components/onboarding/PaginationDots';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation('onboarding');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Hero illustration area */}
        <View style={styles.heroContainer}>
          <View style={styles.iconCircle}>
            <FontAwesome name="heartbeat" size={48} color="#3B82F6" />
          </View>
          <View style={styles.waveIndicators}>
            <View style={[styles.waveDot, { backgroundColor: '#2563EB', height: 24 }]} />
            <View style={[styles.waveDot, { backgroundColor: '#3B82F6', height: 36 }]} />
            <View style={[styles.waveDot, { backgroundColor: '#2563EB', height: 48 }]} />
            <View style={[styles.waveDot, { backgroundColor: '#10B981', height: 40 }]} />
            <View style={[styles.waveDot, { backgroundColor: '#0D9488', height: 28 }]} />
            <View style={[styles.waveDot, { backgroundColor: '#10B981', height: 20 }]} />
            <View style={[styles.waveDot, { backgroundColor: '#2563EB', height: 32 }]} />
          </View>
        </View>

        <Text style={styles.title}>{t('welcome.title')}</Text>
        <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
        <Text style={styles.description}>{t('welcome.description')}</Text>

        <View style={styles.scienceCard}>
          <FontAwesome name="flask" size={16} color="#0D9488" />
          <Text style={styles.scienceText}>
            Your hormones tell a story. Men experience natural hormonal fluctuations daily and monthly
            that affect energy, mood, and performance. Flux helps you decode these patterns with
            science-backed tracking.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <PaginationDots total={5} current={0} />
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/(onboarding)/circadian')}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>Discover Your Rhythm</Text>
          <FontAwesome name="arrow-right" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
  heroContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#252540',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  waveIndicators: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: 56,
  },
  waveDot: {
    width: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#8B8BA3',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  scienceCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#2A2A45',
  },
  scienceText: {
    flex: 1,
    fontSize: 13,
    color: '#8B8BA3',
    lineHeight: 19,
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
