import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';

const ARTICLE_IDS = [
  'circadian-rhythm', 'testosterone-basics', 'sleep-and-hormones',
  'exercise-timing', 'stress-cortisol', 'nutrition-testosterone',
  'infradian-cycles', 'seasonal-variations', 'nofap-science', 'aging-testosterone',
];

export default function ArticleSuggestion() {
  const router = useRouter();
  const { t, i18n } = useTranslation('articles');
  const lang = i18n.language === 'fr' ? 'fr' : 'en';

  const article = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return ARTICLE_IDS[dayOfYear % ARTICLE_IDS.length];
  }, []);

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={() => router.push(`/(modals)/article/${article}` as any)}
    >
      <View style={styles.iconWrap}>
        <FontAwesome name="book" size={18} color={darkPalette.primary} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.label}>DAILY READ</Text>
        <Text style={styles.title} numberOfLines={1}>
          {t(`${article}.title`, { defaultValue: article.replace(/-/g, ' ') })}
        </Text>
      </View>
      <FontAwesome name="chevron-right" size={14} color={darkPalette.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkPalette.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: darkPalette.border,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: { flex: 1 },
  label: { fontSize: 9, fontWeight: '700', color: darkPalette.primary, letterSpacing: 1, marginBottom: 2 },
  title: { fontSize: 14, fontWeight: '600', color: darkPalette.text },
});
