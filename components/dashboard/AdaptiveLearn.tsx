import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';
import { useLogStore } from '@/store/logStore';
import Icon from '@/components/ui/Icon';
import type { IconSet } from '@/components/ui/Icon';
import type { DailyLogEntry } from '@/types/log';

interface ArticleRecommendation {
  articleId: string;
  reason: string; // i18n key
  reasonParams?: Record<string, string>;
  category: string;
  iconName: string;
  iconSet?: IconSet;
  bg: string;
  accent: string;
}

const ARTICLE_POOL: ArticleRecommendation[] = [
  {
    articleId: 'circadian-rhythm',
    reason: 'adaptive_reason_basics',
    category: 'Science',
    iconName: 'flask',
    bg: '#134E4A',
    accent: '#14B8A6',
  },
  {
    articleId: 'testosterone-basics',
    reason: 'adaptive_reason_basics',
    category: 'Hormones',
    iconName: 'barbell',
    bg: '#1E3A5F',
    accent: '#3B82F6',
  },
  {
    articleId: 'sleep-and-hormones',
    reason: 'adaptive_reason_sleep',
    category: 'Sleep',
    iconName: 'moon',
    bg: '#1E1B4B',
    accent: '#6366F1',
  },
  {
    articleId: 'stress-cortisol',
    reason: 'adaptive_reason_stress',
    category: 'Mind',
    iconName: 'brain',
    iconSet: 'material',
    bg: '#312E81',
    accent: '#A78BFA',
  },
  {
    articleId: 'exercise-timing',
    reason: 'adaptive_reason_training',
    category: 'Training',
    iconName: 'fitness',
    bg: '#14532D',
    accent: '#22C55E',
  },
  {
    articleId: 'nutrition-testosterone',
    reason: 'adaptive_reason_energy',
    category: 'Nutrition',
    iconName: 'nutrition',
    iconSet: 'material',
    bg: '#713F12',
    accent: '#F59E0B',
  },
];

function pickArticleForLog(log: DailyLogEntry | null, totalLogCount: number): ArticleRecommendation {
  // First week: suggest basics
  if (totalLogCount < 7) {
    return ARTICLE_POOL[0]; // circadian-rhythm
  }

  if (log) {
    if (log.sleep_quality < 5) {
      return { ...ARTICLE_POOL[2], reason: 'adaptive_reason_sleep_low' };
    }
    if (log.stress > 7) {
      return { ...ARTICLE_POOL[3], reason: 'adaptive_reason_stress_high' };
    }
    if (log.energy < 4) {
      return { ...ARTICLE_POOL[5], reason: 'adaptive_reason_energy_low' };
    }
    if (log.training < 3) {
      return { ...ARTICLE_POOL[4], reason: 'adaptive_reason_training_low' };
    }
  }

  // Default: rotate daily
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return ARTICLE_POOL[dayOfYear % ARTICLE_POOL.length];
}

interface AdaptiveLearnProps {
  log?: DailyLogEntry | null;
}

export default function AdaptiveLearn({ log = null }: AdaptiveLearnProps) {
  const navigation = useNavigation<any>();
  const { t } = useTranslation('dashboard');
  const { t: tArticles } = useTranslation('articles');
  const logs = useLogStore((s) => s.logs);

  const totalLogCount = useMemo(() => Object.keys(logs).length, [logs]);

  const recommendation = useMemo(
    () => pickArticleForLog(log, totalLogCount),
    [log, totalLogCount],
  );

  const articleTitle = tArticles(`${recommendation.articleId}.title`, {
    defaultValue: recommendation.articleId.replace(/-/g, ' '),
  });

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: recommendation.bg }]}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('Article', { id: recommendation.articleId })
      }
    >
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: `${recommendation.accent}25` }]}>
          <Text style={[styles.badgeText, { color: recommendation.accent }]}>
            {t('adaptive_recommended')}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Icon
          set={recommendation.iconSet}
          name={recommendation.iconName}
          size={32}
          color={recommendation.accent}
        />
        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={2}>
            {articleTitle}
          </Text>
          <Text style={[styles.reason, { color: recommendation.accent }]}>
            {t(recommendation.reason)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
  },
  headerRow: {
    marginBottom: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  reason: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
