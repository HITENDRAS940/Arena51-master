import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import RazorpayService from '../../services/RazorpayService';

/**
 * PaymentLauncherScreen
 * 
 * Minimal screen that ONLY opens Razorpay checkout.
 * 
 * WHY separate screen:
 * - Single responsibility: launch payment, nothing else
 * - On ANY result (success/cancel/fail), we navigate AWAY
 * - navigation.replace ensures BookingConfirmationLoaderScreen mounts fresh
 * - Fresh mount = fresh polling = reliable Android behavior
 * 
 * CRITICAL: We don't trust Razorpay result for correctness.
 * Backend (via polling) is the single source of truth.
 */
const PaymentLauncherScreen = ({ route, navigation }: any) => {
  const { bookingId, orderData } = route.params;
  const { theme } = useTheme();
  
  // Guard against double checkout (React StrictMode, hot reload, etc.)
  const checkoutTriggered = useRef(false);

  useEffect(() => {
    if (!orderData || checkoutTriggered.current) return;
    checkoutTriggered.current = true;

    const launchPayment = async () => {
      console.log(`[PaymentLauncher] Opening Razorpay for booking #${bookingId}`);
      
      try {
        const result = await RazorpayService.openCheckout(bookingId, orderData);
        console.log(`[PaymentLauncher] Razorpay result: ${result.status}`);
        
        // WHY we ignore the result status:
        // - SUCCESS doesn't mean booking is confirmed (webhook may be delayed)
        // - CANCELLED doesn't mean booking failed (payment may have gone through)
        // - FAILED is informational only
        // Backend is the ONLY source of truth.
        
      } catch (error: any) {
        console.error(`[PaymentLauncher] Error:`, error);
        // Even on error, we navigate to confirmation screen
        // Let the polling determine actual booking state
      }
      
      // CRITICAL: Always navigate away after Razorpay closes
      // navigation.replace forces full remount of next screen
      console.log(`[PaymentLauncher] Navigating to confirmation loader...`);
      navigation.replace('BookingConfirmationLoader', { bookingId });
    };

    launchPayment();
  }, [bookingId, orderData, navigation]);

  // Brief loading state shown before Razorpay opens
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator 
        size="large" 
        color={theme.colors.primary} 
        style={{ transform: [{ scale: 1.5 }] }} 
      />
      <Text style={[styles.text, { color: theme.colors.text }]}>
        Opening Payment Gateway...
      </Text>
      <Text style={[styles.subtext, { color: theme.colors.textSecondary }]}>
        Please wait
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 40 
  },
  text: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginTop: 32 
  },
  subtext: { 
    fontSize: 14, 
    marginTop: 8 
  },
});

export default PaymentLauncherScreen;
