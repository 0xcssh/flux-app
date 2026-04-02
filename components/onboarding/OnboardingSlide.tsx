import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlideProps {
  title: string;
  description: string;
  image?: React.ReactNode;
  children?: React.ReactNode;
}

export default function OnboardingSlide({
  title,
  description,
  image,
  children,
}: OnboardingSlideProps) {
  return (
    <View style={styles.container}>
      {image && <View style={styles.imageContainer}>{image}</View>}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {children && <View style={styles.childrenContainer}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  imageContainer: {
    marginBottom: 40,
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: '#8B8BA3',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  childrenContainer: {
    width: '100%',
    marginTop: 16,
  },
});
