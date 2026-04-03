import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { darkPalette } from '@/theme/colors';
import ShareCard, { ShareCardProps } from './ShareCard';

export type ShareButtonProps = ShareCardProps;

export default function ShareButton({
  score,
  date,
  streakDays,
  phase,
}: ShareButtonProps) {
  const cardRef = useRef<View>(null);
  const [loading, setLoading] = useState(false);

  const handleShare = useCallback(async () => {
    if (loading || !cardRef.current) return;
    setLoading(true);
    try {
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your Flux score',
      });
    } catch {
      // User cancelled or sharing unavailable — silently ignore
    } finally {
      setLoading(false);
    }
  }, [loading, score, date, streakDays, phase]);

  return (
    <>
      {/* Hidden card for capture */}
      <View
        style={styles.hiddenContainer}
        pointerEvents="none"
      >
        <ShareCard
          ref={cardRef}
          score={score}
          date={date}
          streakDays={streakDays}
          phase={phase}
        />
      </View>

      {/* Visible button */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleShare}
        disabled={loading}
        hitSlop={8}
      >
        {loading ? (
          <ActivityIndicator size="small" color={darkPalette.textSecondary} />
        ) : (
          <Ionicons
            name="share-outline"
            size={20}
            color={darkPalette.textSecondary}
          />
        )}
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  hiddenContainer: {
    position: 'absolute',
    opacity: 0,
    // Move off-screen to avoid layout interference
    left: -9999,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: darkPalette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
  },
  buttonPressed: {
    opacity: 0.6,
  },
});
