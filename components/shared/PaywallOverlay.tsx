import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';

interface PaywallOverlayProps {
  feature?: string;
  onUpgrade: () => void;
}

export default function PaywallOverlay({ feature, onUpgrade }: PaywallOverlayProps) {
  const { t } = useTranslation('insights');

  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        <View style={styles.lockIcon}>
          <FontAwesome name="lock" size={28} color="#2563EB" />
        </View>
        <Text style={styles.title}>Premium Feature</Text>
        <Text style={styles.description}>{t('premium_gate')}</Text>
        <TouchableOpacity style={styles.button} onPress={onUpgrade} activeOpacity={0.8}>
          <FontAwesome name="star" size={16} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Unlock with Premium</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
    zIndex: 10,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  lockIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#252540',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#8B8BA3',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
