import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Image,
  Alert,
  Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { ArrowLeft, Download, Mail, Trash2 } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { StatusPill } from '../../components/ui/StatusPill';
import { useAppContext } from '../../context/AppContext';

export const BookingDetailScreen = ({ route, navigation }) => {
  const { booking } = route.params;
  const insets = useSafeAreaInsets();
  const { cancelBooking } = useAppContext();

  const handleDownload = () => Alert.alert("Receipt", "Receipt downloaded to your device.");
  const handleSupport = () => Linking.openURL('mailto:support@hypehouse.com');
  const handleCancel = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking? This action cannot be undone.",
      [
        { text: "No, keep it", style: "cancel" },
        { 
          text: "Yes, cancel", 
          style: "destructive",
          onPress: () => {
             cancelBooking(booking.id);
             navigation.goBack();
          } 
        }
      ]
    );
  };

  const progressRatio = (booking.paid_amount || 0) / (booking.total_amount || 1);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withTiming(progressRatio * 100, { duration: 1000 });
  }, []);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const checkInDate = new Date(booking.check_in || new Date());
  const checkOutDate = new Date(booking.check_out || new Date());
  const durationDays = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)) || 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.headingM, { color: colors.textPrimary }]}>Booking Details</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Hero Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.section}>
          <GlassCard style={styles.heroCard}>
            <View style={styles.heroRow}>
              <Image source={{ uri: booking.pgs?.images?.[0] }} style={styles.heroImage} />
              <View style={styles.heroInfo}>
                <StatusPill status={booking.status} style={{ marginBottom: spacing.xs }} />
                <Text style={[typography.headingM, { color: colors.textPrimary, marginBottom: 2 }]} numberOfLines={1}>
                  {booking.pgs?.name}
                </Text>
                <Text style={[typography.bodyM, { color: colors.textSecondary }]}>
                  Room {booking.room_number || 'Allocating...'}
                </Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Payment Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
          <GlassCard style={styles.card}>
            <Text style={[typography.headingM, { color: colors.textPrimary, marginBottom: spacing.md }]}>Payment</Text>
            
            <View style={styles.paymentRow}>
              <Text style={[typography.bodyM, { color: colors.textSecondary }]}>Total</Text>
              <Text style={[typography.headingM, { color: colors.textPrimary }]}>₹{(booking.total_amount || 0).toLocaleString()}</Text>
            </View>
            
            <View style={styles.paymentRow}>
              <Text style={[typography.bodyM, { color: colors.textSecondary }]}>Paid</Text>
              <Text style={[typography.bodyM, { color: colors.green, fontWeight: '700' }]}>₹{(booking.paid_amount || 0).toLocaleString()}</Text>
            </View>

            {(booking.total_amount > (booking.paid_amount || 0)) && (
              <View style={[styles.paymentRow, { marginTop: spacing.sm }]}>
                <Text style={[typography.bodyM, { color: colors.textSecondary }]}>Due Amount</Text>
                <Text style={[typography.bodyM, { color: colors.amber, fontWeight: '700' }]}>
                  ₹{(booking.total_amount - (booking.paid_amount || 0)).toLocaleString()}
                </Text>
              </View>
            )}

            <View style={styles.progressBarBg}>
              <Animated.View style={[styles.progressBarFill, progressStyle]} />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Stay Details */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
          <GlassCard style={styles.card}>
            <Text style={[typography.headingM, { color: colors.textPrimary, marginBottom: spacing.md }]}>Stay Duration</Text>
            
            <View style={styles.dateRow}>
              <View style={styles.dateBlock}>
                <Text style={[typography.label, { color: colors.textTertiary, marginBottom: 4 }]}>CHECK IN</Text>
                <Text style={[typography.bodyM, { color: colors.textPrimary, fontWeight: '600' }]}>{booking.check_in}</Text>
              </View>
              <View style={styles.dateDivider}>
                <View style={styles.dateLine} />
                <Text style={[typography.label, { color: colors.textSecondary, marginHorizontal: 8 }]}>{durationDays} Days</Text>
                <View style={styles.dateLine} />
              </View>
              <View style={[styles.dateBlock, { alignItems: 'flex-end' }]}>
                <Text style={[typography.label, { color: colors.textTertiary, marginBottom: 4 }]}>CHECK OUT</Text>
                <Text style={[typography.bodyM, { color: colors.textPrimary, fontWeight: '600' }]}>{booking.check_out}</Text>
              </View>
            </View>

            <View style={styles.idBox}>
              <Text style={[typography.label, { color: colors.textSecondary }]}>Booking ID</Text>
              <Text style={[typography.labelBold, { color: colors.primary, fontSize: 13 }]}>{booking.id.substring(0, 8)}</Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.actionsBox}>
          <GlassButton 
            label="Download Receipt" 
            variant="ghost" 
            icon={Download} 
            fullWidth 
            style={{ marginBottom: spacing.sm }} 
            onPress={handleDownload}
          />
          <GlassButton 
            label="Contact Support" 
            variant="ghost" 
            icon={Mail} 
            fullWidth 
            style={{ marginBottom: spacing.sm }} 
            onPress={handleSupport}
          />
          {(booking.status === 'Upcoming' || booking.status === 'Pending') && (
            <GlassButton 
              label="Cancel Booking" 
              variant="destructive" 
              icon={Trash2} 
              fullWidth 
              onPress={handleCancel}
            />
          )}
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
    borderBottomWidth: 1, borderBottomColor: colors.glassBorder,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  scrollContent: { padding: spacing.xl, paddingBottom: 100 },
  section: { marginBottom: spacing.xl },
  card: { padding: spacing.lg },
  heroCard: { padding: spacing.base },
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  heroImage: { width: 80, height: 80, borderRadius: radius.md, backgroundColor: colors.glassBg },
  heroInfo: { flex: 1, marginLeft: spacing.base, justifyContent: 'center' },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  progressBarBg: { height: 6, backgroundColor: colors.glassHighlight, borderRadius: 3, marginTop: spacing.lg, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: colors.green, borderRadius: 3 },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  dateBlock: { flex: 1 },
  dateDivider: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xs },
  dateLine: { width: 30, height: 1, backgroundColor: colors.divider },
  idBox: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)', padding: spacing.md, 
    borderRadius: radius.md, marginTop: spacing.sm 
  },
  actionsBox: { gap: spacing.md },
});
