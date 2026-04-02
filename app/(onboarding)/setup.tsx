import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import PaginationDots from '@/components/onboarding/PaginationDots';
import { useAuthStore } from '@/store/authStore';
import i18n from '@/i18n';

const TIME_OPTIONS = [
  { label: '7:00 AM', value: '07:00' },
  { label: '8:00 AM', value: '08:00' },
  { label: '9:00 AM', value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '8:00 PM', value: '20:00' },
  { label: '9:00 PM', value: '21:00' },
];

export default function SetupScreen() {
  const router = useRouter();
  const { t } = useTranslation('onboarding');
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [notificationTime, setNotificationTime] = useState('08:00');
  const [nofapEnabled, setNofapEnabled] = useState(false);
  const [language, setLanguage] = useState(i18n.language === 'fr' ? 'fr' : 'en');

  const handleContinue = async () => {
    try {
      await updateProfile({
        notification_time: notificationTime,
        nofap_enabled: nofapEnabled,
        language,
      });
    } catch {
      // Continue anyway
    }
    router.push('/(onboarding)/trial');
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <FontAwesome name="sliders" size={32} color="#2563EB" />
        </View>

        <Text style={styles.title}>{t('setup.title')}</Text>

        {/* Notification Time */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <FontAwesome name="bell" size={16} color="#2563EB" />
            <Text style={styles.settingTitle}>{t('setup.notification_prompt')}</Text>
          </View>
          <View style={styles.timeGrid}>
            {TIME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.timeChip,
                  notificationTime === opt.value && styles.timeChipActive,
                ]}
                onPress={() => setNotificationTime(opt.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.timeChipText,
                    notificationTime === opt.value && styles.timeChipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* NoFap Toggle */}
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <FontAwesome name="shield" size={16} color="#0D9488" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t('setup.nofap_prompt')}</Text>
                <Text style={styles.settingDescription}>{t('setup.nofap_description')}</Text>
              </View>
            </View>
            <Switch
              value={nofapEnabled}
              onValueChange={setNofapEnabled}
              trackColor={{ false: '#E2E8F0', true: '#BBF7D0' }}
              thumbColor={nofapEnabled ? '#10B981' : '#94A3B8'}
            />
          </View>
        </View>

        {/* Language Selector */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <FontAwesome name="language" size={16} color="#2563EB" />
            <Text style={styles.settingTitle}>Language</Text>
          </View>
          <View style={styles.languageRow}>
            <TouchableOpacity
              style={[styles.langButton, language === 'en' && styles.langButtonActive]}
              onPress={() => handleLanguageChange('en')}
              activeOpacity={0.7}
            >
              <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langButton, language === 'fr' && styles.langButtonActive]}
              onPress={() => handleLanguageChange('fr')}
              activeOpacity={0.7}
            >
              <Text style={[styles.langText, language === 'fr' && styles.langTextActive]}>
                Francais
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <PaginationDots total={5} current={3} />
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>{t('common:buttons.continue', { defaultValue: 'Continue' })}</Text>
          <FontAwesome name="arrow-right" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  settingCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 10,
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  settingDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 17,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  timeChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  timeChipText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  timeChipTextActive: {
    color: '#2563EB',
  },
  languageRow: {
    flexDirection: 'row',
    gap: 8,
  },
  langButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  langButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  langText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  langTextActive: {
    color: '#2563EB',
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  ctaButton: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#2563EB',
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
