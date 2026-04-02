import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';
import Icon from '@/components/ui/Icon';
import type { IconSet } from '@/components/ui/Icon';

const CARD_WIDTH = 160;
const CARD_HEIGHT = 200;

interface ArticleCategory {
  key: string;
  bg: string;
  accent: string;
}

const CATEGORIES: Record<string, ArticleCategory> = {
  Hormones: { key: 'hormones', bg: '#1E3A5F', accent: '#3B82F6' },
  Sleep: { key: 'sleep', bg: '#1E1B4B', accent: '#6366F1' },
  Training: { key: 'training', bg: '#14532D', accent: '#22C55E' },
  Nutrition: { key: 'nutrition', bg: '#713F12', accent: '#F59E0B' },
  Mind: { key: 'mind', bg: '#312E81', accent: '#A78BFA' },
  Science: { key: 'science', bg: '#134E4A', accent: '#14B8A6' },
};

interface ArticleEntry {
  id: string;
  category: string;
  iconName: string;
  iconSet?: IconSet;
}

const ARTICLES: ArticleEntry[] = [
  { id: 'circadian-rhythm', category: 'Science', iconName: 'flask' },
  { id: 'testosterone-basics', category: 'Hormones', iconName: 'barbell' },
  { id: 'sleep-and-hormones', category: 'Sleep', iconName: 'moon' },
  { id: 'exercise-timing', category: 'Training', iconName: 'fitness' },
  { id: 'stress-cortisol', category: 'Mind', iconName: 'brain', iconSet: 'material' },
  { id: 'nutrition-testosterone', category: 'Nutrition', iconName: 'nutrition', iconSet: 'material' },
  { id: 'infradian-cycles', category: 'Science', iconName: 'analytics' },
  { id: 'seasonal-variations', category: 'Science', iconName: 'thermometer' },
  { id: 'nofap-science', category: 'Mind', iconName: 'flame' },
  { id: 'aging-testosterone', category: 'Hormones', iconName: 'hourglass-outline' },
];

export default function ArticleSuggestion() {
  const router = useRouter();
  const { t: tDash } = useTranslation('dashboard');
  const { t: tArticles, i18n } = useTranslation('articles');

  // Pick 4 articles based on day of year, rotating daily
  const dailyArticles = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    const shuffled = [...ARTICLES];
    // Simple seeded shuffle based on day
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = (dayOfYear * (i + 1) + 7) % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 4);
  }, []);

  const renderCard = ({ item }: { item: ArticleEntry }) => {
    const cat = CATEGORIES[item.category];
    const title = tArticles(`${item.id}.title`, {
      defaultValue: item.id.replace(/-/g, ' '),
    });
    // Estimate read time from article JSON (fallback 3 min)
    const readTime = tArticles(`${item.id}.read_time`, { defaultValue: '3' });

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: cat.bg }]}
        activeOpacity={0.8}
        onPress={() => router.push(`/(modals)/article/${item.id}` as any)}
      >
        <Text style={[styles.categoryLabel, { color: cat.accent }]}>
          {item.category.toUpperCase()}
        </Text>
        <View style={styles.iconWrap}>
          <Icon set={item.iconSet} name={item.iconName} size={36} color={cat.accent} />
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {title}
        </Text>
        <View style={[styles.readTimeBadge, { backgroundColor: `${cat.accent}20` }]}>
          <Text style={[styles.readTimeText, { color: cat.accent }]}>
            {readTime} {tDash('read_time_unit')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionTitle}>{tDash('learn')}</Text>
          <Text style={styles.sectionSubtitle}>{tDash('daily_articles')}</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.seeAll}>{tDash('see_all')}</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Scrollable Cards */}
      <FlatList
        data={dailyArticles}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: darkPalette.text,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: darkPalette.textTertiary,
    marginTop: 2,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: darkPalette.primary,
  },
  listContent: {
    paddingRight: 4,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    padding: 14,
    justifyContent: 'space-between',
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  iconWrap: {
    marginVertical: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 19,
    flex: 1,
    marginTop: 4,
  },
  readTimeBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
  },
  readTimeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
