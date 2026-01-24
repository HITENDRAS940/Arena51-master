import React from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, ActivityIndicator } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../contexts/ThemeContext';

interface ServiceDetailFooterProps {
  entranceAnim: Animated.Value;
  footerCrossfadeAnim: Animated.AnimatedInterpolation<number>;
  showBookingSection: boolean;
  minPrice: number | null;
  selectedSlotPrice: number;
  selectedSlotKeys: string[];
  bookingLoading: boolean;
  onBookNow: () => void;
  onConfirmBooking: () => void;
  insetsBottom: number;
}

const ServiceDetailFooter: React.FC<ServiceDetailFooterProps> = ({
  entranceAnim,
  footerCrossfadeAnim,
  showBookingSection,
  minPrice,
  selectedSlotPrice,
  selectedSlotKeys,
  bookingLoading,
  onBookNow,
  onConfirmBooking,
  insetsBottom,
}) => {
  const { theme } = useTheme();

  return (
    <Animated.View
      style={[
        styles.footerContainer,
        {
          paddingBottom: Math.max(verticalScale(20), insetsBottom + verticalScale(10)),
          transform: [{
            translateY: entranceAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [verticalScale(100), 0]
            })
          }]
        }
      ]}
    >
      <View style={[
        styles.footer,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        styles.footerShadow
      ]}>
        {/* Detail View Footer Content */}
        <Animated.View
          style={[
            styles.detailsFooterContent,
            {
              opacity: footerCrossfadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0]
              }),
              transform: [{
                translateX: footerCrossfadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -scale(20)]
                })
              }],
              position: showBookingSection ? 'absolute' : 'relative',
              width: '100%',
              pointerEvents: showBookingSection ? 'none' : 'auto'
            }
          ]}
        >
          <View>
            <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>Starting from</Text>
            <Text style={[styles.priceValue, { color: theme.colors.primary }]}>
              {minPrice !== null ? `₹${minPrice}/hr` : 'Check Slots'}
            </Text>
          </View>
          <TouchableOpacity onPress={onBookNow} activeOpacity={0.8}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primary + 'DD']}
              style={styles.primaryButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.primaryButtonText}>Explore Slots</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Booking View Footer Content */}
        <Animated.View
          style={[
            styles.bookingFooterContent,
            {
              opacity: footerCrossfadeAnim,
              transform: [{
                translateX: footerCrossfadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [scale(20), 0]
                })
              }],
              position: !showBookingSection ? 'absolute' : 'relative',
              width: '100%',
              pointerEvents: !showBookingSection ? 'none' : 'auto'
            }
          ]}
        >
          <View style={styles.selectionInfo}>
            <Text style={[styles.totalAmount, { color: theme.colors.text }]}>₹{selectedSlotPrice}</Text>
            <Text style={[styles.slotCount, { color: theme.colors.textSecondary }]}>
              {selectedSlotKeys.length > 0 ? `${selectedSlotKeys.length} slots selected` : 'No slot selected'}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: theme.colors.primary },
              selectedSlotKeys.length === 0 && { opacity: 0.5 }
            ]}
            onPress={onConfirmBooking}
            disabled={selectedSlotKeys.length === 0 || bookingLoading}
            activeOpacity={0.8}
          >
            {bookingLoading ? (
              <ActivityIndicator color="#FFFFFF" size={moderateScale(24)} />
            ) : (
              <Text style={styles.primaryButtonText}>Confirm Booking</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(10),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(24),
    borderWidth: 1,
  },
  footerShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(20),
    elevation: 10,
  },
  detailsFooterContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingFooterContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionInfo: {
    flex: 1,
    marginRight: scale(8),
  },
  priceLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: verticalScale(2),
  },
  priceValue: {
    fontSize: moderateScale(22),
    fontWeight: '800',
  },
  totalAmount: {
    fontSize: moderateScale(24),
    fontWeight: '800',
  },
  slotCount: {
    fontSize: moderateScale(13),
    fontWeight: '500',
    marginTop: verticalScale(2),
  },
  primaryButton: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: scale(130),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(8),
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(17),
    letterSpacing: 0.5,
  },
});

export default ServiceDetailFooter;
