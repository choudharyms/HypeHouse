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
import { User, Mail, Lock, Check } from 'lucide-react-native';
import { colors, typography, spacing, radius } from '../../theme/tokens';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassInput } from '../../components/ui/GlassInput';
import { GlassButton } from '../../components/ui/GlassButton';
import * as auth from '../../lib/auth';
import { useAppContext } from '../../context/AppContext';

export const SignupScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { setUser } = useAppContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Password strength
  const getPasswordStrength = () => {
    if (!password) return 0;
    if (password.length < 6) return 1;
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return 3;
    return 2;
  };
  
  const strength = getPasswordStrength();
  
  const strengthWidth = useSharedValue(0);
  
  useEffect(() => {
    const targetWidth = strength === 0 ? 0 : (strength / 3) * 100;
    strengthWidth.value = withTiming(targetWidth, { duration: 300 });
  }, [strength]);

  const strengthStyle = useAnimatedStyle(() => ({
    width: `${strengthWidth.value}%`,
    backgroundColor: strength === 1 ? colors.red : (strength === 2 ? colors.amber : colors.green),
  }));

  // Orb animations (same as Login)
  const orb1TranslateY = useSharedValue(0);
  const orb2TranslateY = useSharedValue(0);

  useEffect(() => {
    orb1TranslateY.value = withRepeat(
      withTiming(-40, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    orb2TranslateY.value = withRepeat(
      withTiming(40, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const orb1Style = useAnimatedStyle(() => ({ transform: [{ translateY: orb1TranslateY.value }] }));
  const orb2Style = useAnimatedStyle(() => ({ transform: [{ translateY: orb2TranslateY.value }] }));

  const validate = () => {
    let newErrors = {};
    if (!name) newErrors.name = 'Full Name is required';
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!email.includes('@')) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await auth.signUpStudent({ name, email, password });
      const profile = await auth.getMyProfile();
      setUser(profile);
      navigation.replace('Main');
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert("Signup Failed", error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.orb, styles.orb1, orb1Style]} />
      <Animated.View style={[styles.orb, styles.orb2, orb2Style]} />

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.delay(100).duration(600)}>
            <GlassCard style={styles.formCard}>
              <View style={styles.header}>
                <Text style={[typography.displayM, { color: colors.textPrimary }]}>Create Account</Text>
                <Text style={[typography.bodyM, { color: colors.textSecondary, marginTop: spacing.sm }]}>
                  Join the HypeHouse community
                </Text>
              </View>

              <Animated.View entering={FadeInDown.delay(200).duration(600)}>
                <GlassInput
                  label="Full Name"
                  placeholder="e.g. Madhusudan Sharma"
                  value={name}
                  onChangeText={setName}
                  icon={User}
                  error={errors.name}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(300).duration(600)}>
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

              <Animated.View entering={FadeInDown.delay(400).duration(600)}>
                <View style={styles.passwordContainer}>
                  <GlassInput
                    label="Password"
                    placeholder="Create a strong password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    icon={Lock}
                    error={errors.password}
                    style={{ marginBottom: 0 }} 
                  />
                  {password.length > 0 && (
                    <View style={styles.strengthContainer}>
                      <View style={styles.strengthTrack}>
                        <Animated.View style={[styles.strengthFill, strengthStyle]} />
                      </View>
                      <Text style={[typography.label, { color: colors.textTertiary, marginTop: 4 }]}>
                        {strength === 1 ? 'Weak' : (strength === 2 ? 'Medium' : 'Strong')}
                      </Text>
                    </View>
                  )}
                </View>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(500).duration(600)}>
                <View style={styles.termsContainer}>
                  <Pressable 
                    style={styles.checkboxRow}
                    onPress={() => {
                      setAcceptedTerms(!acceptedTerms);
                      if (errors.terms) {
                        setErrors({...errors, terms: null});
                      }
                    }}
                  >
                    <View style={[styles.checkbox, acceptedTerms && styles.checkboxActive, errors.terms && styles.checkboxError]}>
                      {acceptedTerms && <Check size={14} color="#fff" strokeWidth={3} />}
                    </View>
                    <Text style={[typography.bodyS, { color: colors.textSecondary, flex: 1 }]}>
                      I agree to the <Text style={{ color: colors.primary }}>Terms of Service</Text> and <Text style={{ color: colors.primary }}>Privacy Policy</Text>
                    </Text>
                  </Pressable>
                  {errors.terms && <Text style={[typography.label, { color: colors.red, marginLeft: 28, marginTop: 4 }]}>{errors.terms}</Text>}
                </View>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(600).duration(600)}>
                <GlassButton
                  label="Create Account"
                  onPress={handleSignup}
                  fullWidth
                  loading={loading}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(700).duration(600)} style={styles.signinRow}>
                <Text style={[typography.bodyM, { color: colors.textSecondary }]}>
                  Already have an account?{' '}
                </Text>
                <Pressable onPress={() => navigation.navigate('Login')}>
                  <Text style={[typography.bodyM, { color: colors.primary, fontWeight: '700' }]}>
                    Sign In
                  </Text>
                </Pressable>
              </Animated.View>

            </GlassCard>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  orb: { position: 'absolute', borderRadius: 999, filter: 'blur(60px)' },
  orb1: { width: 300, height: 300, backgroundColor: 'rgba(37, 99, 235, 0.2)', top: -50, right: -100 },
  orb2: { width: 250, height: 250, backgroundColor: 'rgba(16, 185, 129, 0.15)', bottom: -50, left: -100 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  formCard: { padding: 28 }, 
  header: { marginBottom: spacing.xl },
  passwordContainer: { marginBottom: spacing.base },
  strengthContainer: { marginTop: spacing.xs, paddingHorizontal: spacing.sm },
  strengthTrack: { height: 4, backgroundColor: colors.glassBorder, borderRadius: 2, overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: 2 },
  termsContainer: { marginBottom: spacing.xl },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start' },
  checkbox: { 
    width: 20, height: 20, 
    borderRadius: 6, 
    borderWidth: 1, 
    borderColor: colors.glassBorder, 
    backgroundColor: colors.glassBg,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2
  },
  checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxError: { borderColor: colors.red },
  signinRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.xxl },
});
