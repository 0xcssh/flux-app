import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { H2, Caption } from '@/components/ui/Typography';
import { Colors } from '@/lib/constants';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <H2 color={Colors.primary} align="center">
        Flux
      </H2>
      <ActivityIndicator
        size="large"
        color={Colors.primary}
        style={styles.indicator}
      />
      {message && (
        <Caption align="center" style={styles.message}>
          {message}
        </Caption>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  indicator: {
    marginTop: 16,
  },
  message: {
    marginTop: 12,
  },
});
