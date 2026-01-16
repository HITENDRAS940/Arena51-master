import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useTheme } from '../../contexts/ThemeContext';

interface RefundPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  preview: {
    canCancel: boolean;
    originalAmount: number;
    refundAmount: number;
    deductionAmount: number;
    refundPercent: number;
    message: string;
    policyMessage: string;
    reasonNotAllowed?: string;
  } | null;
  loading: boolean;
  confirming: boolean;
}

export const RefundPreviewModal: React.FC<RefundPreviewModalProps> = ({
  visible,
  onClose,
  onConfirm,
  preview,
  loading,
  confirming,
}) => {
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Cancel Booking</Text>
            <TouchableOpacity onPress={onClose} disabled={confirming} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Calculating refund...</Text>
            </View>
          ) : preview ? (
            preview.canCancel ? (
              <>
                {/* Refund Details */}
                <View style={[styles.detailsContainer, { backgroundColor: theme.colors.surface }]}>
                  <View style={styles.row}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Original Amount</Text>
                    <Text style={[styles.value, { color: theme.colors.text }]}>₹{preview.originalAmount.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.row}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Refund ({preview.refundPercent}%)</Text>
                    <Text style={[styles.value, styles.refundAmount, { color: theme.colors.success || '#34C759' }]}>
                      ₹{preview.refundAmount.toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={styles.row}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Deduction</Text>
                    <Text style={[styles.value, styles.deductionAmount, { color: theme.colors.error || '#FF3B30' }]}>
                      ₹{preview.deductionAmount.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {/* Policy Message */}
                <View style={[styles.policyContainer, { backgroundColor: (theme.colors as any).warning + '10' || '#FFF9E6' }]}>
                  <Ionicons name="information-circle-outline" size={20} color={(theme.colors as any).warning || '#F59E0B'} />
                  <Text style={[styles.policyText, { color: theme.colors.textSecondary }]}>{preview.policyMessage}</Text>
                </View>

                {/* Message */}
                <Text style={[styles.message, { color: theme.colors.text }]}>{preview.message}</Text>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.keepButton, { backgroundColor: theme.colors.surface }]}
                    onPress={onClose}
                    disabled={confirming}
                  >
                    <Text style={[styles.keepButtonText, { color: theme.colors.text }]}>Keep Booking</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton, { backgroundColor: theme.colors.error || '#FF3B30' }]}
                    onPress={onConfirm}
                    disabled={confirming}
                  >
                    {confirming ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {/* Cannot Cancel */}
                <View style={styles.errorContainer}>
                  <Ionicons name="close-circle" size={moderateScale(64)} color={theme.colors.error || '#FF3B30'} />
                  <Text style={[styles.errorTitle, { color: theme.colors.text }]}>Cannot Cancel</Text>
                  <Text style={[styles.errorMessage, { color: theme.colors.textSecondary }]}>{preview.reasonNotAllowed}</Text>
                </View>
                
                <TouchableOpacity
                  style={[styles.button, styles.okButton, { backgroundColor: theme.colors.primary }]}
                  onPress={onClose}
                >
                  <Text style={styles.okButtonText}>OK</Text>
                </TouchableOpacity>
              </>
            )
          ) : null}
          <View style={{ height: verticalScale(16) }} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: moderateScale(32),
    borderTopRightRadius: moderateScale(32),
    padding: moderateScale(24),
    paddingBottom: Platform.OS === 'ios' ? verticalScale(40) : verticalScale(24),
    minHeight: verticalScale(350),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  closeButton: {
    padding: moderateScale(4),
  },
  loadingContainer: {
    alignItems: 'center',
    padding: verticalScale(40),
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  detailsContainer: {
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    marginBottom: verticalScale(20),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(12),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  value: {
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  refundAmount: {
    // color set dynamically
  },
  deductionAmount: {
    // color set dynamically
  },
  policyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(12),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(20),
  },
  policyText: {
    flex: 1,
    marginLeft: scale(8),
    fontSize: moderateScale(13),
    fontWeight: '500',
    lineHeight: moderateScale(18),
  },
  message: {
    fontSize: moderateScale(15),
    textAlign: 'center',
    marginBottom: verticalScale(24),
    fontWeight: '600',
    paddingHorizontal: scale(10),
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: scale(12),
  },
  button: {
    flex: 1,
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepButton: {
    // bgColor set dynamically
  },
  keepButtonText: {
    fontWeight: '700',
    fontSize: moderateScale(16),
  },
  cancelButton: {
    // bgColor set dynamically
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: moderateScale(16),
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(20),
  },
  errorTitle: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    marginTop: verticalScale(16),
  },
  errorMessage: {
    fontSize: moderateScale(14),
    textAlign: 'center',
    marginTop: verticalScale(8),
    lineHeight: moderateScale(20),
    paddingHorizontal: scale(20),
  },
  okButton: {
    marginTop: verticalScale(12),
  },
  okButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: moderateScale(16),
  },
});
