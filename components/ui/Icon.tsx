import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export type IconSet = 'ionicons' | 'material';

export interface IconProps {
  set?: IconSet;
  name: string;
  size?: number;
  color?: string;
}

export default function Icon({ set = 'ionicons', name, size = 20, color = '#FFFFFF' }: IconProps) {
  if (set === 'material') {
    return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
  }
  return <Ionicons name={name as any} size={size} color={color} />;
}
