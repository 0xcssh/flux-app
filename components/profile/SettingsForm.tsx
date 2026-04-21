import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, Alert, TextInput, Modal, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useSubscription } from '@/hooks/useSubscription';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

export default function SettingsForm() {
  const initialNotificationTime = '08:00';
  const { t } = useTranslation(['profile', 'common']);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const profile = useAuthStore((s) => s.profile);
  const { isPremium } = useSubscription();
  const smartRemindersEnabled = useSettingsStore((s) => s.smartRemindersEnabled);
  const setSmartRemindersEnabled = useSettingsStore((s) => s.setSmartRemindersEnabled);

  const [hour, setHour] = useState(() => {
    const parts = initialNotificationTime.split(':');
    return parseInt(parts[0], 10) || 8;
  });
  const [minute, setMinute] = useState(() => {
    const parts = initialNotificationTime.split(':');
    return parseInt(parts[1], 10) || 0;
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  const openNameEditor = useCallback(() => {
    setNameDraft(profile?.display_name ?? '');
    setNameModalVisible(true);
  }, [profile?.display_name]);

  const saveName = useCallback(async () => {
    const trimmed = nameDraft.trim();
    try {
      await updateProfile({ display_name: trimmed.length === 0 ? null : trimmed });
      setNameModalVisible(false);
    } catch (e) {
      Alert.alert('Error', 'Could not save your name. Please try again.');
    }
  }, [nameDraft, updateProfile]);

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

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('sections.settings')}</Text>

      {/* Display Name */}
      <TouchableOpacity
        style={styles.settingRow}
        onPress={openNameEditor}
        activeOpacity={0.7}
      >
        <View style={styles.settingLeft}>
          <View style={styles.iconContainer}>
            <FontAwesome name="user" size={16} color="#3B82F6" />
          </View>
          <Text style={styles.settingLabel}>Name</Text>
        </View>
        <View style={styles.settingRight}>
          <Text style={styles.settingValue}>
            {profile?.display_name && profile.display_name.length > 0
              ? profile.display_name
              : 'Add name'}
          </Text>
          <FontAwesome name="chevron-right" size={12} color="#94A3B8" />
        </View>
      </TouchableOpacity>

      <Modal
        visible={nameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNameModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Your Name</Text>
            <Text style={styles.modalSubtitle}>How should we call you?</Text>
            <TextInput
              style={styles.modalInput}
              value={nameDraft}
              onChangeText={setNameDraft}
              placeholder="Enter your name"
              placeholderTextColor="#5A5A7A"
              autoFocus
              maxLength={40}
              returnKeyType="done"
              onSubmitEditing={saveName}
              autoCapitalize="words"
              keyboardAppearance={Platform.OS === 'ios' ? 'dark' : undefined}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setNameModalVisible(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={saveName}
              >
                <Text style={styles.modalButtonSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

      {/* Smart Reminders (Premium only) */}
      {isPremium && (
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="notifications" size={16} color="#3B82F6" />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>
                {t('common:smart_reminders')}
              </Text>
              <Text style={styles.settingSubtitle}>
                {t('common:smart_reminders_desc')}
              </Text>
            </View>
          </View>
          <Switch
            value={smartRemindersEnabled}
            onValueChange={setSmartRemindersEnabled}
            trackColor={{ false: '#2A2A45', true: '#3B82F6' }}
            thumbColor={smartRemindersEnabled ? '#FFFFFF' : '#8B8BA3'}
          />
        </View>
      )}

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
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#5A5A7A',
    marginTop: 2,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A45',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#8B8BA3',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#0A0A0F',
    borderWidth: 1,
    borderColor: '#2A2A45',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#252540',
  },
  modalButtonCancelText: {
    color: '#8B8BA3',
    fontSize: 15,
    fontWeight: '600',
  },
  modalButtonSave: {
    backgroundColor: '#3B82F6',
  },
  modalButtonSaveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
