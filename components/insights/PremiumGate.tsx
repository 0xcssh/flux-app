import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSubscription } from '@/hooks/useSubscription';
import PaywallOverlay from '@/components/shared/PaywallOverlay';
import { useNavigation } from '@react-navigation/native';

interface PremiumGateProps {
  children: React.ReactNode;
  feature: string;
}

export default function PremiumGate({ children, feature }: PremiumGateProps) {
  const { canAccess } = useSubscription();
  const navigation = useNavigation<any>();

  const hasAccess = canAccess(feature as any);

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        {children}
      </View>
      <PaywallOverlay
        feature={feature}
        onUpgrade={() => navigation.navigate('Paywall')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  contentWrapper: {
    opacity: 0.3,
  },
});
