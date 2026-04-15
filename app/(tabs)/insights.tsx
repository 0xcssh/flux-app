import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { darkPalette } from '@/theme/colors';
import { useLogStore } from '@/store/logStore';
import { useNoFapStore } from '@/store/nofapStore';
import { useInsights } from '@/hooks/useInsights';
import PremiumGate from '@/components/insights/PremiumGate';
import InsightCard from '@/components/insights/InsightCard';
import PatternAlert from '@/components/insights/PatternAlert';
import CorrelationChart from '@/components/insights/CorrelationChart';
import TierProgress from '@/components/insights/TierProgress';
import UniversalInsightCard from '@/components/insights/UniversalInsightCard';
import EarlyPatternCard from '@/components/insights/EarlyPatternCard';
import SymptomAccuracyCard from '@/components/insights/SymptomAccuracyCard';
import BestDaysCard from '@/components/insights/BestDaysCard';
import StreakImpactCard from '@/components/insights/StreakImpactCard';
import MonthlyReportCard from '@/components/insights/MonthlyReportCard';
import ChallengeCard from '@/components/challenges/ChallengeCard';
import ChallengeDetail from '@/components/challenges/ChallengeDetail';
import { CHALLENGES, getChallengeById } from '@/lib/challenges';
import { useChallengeStore } from '@/store/challengeStore';
import { track, AnalyticsEvents } from '@/lib/analytics';

