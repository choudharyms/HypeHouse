import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  Pressable,
  Alert,
  Linking,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { Settings, Pencil, CreditCard, Bell, HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAppContext } from '../../context/AppContext';

export const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, bookings, pgs, savedPGIds, isLoading } = useAppContext();

  // Avatar back lights
  const orb1Scale = useSharedValue(1);
  const orb2Scale = useSharedValue(1);

  useEffect(() => {
    orb1Scale.value = withRepeat(
      withTiming(1.2, { duration: 3000, easing: Easing.inOut(Easing.ease) }), -1, true
    );
    orb2Scale.value = withRepeat(
      withTiming(1.3, { duration: 4000, easing: Easing.inOut(Easing.ease) }), -1, true
    );
  }, []);

  const orb1Style = useAnimatedStyle(() => ({ transform: [{ scale: orb1Scale.value }] }));
  const orb2Style = useAnimatedStyle(() => ({ transform: [{ scale: orb2Scale.value }] }));

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Auth' }] }) }
    ]);
  };

  const handleAlert = (title) => Alert.alert(title, `${title} coming soon`);
  const handleSupport = () => Linking.openURL('mailto:support@hypehouse.com');

  const MENU_ITEMS = [
    { icon: Pencil, label: 'Edit Profile', action: () => navigation.navigate('EditProfile') },
    { icon: CreditCard, label: 'Payment Methods', action: () => handleAlert('Payment Methods') },
    { icon: Bell, label: 'Notifications', action: () => handleAlert('Notifications') },
    { icon: HelpCircle, label: 'Help & Support', action: handleSupport },
    { icon: LogOut, label: 'Logout', action: handleLogout, color: colors.red },
  ];

  // Handle Loading
  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Handle Guest / Not Logged In
  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={{ width: 44 }} /> 
          <Text style={[typography.headingM, { color: colors.textPrimary }]}>My Profile</Text>
          <View style={{ width: 44 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <GlassCard style={styles.profileCard}>
            <View style={styles.avatarSection}>
               <View style={[styles.avatarImg, styles.avatarPlaceholder]}>
                 <Text style={[typography.displayL, { color: colors.primary }]}>?</Text>
               </View>
               <Text style={[typography.headingL, { color: colors.textPrimary, marginTop: spacing.md }]}>Not Logged In</Text>
               <Text style={[typography.bodyM, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs }]}>
                 Please log in to manage your bookings and saved properties.
               </Text>
            </View>
            <Pressable 
              onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Auth' }] })}
              style={({ pressed }) => [
                styles.loginBtn,
                pressed && { opacity: 0.8 }
              ]}
            >
              <Text style={styles.loginBtnText}>Log In / Sign Up</Text>
            </Pressable>
          </GlassCard>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={{ width: 44 }} /> 
        <Text style={[typography.headingM, { color: colors.textPrimary }]}>My Profile</Text>
        <Pressable onPress={() => handleAlert('Settings')} style={styles.headerBtn}>
          <Settings size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, spacing.base) + 100 }]} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.section}>
          <GlassCard style={styles.profileCard}>
            <Animated.View style={[styles.cardOrb, { backgroundColor: 'rgba(37,99,235,0.2)', top: -20, left: -20 }, orb1Style]} />
            <Animated.View style={[styles.cardOrb, { backgroundColor: 'rgba(16,185,129,0.15)', bottom: -40, right: -20 }, orb2Style]} />

            <View style={styles.avatarSection}>
              <View style={styles.avatarWrap}>
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
                ) : (
                  <View style={[styles.avatarImg, styles.avatarPlaceholder]}>
                    <Text style={[typography.displayL, { color: colors.primary }]}>{user?.full_name?.charAt(0) || 'U'}</Text>
                  </View>
                )}
                <Pressable onPress={() => navigation.navigate('EditProfile')} style={styles.avatarEditBtn}>
                  <Pencil size={12} color="#fff" />
                </Pressable>
              </View>

              <Text style={[typography.headingL, { color: colors.textPrimary, marginTop: spacing.md }]}>{user?.full_name}</Text>
              <Text style={[typography.bodyM, { color: colors.textSecondary }]}>{user?.phone}</Text>
              <View style={styles.collegePill}>
                <Text style={[typography.labelBold, { color: colors.primary }]}>{user.college}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={[typography.headingM, { color: colors.textPrimary }]}>{(bookings || []).length}</Text>
                <Text style={[typography.label, { color: colors.textSecondary }]}>Bookings</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[typography.headingM, { color: colors.textPrimary }]}>{savedPGIds?.length || 0}</Text>
                <Text style={[typography.label, { color: colors.textSecondary }]}>Saved</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[typography.headingM, { color: colors.textPrimary }]}>2024</Text>
                <Text style={[typography.label, { color: colors.textSecondary }]}>Member since</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.section}>
          <Text style={[typography.headingM, { color: colors.textPrimary, marginBottom: spacing.md }]}>Preferences</Text>
          
          <GlassCard noPadding style={{ overflow: 'hidden' }}>
            {MENU_ITEMS.map((item, i) => (
              <Pressable 
                key={i} 
                style={[styles.menuRow, i < MENU_ITEMS.length - 1 && styles.menuDivider]}
                onPress={item.action}
              >
                <View style={styles.menuIconBox}>
                  <item.icon size={20} color={item.color || colors.primary} />
                </View>
                <Text style={[typography.bodyM, { color: item.color || colors.textPrimary, flex: 1, fontWeight: '600' }]}>
                  {item.label}
                </Text>
                <ChevronRight size={20} color={colors.textTertiary} />
              </Pressable>
            ))}
          </GlassCard>
        </Animated.View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.sm,
  },
  headerBtn: {
    width: 44, height: 44, borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  scrollContent: { padding: spacing.xl },
  section: { marginBottom: spacing.xl },
  profileCard: { padding: spacing.xl, overflow: 'hidden' },
  cardOrb: { position: 'absolute', width: 150, height: 150, borderRadius: 75, filter: 'blur(30px)' },
  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatarWrap: { position: 'relative' },
  avatarImg: { 
    width: 80, height: 80, borderRadius: 40, 
    borderWidth: 2, borderColor: colors.primary,
  },
  avatarPlaceholder: { backgroundColor: colors.glassBg, alignItems: 'center', justifyContent: 'center' },
  avatarEditBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  collegePill: {
    marginTop: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: radius.full, backgroundColor: colors.primaryDim,
  },
  statsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: radius.lg, paddingVertical: spacing.md, 
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: '100%', backgroundColor: colors.divider },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', height: 56,
    paddingHorizontal: spacing.lg,
  },
  menuDivider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  menuIconBox: {
    width: 36, height: 36, borderRadius: radius.md,
    backgroundColor: colors.glassHighlight, alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
