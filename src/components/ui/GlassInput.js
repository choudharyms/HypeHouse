import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  Animated as RNAnimated, 
  Text,
  Pressable
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';

export const GlassInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  icon: Icon,
  error,
  keyboardType = 'default',
  style
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureVisible, setIsSecureVisible] = useState(false);
  
  const focusAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? colors.redBorder : colors.glassBorder, 
      error ? colors.red : colors.primary
    ],
  });

  const shadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  const isActuallySecure = secureTextEntry && !isSecureVisible;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[typography.labelBold, styles.label, error && styles.labelError]}>
          {label}
        </Text>
      )}
      
      <RNAnimated.View style={[
        styles.inputContainer,
        { 
          borderColor,
          shadowColor: error ? colors.red : colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity,
          shadowRadius: 12,
          elevation: isFocused ? 4 : 0,
        }
      ]}>
        {Icon && (
          <View style={styles.iconContainer}>
            <Icon 
              size={20} 
              color={isFocused ? colors.primary : colors.textTertiary} 
              strokeWidth={2}
            />
          </View>
        )}
        
        <TextInput
          style={[
            styles.input,
            typography.bodyM,
            Icon && styles.inputWithIcon,
            secureTextEntry && styles.inputWithSecureIcon
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={isActuallySecure}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          selectionColor={colors.primary}
        />
        
        {secureTextEntry && (
          <Pressable 
            style={styles.secureToggle}
            onPress={() => setIsSecureVisible(!isSecureVisible)}
            hitSlop={8}
          >
            {isSecureVisible ? (
              <EyeOff size={20} color={colors.textTertiary} />
            ) : (
              <Eye size={20} color={colors.textTertiary} />
            )}
          </Pressable>
        )}
      </RNAnimated.View>

      {error && (
        <Text style={[typography.label, styles.errorText]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.base,
  },
  label: {
    color: colors.textSecondary,
    marginBottom: spacing.xs + 2,
    marginLeft: spacing.sm,
  },
  labelError: {
    color: colors.red,
  },
  inputContainer: {
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.textPrimary,
    paddingHorizontal: spacing.base,
  },
  inputWithIcon: {
    paddingLeft: spacing.xs,
  },
  inputWithSecureIcon: {
    paddingRight: 48,
  },
  iconContainer: {
    paddingLeft: spacing.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secureToggle: {
    position: 'absolute',
    right: spacing.base,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.red,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
});
