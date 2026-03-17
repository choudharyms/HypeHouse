import React, { useRef } from 'react';
import { StyleSheet, View, Animated as RNAnimated, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '../../theme/tokens';

export const GlassCard = ({ children, style, onPress, noPadding = false }) => {
  const scaleAnim = useRef(new RNAnimated.Value(1)).current;

  const handlePressIn = () => {
    RNAnimated.spring(scaleAnim, {
      toValue: 0.96,
      damping: 18,
      stiffness: 220,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    RNAnimated.spring(scaleAnim, {
      toValue: 1,
      damping: 18,
      stiffness: 220,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  const content = (
    <View style={styles.cardWrapper}>
      <View style={[styles.card, !noPadding && styles.cardPadding, style]}>
        {children}
      </View>
      <LinearGradient
        colors={[colors.glassHighlight, 'transparent', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <RNAnimated.View style={{ transform: [{ scale: scaleAnim }] }}>
          {content}
        </RNAnimated.View>
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: radius.xxl,
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  card: {
    width: '100%',
  },
  cardPadding: {
    padding: spacing.xl,
  },
});
