/**
 * RevenueCard Component
 * Reusable card for displaying revenue analytics
 * - Total revenue
 * - Total bookings
 * - Booked/available slots
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { formatCurrency } from '../../../utils/revenueUtils';

export interface RevenueCardData {
  totalRevenue: number;
  totalBookings: number;
  bookedSlots: number;
  availableSlots: number;
}

interface RevenueCardProps {
  data: RevenueCardData;
  style?: any;
  showTitle?: boolean;
  title?: string;
}

const RevenueCard: React.FC<RevenueCardProps> = ({
  data,
  style,
  showTitle = true,
  title = 'Revenue Analytics',
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }, style]}>
      {showTitle && (
        <View style={styles.header}>
          <Ionicons name="analytics-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        </View>
      )}

      <View style={styles.statsContainer}>
        {/* Total Revenue */}
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>
            {formatCurrency(data.totalRevenue)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Total Revenue
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        {/* Total Bookings */}
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
            {data.totalBookings}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Bookings
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        {/* Slots Booked */}
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>
            {data.bookedSlots}/{data.bookedSlots + data.availableSlots}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Slots Booked
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
    opacity: 0.8,
  },
  divider: {
    width: 1,
    height: 40,
    marginHorizontal: 12,
    opacity: 0.5,
  },
});

export default RevenueCard;
