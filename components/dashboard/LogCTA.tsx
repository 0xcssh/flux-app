import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';

export default function LogCTA() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation('dashboard');

  return (
    <Pressable
      style={styles.container}
      onPress={() => navigation.navigate('MainTabs', { screen: 'Log' })}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="add-circle" size={40} color={darkPalette.primary} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{t('log_cta_title')}</Text>
        <Text style={styles.subtitle}>{t('log_cta_subtitle')}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={darkPalette.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: darkPalette.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: darkPalette.primary,
    gap: 14,
  },
  iconWrap: {
    // icon is self-sized
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: darkPalette.text,
  },
  subtitle: {
    fontSize: 13,
    color: darkPalette.textSecondary,
    marginTop: 2,
  },
});
