import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import PaginationDots from '@/components/onboarding/PaginationDots';
import { useAuthStore } from '@/store/authStore';

const TIME_OPTIONS = [
  { label: '7:00 AM', value: '07:00' },
  { label: '8:00 AM', value: '08:00' },
  { label: '9:00 AM', value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '8:00 PM', value: '20:00' },
  { label: '9:00 PM', value: '21:00' },
];

export default function SetupScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation('onboarding');
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [notificationTime, setNotificationTime] = useState('08:00');
  const [nofapEnabled, setNofapEnabled] = useState(false);

  // Stagger fade-in animations
  const notifCardAnim = useRef(new Animated.Value(0)).current;
  const nofapCardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(notifCardAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(nofapCardAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [notifCardAnim, nofapCardAnim]);

  const handleTimeSelect = (value: string) => {
    setNotificationTime(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleNofapToggle = (value: boolean) => {
    setNofapEnabled(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleContinue = async () => {
    try {
      await updateProfile({
        notification_time: notificationTime,
        nofap_enabled: nofapEnabled,
        language: 'en',
      });
    } catch {
      // Continue anyway
    }
    navigation.navigate('Trial');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="settings-outline" size={28} color="#3B82F6" />
        </View>

        <Text style={styles.title}>{t('setup.title', { defaultValue: 'Personalize Your Experience' })}</Text>

        {/* Notification Time */}
        <Animated.View
          style={[
            styles.settingCard,
            { opacity: notifCardAnim, transform: [{ translateY: notifCardAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] },
          ]}
        >
          <View style={styles.settingHeader}>
            <Ionicons name="notifications-outline" size={16} color="#3B82F6" />
            <Text style={styles.settingTitle}>{t('setup.notification_prompt', { defaultValue: 'Reminder Time' })}</Text>
          </View>
          <View style={styles.timeGrid}>
            {TIME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.timeChip,
                  notificationTime === opt.value && styles.timeChipActive,
                ]}
                onPress={() => handleTimeSelect(opt.value)}
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
        </Animated.View>

        {/* NoFap Toggle */}
        <Animated.View
          style={[
            styles.settingCard,
            { opacity: nofapCardAnim, transform: [{ translateY: nofapCardAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] },
          ]}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#0D9488" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t('setup.nofap_prompt', { defaultValue: 'NoFap Tracking' })}</Text>
                <Text style={styles.settingDescription}>{t('setup.nofap_description', { defaultValue: 'Track retention streaks and see their impact on your vitality.' })}</Text>
              </View>
            </View>
            <Switch
              value={nofapEnabled}
              onValueChange={handleNofapToggle}
              trackColor={{ false: '#2A2A45', true: '#064E3B' }}
              thumbColor={nofapEnabled ? '#22C55E' : '#5A5A7A'}
            />
          </View>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <PaginationDots total={6} current={4} />
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>{t('common:buttons.continue', { defaultValue: 'Continue' })}</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
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
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#252540',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  settingCard: {
    width: '100%',
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 1,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
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
    color: '#FFFFFF',
  },
  settingDescription: {
    fontSize: 12,
    color: '#8B8BA3',
    marginTop: 3,
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
    backgroundColor: '#16162A',
    borderWidth: 1.5,
    borderColor: '#2A2A45',
  },
  timeChipActive: {
    backgroundColor: '#252540',
    borderColor: '#3B82F6',
  },
  timeChipText: {
    fontSize: 13,
    color: '#8B8BA3',
    fontWeight: '600',
  },
  timeChipTextActive: {
    color: '#3B82F6',
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
