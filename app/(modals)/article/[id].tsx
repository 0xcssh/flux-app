import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';

interface ArticleContent {
  id: string;
  title_en: string;
  title_fr: string;
  summary_en: string;
  summary_fr: string;
  body_en: string;
  body_fr: string;
  category: string;
  read_time_min: number;
}

interface CategoryStyle {
  bg: string;
  accent: string;
  label: string;
  emoji: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  'circadian-rhythm': { bg: '#134E4A', accent: '#14B8A6', label: 'SCIENCE', emoji: '🔬' },
  'testosterone-basics': { bg: '#1E3A5F', accent: '#3B82F6', label: 'HORMONES', emoji: '💪' },
  'sleep-and-hormones': { bg: '#1E1B4B', accent: '#6366F1', label: 'SLEEP', emoji: '😴' },
  'exercise-timing': { bg: '#14532D', accent: '#22C55E', label: 'TRAINING', emoji: '🏋️' },
  'stress-cortisol': { bg: '#312E81', accent: '#A78BFA', label: 'MIND', emoji: '🧠' },
  'nutrition-testosterone': { bg: '#713F12', accent: '#F59E0B', label: 'NUTRITION', emoji: '🥩' },
  'infradian-cycles': { bg: '#134E4A', accent: '#14B8A6', label: 'SCIENCE', emoji: '📊' },
  'seasonal-variations': { bg: '#134E4A', accent: '#14B8A6', label: 'SCIENCE', emoji: '🌡️' },
  'nofap-science': { bg: '#312E81', accent: '#A78BFA', label: 'MIND', emoji: '🔥' },
  'aging-testosterone': { bg: '#1E3A5F', accent: '#3B82F6', label: 'HORMONES', emoji: '⏳' },
};

const DEFAULT_STYLE: CategoryStyle = {
  bg: '#1E3A5F',
  accent: '#3B82F6',
  label: 'ARTICLE',
  emoji: '📖',
};

// Static map of article content
const ARTICLES: Record<string, () => ArticleContent> = {
  'circadian-rhythm': () => require('@/content/articles/circadian-rhythm.json'),
  'testosterone-basics': () => require('@/content/articles/testosterone-basics.json'),
  'sleep-and-hormones': () => require('@/content/articles/sleep-and-hormones.json'),
  'exercise-timing': () => require('@/content/articles/exercise-timing.json'),
  'stress-cortisol': () => require('@/content/articles/stress-cortisol.json'),
  'nutrition-testosterone': () => require('@/content/articles/nutrition-testosterone.json'),
  'infradian-cycles': () => require('@/content/articles/infradian-cycles.json'),
  'seasonal-variations': () => require('@/content/articles/seasonal-variations.json'),
  'nofap-science': () => require('@/content/articles/nofap-science.json'),
  'aging-testosterone': () => require('@/content/articles/aging-testosterone.json'),
};

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, i18n } = useTranslation('dashboard');
  const [article, setArticle] = useState<ArticleContent | null>(null);

  const lang = i18n.language === 'fr' ? 'fr' : 'en';
  const catStyle = (id ? CATEGORY_STYLES[id] : null) ?? DEFAULT_STYLE;

  useEffect(() => {
    if (id && ARTICLES[id]) {
      try {
        setArticle(ARTICLES[id]());
      } catch (error) {
        console.error('[Article] Load error:', error);
      }
    }
  }, [id]);

  if (!article) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={darkPalette.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const title = lang === 'fr' ? article.title_fr : article.title_en;
  const body = lang === 'fr' ? article.body_fr : article.body_en;

  return (
    <SafeAreaView style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <FontAwesome name="times" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Area */}
        <View style={[styles.heroArea, { backgroundColor: catStyle.bg }]}>
          <Text style={styles.heroEmoji}>{catStyle.emoji}</Text>
          <View style={[styles.heroCategoryBadge, { backgroundColor: `${catStyle.accent}25` }]}>
            <Text style={[styles.heroCategoryText, { color: catStyle.accent }]}>
              {catStyle.label}
            </Text>
          </View>
        </View>

        {/* Content area */}
        <View style={styles.contentArea}>
          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Meta badges row */}
          <View style={styles.metaRow}>
            <View style={[styles.badge, { backgroundColor: `${catStyle.accent}18` }]}>
              <FontAwesome name="clock-o" size={11} color={catStyle.accent} />
              <Text style={[styles.badgeText, { color: catStyle.accent }]}>
                {article.read_time_min} {t('read_time_unit')}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: 'rgba(34, 197, 94, 0.12)' }]}>
              <FontAwesome name="check-circle" size={11} color={darkPalette.secondary} />
              <Text style={[styles.badgeText, { color: darkPalette.secondary }]}>
                {t('science_backed')}
              </Text>
            </View>
          </View>

          {/* Body text - split by paragraphs */}
          {body.split('\n\n').map((paragraph, idx) => (
            <Text key={idx} style={styles.bodyText}>
              {paragraph}
            </Text>
          ))}

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <FontAwesome name="info-circle" size={14} color={darkPalette.textTertiary} />
            <Text style={styles.disclaimerText}>
              {lang === 'fr'
                ? "Cet article est fourni à titre informatif uniquement et ne constitue pas un avis médical."
                : "This article is for informational purposes only and does not constitute medical advice."}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkPalette.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Hero area
  heroArea: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 40,
  },
  heroEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  heroCategoryBadge: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  heroCategoryText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  // Content
  contentArea: {
    padding: 24,
    paddingTop: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bodyText: {
    fontSize: 17,
    color: darkPalette.textSecondary,
    lineHeight: 28,
    marginBottom: 18,
    letterSpacing: 0.1,
  },
  disclaimer: {
    flexDirection: 'row',
    backgroundColor: darkPalette.surface,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginTop: 16,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: darkPalette.textTertiary,
    lineHeight: 18,
  },
});
