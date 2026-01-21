import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Platform,
  Animated
} from 'react-native';
import { useAlert } from '../../components/shared/CustomAlert';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { useTheme, theme as themeObj } from '../../contexts/ThemeContext';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { DynamicBookingResponse, Service } from '../../types';
import HyperIcon from '../../components/shared/icons/HyperIcon';
import BackIcon from '../../components/shared/icons/BackIcon';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const BookingSummaryScreen = ({ route, navigation }: any) => {
  const { bookingData, service } = route.params as { bookingData: DynamicBookingResponse; service: Service };
  const { theme } = useTheme();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();

  const handleConfirmAndPay = () => {
    navigation.navigate('PaymentCheckout', {
      bookingId: bookingData.id,
      amount: bookingData.amountBreakdown.totalAmount,
      serviceName: service.name,
    });
  };

  // Animation values for sticky header
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isHeaderActive, setIsHeaderActive] = useState(false);

  useEffect(() => {
    const id = scrollY.addListener(({ value }) => {
      const active = value > 60;
      if (active !== isHeaderActive) {
        setIsHeaderActive(active);
      }
    });
    return () => scrollY.removeListener(id);
  }, [isHeaderActive]);

  // Sticky header animations
  const headerOpacity = scrollY.interpolate({
    inputRange: [60, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 60, 100],
    outputRange: [-100, -10, 0],
    extrapolate: 'clamp',
  });

  const mainHeaderTranslateY = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, -120],
    extrapolate: 'clamp',
  });


  return (
    <ScreenWrapper style={[styles.container, { backgroundColor: theme.colors.background }]} safeAreaEdges={['left', 'right']}>
      {/* Sticky Header */}
      <Animated.View 
        pointerEvents={isHeaderActive ? 'auto' : 'none'}
        style={[
          styles.stickyHeader, 
          { 
            backgroundColor: theme.colors.background,
            paddingTop: insets.top,
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslate }],
            borderBottomColor: theme.colors.border,
          }
        ]}
      >
        <View style={styles.stickyHeaderContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.stickyBackButton}
          >
            <BackIcon width={24} height={24} fill={theme.colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.stickyTitle, { color: theme.colors.text }]}>SUMMARY</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </Animated.View>

      {/* Main Header */}
      <Animated.View style={[
        styles.headerContainer, 
        { 
          position: 'absolute',
          top: Math.max(insets.top + 20, 20),
          left: 0,
          right: 0,
          zIndex: 5,
          transform: [{ translateY: mainHeaderTranslateY }]
        }
      ]}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerLeftSection}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.headerBackIconGroup}
            >
              <BackIcon width={28} height={28} fill={theme.colors.text} />
            </TouchableOpacity>
            <View style={styles.headerTitleGroup}>
              <Text style={[styles.headerTitleMain, { color: theme.colors.text }]}>
                Booking
              </Text>
              <Text style={[styles.headerTitleSub, { color: theme.colors.textSecondary }]}>
                Summary.
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <View style={{ height: (insets.top + 20) + 100 }} />
        
        <View style={styles.contentWrapper}>
          {/* Service Mini Card */}
          <View style={[styles.serviceCard, { backgroundColor: theme.colors.surface }]}>
            <HyperIcon size={60}/>
            <View style={styles.serviceInfo}>
              <Text style={[styles.serviceName, { color: theme.colors.text }]} numberOfLines={1}>
                {service.name}
              </Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={12} color={theme.colors.textSecondary} />
                <Text style={[styles.locationText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                  {service.location}
                </Text>
              </View>
            </View>
          </View>

        {/* Booking Details Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Booking Details.</Text>
          <View style={[styles.detailsCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.detailRow}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '15' }]}>
                <Ionicons name="calendar" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.detailText}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>DATE</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {format(new Date(bookingData.bookingDate), 'EEEE, MMMM dd, yyyy')}
                </Text>
              </View>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '15' }]}>
                <Ionicons name="time" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.detailText}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>TIME SLOTS</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {bookingData.startTime} - {bookingData.endTime}
                </Text>
              </View>
            </View>

            <View style={styles.detailDivider} />
            
            <View style={styles.detailRow}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '15' }]}>
                <Ionicons name="layers" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.detailText}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>COURT / RESOURCE</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {bookingData.resourceName || 'Not specified'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Offers & Coupons Area */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Offers & Coupons.</Text>
          <TouchableOpacity 
            style={[styles.couponButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary + '30' }]}
            onPress={() => showAlert({
              title: 'Coming Soon',
              message: 'Offers and coupons system is being integrated.',
              type: 'info'
            })}
          >
            <View style={styles.couponLeft}>
              <Ionicons name="pricetag" size={20} color={theme.colors.primary} />
              <Text style={[styles.couponText, { color: theme.colors.text }]}>Apply Coupon Code</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Payment Summary.</Text>
          <View style={[styles.detailsCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>Booking Amount</Text>
              <Text style={[styles.priceValue, { color: theme.colors.text }]}>₹{bookingData.amountBreakdown.slotSubtotal}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>Platform Fee</Text>
              <View style={styles.priceWithDiscount}>
                <Text style={[styles.strikethroughPrice, { color: theme.colors.textSecondary }]}>₹40</Text>
                <Text style={[styles.priceValue, { color: theme.colors.success || '#10B981' }]}>₹{bookingData.amountBreakdown.platformFee}</Text>
              </View>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>Taxes & GST</Text>
              <Text style={[styles.priceValue, { color: theme.colors.text }]}>₹0</Text>
            </View>
            
            <View style={styles.detailDivider} />
            
            <View style={styles.priceRow}>
              <Text style={[styles.totalLabel, { color: theme.colors.text }]}>Total Payable</Text>
              <Text style={[styles.totalPrice, { color: theme.colors.primary }]}>₹{bookingData.amountBreakdown.totalAmount}</Text>
            </View>
          </View>
        </View>

        {/* Cancellation Policy / T&C */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Guidelines & Policy.</Text>
          <View style={[styles.policyCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.policyItem}>
              <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.policyText, { color: theme.colors.textSecondary }]}>
                Refunds are only eligible if cancelled 24 hours prior to the slot time.
              </Text>
            </View>
            <View style={styles.policyItem}>
              <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.policyText, { color: theme.colors.textSecondary }]}>
                Please carry your own equipment or check rentals at the facility.
              </Text>
            </View>
            <View style={styles.policyItem}>
              <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.policyText, { color: theme.colors.textSecondary }]}>
                Entry might be denied for inappropriate footwear or behavior.
              </Text>
            </View>
          </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      {/* Sticky Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(24, insets.bottom + 8) }]}>
        <View style={styles.footerPrice}>
          <Text style={[styles.footerLabel, { color: theme.colors.textSecondary }]}>Total Amount</Text>
          <Text style={[styles.footerValue, { color: theme.colors.text }]}>₹{bookingData.amountBreakdown.totalAmount}</Text>
        </View>
        <TouchableOpacity 
          style={styles.payButtonWrapper}
          onPress={handleConfirmAndPay}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary || theme.colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.payButton}
          >
            <Text style={styles.payButtonText}>Confirm & Pay</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Sticky Header Styles
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: 1,
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(12),
  },
  stickyHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: verticalScale(60),
  },
  stickyBackButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyTitle: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  // Main Header Styles
  headerContainer: {
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(24),
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLeftSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginLeft: -scale(16),
  },
  headerBackIconGroup: { 
    padding: scale(8),
    marginTop: verticalScale(2),
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerTitleMain: {
    fontSize: moderateScale(34),
    fontWeight: 'condensedBold',
    fontFamily: themeObj.fonts.bold,
    lineHeight: moderateScale(40),
    letterSpacing: -1,
  },
  headerTitleSub: {
    fontSize: moderateScale(34),
    fontWeight: 'condensedBold',
    fontFamily: themeObj.fonts.bold,
    lineHeight: moderateScale(40),
    letterSpacing: -1,
    opacity: 0.5,
  },
  backButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: moderateScale(14),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(4),
    elevation: 3,
  },
  contentWrapper: {
    paddingHorizontal: scale(20),
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  serviceCard: {
    flexDirection: 'row',
    padding: scale(12),
    borderRadius: moderateScale(20),
    alignItems: 'center',
    marginBottom: verticalScale(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(10),
    elevation: 2,
  },
  serviceImage: {
    width: scale(60),
    height: scale(60),
    borderRadius: moderateScale(12),
    overflow: 'hidden',
  },
  serviceInfo: {
    marginLeft: scale(15),
    flex: 1,
  },
  serviceName: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    marginBottom: verticalScale(4),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  locationText: {
    fontSize: moderateScale(13),
    fontWeight: '500',
  },
  section: {
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    marginBottom: verticalScale(12),
    letterSpacing: -0.5,
  },
  detailsCard: {
    borderRadius: moderateScale(20),
    padding: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(8),
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: scale(44),
    height: scale(44),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: scale(15),
    flex: 1,
  },
  detailLabel: {
    fontSize: moderateScale(10),
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: verticalScale(4),
  },
  detailValue: {
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
  detailDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: verticalScale(12),
  },
  couponButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: scale(16),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  couponLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  couponText: {
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: verticalScale(4),
  },
  priceLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  priceValue: {
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
  priceWithDiscount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  strikethroughPrice: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  totalLabel: {
    fontSize: moderateScale(16),
    fontWeight: '800',
  },
  totalPrice: {
    fontSize: moderateScale(20),
    fontWeight: '800',
  },
  policyCard: {
    borderRadius: moderateScale(20),
    padding: scale(16),
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(12),
  },
  dot: {
    width: scale(6),
    height: scale(6),
    borderRadius: moderateScale(3),
    marginTop: verticalScale(6),
    marginRight: scale(10),
  },
  policyText: {
    flex: 1,
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingTop: verticalScale(15),
    paddingHorizontal: scale(20),
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerPrice: {
    flex: 1,
  },
  footerLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  footerValue: {
    fontSize: moderateScale(22),
    fontWeight: '800',
  },
  payButtonWrapper: {
    flex: 1.5,
    borderRadius: moderateScale(18),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(8),
    elevation: 5,
  },
  payButton: {
    height: verticalScale(56),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(10),
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(17),
    fontWeight: '800',
  },
});

export default BookingSummaryScreen;
