import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Heart, MapPin, Star, Wifi, Wind, Car, Utensils } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { StatusPill } from '../ui/StatusPill';
import { useAppContext } from '../../context/AppContext';

const { width: W } = Dimensions.get('window');
const CARD_WIDTH = W - spacing.xl * 2;
const IMAGE_HEIGHT = 200;

// Quick amenity → icon map (show first 4)
const AMENITY_ICONS = { 'Wi-Fi': Wifi, 'AC': Wind, 'Parking': Car, 'Meals': Utensils };
const AMENITY_PRIORITY = ['Wi-Fi', 'AC', 'Parking', 'Meals'];

const getAmenityIcon = (amenity) => {
  for (const key of Object.keys(AMENITY_ICONS)) {
    if (amenity.toLowerCase().includes(key.toLowerCase())) return AMENITY_ICONS[key];
  }
  return null;
};

const PGCard = ({ item, index, onPress }) => {
  const { toggleSaved, isSaved } = useAppContext();
  const saved = isSaved(item.id);

  // Subtle scale on press
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = () => { scale.value = withSpring(0.975, { damping: 20, stiffness: 300 }); };
  const handlePressOut = () => { scale.value = withSpring(1, { damping: 18, stiffness: 220 }); };

  // Show at most 4 recognisable amenities
  const displayAmenities = (item.amenities || [])
    .filter(a => AMENITY_PRIORITY.some(k => a.toLowerCase().includes(k.toLowerCase())))
    .slice(0, 4);
  const extraCount = (item.amenities || []).length - displayAmenities.length;

  return (
    // Outer: handles the FadeInDown entrance animation only
    <Animated.View
      entering={FadeInDown.delay(80 + index * 70).duration(500).springify().damping(18)}
      style={styles.cardWrapper}
    >
      {/* Inner: handles the press scale animation only — must be separate from entering */}
      <Animated.View style={animStyle}>
      <Pressable
        onPress={() => onPress(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}
      >
        {/* ─── Hero Image ─── */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.images[0] }} style={styles.image} resizeMode="cover" />

          {/* Gradient scrim at bottom of image */}
          <View style={styles.imageScrim} />

          {/* Heart button */}
          <Pressable
            onPress={() => toggleSaved(item.id)}
            style={styles.heartBtn}
            hitSlop={8}
          >
            <Heart
              size={18}
              fill={saved ? colors.red : 'transparent'}
              color={saved ? colors.red : '#fff'}
              strokeWidth={2}
            />
          </Pressable>

          {/* Availability pill */}
          <View style={styles.pillWrap}>
            <StatusPill status={item.availability} />
          </View>

          {/* Rating badge overlaid on image */}
          <View style={styles.ratingBadge}>
            <Star size={12} color={colors.amber} fill={colors.amber} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        {/* ─── Content ─── */}
        <View style={styles.content}>
          {/* Title + Price row */}
          <View style={styles.titlePriceRow}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <View style={styles.locationRow}>
                <MapPin size={11} color={colors.textSecondary} />
                <Text style={styles.locationText} numberOfLines={1}> {item.city || item.location}</Text>
                <View style={styles.dot} />
                <Text style={styles.distanceText}>{item.distance_from_college || '0.5'} km</Text>
              </View>
            </View>
            <View style={styles.priceBlock}>
              <Text style={styles.price}>₹{(item.price_per_month || 0).toLocaleString()}</Text>
              <Text style={styles.priceLabel}>/mo</Text>
            </View>
          </View>

          {/* Meta chips row */}
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>{item.room_type || item.type}</Text>
            </View>
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>{item.gender}</Text>
            </View>
          </View>

          {/* Amenity chips */}
          {displayAmenities.length > 0 && (
            <View style={styles.amenityRow}>
              {displayAmenities.map((amenity, i) => {
                const Icon = getAmenityIcon(amenity);
                return (
                  <View key={i} style={styles.amenityChip}>
                    {Icon && <Icon size={11} color={colors.primary} />}
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                );
              })}
              {extraCount > 0 && (
                <View style={styles.amenityChip}>
                  <Text style={styles.amenityText}>+{extraCount} more</Text>
                </View>
              )}
            </View>
          )}

          {/* Divider + CTA */}
          <View style={styles.divider} />
          <Pressable onPress={() => onPress(item)} style={styles.ctaRow}>
            <Text style={styles.ctaText}>View Details →</Text>
          </Pressable>
        </View>
      </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

export const StackingCards = ({ listings, onCardPress }) => {
  return (
    <View style={styles.container}>
      {listings.map((item, i) => (
        <PGCard
          key={item.id}
          item={item}
          index={i}
          onPress={onCardPress}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
    paddingBottom: spacing.base,
    gap: spacing.lg,
  },

  // Card
  cardWrapper: {
    width: CARD_WIDTH,
    borderRadius: radius.xl,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  card: {
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },

  // Image
  imageContainer: {
    height: IMAGE_HEIGHT,
    width: '100%',
    backgroundColor: colors.glassBg,
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  imageScrim: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 80,
    // Simple gradient replacement for React Native
    backgroundColor: 'transparent',
    // The scrim is subtle — card bg will be visible below
  },
  heartBtn: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.base,
    width: 36, height: 36,
    borderRadius: radius.full,
    backgroundColor: 'rgba(10,15,30,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 2,
  },
  pillWrap: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.base,
    zIndex: 2,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10,15,30,0.72)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
    gap: 4,
    zIndex: 2,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Content
  content: {
    padding: spacing.base,
  },
  titlePriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  dot: {
    width: 3, height: 3, borderRadius: 1.5,
    backgroundColor: colors.textTertiary,
    marginHorizontal: 5,
  },
  distanceText: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  priceLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },

  // Meta chips
  metaRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  metaChip: {
    backgroundColor: colors.glassHighlight,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  metaChipText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Amenity chips
  amenityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryDim,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.25)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  amenityText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },

  // Footer
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginBottom: spacing.sm,
  },
  ctaRow: {
    alignItems: 'flex-end',
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.2,
  },
});
