import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StatusBar,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { paymentAPI } from '../../services/paymentApi';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { LinearGradient } from 'expo-linear-gradient';

// Cashfree SDK Imports
import { 
  CFErrorResponse, 
  CFPaymentGatewayService 
} from 'react-native-cashfree-pg-sdk';
import {
  CFSession,
  CFEnvironment,
  CFUPIIntentCheckoutPayment,
} from 'cashfree-pg-api-contract';

const TopupPaymentScreen = ({ route, navigation }: any) => {
  const { amount, reference } = route.params;
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'CARD_NETBANKING' | null>(null);
  const [isStickyHeaderActive, setIsStickyHeaderActive] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  // Header Animations
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [-10, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    console.log('TOPUP_PAYMENT: Setting Cashfree Callback');
    
    const onVerify = (orderID: string) => {
      console.log('✅ Top-up Verified - Order ID:', orderID);
      setProcessing(false);
      Alert.alert(
        'Top-up Successful',
        `₹${amount} has been added to your wallet.`,
        [{ 
          text: 'Great', 
          onPress: () => {
             navigation.popToTop();
             navigation.navigate('Wallet');
          } 
        }]
      );
    };

    const onError = (error: CFErrorResponse, orderID: string) => {
      console.log('❌ Top-up Failed - Order ID:', orderID);
      setProcessing(false);
      Alert.alert(
        'Payment Failed', 
        `Error: ${error.getMessage()}`,
        [{ text: 'Try Again', onPress: () => setProcessing(false) }]
      );
    };

    CFPaymentGatewayService.setCallback({ onVerify, onError });

    const listenerId = scrollY.addListener(({ value }) => {
      if (value > 60 && !isStickyHeaderActive) {
        setIsStickyHeaderActive(true);
      } else if (value <= 60 && isStickyHeaderActive) {
        setIsStickyHeaderActive(false);
      }
    });

    return () => {
      scrollY.removeListener(listenerId);
      console.log('TOPUP_PAYMENT: Removing Cashfree Callback');
      CFPaymentGatewayService.removeCallback();
    };
  }, [isStickyHeaderActive, amount, navigation]);

  const handleConfirmPayment = () => {
    if (!selectedMethod) {
      Alert.alert('Select Payment Method', 'Please select a payment method to proceed.');
      return;
    }
    initiateTopup();
  };

  const initiateTopup = async () => {
    setProcessing(true);
    try {
      const payload = {
        internalBookingId: reference,
        amount: amount,
        customerId: user?.id.toString() || `CUST_${Date.now()}`,
        customerName: user?.name || 'User',
        customerEmail: user?.email || 'user@example.com',
        customerPhone: user?.phone || '0000000000',
        returnUrl: 'https://yourapp.com/payment-return',
        notifyUrl: "https://turf-booking-backend-o121.onrender.com/webhook/cashfree"
      };

      console.log('Creating Top-up Order with payload:', payload);
      const { orderId, paymentSessionId } = await paymentAPI.createOrder(payload);

      const session = new CFSession(
        paymentSessionId,
        orderId,
        CFEnvironment.SANDBOX // Change to PRODUCTION for live
      );

      if (selectedMethod === 'UPI') {
        console.log('Initiating UPI Intent Payment...');
        const cfPayment = new CFUPIIntentCheckoutPayment(session, null);
        CFPaymentGatewayService.doUPIPayment(cfPayment);
      } else {
        console.log('Initiating Web Payment (Card/NB)...');
        CFPaymentGatewayService.doWebPayment(session);
      }

    } catch (error: any) {
      console.error('Top-up Initiation Error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to initiate payment', [
          { text: 'OK', onPress: () => setProcessing(false) }
      ]);
      setProcessing(false);
    }
  };

  const renderStickyHeader = () => (
    <Animated.View 
      style={[
        styles.stickyHeader, 
        { 
          paddingTop: insets.top,
          backgroundColor: theme.colors.background,
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslate }],
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border + '20',
        }
      ]}
    >
      <View style={styles.stickyHeaderContent}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.stickyBackButton}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.stickyTitle, { color: theme.colors.text }]}>Complete Payment</Text>
        <View style={{ width: 44 }} />
      </View>
    </Animated.View>
  );

  return (
    <ScreenWrapper 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      safeAreaEdges={['bottom', 'left', 'right']}
    >
      <StatusBar barStyle="dark-content" />
      
      {renderStickyHeader()}

      <Animated.ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Secure</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.text, opacity: 0.5 }]}>Payment.</Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.summaryInfo}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>RECHARGE AMOUNT</Text>
            <Text style={[styles.summaryAmount, { color: theme.colors.text }]}>₹{amount}</Text>
          </View>
          <View style={[styles.summaryBadge, { backgroundColor: theme.colors.primary + '15' }]}>
            <Ionicons name="wallet-outline" size={24} color={theme.colors.primary} />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Payment Method</Text>
        </View>

        <TouchableOpacity 
          style={[
            styles.methodCard, 
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            selectedMethod === 'UPI' && { borderColor: theme.colors.primary, borderWidth: 2 }
          ]}
          onPress={() => setSelectedMethod('UPI')}
        >
          <View style={[styles.iconBox, { backgroundColor: '#5D2D9115' }]}>
            <Ionicons name="qr-code" size={24} color="#5D2D91" />
          </View>
          <View style={styles.methodInfo}>
            <Text style={[styles.methodTitle, { color: theme.colors.text }]}>UPI Intent</Text>
            <Text style={[styles.methodDesc, { color: theme.colors.textSecondary }]}>Pay via GPay, PhonePe, etc.</Text>
          </View>
          <View style={[styles.selectionCircle, selectedMethod === 'UPI' && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}>
            {selectedMethod === 'UPI' && <Ionicons name="checkmark" size={14} color="#FFF" />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.methodCard, 
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            selectedMethod === 'CARD_NETBANKING' && { borderColor: theme.colors.primary, borderWidth: 2 }
          ]}
          onPress={() => setSelectedMethod('CARD_NETBANKING')}
        >
          <View style={[styles.iconBox, { backgroundColor: '#FF8C0015' }]}>
            <Ionicons name="card" size={24} color="#FF8C00" />
          </View>
          <View style={styles.methodInfo}>
            <Text style={[styles.methodTitle, { color: theme.colors.text }]}>Cards & More</Text>
            <Text style={[styles.methodDesc, { color: theme.colors.textSecondary }]}>Credit/Debit cards, etc.</Text>
          </View>
          <View style={[styles.selectionCircle, selectedMethod === 'CARD_NETBANKING' && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}>
            {selectedMethod === 'CARD_NETBANKING' && <Ionicons name="checkmark" size={14} color="#FFF" />}
          </View>
        </TouchableOpacity>

        <View style={styles.footerInfo}>
          <Ionicons name="shield-checkmark" size={16} color={theme.colors.success} />
          <Text style={[styles.footerInfoText, { color: theme.colors.textSecondary }]}>Your payment is 100% secure with Cashfree</Text>
        </View>

        <View style={styles.spacer} />
      </Animated.ScrollView>

      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16, backgroundColor: theme.colors.background }]}>
        <TouchableOpacity
          style={[
            styles.payButton, 
            { backgroundColor: theme.colors.primary },
            (!selectedMethod || processing) && { opacity: 0.6 }
          ]}
          onPress={handleConfirmPayment}
          disabled={!selectedMethod || processing}
        >
          {processing ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.payButtonText}>Confirm & Pay ₹{amount}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  stickyHeaderContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  stickyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  stickyBackButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -10,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1.5,
  },
  headerSubtitle: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1.5,
    marginTop: -8,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 32,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '800',
  },
  summaryBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  methodDesc: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.6,
  },
  selectionCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  footerInfoText: {
    fontSize: 13,
    fontWeight: '600',
  },
  spacer: {
    height: 120,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  payButton: {
    height: 64,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
});

export default TopupPaymentScreen;
