import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';
import type { InsightTier } from '@/types/insight';

const TIERS: InsightTier[] = ['universal', 'early', 'weekly', 'deep'];

interface TierProgressProps {
  currentTier: InsightTier;
}

export default function TierProgress({ currentTier }: TierProgressProps) {
  const { t } = useTranslation('insights');
  const currentIdx = TIERS.indexOf(currentTier);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {TIERS.map((tier, idx) => {
          const isActive = idx <= currentIdx;
          const isLast = idx === TIERS.length - 1;

          return (
            <React.Fragment key={tier}>
              <View style={styles.step}>
                <View
                  style={[
                    styles.circle,
                    isActive ? styles.circleActive : styles.circleInactive,
                  ]}
                />
                <Text
                  style={[
                    styles.label,
                    isActive ? styles.labelActive : styles.labelInactive,
                  ]}
                >
                  {t(`tier.${tier}`)}
                </Text>
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.line,
                    idx < currentIdx ? styles.lineActive : styles.lineInactive,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: darkPalette.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: {
    alignItems: 'center',
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  circleActive: {
    backgroundColor: darkPalette.primary,
  },
  circleInactive: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: darkPalette.border,
  },
  line: {
    height: 2,
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 18, // offset for label below circle
  },
  lineActive: {
    backgroundColor: darkPalette.primary,
  },
  lineInactive: {
    backgroundColor: darkPalette.border,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  labelActive: {
    color: darkPalette.primary,
  },
  labelInactive: {
    color: darkPalette.textTertiary,
  },
});
