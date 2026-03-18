import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeInDown, 
  useSharedValue, 
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { Mail, Lock } from 'lucide-react-native';
import { colors, typography, spacing } from '../../theme/tokens';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassInput } from '../../components/ui/GlassInput';
import { GlassButton } from '../../components/ui/GlassButton';
import * as auth from '../../lib/auth';
import { useAppContext } from '../../context/AppContext';

export const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { setUser } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Orb animations
  const orb1TranslateY = useSharedValue(0);
  const orb2TranslateY = useSharedValue(0);

  useEffect(() => {
    orb1TranslateY.value = withRepeat(
      withTiming(40, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    orb2TranslateY.value = withRepeat(
      withTiming(-40, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const orb1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: orb1TranslateY.value }]
  }));
  const orb2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: orb2TranslateY.value }]
  }));

  const validate = () => {
    let newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!email.includes('@')) {
      newErrors.email = 'Enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      await auth.signIn({ email, password });
      const profile = await auth.getMyProfile();
      setUser(profile);
      navigation.replace('Main');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert("Login Failed", error.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert("Password Reset", "Reset link sent to your email");
  };

  return (
    <View style={styles.container}>
      {/* Animated Orbs */}
      <Animated.View style={[styles.orb, styles.orb1, orb1Style]} />
      <Animated.View style={[styles.orb, styles.orb2, orb2Style]} />

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.delay(100).duration(600)}>
            <GlassCard style={styles.formCard}>
              <View style={styles.header}>
                <Text style={[typography.displayM, { color: colors.textPrimary }]}>Welcome back</Text>
                <Text style={[typography.bodyM, { color: colors.textSecondary, marginTop: spacing.sm }]}>
                  Enter your details to sign in
                </Text>
              </View>

              <Animated.View entering={FadeInDown.delay(200).duration(600)}>
                <GlassInput
                  label="Email"
                  placeholder="name@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  icon={Mail}
                  error={errors.email}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(300).duration(600)}>
                <GlassInput
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  icon={Lock}
                  error={errors.password}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.forgotPasswordRow}>
                <Pressable onPress={handleForgotPassword}>
                  <Text style={[typography.bodyM, { color: colors.primary, fontWeight: '600' }]}>
                    Forgot Password?
                  </Text>
                </Pressable>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(500).duration(600)}>
                <GlassButton
                  label="Login"
                  onPress={handleLogin}
                  fullWidth
                  loading={loading}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(600).duration(600)}>
                <View style={styles.dividerRow}>
                  <View style={styles.divider} />
                  <Text style={[typography.label, { color: colors.textTertiary, marginHorizontal: spacing.md }]}>
                    OR
                  </Text>
                  <View style={styles.divider} />
                </View>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(700).duration(600)}>
                <GlassButton
                  label="Sign Up"
                  variant="ghost"
                  onPress={() => navigation.navigate('Signup')}
                  fullWidth
                />
              </Animated.View>

            </GlassCard>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    filter: 'blur(60px)',
  },
  orb1: {
    width: 300,
    height: 300,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    top: -50,
    left: -100,
  },
  orb2: {
    width: 250,
    height: 250,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    bottom: -50,
    right: -100,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  formCard: {
    padding: 28, 
  },
  header: {
    marginBottom: spacing.xxl,
  },
  forgotPasswordRow: {
    alignItems: 'flex-end',
    marginBottom: spacing.xxl,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
});
