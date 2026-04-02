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
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { H1, Body, Caption } from '@/components/ui/Typography';
import { Colors } from '@/lib/constants';
import '@/i18n';

export default function SignupScreen() {
  const { t } = useTranslation('common');
  const { signUp, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async () => {
    clearError();
    if (!email.trim()) {
      Alert.alert(t('errors.generic'), t('errors.invalid_email'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('errors.generic'), t('errors.password_short'));
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('errors.generic'), t('errors.passwords_mismatch'));
      return;
    }
    try {
      await signUp(email.trim(), password);
      router.replace('/(onboarding)/welcome');
    } catch {
      Alert.alert(t('errors.generic'), error ?? t('errors.generic'));
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
            {t('auth.create_account')}
          </Body>
        </View>

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

          <View style={styles.inputContainer}>
            <Caption style={styles.inputLabel}>{t('auth.password')}</Caption>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder={t('auth.password')}
              placeholderTextColor={Colors.textSecondary}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>

          <View style={styles.inputContainer}>
            <Caption style={styles.inputLabel}>{t('auth.confirm_password')}</Caption>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t('auth.confirm_password')}
              placeholderTextColor={Colors.textSecondary}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>

          <Button
            title={t('auth.signup')}
            onPress={handleSignup}
            loading={isLoading}
            size="lg"
            style={styles.submitButton}
          />
        </View>

        <View style={styles.footer}>
          <Body color={Colors.textSecondary} align="center">
            {t('auth.have_account')}{' '}
          </Body>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>{t('auth.login')}</Text>
            </TouchableOpacity>
          </Link>
        </View>
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  link: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
});
