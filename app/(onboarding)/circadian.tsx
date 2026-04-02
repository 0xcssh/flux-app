import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import PaginationDots from '@/components/onboarding/PaginationDots';

export default function CircadianScreen() {
  const router = useRouter();
  const { t } = useTranslation('onboarding');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Simple circadian curve illustration */}
        <View style={styles.chartContainer}>
          <View style={styles.chartBackground}>
            {/* Time labels */}
            <View style={styles.timeLabels}>
              <Text style={styles.timeLabel}>4AM</Text>
              <Text style={[styles.timeLabel, styles.peakLabel]}>8AM</Text>
              <Text style={styles.timeLabel}>12PM</Text>
              <Text style={styles.timeLabel}>6PM</Text>
              <Text style={styles.timeLabel}>12AM</Text>
            </View>

            {/* Simplified curve using bars */}
            <View style={styles.barChart}>
              {[20, 45, 85, 95, 90, 75, 60, 50, 42, 38, 35, 30, 28, 25, 22, 20].map(
                (h, i) => (
                  <View
                    key={i}
                    style={[
                      styles.bar,
                      {
                        height: `${h}%`,
                        backgroundColor:
                          h > 80 ? '#2563EB' : h > 50 ? '#3B82F6' : '#93C5FD',
                      },
                    ]}
                  />
                ),
              )}
            </View>
          </View>

          <View style={styles.peakMarker}>
            <FontAwesome name="arrow-up" size={12} color="#2563EB" />
            <Text style={styles.peakText}>Peak: 5:30-8:00 AM</Text>
          </View>
        </View>

        <Text style={styles.title}>{t('circadian.title')}</Text>
        <Text style={styles.description}>{t('circadian.description')}</Text>

        <View style={styles.factCard}>
          <View style={styles.factIcon}>
            <FontAwesome name="info-circle" size={16} color="#2563EB" />
          </View>
          <Text style={styles.factText}>
            Testosterone peaks between 5:30-8:00 AM and drops 20-43% by evening (Diver et al., 2003).
            This daily rhythm affects your energy, focus, and physical performance.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <PaginationDots total={5} current={1} />
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/(onboarding)/infradian')}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>{t('common:buttons.next', { defaultValue: 'Next' })}</Text>
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
  peakMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252540',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 8,
    gap: 4,
  },
  peakText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#60A5FA',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    color: '#8B8BA3',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  factCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#2A2A45',
  },
  factIcon: {
    marginTop: 2,
  },
  factText: {
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
