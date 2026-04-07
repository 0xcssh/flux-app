import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DownsellModalProps {
  visible: boolean;
  billingCycle: 'monthly' | 'annual';
  onClaim: () => void;
  onDismiss: () => void;
}

export default function DownsellModal({
  visible,
  billingCycle,
  onClaim,
  onDismiss,
}: DownsellModalProps) {
  const isAnnual = billingCycle === 'annual';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.iconContainer}>
            <Ionicons name="gift-outline" size={32} color="#F59E0B" />
          </View>
          <Text style={styles.title}>Wait!</Text>
          <Text style={styles.subtitle}>Special offer — just for you</Text>

          {/* Offer */}
          <View style={styles.offerContainer}>
            <Text style={styles.offerText}>Get Premium for 40% less</Text>
            <Text style={styles.originalPrice}>
              {isAnnual ? '$119.99/year' : '$19.99/month'}
            </Text>
            <Text style={styles.discountPrice}>
              {isAnnual ? '$99.99/year' : '$14.99/month'}
            </Text>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={styles.claimButton}
            onPress={onClaim}
            activeOpacity={0.8}
          >
            <Text style={styles.claimButtonText}>Claim My Discount</Text>
          </TouchableOpacity>

          {/* Skip */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={onDismiss}
            activeOpacity={0.6}
          >
            <Text style={styles.skipText}>No thanks</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A45',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F59E0B',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#8B8BA3',
    marginBottom: 24,
  },
  offerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  offerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  originalPrice: {
    fontSize: 14,
    color: '#5A5A7A',
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  discountPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  claimButton: {
    width: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  claimButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0A0A0F',
  },
  skipButton: {
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    color: '#5A5A7A',
    fontWeight: '500',
  },
});
