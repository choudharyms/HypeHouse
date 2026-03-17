import React from 'react';
import { Pressable, Animated } from 'react-native';

const SPRING_CONFIG = { damping: 18, stiffness: 220, mass: 0.8, useNativeDriver: true };

/**
 * PressableScale — wraps any child with a spring scale-down on press.
 */
export const PressableScale = ({ children, style, onPress, onLongPress, disabled }) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, ...SPRING_CONFIG }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, ...SPRING_CONFIG }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};
