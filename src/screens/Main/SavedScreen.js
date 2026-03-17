import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Pressable, 
  Image 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Filter, Heart, MapPin } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { GlassButton } from '../../components/ui/GlassButton';
import { useAppContext } from '../../context/AppContext';
import { StatusPill } from '../../components/ui/StatusPill';

const TAB_OPTIONS = ['Accommodations', 'Shortlisted'];

export const SavedScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { pgs, savedPGIds, toggleSaved } = useAppContext();
  const [activeTab, setActiveTab] = useState(TAB_OPTIONS[0]);

  const savedListings = useMemo(() => {
    // For mock purposes, if "Shortlisted" is selected we can just show empty or a subset
    if (activeTab === 'Shortlisted') return [];
    return pgs.filter(pg => savedPGIds.includes(pg.id));
  }, [pgs, savedPGIds, activeTab]);

  const renderEmptyState = () => (
    <Animated.View entering={FadeIn.delay(300)} style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🏠</Text>
      <Text style={[typography.headingM, { color: colors.textPrimary, marginTop: spacing.lg }]}>
        No saved PGs yet
      </Text>
      <Text style={[typography.bodyM, { color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center', marginHorizontal: spacing.xxl }]}>
        Tap the heart icon on properties you like to save them here for later.
      </Text>
      <View style={{ marginTop: spacing.xl, width: 200 }}>
        <GlassButton 
          label="Explore PGs" 
          variant="ghost" 
          onPress={() => navigation.navigate('Home')}
        />
      </View>
    </Animated.View>
  );

  const renderCard = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(100 + index * 60).duration(500)}>
      <Pressable 
        style={styles.card}
        onPress={() => navigation.navigate('PGDetail', { pg: item })}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.images[0] }} style={styles.image} resizeMode="cover" />
          <View style={styles.absoluteTopLeft}>
            <Pressable 
              onPress={() => toggleSaved(item.id)} 
              style={styles.actionCircle}
            >
              <Heart size={20} fill={colors.red} color={colors.red} />
            </Pressable>
          </View>
          <View style={styles.absoluteTopRight}>
            <StatusPill status={item.availability} />
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <Text style={[typography.headingM, styles.nameText]} numberOfLines={1}>{item.name}</Text>
            <Text style={[typography.headingL, { color: colors.primary }]}>₹{(item.pricePerMonth || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.locationRow}>
            <MapPin size={12} color={colors.textSecondary} />
            <Text style={[typography.bodyS, styles.locationText]} numberOfLines={1}>{item.city || 'Location'}</Text>
            <View style={styles.dot} />
            <Text style={[typography.label, { color: colors.textTertiary }]}>{item.distance_from_college}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.base }]}>
      <View style={styles.header}>
        <Text style={[typography.headingL, { color: colors.textPrimary }]}>Saved PGs</Text>
        <Pressable style={styles.filterBtn}>
          <Filter size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.tabsContainer}>
        {TAB_OPTIONS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable 
              key={tab} 
              onPress={() => setActiveTab(tab)}
              style={styles.tabContent}
            >
              <Text style={[
                typography.bodyM, 
                { fontWeight: '700', color: isActive ? colors.textPrimary : colors.textTertiary }
              ]}>
                {tab}
              </Text>
              {isActive && (
                <Animated.View layoutId="underline" style={styles.activeUnderline} />
              )}
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={savedListings}
        keyExtractor={item => item.id}
        renderItem={renderCard}
        contentContainerStyle={[
          styles.listContent, 
          { paddingBottom: insets.bottom + 120 },
          savedListings.length === 0 && { flex: 1 }
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: spacing.xl, marginBottom: spacing.xl 
  },
  filterBtn: {
    width: 40, height: 40, borderRadius: radius.full,
    backgroundColor: colors.glassBg, borderWidth: 1, borderColor: colors.glassBorder,
    alignItems: 'center', justifyContent: 'center'
  },
  tabsContainer: {
    flexDirection: 'row', paddingHorizontal: spacing.xl, 
    borderBottomWidth: 1, borderBottomColor: colors.glassBorder,
    marginBottom: spacing.base,
  },
  tabContent: {
    marginRight: spacing.xxl,
    paddingBottom: spacing.sm,
    position: 'relative',
  },
  activeUnderline: {
    position: 'absolute', bottom: -1, left: 0, right: 0,
    height: 2, backgroundColor: colors.primary, borderRadius: 2,
  },
  listContent: { paddingHorizontal: spacing.xl },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 64 },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.glassBorder,
    overflow: 'hidden', marginBottom: spacing.lg,
  },
  imageContainer: {
    height: 160, width: '100%', backgroundColor: colors.glassBg, position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  absoluteTopLeft: { position: 'absolute', top: spacing.sm, left: spacing.sm },
  absoluteTopRight: { position: 'absolute', top: spacing.sm, right: spacing.sm },
  actionCircle: {
    width: 36, height: 36, borderRadius: radius.full,
    backgroundColor: 'rgba(10, 15, 30, 0.5)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'
  },
  contentContainer: { padding: spacing.base },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  nameText: { color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { color: colors.textSecondary, marginLeft: 4 },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.textTertiary, marginHorizontal: 6 },
});
