import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import PaginationDots from '@/components/onboarding/PaginationDots';

export default function InfradianScreen() {
  const router = useRouter();
  const { t } = useTranslation('onboarding');

  // Simulated ~25 day cycle illustration
  const cycleBars = [
    40, 45, 55, 65, 72, 80, 88, 92, 95, 90, 82, 75, 68,
    60, 52, 48, 45, 42, 40, 42, 48, 55, 65, 75, 82,
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Cycle illustration */}
        <View style={styles.chartContainer}>
          <View style={styles.chartBackground}>
            <View style={styles.barChart}>
              {cycleBars.map((h, i) => (
                <View
                  key={i}
                  style={[
                    styles.bar,
                    {
                      height: `${h}%`,
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

          <View style={styles.cycleMarker}>
            <FontAwesome name="refresh" size={12} color="#10B981" />
            <Text style={styles.cycleText}>~20-30 day cycle</Text>
          </View>
        </View>

        <Text style={styles.title}>{t('infradian.title')}</Text>
        <Text style={styles.description}>{t('infradian.description')}</Text>

        <View style={styles.nuanceCard}>
          <FontAwesome name="flask" size={16} color="#0D9488" />
          <Text style={styles.nuanceText}>
            Research suggests ~60% of men have detectable hormonal cycles lasting 20-30 days
            (Doering et al., 1975; Celec et al., 2003). Log daily and we'll find your unique pattern.
          </Text>
        </View>

        <View style={styles.teaseCard}>
          <FontAwesome name="magic" size={14} color="#2563EB" />
          <Text style={styles.teaseText}>
            After 14 days of logging, Flux begins detecting your personal cycle.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <PaginationDots total={6} current={2} />
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/(onboarding)/quiz')}
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
  cycleMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 8,
    gap: 4,
  },
  cycleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4ADE80',
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
    marginBottom: 16,
  },
  nuanceCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#2A2A45',
    marginBottom: 10,
  },
  nuanceText: {
    flex: 1,
    fontSize: 13,
    color: '#8B8BA3',
    lineHeight: 19,
  },
  teaseCard: {
    flexDirection: 'row',
    backgroundColor: '#252540',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    alignItems: 'center',
    width: '100%',
  },
  teaseText: {
    flex: 1,
    fontSize: 13,
    color: '#60A5FA',
    fontWeight: '500',
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
