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
  const { i18n } = useTranslation();
  const [article, setArticle] = useState<ArticleContent | null>(null);

  const lang = i18n.language === 'fr' ? 'fr' : 'en';

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
          <ActivityIndicator size="large" color="#3B82F6" />
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
        <FontAwesome name="times" size={20} color="#8B8BA3" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Category + Read time */}
        <View style={styles.metaRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{article.category}</Text>
          </View>
          <View style={styles.readTime}>
            <FontAwesome name="clock-o" size={12} color="#94A3B8" />
            <Text style={styles.readTimeText}>{article.read_time_min} min read</Text>
          </View>
        </View>

        <Text style={styles.title}>{title}</Text>

        {/* Body text - split by paragraphs */}
        {body.split('\n\n').map((paragraph, idx) => (
          <Text key={idx} style={styles.bodyText}>
            {paragraph}
          </Text>
        ))}

        <View style={styles.disclaimer}>
          <FontAwesome name="info-circle" size={14} color="#94A3B8" />
          <Text style={styles.disclaimerText}>
            This article is for informational purposes only and does not constitute medical advice.
          </Text>
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#252540',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: '#252540',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
    textTransform: 'capitalize',
  },
  readTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readTimeText: {
    fontSize: 12,
    color: '#5A5A7A',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 24,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  bodyText: {
    fontSize: 16,
    color: '#8B8BA3',
    lineHeight: 26,
    marginBottom: 16,
  },
  disclaimer: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginTop: 16,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#5A5A7A',
    lineHeight: 17,
  },
});
