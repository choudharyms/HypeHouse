import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  Pressable,
  Dimensions,
  Linking,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { 
  ArrowLeft, Heart, Share, Wifi, Wind, MapPin, 
  Car, Shield, Bath, Droplets, Tv, Utensils, Zap, Phone, MessageCircle 
} from 'lucide-react-native';

import { colors, radius, spacing, typography } from '../../theme/tokens';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { StatusPill } from '../../components/ui/StatusPill';
import { useAppContext } from '../../context/AppContext';

const { height: H, width: W } = Dimensions.get('window');

// Helper to map amenity strings to icons
const getAmenityIcon = (amenity) => {
  const name = amenity.toLowerCase();
  if (name.includes('wi-fi')) return Wifi;
  if (name.includes('ac') || name.includes('cooler')) return Wind;
  if (name.includes('parking')) return Car;
  if (name.includes('security')) return Shield;
  if (name.includes('bathroom')) return Bath;
  if (name.includes('water') || name.includes('ro')) return Droplets;
  if (name.includes('meals') || name.includes('mess')) return Utensils;
  if (name.includes('power')) return Zap;
  return Tv; // fallback
};

export const PGDetailScreen = ({ route, navigation }) => {
  const { pg } = route.params;
  const insets = useSafeAreaInsets();
  const { isSaved, toggleSaved, addBooking } = useAppContext();
  const saved = isSaved(pg.id);

  const [expandedDesc, setExpandedDesc] = useState(false);

  const handleBookNow = () => {
    Alert.alert(
      "Confirm Booking",
      `Are you sure you want to book ${pg.name} for ₹${(pg.price_per_month || 0).toLocaleString()}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: () => {
             // add to bookings AppContext
             const newBooking = {
               id: `BK-${Math.floor(Math.random()*10000)}-NN`,
               pgId: pg.id,
               pgName: pg.name,
               pgImage: pg.images[0],
               roomNumber: 'Allocating...',
               checkIn: new Date().toISOString().split('T')[0],
               checkOut: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
               status: 'Upcoming',
               paymentStatus: 'Pending',
               totalAmount: (pg.price_per_month || 0) * 11, // Standard 11 month agreement
               paidAmount: 0,
             };
             addBooking(newBooking);
             navigation.navigate('BookingsRoot'); // We will create this alias in MainStack if needed, or navigate to Tab
             navigation.navigate('Bookings');
          } 
        }
      ]
    );
  };

  const handleCall = () => {
    Linking.openURL(`tel:${pg.ownerPhone}`);
  };

  const handleWhatsApp = () => {
    Linking.openURL(`whatsapp://send?phone=${pg.ownerPhone}`);
  };

  const handleShare = () => {
    Alert.alert("Share", "Share functionality would open native share sheet.");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Full-width Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: pg.images[0] }} style={styles.heroImage} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(10,15,30,0)', 'rgba(10,15,30,0.8)', colors.bg]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          
          {/* Top floating header elements */}
          <View style={[styles.headerControls, { top: insets.top + spacing.sm }]}>
            <Pressable onPress={() => navigation.goBack()} style={styles.circleBtn}>
              <ArrowLeft size={20} color={colors.textPrimary} />
            </Pressable>
            <View style={styles.headerRight}>
              <Pressable onPress={() => toggleSaved(pg.id)} style={styles.circleBtn}>
                <Heart size={20} fill={saved ? colors.red : 'transparent'} color={saved ? colors.red : colors.textPrimary} />
              </Pressable>
              <Pressable onPress={handleShare} style={styles.circleBtn}>
                <Share size={20} color={colors.textPrimary} />
              </Pressable>
            </View>
          </View>

          {/* Bottom hero elements */}
          <View style={styles.heroBottomRow}>
            <StatusPill status={pg.availability} />
            <View style={styles.ratingBadge}>
              <Text style={[typography.labelBold, { color: colors.textPrimary }]}>★ {pg.rating}</Text>
            </View>
          </View>
        </View>

        {/* Content Body */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.body}>
          
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.headingL, { color: colors.textPrimary }]}>{pg.name}</Text>
              <View style={styles.locationWrap}>
                <MapPin size={14} color={colors.textSecondary} style={{ marginRight: 4 }}/>
                <Text style={[typography.bodyM, { color: colors.textSecondary }]}>{pg.city || 'Unknown'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={[typography.displayM, { color: colors.primary }]}>₹{(pg.price_per_month || 0).toLocaleString()}</Text>
            <Text style={[typography.bodyL, { color: colors.textSecondary, marginBottom: 4, marginLeft: 4 }]}>/mo</Text>
          </View>

          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            {[
              { label: 'Type', value: pg.room_type || 'Single' },
              { label: 'Gender', value: pg.gender || 'Boys' },
              { label: 'Distance', value: `${pg.distance_from_college || '0.5'} km` },
              { label: 'Rooms', value: 'Furnished' }
            ].map((stat, i) => (
              <View key={i} style={styles.statTile}>
                <Text style={[typography.label, { color: colors.textSecondary, marginBottom: 4 }]}>{stat.label}</Text>
                <Text style={[typography.bodyM, { color: colors.textPrimary, fontWeight: '700' }]}>{stat.value}</Text>
              </View>
            ))}
          </View>

          {/* Amenities Section */}
          <View style={styles.section}>
            <Text style={[typography.headingM, styles.sectionTitle]}>Amenities</Text>
            <View style={styles.chipsWrap}>
              {(pg.amenities || []).map((amenity, i) => {
                const Icon = getAmenityIcon(amenity);
                return (
                  <View key={i} style={styles.chip}>
                    <Icon size={14} color={colors.primary} />
                    <Text style={[typography.bodyS, { color: colors.textPrimary, marginLeft: 6 }]}>{amenity}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={[typography.headingM, styles.sectionTitle]}>Description</Text>
            <Text 
              style={[typography.bodyM, { color: colors.textSecondary, lineHeight: 22 }]} 
              numberOfLines={expandedDesc ? undefined : 3}
            >
              {pg.description}
            </Text>
            <Pressable onPress={() => setExpandedDesc(!expandedDesc)} style={{ marginTop: spacing.sm }}>
              <Text style={[typography.bodyM, { color: colors.primary, fontWeight: '600' }]}>
                {expandedDesc ? 'Show less' : 'Read more'}
              </Text>
            </Pressable>
          </View>

          {/* Rules Section */}
          <View style={styles.section}>
            <Text style={[typography.headingM, styles.sectionTitle]}>House Rules</Text>
            {(pg.rules || ['No Loud Music', 'Respect Neighbors']).map((rule, i) => (
              <View key={i} style={styles.ruleRow}>
                <View style={styles.bullet} />
                <Text style={[typography.bodyM, { color: colors.textSecondary }]}>{rule}</Text>
              </View>
            ))}
          </View>

          {/* Owner Section */}
          <View style={styles.section}>
            <Text style={[typography.headingM, styles.sectionTitle]}>Owner Details</Text>
            <GlassCard noPadding style={styles.ownerCard}>
              <View style={styles.ownerRow}>
                <View style={styles.ownerAvatar}>
                  <Text style={[typography.headingM, { color: colors.primary }]}>{pg.owner?.full_name?.charAt(0) || 'O'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.headingM, { color: colors.textPrimary }]}>{pg.owner?.full_name || 'Owner'}</Text>
                  <Text style={[typography.bodyS, { color: colors.textSecondary }]}>Verified Owner</Text>
                </View>
              </View>
              <View style={styles.ownerActions}>
                <GlassButton 
                  label="Call" 
                  icon={Phone} 
                  variant="ghost" 
                  size="sm" 
                  onPress={handleCall}
                  style={styles.actionBtn}
                />
                <View style={{ width: spacing.sm }} />
                <GlassButton 
                  label="WhatsApp" 
                  icon={MessageCircle} 
                  size="sm" 
                  onPress={handleWhatsApp}
                  style={styles.actionBtn}
                />
              </View>
            </GlassCard>
          </View>
          
        </Animated.View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.base) }]}>
        <View style={styles.bottomBarInner}>
          <View>
            <Text style={[typography.label, { color: colors.textSecondary }]}>Price / month</Text>
            <Text style={[typography.headingL, { color: colors.textPrimary }]}>₹{(pg.price_per_month || 0).toLocaleString()}</Text>
          </View>
          <View style={{ width: 160 }}>
            <GlassButton label="Book Now" onPress={handleBookNow} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  heroContainer: { height: 320, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  headerControls: {
    position: 'absolute', left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    zIndex: 10,
  },
  headerRight: { flexDirection: 'row', gap: spacing.sm },
  circleBtn: {
    width: 44, height: 44, borderRadius: radius.full,
    backgroundColor: colors.glassBg, borderWidth: 1, borderColor: colors.glassBorder,
    alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  heroBottomRow: {
    position: 'absolute', bottom: spacing.xl, left: spacing.xl, right: spacing.xl,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  ratingBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.glassBorder,
  },
  body: { paddingHorizontal: spacing.xl },
  titleRow: { flexDirection: 'row', marginBottom: spacing.sm },
  locationWrap: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: spacing.xl },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xxl,
  },
  statTile: {
    width: (W - spacing.xl * 2 - spacing.sm) / 2,
    backgroundColor: colors.glassBg, borderWidth: 1, borderColor: colors.glassBorder,
    borderRadius: radius.lg, padding: spacing.md,
  },
  section: { marginBottom: spacing.xxl },
  sectionTitle: { color: colors.textPrimary, marginBottom: spacing.md },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.primaryDim, borderWidth: 1, borderColor: 'rgba(37,99,235,0.3)',
    borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  ruleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginRight: spacing.md },
  ownerCard: { padding: spacing.lg },
  ownerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  ownerAvatar: {
    width: 48, height: 48, borderRadius: radius.full, backgroundColor: colors.glassHighlight,
    borderWidth: 1, borderColor: colors.primary, marginRight: spacing.md,
    alignItems: 'center', justifyContent: 'center',
  },
  ownerActions: { flexDirection: 'row' },
  actionBtn: { flex: 1 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(10,15,30,0.85)',
    borderTopWidth: 1, borderTopColor: colors.glassBorder,
    paddingTop: spacing.base, paddingHorizontal: spacing.xl,
    backdropFilter: 'blur(20px)',
  },
  bottomBarInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
