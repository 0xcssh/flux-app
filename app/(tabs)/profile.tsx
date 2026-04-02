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
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuthStore } from '@/store/authStore';
import { useLogStore } from '@/store/logStore';
import SubscriptionCard from '@/components/profile/SubscriptionCard';
import HistoryChart from '@/components/profile/HistoryChart';
import SettingsForm from '@/components/profile/SettingsForm';
import ExportButton from '@/components/profile/ExportButton';
import Constants from 'expo-constants';

export default function ProfileScreen() {
  const { t } = useTranslation('profile');
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
      const expectedStr = expected.toISOString().split('T')[0];
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* User Info */}
      <View style={styles.userSection}>
        <View style={styles.avatarContainer}>
          <FontAwesome name="user" size={28} color="#2563EB" />
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
      <SettingsForm
        initialNotificationTime={profile?.notification_time ?? '08:00'}
        initialNofapEnabled={profile?.nofap_enabled ?? false}
        initialLanguage={profile?.language ?? 'en'}
        initialDarkMode={profile?.dark_mode ?? false}
      />

      {/* Export Button */}
      <ExportButton />

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
          <TouchableOpacity
            onPress={() => Linking.openURL('https://flux-app.com/terms')}
          >
            <Text style={styles.legalLink}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.legalSeparator}>|</Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://flux-app.com/privacy')}
          >
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    backgroundColor: '#EFF6FF',
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
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
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
    color: '#2563EB',
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legalLink: {
    fontSize: 12,
    color: '#64748B',
  },
  legalSeparator: {
    fontSize: 12,
    color: '#CBD5E1',
  },
});
