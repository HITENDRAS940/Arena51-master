import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Dimensions, ActivityIndicator, Pressable } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../contexts/ThemeContext';
import { EphemeralSlot, DynamicBookingResponse } from '../../../types';
import { format } from 'date-fns';
import DraggableModal from '../../shared/DraggableModal';

interface BookingSummarySheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  serviceName: string;
  date: Date;
  selectedSlots: EphemeralSlot[];
  totalPrice: number;
  loading: boolean;
  bookingData: DynamicBookingResponse | null;
}

const BookingSummarySheet: React.FC<BookingSummarySheetProps> = ({
  visible,
  onClose,
  onConfirm,
  serviceName,
  date,
  selectedSlots,
  totalPrice,
  loading,
  bookingData,
}) => {
  const { theme } = useTheme();

  return (
    <DraggableModal
      visible={visible}
      onClose={onClose}
      height="85%"
      containerStyle={{ backgroundColor: theme.colors.background }}
    >
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Summary.</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Main Info Card */}
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.summaryItem}>
              <Ionicons name="business-outline" size={20} color={theme.colors.primary} />
              <View style={styles.summaryText}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>VENUE</Text>
                <Text style={[styles.value, { color: theme.colors.text }]}>{serviceName}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryItem}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
              <View style={styles.summaryText}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>DATE</Text>
                <Text style={[styles.value, { color: theme.colors.text }]}>
                  {format(date, 'MMMM dd, yyyy')}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryItem}>
              <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
              <View style={styles.summaryText}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>SLOTS</Text>
                <View style={styles.slotsList}>
                  {selectedSlots.map((slot, index) => (
                    <Text key={index} style={[styles.value, { color: theme.colors.text }]}>
                      {slot.startTime} - {slot.endTime}{index < selectedSlots.length - 1 ? ',' : ''}
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
              <View style={styles.summaryText}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>REFERENCE</Text>
                <Text style={[styles.value, { color: theme.colors.text }]}>
                  {bookingData?.reference || 'Pending...'}
                </Text>
              </View>
            </View>

            {bookingData?.resourceName && (
              <>
                <View style={styles.divider} />
                <View style={styles.summaryItem}>
                  <Ionicons name="layers-outline" size={20} color={theme.colors.primary} />
                  <View style={styles.summaryText}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>COURT/RESOURCE</Text>
                    <Text style={[styles.value, { color: theme.colors.text }]}>
                      {bookingData.resourceName}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {bookingData?.message && (
              <>
                <View style={styles.divider} />
                <View style={styles.summaryItem}>
                  <Ionicons name="chatbubble-outline" size={20} color={theme.colors.primary} />
                  <View style={styles.summaryText}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>INFO</Text>
                    <Text style={[styles.value, { color: theme.colors.text, fontSize: 13 }]}>
                      {bookingData.message}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Price section */}
          <View style={styles.priceContainer}>
            {bookingData?.amountBreakdown ? (
              <View style={styles.breakdownContainer}>
                <View style={styles.breakdownRow}>
                  <Text style={[styles.breakdownLabel, { color: theme.colors.textSecondary }]}>Subtotal</Text>
                  <Text style={[styles.breakdownValue, { color: theme.colors.text }]}>₹{bookingData.amountBreakdown.slotSubtotal}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={[styles.breakdownLabel, { color: theme.colors.textSecondary }]}>Platform Fee</Text>
                  <Text style={[styles.breakdownValue, { color: theme.colors.text }]}>₹{bookingData.amountBreakdown.platformFee}</Text>
                </View>
                <View style={styles.breakdownDivider} />
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: theme.colors.text }]}>Total Amount</Text>
                  <Text style={[styles.totalValue, { color: theme.colors.primary }]}>₹{bookingData.amountBreakdown.totalAmount}</Text>
                </View>
              </View>
            ) : (
              <>
                <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>Total Price</Text>
                <Text style={[styles.totalValue, { color: theme.colors.text }]}>₹{totalPrice}</Text>
              </>
            )}
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(24, Platform.OS === 'ios' ? 40 : 24) }]}>
          <Pressable
            onPress={onConfirm}
            disabled={loading}
            style={({ pressed }) => [
              styles.confirmButtonWrapper,
              { opacity: (loading || pressed) ? 0.7 : 1 }
            ]}
            hitSlop={15}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary || theme.colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmButton}
              >
                {loading ? (
                  <ActivityIndicator size={24} color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm & Pay</Text>
                )}
              </LinearGradient>
            </Pressable>
        </View>
      </View>
    </DraggableModal>
  );
};

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  content: {
    paddingHorizontal: 24,
  },
  summaryCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  summaryText: {
    marginLeft: 16,
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
  },
  slotsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  priceContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
  },
  breakdownContainer: {
    width: '100%',
    paddingVertical: 10,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '800',
  },
  footer: {
    padding: 24,
  },
  confirmButtonWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  confirmButton: {
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default BookingSummarySheet;
