import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';

interface TrialOfferCardProps {
  onStartTrial: () => void;
  onSkip: () => void;
}

const FEATURES = [
  { key: 'unlimited_history', icon: 'history' },
  { key: 'cycle_detection', icon: 'refresh' },
  { key: 'ai_insights', icon: 'lightbulb-o' },
  { key: 'pdf_reports', icon: 'file-pdf-o' },
  { key: 'advanced_nofap', icon: 'shield' },
];

const FEATURE_LABELS: Record<string, { en: string; fr: string }> = {
  unlimited_history: { en: 'Unlimited history', fr: 'Historique illimite' },
  cycle_detection: { en: 'Cycle detection', fr: 'Detection de cycle' },
  ai_insights: { en: 'AI insights', fr: 'Analyses IA' },
  pdf_reports: { en: 'PDF reports', fr: 'Rapports PDF' },
  advanced_nofap: { en: 'Advanced NoFap', fr: 'NoFap avance' },
};

export default function TrialOfferCard({ onStartTrial, onSkip }: TrialOfferCardProps) {
  const { t, i18n } = useTranslation('onboarding');
  const lang = i18n.language === 'fr' ? 'fr' : 'en';

  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <FontAwesome name="star" size={12} color="#FFFFFF" />
        <Text style={styles.badgeText}>PREMIUM</Text>
      </View>

      <Text style={styles.title}>{t('trial.title')}</Text>

      <View style={styles.featureList}>
        {FEATURES.map((feature) => (
          <View key={feature.key} style={styles.featureRow}>
            <View style={styles.checkContainer}>
              <FontAwesome name="check" size={12} color="#10B981" />
            </View>
            <Text style={styles.featureText}>
              {FEATURE_LABELS[feature.key][lang]}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.trialButton}
        onPress={onStartTrial}
        activeOpacity={0.8}
      >
        <FontAwesome name="star" size={18} color="#FFFFFF" />
        <Text style={styles.trialButtonText}>{t('trial.cta')}</Text>
      </TouchableOpacity>

      <Text style={styles.priceInfo}>
        {lang === 'fr'
          ? 'Puis $19.99/mois ou $119.99/an'
          : 'Then $19.99/month or $119.99/year'}
      </Text>

      <TouchableOpacity onPress={onSkip} style={styles.skipButton} activeOpacity={0.6}>
        <Text style={styles.skipText}>{t('trial.skip')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#2A2A45',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  featureList: {
    width: '100%',
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#064E3B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#8B8BA3',
    fontWeight: '500',
  },
  trialButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    marginBottom: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  trialButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  priceInfo: {
    fontSize: 12,
    color: '#5A5A7A',
    textAlign: 'center',
    marginBottom: 16,
  },
  skipButton: {
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    color: '#5A5A7A',
    fontWeight: '500',
  },
});
