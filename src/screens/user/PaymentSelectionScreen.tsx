import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StatusBar, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/shared/Button';
import { paymentAPI } from '../../services/paymentApi';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { DynamicBookingResponse } from '../../types';
import { walletAPI } from '../../services/api';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';

// Cashfree SDK Imports
import { 
  CFErrorResponse, 
  CFPaymentGatewayService 
} from 'react-native-cashfree-pg-sdk';
import {
  CFSession,
  CFEnvironment,
  CFUPIIntentCheckoutPayment
} from 'cashfree-pg-api-contract';

const PaymentSelectionScreen = ({ route, navigation }: any) => {
  const { bookingRequest, bookingResponse } = route.params;
  const totalAmount = bookingResponse.amountBreakdown.totalAmount;
  const { theme } = useTheme();
  const { user, updateUser } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'CARD_NETBANKING' | 'WALLET'>('UPI');
  const [processing, setProcessing] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(user?.walletBalance ?? null);
  const [couponCode, setCouponCode] = useState('');

  const scrollY = React.useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [-10, 0],
    extrapolate: 'clamp',
  });

  // Step 3: Set payment callback (componentDidMount / useEffect)
  useEffect(() => {
    if (bookingResponse.status === 'CONFIRMED') {
      Alert.alert(
        'Booking Confirmed',
        'Your booking is already confirmed.',
        [{ 
          text: 'View Bookings', 
          onPress: () => {
            navigation.popToTop();
            navigation.navigate('MainTabs', { screen: 'Bookings' });
          } 
        }]
      );
      return;
    }

    console.log('MOUNTED: Setting Cashfree Callback');
    
    const onVerify = (orderID: string) => {
      console.log('✅ Payment Verified - Order ID:', orderID);
      setProcessing(false);
      Alert.alert(
        'Booking Confirmed',
        `Your payment was successful.\nOrder ID: ${orderID}`,
        [{ 
          text: 'View Bookings', 
          onPress: () => {
            navigation.popToTop();
            navigation.navigate('MainTabs', { screen: 'Bookings' });
          } 
        }]
      );
    };

    const onError = (error: CFErrorResponse, orderID: string) => {
      console.log('❌ Payment Failed - Order ID:', orderID);
      console.log('Error:', error.getMessage());
      setProcessing(false);
      Alert.alert(
        'Payment Failed', 
        `Error: ${error.getMessage()}\nOrder ID: ${orderID}`
      );
    };

    CFPaymentGatewayService.setCallback({ onVerify, onError });

    fetchWalletBalance();

    return () => {
      console.log('UNMOUNTED: Removing Cashfree Callback');
      CFPaymentGatewayService.removeCallback();
    };
  }, [navigation]);

  const fetchWalletBalance = async () => {
    if (!user) return;
    try {
      const response = await walletAPI.getBalance();
      const balance = response.data.balance;
      setWalletBalance(balance);
      await updateUser({ ...user, walletBalance: balance });
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
    }
  };

  const initiatePayment = async () => {
    if (selectedMethod === 'WALLET') {
      handleWalletPayment();
      return;
    }
    setProcessing(true);
    try {
      // Step 1: Create Order (Backend)
      const internalOrderId = bookingResponse.reference;
      const payload = {
        internalBookingId: internalOrderId,
        amount: totalAmount,
        customerId: `CUST_${Date.now()}`, 
        customerName: user?.name || 'Guest User',
        customerEmail: user?.email || 'guest@example.com',
        customerPhone: user?.phone || '9876543210',
        returnUrl: 'https://yourapp.com/payment-return',
        notifyUrl: 'https://turf-booking-backend-o121.onrender.com/webhook/cashfree'
      };

      console.log('Creating Order with payload:', payload);
      const {  orderId,  paymentSessionId} = await paymentAPI.createOrder(payload);

      console.log('Payment Session ID:', paymentSessionId);
      console.log('Order ID:', orderId);

      // Step 2: Create Session
      const session = new CFSession(
        paymentSessionId,
        orderId,
        CFEnvironment.SANDBOX
      );

      if (selectedMethod === 'UPI') {
        // Step 2.1: Initiate UPI Intent Payment
        console.log('Initiating UPI Intent Payment...');
        const cfPayment = new CFUPIIntentCheckoutPayment(session, null);
        CFPaymentGatewayService.doUPIPayment(cfPayment);
      } else {
        // Step 2.2: Initiate Web Payment (Card, Netbanking, etc.)
        console.log('Initiating Web Payment (Card/NB)...');
        CFPaymentGatewayService.doWebPayment(session);
      }

    } catch (error: any) {
      console.error('Payment Initiation Error:', error);
      Alert.alert('Error', 'Failed to initiate payment');
      setProcessing(false);
    }
  };

  const handleWalletPayment = async () => {
    if (walletBalance === null || walletBalance < totalAmount) {
      Alert.alert('Insufficient Balance', 'Your wallet balance is not enough to complete this booking.');
      return;
    }

    Alert.alert(
      'Wallet Payment',
      `Pay ₹${totalAmount} using your wallet balance?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Now',
          onPress: async () => {
            setProcessing(true);
            try {
              const response = await walletAPI.payWithWallet(bookingResponse.id);
              console.log('Wallet Payment response:', response.data);
              
              // Verify success (assuming API returns updated balance or status)
              Alert.alert(
                'Booking Confirmed',
                'Your payment was successful using wallet balance.',
              [{ 
                  text: 'View Bookings', 
                  onPress: () => {
                    navigation.popToTop();
                    navigation.navigate('MainTabs', { screen: 'Bookings' });
                  } 
                }]
              );
            } catch (error: any) {
              console.error('Wallet Payment error:', error);
              Alert.alert('Payment Failed', error.response?.data?.message || 'Something went wrong with the wallet payment.');
            } finally {
              setProcessing(false);
              fetchWalletBalance(); // Update balance
            }
          }
        }
      ]
    );
  };

  if (processing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.overlayText, { color: theme.colors.text }]}>
          Verifying Payment Status...
        </Text>
        <Text style={[styles.overlaySubText, { color: theme.colors.textSecondary }]}>
          Please do not press back or close the app
        </Text>
      </View>
    );
  }

  return (
    <ScreenWrapper 
      style={styles.container} 
      safeAreaEdges={['left', 'right']}
    >
      
      {/* Sticky Header */}
      <Animated.View 
        style={[
          styles.stickyHeader, 
          { 
            paddingTop: insets.top,
            backgroundColor: theme.colors.background,
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslate }],
            borderBottomColor: theme.colors.border + '20',
          }
        ]}
      >
        <View style={styles.stickyHeaderContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.stickyBackButton}>
             <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.stickyTitle, { color: theme.colors.text }]}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>
      </Animated.View>

      <Animated.ScrollView 
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
        onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Header */}
        <View style={styles.mainHeader}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonIcon}>
                    <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitleLarge, { color: theme.colors.text }]}>
                    Checkout.
                </Text>
            </View>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
                Complete payment.
            </Text>
        </View>
        {/* Booking Summary */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.card}
        >
          <Text style={styles.cardLabel}>Amount to Pay</Text>
          <Text style={styles.cardAmount}>₹{totalAmount}</Text>
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Ionicons name="football-outline" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.cardDetail}>{bookingResponse.serviceId ? bookingResponse.serviceName : 'Consolidated Booking'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.cardDetail}>
              {bookingResponse.bookingDate ? format(new Date(bookingResponse.bookingDate), 'EEE, dd MMM yyyy') : 'Date TBD'}
            </Text>
          </View>

          {bookingResponse.bookingType === 'MULTI_RESOURCE' && bookingResponse.childBookings ? (
            <View style={{ marginTop: 8 }}>
              <Text style={[styles.cardLabel, { fontSize: 12, marginBottom: 6, color: 'rgba(255,255,255,0.9)' }]}>Split across grounds:</Text>
              {bookingResponse.childBookings.map((child: DynamicBookingResponse, index: number) => (
                <View key={index} style={[styles.detailRow, { marginBottom: 4, marginLeft: 4 }]}>
                   <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.6)" />
                   <Text style={[styles.cardDetail, { fontSize: 13 }]}>
                     {child.startTime} - {child.endTime}
                   </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.cardDetail}>
                {bookingResponse.startTime} - {bookingResponse.endTime}
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Coupons and Offers */}
        <View style={[styles.sectionContainer, { marginTop: 8 }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Coupons & Offers</Text>
          <View style={[styles.couponInputContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Ionicons name="pricetag-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.couponPlaceholder, { color: theme.colors.textSecondary }]}>Apply Coupon Code</Text>
            <TouchableOpacity style={styles.applyButton}>
              <Text style={[styles.applyButtonText, { color: theme.colors.primary }]}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Simplified Price Breakdown */}
        {bookingResponse.amountBreakdown && (
          <View style={[styles.breakdownCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.breakdownTitle, { color: theme.colors.text }]}>Price Breakdown</Text>
            
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: theme.colors.textSecondary }]}>Slot Subtotal</Text>
              <Text style={[styles.breakdownValue, { color: theme.colors.text }]}>₹{bookingResponse.amountBreakdown.slotSubtotal}</Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: theme.colors.textSecondary }]}>Platform Fee</Text>
              <Text style={[styles.breakdownValue, { color: theme.colors.text }]}>₹{bookingResponse.amountBreakdown.platformFee.toFixed(2)}</Text>
            </View>

            <View style={[styles.breakdownDivider, { backgroundColor: theme.colors.border }]} />
            
            <View style={styles.breakdownRow}>
              <Text style={[styles.totalLabel, { color: theme.colors.text }]}>Total Amount</Text>
              <Text style={[styles.totalValue, { color: theme.colors.primary }]}>₹{bookingResponse.amountBreakdown.totalAmount}</Text>
            </View>
          </View>
        )}

        {/* Wallet Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Wallet Balance</Text>
          <TouchableOpacity 
            style={[
              styles.walletCard, 
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              selectedMethod === 'WALLET' && { borderColor: theme.colors.primary, borderWidth: 2 }
            ]}
            onPress={() => setSelectedMethod('WALLET')}
            disabled={walletBalance !== null && walletBalance < totalAmount}
          >
            <View style={styles.walletHeader}>
              <View style={[styles.walletIconBox, { backgroundColor: theme.colors.primary + '15' }]}>
                <Ionicons name="wallet" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.walletInfo}>
                <Text style={[styles.walletLabelText, { color: theme.colors.text }]}>Available Balance</Text>
                <Text style={[styles.walletAmountText, { color: (walletBalance !== null && walletBalance < totalAmount) ? theme.colors.error : theme.colors.success }]}>
                  ₹{walletBalance?.toFixed(2) ?? '0.00'}
                </Text>
              </View>
              {walletBalance !== null && walletBalance >= totalAmount && (
                <View style={[styles.selectionCircle, selectedMethod === 'WALLET' && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}>
                  {selectedMethod === 'WALLET' && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </View>
              )}
            </View>
            {walletBalance !== null && walletBalance < totalAmount && (
              <Text style={[styles.insufficientText, { color: theme.colors.error }]}>
                Insufficient balance to pay for this booking
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Other Payment Methods</Text>

        {/* Payment Methods Selection */}
        <TouchableOpacity 
          style={[
            styles.methodOption, 
            selectedMethod === 'UPI' && styles.methodSelected,
            { borderColor: theme.colors.navy }
          ]}
          onPress={() => setSelectedMethod('UPI')}
        >
          <View style={styles.methodHeader}>
            <Ionicons name="phone-portrait-outline" size={24} color={selectedMethod === 'UPI' ? theme.colors.navy : theme.colors.textSecondary} />
            <Text style={[styles.methodTitle, { color: theme.colors.text }]}>UPI Apps</Text>
            {selectedMethod === 'UPI' && <Ionicons name="checkmark-circle" size={24} color={theme.colors.navy} />}
          </View>
          <Text style={styles.methodDesc}>PhonePe, Google Pay, Paytm, etc.</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.methodOption, 
            selectedMethod === 'CARD_NETBANKING' && styles.methodSelected,
            { borderColor: theme.colors.navy }
          ]}
          onPress={() => setSelectedMethod('CARD_NETBANKING')}
        >
           <View style={styles.methodHeader}>
            <Ionicons name="card-outline" size={24} color={selectedMethod === 'CARD_NETBANKING' ? theme.colors.navy : theme.colors.textSecondary} />
            <Text style={[styles.methodTitle, { color: theme.colors.text }]}>Card & Netbanking</Text>
            {selectedMethod === 'CARD_NETBANKING' && <Ionicons name="checkmark-circle" size={24} color={theme.colors.navy} />}
          </View>
          <Text style={styles.methodDesc}>Credit/Debit Cards, Netbanking</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.methodOption, 
            selectedMethod === 'WALLET' && styles.methodSelected,
            { borderColor: theme.colors.navy },
            (walletBalance !== null && walletBalance < totalAmount) && { opacity: 0.6 }
          ]}
          onPress={() => setSelectedMethod('WALLET')}
        >
          <View style={styles.methodHeader}>
            <Ionicons name="wallet-outline" size={24} color={selectedMethod === 'WALLET' ? theme.colors.navy : theme.colors.textSecondary} />
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 8 }}>
              <Text style={[styles.methodTitle, { color: theme.colors.text }]}>Wallet Credits</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: (walletBalance !== null && walletBalance < totalAmount) ? theme.colors.error : theme.colors.success }}>
                ₹{walletBalance ?? 0}
              </Text>
            </View>
            {selectedMethod === 'WALLET' && <Ionicons name="checkmark-circle" size={24} color={theme.colors.navy} />}
          </View>
          <Text style={styles.methodDesc}>
            { (walletBalance !== null && walletBalance < totalAmount) 
              ? 'Insufficient balance to pay' 
              : 'Fast & secure one-tap payment' }
          </Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            Secure payment via Cashfree
          </Text>
        </View>
      </Animated.ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20, backgroundColor: theme.colors.surface }]}>
        <Button
          title="Pay Now"
          onPress={initiatePayment}
          loading={false}
          style={styles.payButton}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  card: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
  },
  cardLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 8 },
  cardAmount: { color: '#fff', fontSize: 32, fontWeight: '800' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 16 },
  cardDetail: { color: '#fff', fontSize: 15, fontWeight: '500' },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  infoText: { fontSize: 14 },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  payButton: { height: 56, borderRadius: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 12 },
  methodOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    marginBottom: 12,
  },
  methodSelected: {
    borderWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  methodHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  methodTitle: { fontSize: 16, fontWeight: '600', flex: 1 },
  methodDesc: { fontSize: 13, color: '#666', marginLeft: 36 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
  },
  overlaySubText: {
    marginTop: 8,
    fontSize: 14,
  },
  breakdownCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  ruleText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontStyle: 'italic',
  },
  breakdownDivider: {
    height: 1,
    marginVertical: 12,
    opacity: 0.5,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  
  // New Styles
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: 1,
  },
  stickyHeaderContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  stickyBackButton: {
    position: 'absolute',
    left: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  mainHeader: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: -8,
  },
  backButtonIcon: {
    padding: 8,
  },
  headerTitleLarge: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
    opacity: 0.5,
    marginTop: -4,
    marginLeft: 36,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  couponInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 12,
  },
  couponPlaceholder: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  applyButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  applyButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  walletCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  walletIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletInfo: {
    flex: 1,
  },
  walletLabelText: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.7,
  },
  walletAmountText: {
    fontSize: 18,
    fontWeight: '800',
  },
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  insufficientText: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '500',
    fontStyle: 'italic',
  },
});

export default PaymentSelectionScreen;
