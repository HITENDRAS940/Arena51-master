import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import RazorpayService from '../../services/RazorpayService';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { useAlert } from '../../components/shared/CustomAlert';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const PaymentCheckoutScreen = ({ route, navigation }: any) => {
  const { bookingId, amount, serviceName } = route.params;
  const { theme } = useTheme();
  const { showAlert } = useAlert();
  const [status, setStatus] = useState<'PENDING' | 'FAILED' | 'CANCELLED'>('PENDING');

  useEffect(() => {
    startPayment();
  }, []);

  const startPayment = async () => {
    setStatus('PENDING');
    try {
      const result = await RazorpayService.initiatePayment(bookingId, theme.colors.primary);
      
      if (result.status === 'SUCCESS') {
        // Navigate to polling screen
        navigation.replace('PaymentProcessing', { bookingId });
      } else if (result.status === 'CANCELLED') {
        setStatus('CANCELLED');
      } else {
        setStatus('FAILED');
      }
    } catch (error: any) {
      setStatus('FAILED');
      showAlert({
        title: 'Error',
        message: error.message || 'Payment initiation failed.',
        type: 'error',
      });
    }
  };

  const renderStatus = () => {
    switch (status) {
      case 'PENDING':
        return (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.statusTitle, { color: theme.colors.text }]}>Preparing Payment...</Text>
            <Text style={[styles.statusSubtitle, { color: theme.colors.textSecondary }]}>
              Please do not close the app while we connect to the secure gateway.
            </Text>
          </View>
        );
      case 'CANCELLED':
        return (
          <View style={styles.center}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.warning + '15' }]}>
              <Ionicons name="close-circle" size={60} color={theme.colors.warning} />
            </View>
            <Text style={[styles.statusTitle, { color: theme.colors.text }]}>Payment Cancelled</Text>
            <Text style={[styles.statusSubtitle, { color: theme.colors.textSecondary }]}>
              You cancelled the payment process. You can try again or go back and modify your booking.
            </Text>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={startPayment}
            >
              <Text style={styles.actionButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.textButton]}
              onPress={() => navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              })}
            >
              <Text style={[styles.textButtonText, { color: theme.colors.textSecondary }]}>Go Back</Text>
            </TouchableOpacity>
          </View>
        );
      case 'FAILED':
        return (
          <View style={styles.center}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.error + '15' }]}>
              <Ionicons name="alert-circle" size={60} color={theme.colors.error} />
            </View>
            <Text style={[styles.statusTitle, { color: theme.colors.text }]}>Payment Failed</Text>
            <Text style={[styles.statusSubtitle, { color: theme.colors.textSecondary }]}>
              Something went wrong while processing your payment. Please check your bank account or try another method.
            </Text>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={startPayment}
            >
              <Text style={styles.actionButtonText}>Retry Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.textButton]}
              onPress={() => navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              })}
            >
              <Text style={[styles.textButtonText, { color: theme.colors.textSecondary }]}>Go Back</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <ScreenWrapper style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Checkout</Text>
      </View>
      
      <View style={styles.paymentInfo}>
        <View style={styles.invoiceRow}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>BOOKING ID</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>#{bookingId}</Text>
        </View>
        <View style={styles.invoiceRow}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>MERCHANT</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>{serviceName}</Text>
        </View>
        <View style={styles.amountBox}>
          <Text style={[styles.amountLabel, { color: theme.colors.textSecondary }]}>Total Amount</Text>
          <Text style={[styles.amountValue, { color: theme.colors.text }]}>₹{amount}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {renderStatus()}
      </View>

      <View style={styles.footer}>
        <View style={styles.shieldRow}>
          <Ionicons name="shield-checkmark" size={16} color={theme.colors.success} />
          <Text style={[styles.shieldText, { color: theme.colors.textSecondary }]}>
            Secure 256-bit SSL Encrypted Payment
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(15),
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '800',
  },
  paymentInfo: {
    padding: scale(24),
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(8),
  },
  label: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: moderateScale(14),
    fontWeight: '800',
  },
  amountBox: {
    marginTop: verticalScale(20),
    alignItems: 'center',
    padding: scale(16),
    borderRadius: moderateScale(16),
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(5),
    elevation: 2,
  },
  amountLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    marginBottom: verticalScale(4),
  },
  amountValue: {
    fontSize: moderateScale(32),
    fontWeight: '900',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: scale(30),
  },
  center: {
    alignItems: 'center',
  },
  iconBox: {
    width: scale(100),
    height: scale(100),
    borderRadius: moderateScale(50),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  statusTitle: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    marginBottom: verticalScale(10),
    textAlign: 'center',
  },
  statusSubtitle: {
    fontSize: moderateScale(14),
    textAlign: 'center',
    lineHeight: moderateScale(20),
    fontWeight: '500',
    marginBottom: verticalScale(30),
  },
  actionButton: {
    width: '100%',
    height: verticalScale(56),
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '800',
  },
  textButton: {
    padding: scale(10),
  },
  textButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
  },
  footer: {
    padding: scale(24),
    alignItems: 'center',
  },
  shieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  shieldText: {
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
});

export default PaymentCheckoutScreen;
