import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Platform,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { DynamicBookingResponse, Service } from '../../types';

const BookingSummaryScreen = ({ route, navigation }: any) => {
  const { bookingData, service } = route.params as { bookingData: DynamicBookingResponse; service: Service };
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const handleConfirmAndPay = () => {
    navigation.navigate('PaymentCheckout', {
      bookingId: bookingData.id,
      amount: bookingData.amountBreakdown.totalAmount,
      serviceName: service.name,
    });
  };

  return (
    <ScreenWrapper style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Summary.</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Service Mini Card */}
        <View style={[styles.serviceCard, { backgroundColor: theme.colors.surface }]}>
          <Image 
            source={{ uri: service.image }} 
            style={styles.serviceImage} 
            resizeMode="cover"
          />
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

            {bookingData.resourceName && (
              <>
                <View style={styles.detailDivider} />
                <View style={styles.detailRow}>
                  <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '15' }]}>
                    <Ionicons name="layers" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.detailText}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>COURT / RESOURCE</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                      {bookingData.resourceName}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Offers & Coupons Area */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Offers & Coupons.</Text>
          <TouchableOpacity 
            style={[styles.couponButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary + '30' }]}
            onPress={() => Alert.alert('Coming Soon', 'Offers and coupons system is being integrated.')}
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
              <Text style={[styles.priceValue, { color: theme.colors.text }]}>₹{bookingData.amountBreakdown.platformFee}</Text>
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

        <View style={{ height: 120 }} />
      </ScrollView>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  serviceCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  serviceInfo: {
    marginLeft: 15,
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  detailsCard: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 15,
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  detailDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 12,
  },
  couponButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  couponLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  couponText: {
    fontSize: 15,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '800',
  },
  policyCard: {
    borderRadius: 20,
    padding: 16,
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 10,
  },
  policyText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingTop: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerPrice: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  payButtonWrapper: {
    flex: 1.5,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  payButton: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});

export default BookingSummaryScreen;
