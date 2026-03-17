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
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAppContext } from '../../context/AppContext';
import { StatusPill } from '../../components/ui/StatusPill';

const TAB_OPTIONS = ['Upcoming', 'Past'];

export const BookingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { bookings } = useAppContext();
  const [activeTab, setActiveTab] = useState(TAB_OPTIONS[0]);

  const activeStay = useMemo(() => bookings.find(b => b.status === 'Active'), [bookings]);
  
  const listData = useMemo(() => {
    return bookings.filter(b => b.status === activeTab && b.id !== activeStay?.id);
  }, [bookings, activeTab, activeStay]);

  const renderEmptyState = () => (
    <Animated.View entering={FadeIn.delay(300)} style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📅</Text>
      <Text style={[typography.headingM, { color: colors.textPrimary, marginTop: spacing.lg }]}>
        No {activeTab.toLowerCase()} bookings
      </Text>
    </Animated.View>
  );

  const renderActiveStay = () => {
    if (!activeStay && activeTab === 'Upcoming') return null;
    if (activeStay && activeTab === 'Upcoming') {
      return (
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <View style={styles.activeStayContainer}>
            <View style={styles.blueAccentBorder} />
            <Text style={[typography.labelBold, { color: colors.primary, marginBottom: spacing.sm }]}>ACTIVE STAY</Text>
            <View style={styles.activeRow}>
              <Image source={{ uri: activeStay.pgs?.images?.[0] }} style={styles.activeThumb} />
              <View style={{ flex: 1, marginLeft: spacing.base }}>
                <Text style={[typography.headingM, { color: colors.textPrimary }]} numberOfLines={1}>{activeStay.pgs?.name}</Text>
                <Text style={[typography.bodyS, { color: colors.textSecondary }]}>Room {activeStay.room_number || 'TBD'}</Text>
                
                <View style={styles.timeline}>
                  <Text style={[typography.label, { color: colors.textTertiary }]}>{activeStay.check_in}</Text>
                  <View style={styles.timelineDashed} />
                  <Text style={[typography.label, { color: colors.textTertiary }]}>{activeStay.check_out}</Text>
                </View>
              </View>
            </View>
            <Pressable 
              style={styles.ghostBtn}
              onPress={() => navigation.navigate('BookingDetail', { booking: activeStay })}
            >
              <Text style={[typography.bodyM, { color: colors.primary, fontWeight: '600' }]}>View Details</Text>
            </Pressable>
          </View>
        </Animated.View>
      );
    }
    return null;
  };

  const renderCard = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(100 + index * 60).duration(500)} style={{ marginBottom: spacing.base }}>
      <GlassCard 
        onPress={() => navigation.navigate('BookingDetail', { booking: item })}
        style={{ padding: spacing.base }}
      >
        <View style={styles.cardHeader}>
          <StatusPill status={item.status} />
          <Text style={[typography.headingM, { color: colors.textPrimary }]}>₹{(item.total_amount || 0).toLocaleString()}</Text>
        </View>
        <Text style={[typography.headingM, { color: colors.textPrimary, marginTop: spacing.sm }]} numberOfLines={1}>{item.pgs?.name}</Text>
        <Text style={[typography.bodyS, { color: colors.textSecondary, marginBottom: spacing.base }]}>Room {item.room_number || 'TBD'} • ID: {item.id.substring(0,8)}</Text>
        
        <View style={styles.timelineSimple}>
          <View>
            <Text style={[typography.label, { color: colors.textTertiary }]}>CHECK-IN</Text>
            <Text style={[typography.bodyM, { color: colors.textPrimary }]}>{item.check_in}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[typography.label, { color: colors.textTertiary }]}>CHECK-OUT</Text>
            <Text style={[typography.bodyM, { color: colors.textPrimary }]}>{item.check_out}</Text>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.base }]}>
      <View style={styles.header}>
        <Text style={[typography.headingL, { color: colors.textPrimary }]}>My Bookings</Text>
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
                <Animated.View layoutId="bUnderline" style={styles.activeUnderline} />
              )}
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={listData}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderActiveStay}
        renderItem={renderCard}
        contentContainerStyle={[
          styles.listContent, 
          { paddingBottom: insets.bottom + 120 },
          listData.length === 0 && !activeStay && { flex: 1 }
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  tabsContainer: {
    flexDirection: 'row', paddingHorizontal: spacing.xl, 
    borderBottomWidth: 1, borderBottomColor: colors.glassBorder,
    marginBottom: spacing.xl,
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
  
  activeStayContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.glassBorder,
    padding: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  blueAccentBorder: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0, width: 4,
    backgroundColor: colors.primary,
  },
  activeRow: { flexDirection: 'row', marginBottom: spacing.lg },
  activeThumb: { width: 80, height: 80, borderRadius: radius.md, backgroundColor: colors.glassBg },
  timeline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  timelineDashed: { flex: 1, height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.divider, marginHorizontal: spacing.sm, borderRadius: 1 },
  ghostBtn: {
    backgroundColor: 'rgba(37,99,235,0.1)',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(37,99,235,0.3)'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timelineSimple: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.divider },
});
