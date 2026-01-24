import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Linking,
} from 'react-native';
import { useAlert } from '../shared/CustomAlert';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import DraggableModal from '../shared/DraggableModal';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { bookingAPI } from '../../services/api';
import { DynamicBookingResponse } from '../../types';
import { format } from 'date-fns';
import { useRefundPreview } from '../../hooks/useRefundPreview';
import { useCancelBooking } from '../../hooks/useCancelBooking';
import { RefundPreviewModal } from './RefundPreviewModal';

interface BookingDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  bookingId: number | null;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  visible,
  onClose,
  bookingId,
}) => {
  const { theme } = useTheme();
  const { showAlert } = useAlert();
  const [details, setDetails] = useState<DynamicBookingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refundModalVisible, setRefundModalVisible] = useState(false);

  const { preview, loading: previewLoading, fetchPreview, resetPreview } = useRefundPreview();
  const { cancelBooking, loading: cancelLoading } = useCancelBooking();
  const { user } = useAuth();

  useEffect(() => {
    if (visible && bookingId) {
      fetchDetails();
    } else if (!visible) {
      setDetails(null);
      setError(null);
    }
  }, [visible, bookingId]);

  const fetchDetails = async () => {
    if (!bookingId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await bookingAPI.getBookingDetails(bookingId);
      setDetails(response.data);
    } catch (err: any) {
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPress = async () => {
    if (!details) return;
    setRefundModalVisible(true);
    try {
      await fetchPreview(details.id);
    } catch (err: any) {
      // Alert already handled in hook if we want, but let's be safe
      showAlert({
        title: 'Error',
        message: err.message || 'Failed to fetch refund details',
        type: 'error'
      });
      setRefundModalVisible(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!details) return;
    try {
      const result = await cancelBooking(details.id);
      setRefundModalVisible(false);
      resetPreview();
      
      showAlert({
        title: 'Booking Cancelled',
        message: result.message,
        type: 'success',
        buttons: [
          {
            text: 'OK',
            onPress: () => {
              fetchDetails(); // Refresh details to show CANCELLED status
            },
          },
        ]
      });
    } catch (err: any) {
      showAlert({
        title: 'Error',
        message: err.message || 'Failed to cancel booking',
        type: 'error'
      });
    }
  };

  const handleDownloadInvoice = async () => {
    if (!details || !user?.token) return;
    
    try {
      const invoiceUrl = `${bookingAPI.getInvoiceUrl(details.id)}?token=${user.token}`;
      const supported = await Linking.canOpenURL(invoiceUrl);
      
      if (supported) {
        await Linking.openURL(invoiceUrl);
      } else {
        await Linking.openURL(invoiceUrl);
      }
    } catch (err) {
      showAlert({
        title: 'Error',
        message: 'An unexpected error occurred while trying to access the invoice.',
        type: 'error'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
      case 'SUCCESS':
        return theme.colors.success;
      case 'PENDING':
      case 'PAYMENT_PENDING':
        return theme.colors.warning;
      case 'CANCELLED':
      case 'FAILED':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const InfoRow = ({ label, value, icon, last }: { label: string; value: string; icon: string; last?: boolean }) => (
    <View style={[styles.infoRow, !last && { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }]}>
      <View style={[styles.iconContainer, { backgroundColor: '#262626' }]}>
        <Ionicons name={icon as any} size={moderateScale(18)} color={theme.colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: '#9CA3AF' }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: '#FFFFFF' }]}>{value}</Text>
      </View>
    </View>
  );


  return (
    <>
    <DraggableModal
      visible={visible}
      onClose={onClose}
      containerStyle={{ backgroundColor: '#121212' }}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: '#FFFFFF' }]}>Booking Details</Text>
          <Text style={[styles.subtitle, { color: '#9CA3AF' }]}>
            {details?.reference ? `#${details.reference}` : 'Full breakdown of your booking'}
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: '#1A1A1A' }]}>
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Fetching details...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
            <Text style={[styles.errorText, { color: theme.colors.text }]}>{error}</Text>
            <TouchableOpacity onPress={fetchDetails} style={styles.retryButton}>
              <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : details ? (
          <View style={styles.detailsBody}>
            {/* Status Section */}
            <View style={[styles.statusBanner, { backgroundColor: getStatusColor(details.status) + '15' }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(details.status) }]} />
              <Text style={[styles.statusBannerText, { color: getStatusColor(details.status) }]}>
                {details.status?.replace('_', ' ')}
              </Text>
            </View>

            {/* Main Info Card */}
            <View style={[styles.card, { backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.05)' }]}>
               <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>General Information</Text>
               <InfoRow label="Service Name" value={details.serviceName} icon="business-outline" />
               <InfoRow label="Resource" value={details.resourceName || 'All Resources'} icon="apps-outline" />
               <InfoRow label="Booking Date" value={format(new Date(details.bookingDate), 'EEEE, do MMMM yyyy')} icon="calendar-outline" />
               <InfoRow label="Time Slot" value={`${details.startTime} - ${details.endTime}`} icon="time-outline" last />
            </View>
 
            {/* User Details */}
            {details.user && (
              <View style={[styles.card, { backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.05)' }]}>
                <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>Customer Details</Text>
                <InfoRow label="Name" value={details.user.name} icon="person-outline" />
                <InfoRow label="Phone" value={details.user.phone} icon="call-outline" />
                <InfoRow label="Email" value={details.user.email} icon="mail-outline" last />
              </View>
            )}
 
            {/* Amount Breakdown */}
            <View style={[styles.card, { backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.05)' }]}>
              <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>Payment Summary</Text>
              
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: '#9CA3AF' }]}>Subtotal</Text>
                <Text style={[styles.priceValue, { color: '#FFFFFF' }]}>
                  {details.amountBreakdown.currency} {details.amountBreakdown.slotSubtotal}
                </Text>
              </View>
 
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: '#9CA3AF' }]}>
                  Platform Fee ({details.amountBreakdown.platformFeePercent}%)
                </Text>
                <Text style={[styles.priceValue, { color: '#FFFFFF' }]}>
                  {details.amountBreakdown.currency} {details.amountBreakdown.platformFee}
                </Text>
              </View>
 
              <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
 
              <View style={styles.priceRow}>
                <Text style={[styles.totalLabel, { color: '#FFFFFF' }]}>Total Amount</Text>
                <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
                  {details.amountBreakdown.currency} {details.amountBreakdown.totalAmount}
                </Text>
              </View>
            </View>
 
            {/* Meta Info */}
            <View style={styles.metaContainer}>
               <Text style={[styles.metaText, { color: '#9CA3AF' }]}>
                 Booked on {format(new Date(details.createdAt), 'dd/MM/yyyy HH:mm')}
               </Text>
               <Text style={[styles.metaText, { color: '#9CA3AF' }]}>
                 Booking ID: {details.id}
               </Text>
            </View>


            {/* Actions Section */}
            <View style={styles.actionContainer}>
              {/* Download Invoice Button - Only for successful bookings */}
              {(details.status === 'CONFIRMED' || details.status === 'SUCCESS' || details.status === 'COMPLETED') && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary }]}
                  onPress={handleDownloadInvoice}
                >
                  <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
                  <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Download Invoice</Text>
                </TouchableOpacity>
              )}

              {/* Cancel Button */}
              {details.status === 'CONFIRMED' && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.error + '08', borderColor: theme.colors.error + '20' }]}
                  onPress={handleCancelPress}
                >
                  <Ionicons name="close-circle-outline" size={20} color={theme.colors.error} />
                  <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>Cancel Booking</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ height: verticalScale(40) }} />
          </View>
        ) : null}
      </ScrollView>
    </DraggableModal>

    <RefundPreviewModal
      visible={refundModalVisible}
      onClose={() => {
        setRefundModalVisible(false);
        resetPreview();
      }}
      onConfirm={handleConfirmCancel}
      preview={preview}
      loading={previewLoading}
      confirming={cancelLoading}
    />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(20),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: moderateScale(13),
    fontWeight: '500',
    marginTop: verticalScale(2),
  },
  closeButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: moderateScale(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(24),
  },
  centerContainer: {
    padding: moderateScale(60),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  errorText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(16),
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: verticalScale(12),
    padding: moderateScale(8),
  },
  detailsBody: {
    marginTop: verticalScale(10),
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(10),
    marginBottom: verticalScale(20),
    gap: scale(8),
  },
  statusDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
  },
  statusBannerText: {
    fontSize: moderateScale(12),
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    padding: moderateScale(20),
    borderRadius: moderateScale(24),
    borderWidth: 1,
    marginBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    marginBottom: verticalScale(16),
    letterSpacing: -0.3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    gap: scale(16),
  },
  iconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: verticalScale(2),
  },
  infoValue: {
    fontSize: moderateScale(15),
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  priceLabel: {
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  priceValue: {
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: verticalScale(16),
    opacity: 0.1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: moderateScale(16),
    fontWeight: '800',
  },
  totalValue: {
    fontSize: moderateScale(20),
    fontWeight: '900',
  },
  metaContainer: {
    alignItems: 'center',
    gap: verticalScale(4),
    marginBottom: verticalScale(24),
  },
  metaText: {
    fontSize: moderateScale(11),
    fontWeight: '500',
  },
  actionContainer: {
    gap: verticalScale(12),
    marginBottom: verticalScale(20),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    gap: scale(10),
  },
  actionButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
});

export default BookingDetailsModal;
