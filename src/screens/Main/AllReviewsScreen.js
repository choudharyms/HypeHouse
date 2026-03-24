import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { ArrowLeft, Star, User } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { GlassCard } from '../../components/ui/GlassCard';

export const AllReviewsScreen = ({ route, navigation }) => {
  const { pg } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[typography.headingM, { color: colors.textPrimary }]}>All Reviews</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsCard}>
          <Text style={[typography.displayL, { color: colors.primary }]}>{pg.rating || '0.0'}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(s => (
              <Star 
                key={s} 
                size={20} 
                color={s <= Math.round(pg.rating) ? "#FFD700" : colors.textTertiary} 
                fill={s <= Math.round(pg.rating) ? "#FFD700" : 'transparent'} 
              />
            ))}
          </View>
          <Text style={[typography.bodyM, { color: colors.textSecondary }]}>
            Based on {pg.review_count || 0} reviews
          </Text>
        </View>

        <View style={styles.reviewsList}>
          {pg.reviews?.map((rev, i) => (
            <GlassCard key={i} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.avatar}>
                    <User size={16} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={[typography.bodyM, { color: colors.textPrimary, fontWeight: '700' }]}>
                      {rev.profiles?.full_name || 'Student'}
                    </Text>
                    <Text style={[typography.bodyS, { color: colors.textTertiary }]}>
                      {new Date(rev.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.ratingBadge}>
                  <Star size={12} color="#FFD700" fill="#FFD700" />
                  <Text style={[typography.label, { color: colors.textPrimary, marginLeft: 4 }]}>{rev.rating}</Text>
                </View>
              </View>
              <Text style={[typography.bodyM, { color: colors.textSecondary, lineHeight: 22, marginTop: spacing.sm }]}>
                {rev.comment}
              </Text>
            </GlassCard>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { padding: spacing.xl },
  statsCard: {
    alignItems: 'center',
    backgroundColor: colors.glassBg,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginVertical: spacing.sm,
  },
  reviewsList: { gap: spacing.lg },
  reviewCard: { padding: spacing.lg },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.md,
  },
});
