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
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  paymentInfo: {
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 14,
    fontWeight: '800',
  },
  amountBox: {
    marginTop: 20,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '900',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  center: {
    alignItems: 'center',
  },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  statusSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 30,
  },
  actionButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  textButton: {
    padding: 10,
  },
  textButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  shieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shieldText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default PaymentCheckoutScreen;
