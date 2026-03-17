import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn, Easing, withDelay } from 'react-native-reanimated';
import { Building2, Star, ShieldCheck } from 'lucide-react-native';
import { colors, typography, spacing, radius } from '../../theme/tokens';
import { GlassButton } from '../../components/ui/GlassButton';

const { height: H } = Dimensions.get('window');

const AnimatedWord = ({ word, index }) => {
  return (
    <Animated.Text
      entering={FadeInDown.delay(300 + index * 60).duration(500).easing(Easing.out(Easing.back(1.5)))}
      style={[typography.displayM, styles.headlineWord]}
    >
      {word}{' '}
    </Animated.Text>
  );
};

export const LandingScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const headline = ['Find', 'your', 'perfect', 'student', 'PG.'];
  
  const stats = [
    { icon: Building2, label: '10k+ PGs' },
    { icon: Star, label: '4.8 Rating' },
    { icon: ShieldCheck, label: 'Verified' },
  ];

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80' }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      
      {/* Gradient overlay bottom 60% */}
      <LinearGradient
        colors={['transparent', 'rgba(10, 15, 30, 0.8)', colors.bg]}
        locations={[0, 0.4, 1]}
        style={[StyleSheet.absoluteFill, { top: H * 0.4 }]}
      />

      <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, spacing.xl), paddingTop: insets.top + spacing.xl }]}>
        
        {/* Top Section */}
        <Animated.View entering={FadeIn.delay(100).duration(800)} style={styles.topSection}>
          <View style={styles.logoRow}>
            <View style={styles.logoBadge}>
              <Building2 size={24} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={[typography.headingL, { color: colors.textPrimary }]}>MyCampusPG</Text>
          </View>
          <Text style={[typography.bodyM, styles.tagline]}>Verified student accommodations close to your campus.</Text>
          
          <View style={styles.statsRow}>
            {stats.map((stat, i) => (
              <React.Fragment key={i}>
                {i > 0 && <View style={styles.statDivider} />}
                <View style={styles.statItem}>
                  <stat.icon size={16} color={colors.primary} strokeWidth={2} />
                  <Text style={[typography.labelBold, { color: colors.textPrimary }]}>{stat.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </Animated.View>

        <View style={styles.spacer} />

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <View style={styles.headlineRow}>
            {headline.map((word, index) => (
              <AnimatedWord key={index} word={word} index={index} />
            ))}
          </View>
          
          <Animated.View 
            entering={FadeInDown.delay(700).duration(500)}
            style={styles.buttonsContainer}
          >
            <GlassButton 
              label="Get Started" 
              fullWidth 
              size="lg"
              onPress={() => navigation.navigate('Signup')}
            />
            <View style={{ height: spacing.md }} />
            <GlassButton 
              label="I already have an account" 
              variant="ghost" 
              fullWidth 
              size="lg"
              onPress={() => navigation.navigate('Login')}
            />
          </Animated.View>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  topSection: {
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.glassBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginRight: spacing.sm,
  },
  tagline: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassBg,
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.divider,
  },
  spacer: {
    flex: 1,
  },
  bottomSection: {
    width: '100%',
  },
  headlineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xxl,
  },
  headlineWord: {
    color: colors.textPrimary,
  },
  buttonsContainer: {
    width: '100%',
  },
});
