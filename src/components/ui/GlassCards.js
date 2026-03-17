import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Wifi, Home } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { PressableScale } from '../PressableScale';

const BadgeIcon = ({ name }) => {
  const p = { size: 11, strokeWidth: 1.5, color: colors.textSecondary };
  if (name === 'Wi-Fi') return <Wifi {...p} />;
  if (name?.includes('Room')) return <Home {...p} />;
  return null;
};

const getStatusStyle = (color) => {
  if (color === '#10b981') return [styles.availPill, styles.pillGreen];
  if (color === '#f59e0b') return [styles.availPill, styles.pillAmber];
  return [styles.availPill, styles.pillRed];
};

const getStatusTextColor = (color) => {
  if (color === '#10b981') return colors.accentGreen;
  if (color === '#f59e0b') return colors.accentAmber;
  return colors.destructive;
};

export const PGCard = ({ item }) => {
  return (
    <PressableScale>
      <View style={styles.card}>
        {/* Glass reflection streak */}
        <LinearGradient
          colors={['rgba(255,255,255,0.07)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Image */}
        <ImageBackground
          source={{ uri: item.image }}
          style={styles.image}
          imageStyle={{ borderRadius: 16 }}
        >
          <LinearGradient
            colors={['transparent', 'rgba(10,15,30,0.85)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>₹{item.price}</Text>
            <Text style={styles.priceSubText}>/mo</Text>
          </View>
          <View style={getStatusStyle(item.availableColor)}>
            <View style={[styles.dot, { backgroundColor: item.availableColor || colors.destructive }]} />
            <Text style={[styles.availText, { color: getStatusTextColor(item.availableColor) }]}>
              {item.availability}
            </Text>
          </View>
        </ImageBackground>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
          <View style={styles.locationRow}>
            <MapPin size={12} strokeWidth={1.5} color={colors.primary} />
            <Text style={styles.locationText}>{item.distance}</Text>
          </View>
          <View style={styles.badges}>
            {item.badges.map((badge, i) => (
              <View key={i} style={styles.badge}>
                <BadgeIcon name={badge} />
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  image: { height: 180 },
  priceTag: {
    position: 'absolute', bottom: 12, left: 14,
    flexDirection: 'row', alignItems: 'baseline', gap: 2,
  },
  priceText: { color: '#F8FAFC', fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  priceSubText: { color: 'rgba(248,250,252,0.6)', fontSize: 12, fontWeight: '500' },
  availPill: {
    position: 'absolute', bottom: 12, right: 12,
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5,
    gap: 5, borderWidth: 1,
  },
  pillGreen: { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.3)' },
  pillAmber: { backgroundColor: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.3)' },
  pillRed: { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.3)' },
  dot: { width: 6, height: 6, borderRadius: 999 },
  availText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  content: { padding: 16, gap: 8 },
  title: { color: colors.textPrimary, fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationText: { color: colors.textSecondary, fontSize: 12, fontWeight: '500' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
  },
  badgeText: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
});
