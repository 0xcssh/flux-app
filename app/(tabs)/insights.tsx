import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLogStore } from '@/store/logStore';
import { useNoFapStore } from '@/store/nofapStore';
import { useInsights } from '@/hooks/useInsights';
import PremiumGate from '@/components/insights/PremiumGate';
import InsightCard from '@/components/insights/InsightCard';
import PatternAlert from '@/components/insights/PatternAlert';
import CorrelationChart from '@/components/insights/CorrelationChart';
import { track, AnalyticsEvents } from '@/lib/analytics';

export default function InsightsScreen() {
  const { t } = useTranslation('insights');
  const [refreshing, setRefreshing] = useState(false);

  const logs = useLogStore((s) => s.logs);
  const streaks = useNoFapStore((s) => s.history);

  const sortedLogs = useMemo(
    () => Object.values(logs).sort((a, b) => a.log_date.localeCompare(b.log_date)),
    [logs],
  );

  const { insights, isLoading, hasEnoughData, daysUntilInsights } =
    useInsights(sortedLogs, streaks);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  }, []);

  React.useEffect(() => {
    if (hasEnoughData) {
      track(AnalyticsEvents.INSIGHT_VIEWED, {
        correlations_count: insights.correlations.length,
        patterns_count: insights.patterns.length,
      });
    }
  }, [hasEnoughData]);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>{t('sections.correlations')}...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#3B82F6']}
          tintColor="#3B82F6"
        />
      }
    >
      <Text style={styles.screenTitle}>{t('title')}</Text>

      {!hasEnoughData ? (
        <View style={styles.progressCard}>
          <View style={styles.progressIconContainer}>
            <FontAwesome name="line-chart" size={32} color="#3B82F6" />
          </View>
          <Text style={styles.progressTitle}>
            {daysUntilInsights} more days until insights
          </Text>
          <Text style={styles.progressDescription}>
            {t('minimum_data_required')}
          </Text>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(100, (sortedLogs.length / 14) * 100)}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {sortedLogs.length}/14 days logged
            </Text>
          </View>

          <View style={styles.encouragementCard}>
            <FontAwesome name="lightbulb-o" size={16} color="#F59E0B" />
            <Text style={styles.encouragementText}>
              Keep logging daily! Consistent data leads to more accurate insights about your unique patterns.
            </Text>
          </View>
        </View>
      ) : (
        <PremiumGate feature="insights">
          {/* Correlations Section */}
          {insights.correlations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('sections.correlations')}
              </Text>
              {insights.correlations.map((corr, idx) => (
                <InsightCard key={idx} correlation={corr} />
              ))}

              {insights.correlations.length > 0 && (
                <CorrelationChart
                  logs={sortedLogs}
                  metricA={insights.correlations[0].metric_a}
                  metricB={insights.correlations[0].metric_b}
                />
              )}
            </View>
          )}

          {/* Patterns Section */}
          {insights.patterns.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('sections.patterns')}
              </Text>
              {insights.patterns.map((pattern, idx) => (
                <PatternAlert key={idx} pattern={pattern} />
              ))}
            </View>
          )}

          {/* Recommendations Section */}
          {insights.recommendations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('sections.recommendations')}
              </Text>
              {insights.recommendations.map((rec, idx) => (
                <View key={idx} style={styles.recommendationCard}>
                  <View style={styles.recPriorityBadge}>
                    <Text style={styles.recPriorityText}>
                      {rec.priority === 1 ? 'High' : rec.priority === 2 ? 'Medium' : 'Low'}
                    </Text>
                  </View>
                  <Text style={styles.recTitle}>
                    {t(rec.title_key, { defaultValue: rec.title_key })}
                  </Text>
                  <Text style={styles.recBody}>
                    {t(rec.body_key, { defaultValue: rec.body_key })}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {insights.correlations.length === 0 &&
            insights.patterns.length === 0 &&
            insights.recommendations.length === 0 && (
              <View style={styles.emptyState}>
                <FontAwesome name="search" size={40} color="#5A5A7A" />
                <Text style={styles.emptyText}>
                  No significant patterns found yet. Keep logging to discover your unique rhythms!
                </Text>
              </View>
            )}
        </PremiumGate>
      )}
    </ScrollView>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
  },
  loadingText: {
    fontSize: 14,
    color: '#5A5A7A',
    marginTop: 12,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  progressCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 3,
  },
  progressIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#252540',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  progressDescription: {
    fontSize: 14,
    color: '#8B8BA3',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2A2A45',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#5A5A7A',
    textAlign: 'center',
    fontWeight: '500',
  },
  encouragementCard: {
    flexDirection: 'row',
    backgroundColor: '#78350F',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    alignItems: 'flex-start',
    width: '100%',
  },
  encouragementText: {
    flex: 1,
    fontSize: 13,
    color: '#FBBF24',
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  recommendationCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A45',
  },
  recPriorityBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#78350F',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  recPriorityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FBBF24',
  },
  recTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  recBody: {
    fontSize: 13,
    color: '#8B8BA3',
    lineHeight: 19,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#5A5A7A',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
