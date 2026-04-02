import React from 'react';
import { Text, type TextStyle, type TextProps } from 'react-native';
import { Colors } from '@/lib/constants';

interface TypographyProps extends TextProps {
  color?: string;
  align?: TextStyle['textAlign'];
  children: React.ReactNode;
}

export function H1({ color = Colors.text, align, style, ...props }: TypographyProps) {
  return (
    <Text
      style={[{ fontSize: 34, lineHeight: 42, fontWeight: '700', color, textAlign: align }, style]}
      {...props}
    />
  );
}

export function H2({ color = Colors.text, align, style, ...props }: TypographyProps) {
  return (
    <Text
      style={[{ fontSize: 28, lineHeight: 36, fontWeight: '700', color, textAlign: align }, style]}
      {...props}
    />
  );
}

export function H3({ color = Colors.text, align, style, ...props }: TypographyProps) {
  return (
    <Text
      style={[{ fontSize: 22, lineHeight: 30, fontWeight: '600', color, textAlign: align }, style]}
      {...props}
    />
  );
}

export function Body({ color = Colors.text, align, style, ...props }: TypographyProps) {
  return (
    <Text
      style={[{ fontSize: 16, lineHeight: 24, fontWeight: '400', color, textAlign: align }, style]}
      {...props}
    />
  );
}

export function Caption({ color = Colors.textSecondary, align, style, ...props }: TypographyProps) {
  return (
    <Text
      style={[{ fontSize: 12, lineHeight: 16, fontWeight: '400', color, textAlign: align }, style]}
      {...props}
    />
  );
}

export function Label({ color = Colors.text, align, style, ...props }: TypographyProps) {
  return (
    <Text
      style={[{ fontSize: 14, lineHeight: 20, fontWeight: '500', color, textAlign: align }, style]}
      {...props}
    />
  );
}
