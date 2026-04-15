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
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { H1, Body, Caption } from '@/components/ui/Typography';
import { Colors } from '@/lib/constants';
import '@/i18n';

export default function LoginScreen() {
  const { t } = useTranslation('common');
  const navigation = useNavigation<any>();
  const { signIn, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    clearError();
    if (!email.trim()) {
      Alert.alert(t('errors.generic'), t('errors.invalid_email'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('errors.generic'), t('errors.password_short'));
      return;
    }
    try {
      await signIn(email.trim(), password);
      try {
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      } catch (e) {
        console.error('[Navigation] Reset failed:', e);
        Alert.alert('Navigation Error', 'Please restart the app.');
      }
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
            {t('auth.welcome_back')}
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
              autoComplete="password"
            />
          </View>

          <TouchableOpacity style={styles.forgotLink} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotText}>{t('auth.forgot_password')}</Text>
          </TouchableOpacity>

          <Button
            title={t('auth.login')}
            onPress={handleLogin}
            loading={isLoading}
            size="lg"
            style={styles.submitButton}
          />
        </View>

        <View style={styles.footer}>
          <Body color={Colors.textSecondary} align="center">
            {t('auth.no_account')}{' '}
          </Body>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.link}>{t('auth.signup')}</Text>
          </TouchableOpacity>
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
  forgotLink: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
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
