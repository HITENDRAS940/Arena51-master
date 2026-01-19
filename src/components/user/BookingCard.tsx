import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { UserBooking } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { format } from 'date-fns';

interface BookingCardProps {
  booking: UserBooking;
  onPress?: () => void;
  onCancel?: () => void;
  onPay?: () => void;
  showActions?: boolean;
}

const formatSlots = (slots: any[]) => {
  if (!slots || slots.length === 0) return 'No slots selected';
  if (slots.length === 1) {
    return `${slots[0].startTime} - ${slots[0].endTime}`;
  }
  return `${slots.length} slots • ${slots[0].startTime} - ${slots[slots.length - 1].endTime}`;
};

const isBookingCancellable = (booking: UserBooking) => {
  const bookingDate = new Date(booking.date);
  const now = new Date();
  const diffHours = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return diffHours >= 2 && booking.status === 'CONFIRMED';
};

const getStatusColor = (status: string, colors: any) => {
  switch (status.toUpperCase()) {
    case 'CONFIRMED': return colors.success || '#10B981';
    case 'PENDING':
    case 'PAYMENT_PENDING': return colors.warning || '#F59E0B';
    case 'CANCELLED': return colors.error || '#EF4444';
    case 'COMPLETED': return colors.primary;
    default: return colors.textSecondary;
  }
};

const getStatusTheme = (status: string, theme: any) => {
  const statusColor = getStatusColor(status, theme.colors);
  switch (status.toUpperCase()) {
    case 'CONFIRMED':
    case 'COMPLETED':
      return {
        gradient: ['#10B981', '#059669'],
        text: '#FFFFFF',
        secondaryText: 'rgba(255,255,255,0.8)',
        iconBg: 'rgba(255,255,255,0.2)',
        border: 'rgba(255,255,255,0.2)',
        accent: '#FFFFFF',
        statusIndicator: '#FFFFFF',
        badgeBg: 'rgba(255,255,255,0.25)',
      };
    case 'CANCELLED':
      return {
        gradient: ['#EF4444', '#DC2626'],
        text: '#FFFFFF',
        secondaryText: 'rgba(255,255,255,0.8)',
        iconBg: 'rgba(255,255,255,0.2)',
        border: 'rgba(255,255,255,0.2)',
        accent: '#FFFFFF',
        statusIndicator: '#FFFFFF',
        badgeBg: 'rgba(255,255,255,0.25)',
      };
    case 'PENDING':
    case 'PAYMENT_PENDING':
      return {
        gradient: ['#F59E0B', '#D97706'],
        text: '#FFFFFF',
        secondaryText: 'rgba(255,255,255,0.8)',
        iconBg: 'rgba(255,255,255,0.2)',
        border: 'rgba(255,255,255,0.2)',
        accent: '#FFFFFF',
        statusIndicator: '#FFFFFF',
        badgeBg: 'rgba(255,255,255,0.25)',
      };
    default:
      return {
        gradient: ['#FFFFFF', '#F8FAFC'],
        text: theme.colors.text,
        secondaryText: theme.colors.textSecondary,
        iconBg: `${theme.colors.primary}10`,
        border: theme.colors.border + '40',
        accent: theme.colors.primary,
        statusIndicator: statusColor,
        badgeBg: `${statusColor}15`,
      };
  }
};

