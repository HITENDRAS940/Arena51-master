/**
 * Enhanced BookingCard Component
 * Reusable card for displaying booking information
 * Supports both user and admin views with different layouts
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import StatusBadge from '../StatusBadge';
import { formatDateToDDMMMYYYY } from '../../../utils/dateUtils';
import { formatTimeRange } from '../../../utils/slotUtils';
import { formatCurrency } from '../../../utils/revenueUtils';
import ProfileIcon from '../../shared/icons/ProfileIcon';

interface BookingSlot {
  slotId: number;
  startTime: string;
  endTime: string;
  price: number;
}

interface BookingUser {
  name: string;
  phone: string;
}

export interface BookingData {
  id: number;
  reference: string;
  serviceName: string;
  amount: number;
  status: string;
  bookingDate: string;
  createdAt?: string;
  slotTime?: string;
  slots: BookingSlot[];
  user?: BookingUser;
  totalAmount?: number;
  date?: string;
}

interface BookingCardProps {
  booking: BookingData;
  variant?: 'user' | 'admin';
  onPress?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
  showUserInfo?: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  variant = 'user',
  onPress,
  onCancel,
  showActions = true,
  showUserInfo = true,
}) => {
  const { theme } = useTheme();

  const formatSlots = (slots: BookingSlot[]) => {
    if (!slots || slots.length === 0) return 'No slots';
    if (slots.length === 1) {
      return formatTimeRange(slots[0].startTime, slots[0].endTime);
    }
    return `${slots.length} slots`;
  };

  const isBookingCancellable = () => {
    const bookingDate = new Date(booking.bookingDate || booking.date || '');
    const now = new Date();
    const diffHours = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Allow cancellation if booking is at least 2 hours in the future
    return diffHours >= 2 && booking.status === 'CONFIRMED';
  };

  if (variant === 'admin') {
    // Check if this is an admin manual booking (user is null or has null fields)
    const isAdminBooking = !booking.user || !booking.user.name || !booking.user.phone;
    const displayName = isAdminBooking ? 'Admin Booking' : (booking.user?.name || 'Unknown User');
    const displayPhone = isAdminBooking ? 'Walk-in Customer' : (booking.user?.phone || 'N/A');
    const avatarLetter = isAdminBooking ? 'A' : (booking.user?.name?.charAt(0)?.toUpperCase() || 'U');

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.colors.card }]}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        {/* Admin View - User Info Header */}
        {showUserInfo && (
          <View style={styles.adminHeader}>
            <View style={[
              styles.avatar, 
              { backgroundColor: isAdminBooking ? '#F59E0B20' : theme.colors.primary + '20' }
            ]}>
              <Text style={[
                styles.avatarText, 
                { color: isAdminBooking ? '#F59E0B' : theme.colors.primary }
              ]}>
                {avatarLetter}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={[styles.userName, { color: theme.colors.text }]}>
                  {displayName}
                </Text>
                {isAdminBooking && (
                  <View style={[styles.adminBadge, { backgroundColor: '#F59E0B20' }]}>
                    <ProfileIcon size={12} color="#F59E0B" />
                    <Text style={styles.adminBadgeText}>Manual</Text>
                  </View>
                )}
              </View>
              <View style={styles.phoneRow}>
                <Ionicons name="call-outline" size={12} color={theme.colors.textSecondary} />
                <Text style={[styles.phoneText, { color: theme.colors.textSecondary }]}>
                  {displayPhone}
                </Text>
              </View>
            </View>
            <View style={[styles.amountBadge, { backgroundColor: '#10B981' + '20' }]}>
              <Text style={[styles.amountText, { color: '#10B981' }]}>
                {formatCurrency(booking.amount || booking.totalAmount || 0)}
              </Text>
            </View>
          </View>
        )}

        {/* Booked Slots */}
        <View style={styles.slotsSection}>
          <Text style={[styles.slotsLabel, { color: theme.colors.textSecondary }]}>
            Booked Slots:
          </Text>
          <View style={styles.slotsGrid}>
            {(booking.slots || []).map((slot, index) => (
              <View
                key={`${booking.id}-${slot.slotId}-${index}`}
                style={[styles.slotChip, { backgroundColor: theme.colors.primary + '15' }]}
              >
                <Text style={[styles.slotChipText, { color: theme.colors.primary }]}>
                  {formatTimeRange(slot.startTime, slot.endTime)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Status Row */}
        <View style={[styles.statusRow, { borderTopColor: theme.colors.border }]}>
          <Ionicons
            name={booking.status === 'CONFIRMED' ? 'checkmark-circle' : 'time-outline'}
            size={16}
            color={booking.status === 'CONFIRMED' ? '#10B981' : '#F59E0B'}
          />
          <Text
            style={[
              styles.statusText,
              { color: booking.status === 'CONFIRMED' ? '#10B981' : '#F59E0B' },
            ]}
          >
            {booking.status || 'PENDING'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // User View
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.card }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* User View - Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.turfName, { color: theme.colors.text }]}>
            {booking.serviceName}
          </Text>
          <StatusBadge status={(booking.status as 'CONFIRMED' | 'CANCELLED' | 'PENDING' | 'COMPLETED') || 'PENDING'} />
        </View>
        <Text style={[styles.bookingId, { color: theme.colors.textSecondary }]}>
          #{booking.reference || booking.id}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      {/* User View - Content */}
      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            {formatDateToDDMMMYYYY(booking.bookingDate || booking.date || '')}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            {booking.slotTime || formatSlots(booking.slots)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="cash-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.priceText, { color: theme.colors.primary }]}>
            {formatCurrency(booking.amount || booking.totalAmount || 0)}
          </Text>
        </View>

        {booking.createdAt && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.infoSubText, { color: theme.colors.textSecondary }]}>
              Booked on {formatDateToDDMMMYYYY(booking.createdAt)}
            </Text>
          </View>
        )}
      </View>

      {/* User View - Actions */}
      {showActions && isBookingCancellable() && onCancel && (
        <View style={[styles.actions, { borderTopColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: theme.colors.error }]}
            onPress={onCancel}
          >
            <Ionicons name="close-circle-outline" size={16} color={theme.colors.error} />
            <Text style={[styles.cancelButtonText, { color: theme.colors.error }]}>
              Cancel Booking
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  // User View Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  turfName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  bookingId: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    marginBottom: 16,
    opacity: 0.5,
  },
  content: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '500',
  },
  infoSubText: {
    fontSize: 13,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
  },
  actions: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#FEF2F2',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Admin View Styles
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phoneText: {
    fontSize: 13,
  },
  amountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  slotsSection: {
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 16,
  },
  slotsLabel: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  slotChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default BookingCard;
