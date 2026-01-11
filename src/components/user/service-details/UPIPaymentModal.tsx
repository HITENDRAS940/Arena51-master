import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Linking,
  Alert,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { verticalScale, scale, moderateScale } from 'react-native-size-matters';
import DraggableModal from '../../shared/DraggableModal';

interface UPIPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onConfimPayment: () => void;
  amount: number;
  upiId: string;
  merchantName: string;
  reference: string;
  lockExpiresAt: string;
}

const UPIPaymentModal: React.FC<UPIPaymentModalProps> = ({
  visible,
  onClose,
  onConfimPayment,
  amount,
  upiId,
  merchantName,
  reference,
  lockExpiresAt,
}) => {
  const { theme } = useTheme();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!visible || !lockExpiresAt) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expires = new Date(lockExpiresAt).getTime();
      const difference = expires - now;

      if (difference <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [visible, lockExpiresAt]);

  const handlePayPress = async (appScheme: string = 'upi') => {
    // Shared parameters
    const params = `pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(reference)}`;
    
    // Construct URLs
    const schemes: { [key: string]: string } = {
      gpay: Platform.OS === 'ios' ? `tez://pay?${params}` : `upi://pay?${params}&pa=${upiId}&orgid=000000&mode=02&purpose=00&mc=0000`, // Standard GPay Android format
      phonepe: `phonepe://pay?${params}`,
      paytm: `paytmmp://pay?${params}`,
      upi: `upi://pay?${params}`,
    };

    let upiUrl = schemes[appScheme] || schemes.upi;
    
    // For GPay Android, it's often better to use the universal upi:// or intent if we had more control
    // But tez:// works on iOS. On Android gpay usually responds to upi://
    
    try {
      const supported = await Linking.canOpenURL(upiUrl);
      if (supported) {
        await Linking.openURL(upiUrl);
      } else {
        // Fallback to generic upi:// if specific app is not found supportable
        const genericUrl = `upi://pay?${params}`;
        if (appScheme !== 'upi') {
          const genericSupported = await Linking.canOpenURL(genericUrl);
          if (genericSupported) {
            await Linking.openURL(genericUrl);
            return;
          }
        }
        
        // If we reach here, neither specific nor generic worked via canOpenURL
        // On Android, sometimes canOpenURL fails but openURL works. Try one last time.
        if (Platform.OS === 'android') {
          try {
            await Linking.openURL(upiUrl);
          } catch (e) {
            Alert.alert('App Not Found', 'The selected UPI app is not installed or doesn\'t support this payment.');
          }
        } else {
          Alert.alert('App Not Found', 'The selected UPI app is not installed or doesn\'t support this payment.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open the payment app.');
    }
  };

  const copyToClipboard = () => {
    Clipboard.setString(upiId);
    Alert.alert('Copied', 'UPI ID copied to clipboard');
  };

  const UPIAppButton = ({ name, icon, scheme, color }: { name: string, icon: any, scheme: string, color: string }) => (
    <TouchableOpacity 
      style={[styles.appButton, { borderColor: theme.colors.border }]} 
      onPress={() => handlePayPress(scheme)}
    >
      <View style={[styles.appIconCircle, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.appButtonText, { color: theme.colors.text }]}>{name}</Text>
    </TouchableOpacity>
  );

  return (
    <DraggableModal
      visible={visible}
      onClose={onClose}
      height="auto"
      containerStyle={{ backgroundColor: theme.colors.background }}
    >
      <View style={styles.modalInner}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Payment Method.</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={[styles.timerContainer, { backgroundColor: theme.colors.primary + '10' }]}>
          <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.timerText, { color: theme.colors.primary }]}>
            {timeLeft === 'Expired' ? 'Slot release in progress...' : `Slot locked for ${timeLeft}`}
          </Text>
        </View>

        <View style={styles.amountSection}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>AMOUNT TO PAY</Text>
          <Text style={[styles.amount, { color: theme.colors.text }]}>₹{amount}</Text>
        </View>

        <View style={styles.appSelection}>
          <Text style={[styles.selectionTitle, { color: theme.colors.textSecondary }]}>PAY VIA</Text>
          <View style={styles.appGrid}>
            <UPIAppButton name="GPay" icon="logo-google" scheme="gpay" color="#4285F4" />
            <UPIAppButton name="PhonePe" icon="wallet" scheme="phonepe" color="#5F259F" />
            <UPIAppButton name="Paytm" icon="cash" scheme="paytm" color="#00BAF2" />
            <UPIAppButton name="Other" icon="apps" scheme="upi" color={theme.colors.primary} />
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.infoRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>UPI ID</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>{upiId}</Text>
            </View>
            <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
              <Ionicons name="copy-outline" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Merchant / Reference</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>{merchantName} | {reference}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.secondaryButton, { borderColor: theme.colors.border }]} 
            onPress={onConfimPayment}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>Already Paid? Confirm Booking</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>
          Selected slots are locked while you pay.
        </Text>
      </View>
    </DraggableModal>
  );
};

const styles = StyleSheet.create({
  modalInner: {
    padding: scale(24),
    paddingTop: verticalScale(8),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: '800',
  },
  closeButton: {
    padding: 4,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(20),
  },
  timerText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    marginLeft: 8,
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  label: {
    fontSize: moderateScale(11),
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  amount: {
    fontSize: moderateScale(36),
    fontWeight: '900',
    letterSpacing: -1,
  },
  appSelection: {
    marginBottom: verticalScale(24),
  },
  selectionTitle: {
    fontSize: moderateScale(10),
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: verticalScale(12),
    textAlign: 'center',
  },
  appGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: scale(4),
  },
  appButton: {
    alignItems: 'center',
    width: '22%',
  },
  appIconCircle: {
    width: moderateScale(54),
    height: moderateScale(54),
    borderRadius: moderateScale(27),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  appButtonText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
  infoCard: {
    borderRadius: moderateScale(20),
    borderWidth: 1,
    padding: scale(16),
    marginBottom: verticalScale(20),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(8),
  },
  infoLabel: {
    fontSize: moderateScale(9),
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
  copyButton: {
    padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  actions: {
    gap: verticalScale(12),
  },
  secondaryButton: {
    height: verticalScale(54),
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  secondaryButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '800',
  },
  footerNote: {
    marginTop: verticalScale(16),
    textAlign: 'center',
    fontSize: moderateScale(11),
    color: '#999',
    paddingHorizontal: scale(20),
  },
});

export default UPIPaymentModal;