const BookingCard: React.FC<BookingCardProps> = React.memo(({ 
  booking, 
  onPress,
  onCancel,
  onPay,
  showActions = true 
}) => {
  const { theme } = useTheme();
  
  const statusTheme = getStatusTheme(booking.status, theme);
  const cancellable = isBookingCancellable(booking);

  const handlePress = () => {
    if (onPress) onPress();
  };

  return (
    <View>
    <TouchableOpacity 
      style={styles.cardContainer} 
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={statusTheme.gradient as any}
        style={[styles.cardGradient, { borderWidth: 1, borderColor: statusTheme.border }]}
      >
        {/* Decorative Background Icon */}
        <View style={styles.backgroundDecor}>
          <Ionicons name="football-outline" size={moderateScale(150)} color={statusTheme.iconBg} />
        </View>

        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <View style={[styles.statusIndicator, { backgroundColor: statusTheme.statusIndicator }]} />
              <Text style={[styles.turfName, { color: statusTheme.text }]} numberOfLines={1}>
                {booking.serviceName}
              </Text>
            </View>
            <Text style={[styles.resourceName, { color: statusTheme.secondaryText }]}>
              {booking.resourceName}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusTheme.badgeBg }]}>
            <Text style={[styles.statusText, { color: statusTheme.text }]}>
              {booking.status === 'PAYMENT_PENDING' ? 'PENDING' : booking.status}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: statusTheme.iconBg }]} />

        {/* Details Section */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <View style={[styles.iconBox, { backgroundColor: statusTheme.iconBg }]}>
              <Ionicons name="calendar-outline" size={moderateScale(18)} color={statusTheme.text} />
            </View>
            <View>
              <Text style={[styles.detailLabel, { color: statusTheme.secondaryText }]}>Date</Text>
              <Text style={[styles.detailValue, { color: statusTheme.text }]}>
                {format(new Date(booking.date), 'EEE, dd MMM')}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={[styles.iconBox, { backgroundColor: statusTheme.iconBg }]}>
              <Ionicons name="time-outline" size={moderateScale(18)} color={statusTheme.text} />
            </View>
            <View>
              <Text style={[styles.detailLabel, { color: statusTheme.secondaryText }]}>Time</Text>
              <Text style={[styles.detailValue, { color: statusTheme.text }]} numberOfLines={1}>
                {formatSlots(booking.slots || [])}
              </Text>
            </View>
          </View>
        </View>

        {/* Price & Ref Row */}
        <View style={styles.infoRow}>
          <View style={styles.refGroup}>
            <Ionicons name="receipt-outline" size={moderateScale(14)} color={statusTheme.secondaryText} />
            <Text style={[styles.bookingId, { color: statusTheme.secondaryText }]}>
              #{booking.reference || booking.id}
            </Text>
          </View>
          <Text style={[styles.priceValue, { color: statusTheme.text }]}>
            ₹{booking.totalAmount}
          </Text>
        </View>

        {/* Footer / Actions */}
        {(booking.createdAt || (showActions && isBookingCancellable(booking) && onCancel)) && (
          <View style={[styles.footer, { borderTopColor: statusTheme.border }]}>
            {booking.createdAt ? (
              <View style={styles.bookedOnContainer}>
                <Ionicons name="checkmark-circle-outline" size={moderateScale(14)} color={statusTheme.text} />
                <Text style={[styles.bookedOn, { color: statusTheme.secondaryText }]}>
                  {format(new Date(booking.createdAt), 'dd MMM, hh:mm a')}
                </Text>
              </View>
            ) : <View />}

            {showActions && booking.status === 'PAYMENT_PENDING' && onPay && (
              <TouchableOpacity
                style={[
                  styles.payButton, 
                  { 
                    backgroundColor: statusTheme.text,
                  }
                ]}
                onPress={onPay}
              >
                <Text style={[styles.payButtonText, { color: statusTheme.gradient[0] }]}>Pay Now</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
    </View>
  );
});

BookingCard.displayName = 'BookingCard';

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: verticalScale(16),
    borderRadius: moderateScale(24),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(12),
    overflow: 'hidden',
  },
  cardGradient: {
    padding: scale(20),
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundDecor: {
    position: 'absolute',
    right: -scale(30),
    top: -verticalScale(30),
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(16),
  },
  headerContent: {
    flex: 1,
    marginRight: scale(12),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(4),
    gap: scale(8),
  },
  statusIndicator: {
    width: scale(8),
    height: scale(8),
    borderRadius: moderateScale(4),
  },
  turfName: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    letterSpacing: -0.3,
    flex: 1,
  },
  resourceName: {
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(12),
  },
  statusText: {
    fontSize: moderateScale(11),
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    marginBottom: verticalScale(16),
    opacity: 0.1,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(20),
    gap: scale(12),
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
  },
  iconBox: {
    width: scale(36),
    height: scale(36),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    marginBottom: verticalScale(2),
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  refGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  bookingId: {
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  priceValue: {
    fontSize: moderateScale(20),
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(16),
    paddingTop: verticalScale(16),
    borderTopWidth: 1,
  },
  bookedOnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  bookedOn: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(100),
    borderWidth: 1.5,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  cancelButtonText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  payButton: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(100),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(4),
    elevation: 3,
  },
  payButtonText: {
    fontSize: moderateScale(12),
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});

export default BookingCard;
