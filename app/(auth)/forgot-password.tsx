import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { H1, Body, Caption } from '@/components/ui/Typography';
import { Colors } from '@/lib/constants';
import '@/i18n';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation('common');
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert(t('errors.generic'), t('errors.invalid_email'));
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
      setSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('errors.generic');
      Alert.alert(t('errors.generic'), message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <H1 color={Colors.primary} align="center">
            Flux
          </H1>
          <Body color={Colors.textSecondary} align="center" style={styles.subtitle}>
            {t('auth.reset_password')}
          </Body>
        </View>

        {sent ? (
          <View style={styles.sentContainer}>
            <Body align="center" style={styles.sentMessage}>
              {t('auth.reset_sent')}
            </Body>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>{t('auth.login')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Caption style={styles.inputLabel}>{t('auth.email')}</Caption>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder={t('auth.email')}
                placeholderTextColor={Colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
            </View>

            <Button
              title={t('auth.reset_password')}
              onPress={handleReset}
              loading={isLoading}
              size="lg"
              style={styles.submitButton}
            />

            <TouchableOpacity style={styles.backLink} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>{t('buttons.back')} {t('auth.login')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 40,
  },
  subtitle: {
    marginTop: 8,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 4,
  },
  inputLabel: {
    marginLeft: 4,
    fontWeight: '500',
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
  },
  submitButton: {
    marginTop: 8,
  },
  backLink: {
    alignSelf: 'center',
    marginTop: 8,
  },
  link: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  sentContainer: {
    alignItems: 'center',
    gap: 24,
  },
  sentMessage: {
    paddingHorizontal: 16,
  },
  backButton: {
    marginTop: 8,
  },
});
