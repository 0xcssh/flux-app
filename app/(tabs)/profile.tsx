import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuthStore } from '@/store/authStore';
import { useLogStore } from '@/store/logStore';
import { useSettingsStore } from '@/store/settingsStore';
import SubscriptionCard from '@/components/profile/SubscriptionCard';
import HistoryChart from '@/components/profile/HistoryChart';
import SettingsForm from '@/components/profile/SettingsForm';
import ExportButton from '@/components/profile/ExportButton';
import Constants from 'expo-constants';
import { formatLocalDate } from '@/lib/dateUtils';

export default function ProfileScreen() {
  const { t } = useTranslation('profile');
  const navigation = useNavigation<any>();
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const logs = useLogStore((s) => s.logs);

  const allLogs = useMemo(
    () =>
      Object.values(logs).sort((a, b) =>
        a.log_date.localeCompare(b.log_date),
      ),
    [logs],
  );

  const totalLogs = allLogs.length;

  const avgVitality = useMemo(() => {
    if (allLogs.length === 0) return 0;
    const sum = allLogs.reduce((s, l) => s + l.vitality_score, 0);
    return Math.round(sum / allLogs.length);
  }, [allLogs]);

  const currentStreak = useMemo(() => {
    if (allLogs.length === 0) return 0;
    const sorted = [...allLogs].sort((a, b) =>
      b.log_date.localeCompare(a.log_date),
    );
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < sorted.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      const expectedStr = formatLocalDate(expected);
      if (sorted[i].log_date === expectedStr) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [allLogs]);

  const handleLogout = () => {
    Alert.alert(t('logout'), t('logout_confirm'), [
      { text: 'Cancel', style: 'cancel' },
      {
        text: t('logout'),
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.contentContainer}
    >
      {/* User Info */}
      <View style={styles.userSection}>
        <View style={styles.avatarContainer}>
          <FontAwesome name="user" size={28} color="#3B82F6" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {profile?.display_name ?? 'User'}
          </Text>
          <Text style={styles.userEmail}>
            {user?.email ?? profile?.email ?? ''}
          </Text>
        </View>
      </View>

      {/* Subscription Card */}
      <SubscriptionCard />

      {/* History Chart */}
      <HistoryChart logs={allLogs} />

      {/* Stats Summary */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalLogs}</Text>
            <Text style={styles.statLabel}>Total Logs</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {currentStreak}
            </Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#0D9488' }]}>
              {avgVitality}
            </Text>
            <Text style={styles.statLabel}>Avg Vitality</Text>
          </View>
        </View>
      </View>

      {/* Settings */}
      <SettingsForm />

      {/* Export Button */}
      <ExportButton />

      {/* Replay Onboarding (dev only) */}
      {__DEV__ && (
        <TouchableOpacity
          style={styles.devButton}
          onPress={() => {
            useSettingsStore.getState().setOnboardingSeen(false);
          }}
          activeOpacity={0.7}
        >
          <FontAwesome name="refresh" size={16} color="#3B82F6" />
          <Text style={styles.devButtonText}>Replay Onboarding</Text>
        </TouchableOpacity>
      )}

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <FontAwesome name="sign-out" size={18} color="#EF4444" />
        <Text style={styles.logoutText}>{t('logout')}</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>
          {t('version', { version: appVersion })}
        </Text>
        <View style={styles.legalLinks}>
          {/* TODO: Replace with actual legal page URLs before submission */}
          <TouchableOpacity
            onPress={() => Linking.openURL('https://flux-legal.vercel.app/terms')}
          >
            <Text style={styles.legalLink}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.legalSeparator}>|</Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://flux-legal.vercel.app/privacy')}
          >
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#252540',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 14,
    color: '#8B8BA3',
    marginTop: 2,
  },
  statsCard: {
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
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 12,
    color: '#5A5A7A',
    fontWeight: '500',
    marginTop: 4,
  },
  devButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  devButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F87171',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#5A5A7A',
    marginBottom: 8,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legalLink: {
    fontSize: 12,
    color: '#8B8BA3',
  },
  legalSeparator: {
    fontSize: 12,
    color: '#5A5A7A',
  },
});
