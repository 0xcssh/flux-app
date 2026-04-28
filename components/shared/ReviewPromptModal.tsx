import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  requestNativeReview,
  recordPositiveResponse,
  recordNegativeResponse,
  recordDismissedResponse,
} from '@/lib/reviewPrompt';

interface ReviewPromptModalProps {
  visible: boolean;
  onClose: () => void;
}

type Step = 'feedback' | 'negative';

const SUPPORT_EMAIL = 'contact@meara.fr';

export default function ReviewPromptModal({ visible, onClose }: ReviewPromptModalProps) {
  const { t } = useTranslation('common');
  const [step, setStep] = useState<Step>('feedback');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setStep('feedback');
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const handlePositive = async () => {
    recordPositiveResponse();
    onClose();
    setTimeout(() => {
      requestNativeReview();
    }, 250);
  };

  const handleNegative = () => {
    setStep('negative');
  };

  const handleSendFeedback = async () => {
    recordNegativeResponse();
    const subject = encodeURIComponent('Flux feedback');
    const body = encodeURIComponent('Hi,\n\nMy feedback about Flux:\n\n');
    try {
      await Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`);
    } catch (e) {
      console.warn('[ReviewPrompt] openURL mailto error:', e);
    }
    onClose();
  };

  const handleDismiss = () => {
    recordDismissedResponse();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          {step === 'feedback' ? (
            <>
              <View style={styles.iconContainer}>
                <Ionicons name="sparkles" size={32} color="#3B82F6" />
              </View>
              <Text style={styles.title}>{t('review.feedback_title')}</Text>
              <Text style={styles.subtitle}>{t('review.feedback_subtitle')}</Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.choiceButton, styles.choiceButtonNegative]}
                  onPress={handleNegative}
                  activeOpacity={0.7}
                >
                  <Ionicons name="thumbs-down" size={22} color="#8B8BA3" />
                  <Text style={styles.choiceTextNegative}>{t('review.choice_negative')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.choiceButton, styles.choiceButtonPositive]}
                  onPress={handlePositive}
                  activeOpacity={0.7}
                >
                  <Ionicons name="thumbs-up" size={22} color="#FFFFFF" />
                  <Text style={styles.choiceTextPositive}>{t('review.choice_positive')}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={handleDismiss} activeOpacity={0.6}>
                <Text style={styles.skipText}>{t('review.skip')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.iconContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={32} color="#F59E0B" />
              </View>
              <Text style={styles.title}>{t('review.negative_title')}</Text>
              <Text style={styles.subtitle}>{t('review.negative_subtitle')}</Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSendFeedback}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>{t('review.send_feedback')}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleDismiss} activeOpacity={0.6}>
                <Text style={styles.skipText}>{t('review.skip')}</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
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
    paddingHorizontal: 28,
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
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#8B8BA3',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 12,
  },
  choiceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  choiceButtonNegative: {
    backgroundColor: '#252540',
    borderWidth: 1,
    borderColor: '#2A2A45',
  },
  choiceButtonPositive: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  choiceTextNegative: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B8BA3',
  },
  choiceTextPositive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0A0A0F',
  },
  skipText: {
    fontSize: 13,
    color: '#5A5A7A',
    fontWeight: '500',
    paddingVertical: 8,
  },
});
