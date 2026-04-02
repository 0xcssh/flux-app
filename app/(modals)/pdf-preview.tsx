import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { generateMonthlyReport } from '@/lib/pdfReport';
import { useLogStore } from '@/store/logStore';
import { useAuthStore } from '@/store/authStore';
import { track, AnalyticsEvents } from '@/lib/analytics';

export default function PdfPreviewScreen() {
  const router = useRouter();
  const logs = useLogStore((s) => s.logs);
  const profile = useAuthStore((s) => s.profile);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  const allLogs = Object.values(logs).sort((a, b) =>
    a.log_date.localeCompare(b.log_date),
  );

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const startStr = startDate.toISOString().split('T')[0];

      const userName = profile?.display_name ?? profile?.email ?? 'User';
      const uri = await generateMonthlyReport(allLogs, userName, {
        start: startStr,
        end: endDate,
      });
      setFileUri(uri);
    } catch (error) {
      console.error('[PdfPreview] Error:', error);
      Alert.alert('Error', 'Failed to generate report.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!fileUri) return;
    setIsSharing(true);
    try {
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Flux Report',
          UTI: 'com.adobe.pdf',
        });
        track(AnalyticsEvents.PDF_EXPORTED, { log_count: allLogs.length });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device.');
      }
    } catch (error) {
      console.error('[PdfPreview] Share error:', error);
    } finally {
      setIsSharing(false);
    }
  };

  // Compute summary stats for preview
  const recentLogs = allLogs.slice(-30);
  const avgVitality =
    recentLogs.length > 0
      ? Math.round(
          recentLogs.reduce((s, l) => s + l.vitality_score, 0) / recentLogs.length,
        )
      : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <FontAwesome name="times" size={20} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PDF Report Preview</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isGenerating ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Generating your report...</Text>
          </View>
        ) : (
          <>
            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.logoRow}>
                <Text style={styles.logo}>
                  Flux<Text style={styles.logoDot}>.</Text>
                </Text>
                <Text style={styles.reportLabel}>Monthly Report</Text>
              </View>

              <View style={styles.vitalitySection}>
                <Text style={styles.vitalityScore}>{avgVitality}</Text>
                <Text style={styles.vitalityLabel}>Average Vitality</Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{recentLogs.length}</Text>
                  <Text style={styles.statLabel}>Days Logged</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {recentLogs.length > 0
                      ? (
                          recentLogs.reduce((s, l) => s + l.energy, 0) /
                          recentLogs.length
                        ).toFixed(1)
                      : '--'}
                  </Text>
                  <Text style={styles.statLabel}>Avg Energy</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {recentLogs.length > 0
                      ? (
                          recentLogs.reduce((s, l) => s + l.sleep_quality, 0) /
                          recentLogs.length
                        ).toFixed(1)
                      : '--'}
                  </Text>
                  <Text style={styles.statLabel}>Avg Sleep</Text>
                </View>
              </View>
            </View>

            <Text style={styles.previewNote}>
              The full PDF includes metric averages, trend charts, and detailed analysis.
            </Text>
          </>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      {!isGenerating && fileUri && (
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            disabled={isSharing}
            activeOpacity={0.8}
          >
            {isSharing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <FontAwesome name="share-alt" size={18} color="#FFFFFF" />
                <Text style={styles.shareButtonText}>Share Report</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2563EB',
  },
  logoDot: {
    color: '#10B981',
  },
  reportLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  vitalitySection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
  },
  vitalityScore: {
    fontSize: 56,
    fontWeight: '800',
    color: '#2563EB',
    lineHeight: 64,
  },
  vitalityLabel: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  previewNote: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 16,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 36,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  shareButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
