import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Platform, Dimensions } from 'react-native';
import BrandedLoader from '../../shared/BrandedLoader';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../contexts/ThemeContext';
import { EphemeralSlot } from '../../../types';
import { format } from 'date-fns';

interface BookingSummarySheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  serviceName: string;
  date: Date;
  selectedSlots: EphemeralSlot[];
  totalPrice: number;
  loading: boolean;
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
}) => {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissArea} onPress={onClose} activeOpacity={1} />
        <View style={[styles.sheet, { backgroundColor: theme.colors.background }]}>
          <View style={styles.header}>
            <View style={[styles.dragHandle, { backgroundColor: theme.colors.border }]} />
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
            </View>

            {/* Price section */}
            <View style={styles.priceContainer}>
              <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>Total Price</Text>
              <Text style={[styles.priceValue, { color: theme.colors.text }]}>₹{totalPrice}</Text>
            </View>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: Math.max(24, Platform.OS === 'ios' ? 40 : 24) }]}>
            <TouchableOpacity
              onPress={onConfirm}
              disabled={loading}
              style={styles.confirmButtonWrapper}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary || theme.colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmButton}
              >
                {loading ? (
                  <BrandedLoader size={24} color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
  dismissArea: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    maxHeight: '80%',
  },
  header: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 20,
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
  priceValue: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
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
