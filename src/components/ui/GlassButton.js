import React, { useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Pressable, 
  Animated as RNAnimated, 
  ActivityIndicator 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, typography } from '../../theme/tokens';

export const GlassButton = ({ 
  label, 
  onPress, 
  variant = 'primary', 
  icon: Icon, 
  loading = false, 
  disabled = false, 
  fullWidth = false, 
  size = 'md' 
}) => {
  const scaleAnim = useRef(new RNAnimated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    RNAnimated.spring(scaleAnim, {
      toValue: 0.96,
      damping: 18,
      stiffness: 220,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    RNAnimated.spring(scaleAnim, {
      toValue: 1,
      damping: 18,
      stiffness: 220,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          wrapper: styles.primaryWrapper,
          text: styles.primaryText,
          gradient: ['#2563EB', '#1D4ED8'],
          glow: true,
        };
      case 'ghost':
        return {
          wrapper: styles.ghostWrapper,
          text: styles.ghostText,
          gradient: [colors.glassBg, colors.glassBg],
          glow: false,
        };
      case 'destructive':
        return {
          wrapper: styles.destructiveWrapper,
          text: styles.destructiveText,
          gradient: [colors.redDim, colors.redDim],
          glow: false,
        };
      default:
        return {
          wrapper: styles.primaryWrapper,
          text: styles.primaryText,
          gradient: ['#2563EB', '#1D4ED8'],
          glow: true,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 10, paddingHorizontal: 16, fontSize: 13 };
      case 'lg':
        return { paddingVertical: 18, paddingHorizontal: 28, fontSize: 16 };
      case 'md':
      default:
        return { paddingVertical: 14, paddingHorizontal: 24, fontSize: 15 };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();
  
  const content = (
    <LinearGradient
      colors={vStyles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.base,
        vStyles.wrapper,
        { paddingVertical: sStyles.paddingVertical, paddingHorizontal: sStyles.paddingHorizontal },
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {vStyles.glow && <View style={styles.primaryGlow} />}
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : (variant === 'destructive' ? colors.red : colors.textPrimary)} />
      ) : (
        <View style={styles.contentRow}>
          {Icon && <Icon size={18} color={vStyles.text.color} style={styles.icon} strokeWidth={2} />}
          <Text style={[styles.text, typography.bodyM, { fontWeight: '700' }, vStyles.text, { fontSize: sStyles.fontSize }]}>
            {label}
          </Text>
        </View>
      )}
    </LinearGradient>
  );

  return (
    <View style={[fullWidth && { width: '100%' }, (disabled || loading) && { opacity: 0.6 }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
      >
        <RNAnimated.View style={{ transform: [{ scale: scaleAnim }] }}>
          {content}
        </RNAnimated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    letterSpacing: 0.2,
  },
  // Primary
  primaryWrapper: {
    borderWidth: 0,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  primaryGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  // Ghost
  ghostWrapper: {
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  ghostText: {
    color: colors.textPrimary,
  },
  // Destructive
  destructiveWrapper: {
    borderWidth: 1,
    borderColor: colors.redBorder,
  },
  destructiveText: {
    color: colors.red,
  },
});
