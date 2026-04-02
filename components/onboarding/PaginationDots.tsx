import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface PaginationDotsProps {
  total: number;
  current: number;
}

function Dot({ isActive }: { isActive: boolean }) {
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const widthAnim = useRef(new Animated.Value(isActive ? 24 : 8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isActive ? 1 : 0,
        useNativeDriver: false,
        friction: 6,
      }),
      Animated.spring(widthAnim, {
        toValue: isActive ? 24 : 8,
        useNativeDriver: false,
        friction: 6,
      }),
    ]).start();
  }, [isActive]);

  const backgroundColor = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#5A5A7A', '#3B82F6'],
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: widthAnim,
          backgroundColor,
        },
      ]}
    />
  );
}

export default function PaginationDots({ total, current }: PaginationDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }, (_, index) => (
        <Dot key={index} isActive={index === current} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