export default function InsightsScreen() {
  const { t } = useTranslation('insights');

  const logs = useLogStore((s) => s.logs);
  const todayLog = useLogStore((s) => s.getTodayLog());
  const streaks = useNoFapStore((s) => s.history);

  const activeChallenge = useChallengeStore((s) => s.activeChallenge);
  const completedChallenges = useChallengeStore((s) => s.completedChallenges);
  const startChallenge = useChallengeStore((s) => s.startChallenge);
  const completeDay = useChallengeStore((s) => s.completeDay);
  const abandonChallenge = useChallengeStore((s) => s.abandonChallenge);
  const isChallengeCompleted = useChallengeStore((s) => s.isCompleted);
  const getCurrentDayNumber = useChallengeStore((s) => s.getCurrentDayNumber);

  const activeChallengeData = activeChallenge
    ? getChallengeById(activeChallenge.challengeId)
    : undefined;
  const currentDayNumber = getCurrentDayNumber();

  const sortedLogs = useMemo(
    () => Object.values(logs).sort((a, b) => a.log_date.localeCompare(b.log_date)),
    [logs],
  );

  const {
    tier,
    universalInsights,
    earlyPatterns,
    weeklyInsights,
    deepInsights,
    daysLogged,
    daysUntilNextTier,
    nextTier,
  } = useInsights(sortedLogs, streaks);

  React.useEffect(() => {
    track(AnalyticsEvents.INSIGHT_VIEWED, {
      tier,
      days_logged: daysLogged,
    });
  }, [tier, daysLogged]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.contentContainer}
    >
      {/* HEADER: Tier Progress — always visible */}
      <TierProgress currentTier={tier} />

      {/* SECTION 1: YOUR COACHING — active challenge at top */}
      {activeChallenge && activeChallengeData && (
        <View style={styles.section}>
          <View style={styles.challengesSectionHeader}>
            <Ionicons name="trophy" size={18} color={darkPalette.accent} />
            <Text style={styles.sectionTitle}>{t('challenges_title')}</Text>
          </View>
          <ChallengeDetail
            challenge={activeChallengeData}
            progress={activeChallenge}
            currentDayNumber={currentDayNumber}
            onCompleteDay={completeDay}
            onAbandon={abandonChallenge}
          />
        </View>
      )}

      {/* SECTION 2: YOUR PATTERNS */}
      <Text style={styles.sectionLabel}>YOUR PATTERNS</Text>

      {/* Symptom Accuracy — 7+ days */}
      {weeklyInsights && <SymptomAccuracyCard />}

      {/* Best Days — 7+ days */}
      {weeklyInsights && <BestDaysCard />}

      {/* Early Patterns — 3+ days */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('section.early')}</Text>
        {earlyPatterns && earlyPatterns.length > 0 ? (
          earlyPatterns.map((pattern) => (
            <EarlyPatternCard key={pattern.metric} pattern={pattern} />
          ))
        ) : (
          <LockedTeaser
            daysUntilNextTier={daysLogged < 3 ? 3 - daysLogged : 0}
            tierLabel={t('tier.early')}
            progress={daysLogged / 3}
            t={t}
          />
        )}
      </View>

      {/* Weekly correlations — 7+ days */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('section.weekly')}</Text>
        {weeklyInsights ? (
          <>
            {weeklyInsights.patterns.map((pattern, idx) => (
              <PatternAlert key={idx} pattern={pattern} />
            ))}
            {weeklyInsights.correlations.map((corr, idx) => (
              <InsightCard key={idx} correlation={corr} />
            ))}
            {weeklyInsights.correlations.length > 0 && (
              <CorrelationChart
                logs={sortedLogs}
                metricA={weeklyInsights.correlations[0].metric_a}
                metricB={weeklyInsights.correlations[0].metric_b}
              />
            )}
            {weeklyInsights.recommendations.map((rec, idx) => (
              <View key={idx} style={styles.recommendationCard}>
                <Text style={styles.recTitle}>
                  {t(rec.title_key, { defaultValue: rec.title_key })}
                </Text>
                <Text style={styles.recBody}>
                  {t(rec.body_key, { defaultValue: rec.body_key })}
                </Text>
              </View>
            ))}
            {weeklyInsights.patterns.length === 0 &&
              weeklyInsights.correlations.length === 0 && (
                <Text style={styles.noDataText}>
                  {t('no_patterns_yet', {
                    defaultValue: 'No significant weekly patterns detected yet. Keep logging!',
                  })}
                </Text>
              )}
          </>
        ) : (
          <LockedTeaser
            daysUntilNextTier={daysLogged < 7 ? 7 - daysLogged : 0}
            tierLabel={t('tier.weekly')}
            progress={daysLogged / 7}
            t={t}
          />
        )}
      </View>

      {/* Deep correlations — 14+ days, Premium gated */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('section.deep')}</Text>
        {deepInsights ? (
          <PremiumGate feature="insights">
            {deepInsights.correlations.map((corr, idx) => (
              <InsightCard key={idx} correlation={corr} />
            ))}
            {deepInsights.correlations.length > 0 && (
              <CorrelationChart
                logs={sortedLogs}
                metricA={deepInsights.correlations[0].metric_a}
                metricB={deepInsights.correlations[0].metric_b}
              />
            )}
            {deepInsights.patterns.map((pattern, idx) => (
              <PatternAlert key={idx} pattern={pattern} />
            ))}
            {deepInsights.recommendations.map((rec, idx) => (
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
          </PremiumGate>
        ) : (
          <LockedTeaser
            daysUntilNextTier={daysLogged < 14 ? 14 - daysLogged : 0}
            tierLabel={t('tier.deep')}
            progress={daysLogged / 14}
            t={t}
          />
        )}
      </View>

      {/* SECTION 3: YOUR DATA */}
      <Text style={styles.sectionLabel}>YOUR DATA</Text>

      {/* Streak Impact — 7+ days */}
      {weeklyInsights ? (
        <StreakImpactCard />
      ) : (
        <View style={styles.section}>
          <LockedTeaser
            daysUntilNextTier={daysLogged < 7 ? 7 - daysLogged : 0}
            tierLabel={t('tier.weekly')}
            progress={daysLogged / 7}
            t={t}
          />
        </View>
      )}

      {/* Monthly Report — 14+ days, Premium */}
      {deepInsights && (
        <PremiumGate feature="insights">
          <MonthlyReportCard deepInsights={deepInsights} />
        </PremiumGate>
      )}

      {/* SECTION 4: SCIENCE */}
      <Text style={styles.sectionLabel}>SCIENCE</Text>

      {/* Universal Insights — always shown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('section.universal')}</Text>
        {universalInsights.map((insight) => (
          <UniversalInsightCard key={insight.id} insight={insight} />
        ))}
      </View>

      {/* SECTION 5: CHALLENGES — discovery/browse */}
      <Text style={styles.sectionLabel}>CHALLENGES</Text>

      <View style={styles.section}>
        <PremiumGate feature="challenges">
          {CHALLENGES.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              progress={
                activeChallenge?.challengeId === challenge.id
                  ? activeChallenge
                  : null
              }
              isCompleted={isChallengeCompleted(challenge.id)}
              onPress={() => {
                if (
                  !activeChallenge &&
                  !isChallengeCompleted(challenge.id)
                ) {
                  startChallenge(challenge.id);
                }
              }}
            />
          ))}
        </PremiumGate>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

// ── Locked Tier Teaser ────────────────────────────────────────────────

interface LockedTeaserProps {
  daysUntilNextTier: number;
  tierLabel: string;
  progress: number;
  t: (key: string, opts?: Record<string, unknown>) => string;
}

function LockedTeaser({ daysUntilNextTier, tierLabel, progress, t }: LockedTeaserProps) {
  return (
    <View style={styles.lockedCard}>
      <FontAwesome name="lock" size={20} color={darkPalette.textTertiary} />
      <Text style={styles.lockedTitle}>
        {tierLabel} — {t('tier.unlocks_in', { days: daysUntilNextTier })}
      </Text>
      <View style={styles.lockedProgressBar}>
        <View
          style={[
            styles.lockedProgressFill,
            { width: `${Math.min(100, progress * 100)}%` },
          ]}
        />
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkPalette.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: darkPalette.text,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: darkPalette.text,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: darkPalette.textTertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 12,
  },
  challengesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 0,
  },
  recommendationCard: {
    backgroundColor: darkPalette.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: darkPalette.border,
  },
  recPriorityBadge: {
    alignSelf: 'flex-start',
    backgroundColor: darkPalette.warningLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  recPriorityText: {
    fontSize: 11,
    fontWeight: '700',
    color: darkPalette.accentLight,
  },
  recTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: darkPalette.text,
    marginBottom: 4,
  },
  recBody: {
    fontSize: 13,
    color: darkPalette.textSecondary,
    lineHeight: 19,
  },
  noDataText: {
    fontSize: 13,
    color: darkPalette.textTertiary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  // Locked teaser
  lockedCard: {
    backgroundColor: darkPalette.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: darkPalette.border,
  },
  lockedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: darkPalette.textSecondary,
    marginTop: 10,
    marginBottom: 12,
  },
  lockedProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: darkPalette.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  lockedProgressFill: {
    height: '100%',
    backgroundColor: darkPalette.primary,
    borderRadius: 3,
  },
});
