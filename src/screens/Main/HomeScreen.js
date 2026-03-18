import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Image,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Search, Building2 } from 'lucide-react-native';
import { colors, typography, spacing, radius } from '../../theme/tokens';
import { GlassInput } from '../../components/ui/GlassInput';
import { StackingCards } from '../../components/home/StackingCards';
import { useAppContext } from '../../context/AppContext';

const CATEGORIES = [
  'All', 'Single Room', 'Double', 'Girls PG', 'Boys PG', 'Under ₹5k', 'Near Campus', 'Co-ed'
];

export const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, pgs, isLoading } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');



  const filteredPGs = useMemo(() => {
    let result = pgs;

    // Search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        pg => pg.name.toLowerCase().includes(lowerQuery) || 
              (pg.city && pg.city.toLowerCase().includes(lowerQuery))
      );
    }

    // Category filter
    if (activeCategory !== 'All') {
      if (activeCategory === 'Single Room') result = result.filter(pg => pg.room_type === 'Single');
      if (activeCategory === 'Double') result = result.filter(pg => pg.room_type === 'Double');
      if (activeCategory === 'Girls PG') result = result.filter(pg => pg.gender === 'Girls');
      if (activeCategory === 'Boys PG') result = result.filter(pg => pg.gender === 'Boys');
      if (activeCategory === 'Co-ed') result = result.filter(pg => pg.gender === 'Co-ed');
      // Under ₹5k is a mock category that might yield 0 results with our current mockData prices
      if (activeCategory === 'Under ₹5k') result = result.filter(pg => pg.price_per_month < 5000);
      // Near Campus would be another mock mapping, let's say < 1km
      if (activeCategory === 'Near Campus') result = result.filter(pg => 
        pg.distance_from_college !== null && pg.distance_from_college <= 1
      );
    }

    return result;
  }, [pgs, searchQuery, activeCategory]);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingTop: insets.top + spacing.base, 
          paddingBottom: insets.bottom + 120,
        }}
      >
        {/* Header Row */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBadge}>
              <Building2 size={20} color={colors.primary} strokeWidth={2} />
            </View>
            <View>
            <Text style={styles.userName}>Hello, {user?.full_name?.split(' ')[0] || 'Guest'} 👋</Text>
            <Text style={styles.userLocation}>Find your perfect home</Text>
          </View>
          </View>
          <Pressable 
            style={styles.avatar}
            onPress={() => navigation.navigate('Profile')}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={[typography.headingM, { color: colors.primary }]}>
                {user?.full_name?.charAt(0) || 'G'}
              </Text>
            )}
          </Pressable>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View entering={FadeInDown.delay(160).duration(600)} style={styles.searchContainer}>
          <GlassInput
            placeholder="Search PGs, localities..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            icon={Search}
            style={{ marginBottom: 0 }}
          />
        </Animated.View>

        {/* Categories */}
        <Animated.View entering={FadeInDown.delay(220).duration(600)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setActiveCategory(cat)}
                  style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                >
                  <Text style={[
                    typography.bodyS, 
                    { fontWeight: '600' }, 
                    { color: isActive ? '#fff' : colors.textSecondary }
                  ]}>
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Listings */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[typography.bodyM, { color: colors.textSecondary, marginTop: spacing.md }]}>
              Finding best PGs for you...
            </Text>
          </View>
        ) : filteredPGs.length > 0 ? (
          <StackingCards 
            listings={filteredPGs} 
            onCardPress={(pg) => navigation.navigate('PGDetail', { pg })}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={[typography.bodyL, { color: colors.textSecondary }]}>No PGs found in this category.</Text>
          </View>
        )}
        
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: spacing.xs,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  categoriesContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    paddingBottom: spacing.base,
  },
  categoryPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  emptyState: {
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
});
