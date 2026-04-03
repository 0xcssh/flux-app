import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface NoFapCheckboxProps {
  checked: boolean;
  onToggle: () => void;
}

export default function NoFapCheckbox({ checked, onToggle }: NoFapCheckboxProps) {
  const { t } = useTranslation('log');

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Ionicons
          name="shield-checkmark"
          size={20}
          color={checked ? '#22C55E' : '#5A5A7A'}
        />
        <Text style={[styles.label, checked && styles.labelActive]}>
          {t('nofap_label')}
        </Text>
      </View>
      <Switch
        value={checked}
        onValueChange={onToggle}
        trackColor={{ false: '#2A2A45', true: '#22C55E40' }}
        thumbColor={checked ? '#22C55E' : '#5A5A7A'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#252540',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#8B8BA3',
    fontWeight: '500',
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
