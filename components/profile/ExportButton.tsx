import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { generateMonthlyReport } from '@/lib/pdfReport';
import { useLogStore } from '@/store/logStore';
import { useAuthStore } from '@/store/authStore';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigation } from '@react-navigation/native';
import { track, AnalyticsEvents } from '@/lib/analytics';
import { getTodayDate, formatLocalDate } from '@/lib/dateUtils';

export default function ExportButton() {
  const { t } = useTranslation('profile');
  const [isLoading, setIsLoading] = useState(false);
  const { canAccess } = useSubscription();
  const navigation = useNavigation<any>();
  const logs = useLogStore((s) => s.logs);
  const profile = useAuthStore((s) => s.profile);

  const handleExport = async () => {
    if (!canAccess('pdf_export')) {
      navigation.navigate('Paywall');
      return;
    }

    setIsLoading(true);
    try {
      const allLogs = Object.values(logs).sort((a, b) =>
        a.log_date.localeCompare(b.log_date),
      );

      if (allLogs.length === 0) {
        Alert.alert('No Data', 'You need to log at least one day to generate a report.');
        return;
      }

      const endDate = getTodayDate();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const startStr = formatLocalDate(startDate);

      const userName = profile?.display_name ?? profile?.email ?? 'User';

      const fileUri = await generateMonthlyReport(allLogs, userName, {
        start: startStr,
        end: endDate,
      });

      track(AnalyticsEvents.PDF_EXPORTED, { log_count: allLogs.length });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Flux Report',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Sharing not available', 'Sharing is not available on this device.');
      }
    } catch (error) {
      console.error('[ExportButton] Error:', error);
      Alert.alert('Error', 'Failed to generate the report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isPremium = canAccess('pdf_export');

  return (
    <TouchableOpacity
      style={[styles.button, !isPremium && styles.buttonLocked]}
      onPress={handleExport}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <>
          <FontAwesome
            name={isPremium ? 'file-pdf-o' : 'lock'}
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.buttonText}>{t('export_pdf')}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonLocked: {
    backgroundColor: '#252540',
    shadowColor: '#000',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
