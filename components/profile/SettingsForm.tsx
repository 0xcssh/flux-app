import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuthStore } from '@/store/authStore';
import i18n from '@/i18n';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

export default function SettingsForm() {
  const initialNotificationTime = '08:00';
  const initialLanguage = 'en';
  const { t } = useTranslation('profile');
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [hour, setHour] = useState(() => {
    const parts = initialNotificationTime.split(':');
    return parseInt(parts[0], 10) || 8;
  });
  const [minute, setMinute] = useState(() => {
    const parts = initialNotificationTime.split(':');
    return parseInt(parts[1], 10) || 0;
  });
  const [language, setLanguage] = useState(initialLanguage);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const formatTime = (h: number, m: number) => {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleTimeChange = useCallback(
    (newHour: number, newMinute: number) => {
      setHour(newHour);
      setMinute(newMinute);
      updateProfile({ notification_time: formatTime(newHour, newMinute) });
    },
    [updateProfile],
  );

  const handleLanguageChange = useCallback(
    (lang: string) => {
      setLanguage(lang);
      i18n.changeLanguage(lang);
      updateProfile({ language: lang });
    },
    [updateProfile],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('sections.settings')}</Text>

      {/* Notification Time */}
      <TouchableOpacity
        style={styles.settingRow}
        onPress={() => setShowTimePicker(!showTimePicker)}
        activeOpacity={0.7}
      >
        <View style={styles.settingLeft}>
          <View style={styles.iconContainer}>
            <FontAwesome name="bell" size={16} color="#2563EB" />
          </View>
          <Text style={styles.settingLabel}>{t('settings.notification_time')}</Text>
        </View>
        <View style={styles.settingRight}>
          <Text style={styles.settingValue}>{formatTime(hour, minute)}</Text>
          <FontAwesome name="chevron-right" size={12} color="#94A3B8" />
        </View>
      </TouchableOpacity>

      {showTimePicker && (
        <View style={styles.timePickerContainer}>
          <View style={styles.timePickerSection}>
            <Text style={styles.timePickerLabel}>Hour</Text>
            <View style={styles.timePickerRow}>
              {[6, 7, 8, 9, 10, 11, 12, 18, 19, 20, 21].map((h) => (
                <TouchableOpacity
                  key={h}
                  style={[
                    styles.timeChip,
                    hour === h && styles.timeChipActive,
                  ]}
                  onPress={() => handleTimeChange(h, minute)}
                >
                  <Text
                    style={[
                      styles.timeChipText,
                      hour === h && styles.timeChipTextActive,
                    ]}
                  >
                    {h.toString().padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.timePickerSection}>
            <Text style={styles.timePickerLabel}>Minute</Text>
            <View style={styles.timePickerRow}>
              {MINUTES.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.timeChip,
                    minute === m && styles.timeChipActive,
                  ]}
                  onPress={() => handleTimeChange(hour, m)}
                >
                  <Text
                    style={[
                      styles.timeChipText,
                      minute === m && styles.timeChipTextActive,
                    ]}
                  >
                    {m.toString().padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Language Selector */}
      <View style={styles.settingRow}>
        <View style={styles.settingLeft}>
          <View style={styles.iconContainer}>
            <FontAwesome name="language" size={16} color="#2563EB" />
          </View>
          <Text style={styles.settingLabel}>{t('settings.language')}</Text>
        </View>
        <View style={styles.languageButtons}>
          <TouchableOpacity
            style={[styles.langButton, language === 'en' && styles.langButtonActive]}
            onPress={() => handleLanguageChange('en')}
          >
            <Text style={[styles.langButtonText, language === 'en' && styles.langButtonTextActive]}>
              {t('languages.en')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langButton, language === 'fr' && styles.langButtonActive]}
            onPress={() => handleLanguageChange('fr')}
          >
            <Text style={[styles.langButtonText, language === 'fr' && styles.langButtonTextActive]}>
              {t('languages.fr')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Language is the last row */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A45',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#252540',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: '600',
  },
  timePickerContainer: {
    backgroundColor: '#16162A',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
  },
  timePickerSection: {
    marginBottom: 8,
  },
  timePickerLabel: {
    fontSize: 12,
    color: '#5A5A7A',
    fontWeight: '600',
    marginBottom: 6,
  },
  timePickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  timeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2A2A45',
  },
  timeChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  timeChipText: {
    fontSize: 13,
    color: '#8B8BA3',
    fontWeight: '500',
  },
  timeChipTextActive: {
    color: '#FFFFFF',
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  langButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#16162A',
  },
  langButtonActive: {
    backgroundColor: '#3B82F6',
  },
  langButtonText: {
    fontSize: 13,
    color: '#8B8BA3',
    fontWeight: '600',
  },
  langButtonTextActive: {
    color: '#FFFFFF',
  },
});
