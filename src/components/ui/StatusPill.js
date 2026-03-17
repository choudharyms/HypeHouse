import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';

// Maps status text to specific colors from tokens.js
const STATUS_COLORS = {
  // Availabilities
  'Available': { text: colors.green, bg: colors.greenDim, border: colors.greenBorder },
  'Limited': { text: colors.amber, bg: colors.amberDim, border: colors.amberBorder },
  'Full': { text: colors.red, bg: colors.redDim, border: colors.redBorder },
  
  // Payment / Booking statuses
  'Paid': { text: colors.green, bg: colors.greenDim, border: colors.greenBorder },
  'Partial': { text: colors.amber, bg: colors.amberDim, border: colors.amberBorder },
  'Pending': { text: colors.amber, bg: colors.amberDim, border: colors.amberBorder },
  'Active': { text: colors.primary, bg: colors.primaryDim, border: colors.primary },
  'Past': { text: colors.textSecondary, bg: colors.glassBg, border: colors.glassBorder },
  'Upcoming': { text: colors.textPrimary, bg: colors.glassBg, border: colors.glassBorder },
};

export const StatusPill = ({ status, style }) => {
  const scheme = STATUS_COLORS[status] || {
    text: colors.textSecondary,
    bg: colors.glassBg,
    border: colors.glassBorder,
  };

  return (
    <View 
      style={[
        styles.pill, 
        { 
          backgroundColor: scheme.bg,
          borderColor: scheme.border,
        },
        style
      ]}
    >
      <Text style={[typography.labelBold, { color: scheme.text, textTransform: 'uppercase' }]}>
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});
