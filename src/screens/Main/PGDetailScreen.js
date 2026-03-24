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
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { 
  ArrowLeft, Heart, Share, Wifi, Wind, MapPin, 
  Car, Shield, Bath, Droplets, Tv, Utensils, Zap, Phone, MessageCircle,
  Calendar
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
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const handleBookNow = () => {
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!checkInDate || !checkOutDate) {
      Alert.alert("Required", "Please enter both Check-in and Check-out dates.");
      return;
    }

    // Basic date validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(checkInDate) || !dateRegex.test(checkOutDate)) {
      Alert.alert("Invalid Format", "Please use YYYY-MM-DD format.");
      return;
    }

    setIsBooking(true);
    try {
      const bookingData = {
        pgId: pg.id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalAmount: pg.price_per_month, // Just a placeholder for base amount
        status: 'Pending'
      };
      
      const result = await addBooking(bookingData);
      setShowBookingModal(false);
      Alert.alert(
        "Request Sent!", 
        "Your booking request has been sent to the owner. You can track the status in your Bookings tab.",
        [{ text: "OK", onPress: () => navigation.navigate('Bookings') }]
      );
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert("Booking Failed", error.message || "Failed to create booking request.");
    } finally {
      setIsBooking(false);
    }
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

  const handleOpenMaps = () => {
    const lat = pg.lat || 12.9716;
    const lng = pg.lng || 77.5946;
    const label = pg.name;
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`
    });
    Linking.openURL(url);
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

          {/* Map Section */}
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={[typography.headingM, { color: colors.textPrimary, marginBottom: 0 }]}>Location</Text>
              <TouchableOpacity onPress={handleOpenMaps}>
                <Text style={[typography.bodyS, { color: colors.primary, fontWeight: '700' }]}>Get Directions</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: pg.lat || 12.9716,
                  longitude: pg.lng || 77.5946,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: pg.lat || 12.9716,
                    longitude: pg.lng || 77.5946,
                  }}
                  title={pg.name}
                  description={pg.address}
                />
              </MapView>
              {!pg.lat && (
                <View style={styles.mapOverlay}>
                  <Text style={[typography.bodyS, { color: colors.textTertiary, textAlign: 'center' }]}>
                    Exact location not provided by owner
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.locationDetail}>
              <MapPin size={16} color={colors.textSecondary} />
              <Text style={[typography.bodyM, { color: colors.textSecondary, marginLeft: 8, flex: 1 }]}>
                {pg.address}
              </Text>
            </View>
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

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <GlassCard style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[typography.headingM, { color: colors.textPrimary }]}>Choose Stay Period</Text>
              <Pressable onPress={() => setShowBookingModal(false)}>
                <ArrowLeft size={20} color={colors.textSecondary} style={{ transform: [{ rotate: '90deg' }] }} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={[typography.label, { color: colors.textSecondary, marginBottom: 8 }]}>Check-in Date</Text>
                <View style={styles.inputWrap}>
                  <Calendar size={16} color={colors.primary} style={{ marginRight: 8 }} />
                  <TextInput
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textTertiary}
                    value={checkInDate}
                    onChangeText={setCheckInDate}
                    style={styles.textInput}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[typography.label, { color: colors.textSecondary, marginBottom: 8 }]}>Check-out Date (Estimate)</Text>
                <View style={styles.inputWrap}>
                  <Calendar size={16} color={colors.primary} style={{ marginRight: 8 }} />
                  <TextInput
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textTertiary}
                    value={checkOutDate}
                    onChangeText={setCheckOutDate}
                    style={styles.textInput}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={[typography.bodyS, { color: colors.textTertiary, marginTop: 12, fontStyle: 'italic' }]}>
                * Your booking will be sent as a request. The owner needs to accept it before you can check in.
              </Text>

              <View style={{ marginTop: 24 }}>
                <GlassButton 
                  label="Confirm Booking Request" 
                  onPress={handleConfirmBooking} 
                  loading={isBooking}
                />
              </View>
            </View>
          </GlassCard>
        </KeyboardAvoidingView>
      </Modal>

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
  },
  bottomBarInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.xl,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalBody: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 54,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  textInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  mapContainer: {
    height: 180,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: spacing.md,
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,15,30,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  locationDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassBg,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
});
