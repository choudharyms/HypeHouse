import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Pressable,
  Alert,
  Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeInDown, 
  useSharedValue, 
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS
} from 'react-native-reanimated';
import { User, Mail, Phone, GraduationCap, ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { GlassInput } from '../../components/ui/GlassInput';
import { GlassButton } from '../../components/ui/GlassButton';
import { useAppContext } from '../../context/AppContext';

export const EditProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, setUser } = useAppContext();

  const [name, setName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [college, setCollege] = useState(user?.college || '');
  const [errors, setErrors] = useState({});

  const toastTranslateY = useSharedValue(-100);

  const toastStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: toastTranslateY.value }],
  }));

  const showToastAndGoBack = () => {
    // slide down
    toastTranslateY.value = withSpring(insets.top + spacing.xl, { damping: 18, stiffness: 220, mass: 0.8 });
    
    // stay for 2s, slide up
    toastTranslateY.value = withDelay(
      2000, 
      withTiming(-100, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(navigation.goBack)();
        }
      })
    );
  };

  const validate = () => {
    let newErrors = {};
    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    if (!phone) newErrors.phone = 'Phone is required';
    if (!college) newErrors.college = 'College is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      setUser({ ...user, full_name: name, email, phone, college });
      showToastAndGoBack();
    }
  };

  const handleChangePhoto = () => {
    Alert.alert("Notice", "Photo upload coming soon");
  };

  return (
    <View style={styles.container}>
      
      {/* Toast */}
      <Animated.View style={[styles.toast, toastStyle]}>
        <CheckCircle2 size={16} color={colors.green} />
        <Text style={[typography.labelBold, { color: colors.green, marginLeft: 8 }]}>Profile updated ✓</Text>
      </Animated.View>

      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.headingM, { color: colors.textPrimary }]}>Edit Profile</Text>
        <Pressable onPress={handleSave} style={styles.headerBtnRight}>
          <Text style={[typography.bodyM, { color: colors.primary, fontWeight: '700' }]}>Save</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          
          <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
              ) : (
                <View style={[styles.avatarImg, styles.avatarPlaceholder]}>
                  <Text style={[typography.displayL, { color: colors.primary }]}>{user?.full_name?.charAt(0) || 'U'}</Text>
                </View>
              )}
            </View>
            <Pressable onPress={handleChangePhoto}>
              <Text style={[typography.bodyM, { color: colors.primary, marginTop: spacing.md }]}>Change Photo</Text>
            </Pressable>
          </Animated.View>

          <View style={styles.formSection}>
            <Animated.View entering={FadeInDown.delay(200).duration(600)}>
              <GlassInput
                label="Full Name"
                placeholder="Name"
                value={name}
                onChangeText={setName}
                icon={User}
                error={errors.name}
              />
            </Animated.View>
            
            <Animated.View entering={FadeInDown.delay(300).duration(600)}>
              <GlassInput
                label="Email"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                icon={Mail}
                error={errors.email}
              />
            </Animated.View>
            
            <Animated.View entering={FadeInDown.delay(400).duration(600)}>
              <GlassInput
                label="Phone Number"
                placeholder="Phone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                icon={Phone}
                error={errors.phone}
              />
            </Animated.View>
            
            <Animated.View entering={FadeInDown.delay(500).duration(600)}>
              <GlassInput
                label="College Name"
                placeholder="College"
                value={college}
                onChangeText={setCollege}
                icon={GraduationCap}
                error={errors.college}
              />
            </Animated.View>
          </View>

          <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.actionSection}>
            <GlassButton
              label="Save Changes"
              onPress={handleSave}
              fullWidth
            />
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingBottom: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.glassBorder,
    backgroundColor: 'rgba(10,15,30,0.85)',
    zIndex: 10,
  },
  headerBtn: {
    width: 44, height: 44, borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  headerBtnRight: {
    width: 44, height: 44,
    alignItems: 'flex-end', justifyContent: 'center',
  },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: spacing.xl },
  avatarSection: { alignItems: 'center', paddingVertical: spacing.xxl },
  avatarWrap: { position: 'relative' },
  avatarImg: { 
    width: 100, height: 100, borderRadius: 50, 
    borderWidth: 2, borderColor: colors.primary,
  },
  avatarPlaceholder: { backgroundColor: colors.glassBg, alignItems: 'center', justifyContent: 'center' },
  formSection: { flex: 1 },
  actionSection: { marginTop: spacing.xxl },

  toast: {
    position: 'absolute', top: 0, left: 0, right: 0,
    marginHorizontal: spacing.xxl, zIndex: 100,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.greenBorder,
    borderRadius: radius.full, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.green, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
});
