/**
 * ManualBookingModal – Admin Manual Booking
 * Allows admin to manually book slots for walk-in customers
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { ScreenWrapper } from "../ScreenWrapper";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../../contexts/ThemeContext";
import Button from "../Button";
import { formatTime, getSlotColors } from "../../../utils/slotUtils";

interface SlotData {
  id: number;
  startTime: string;
  endTime: string;
  price: number;
  enabled: boolean;
  isBooked?: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (slotIds: number[]) => Promise<void>;
  slots: SlotData[];
  bookedSlotIds?: number[];
  disabledSlotIds?: number[];
  serviceName?: string;
  selectedDate: string;
  loading?: boolean;
}

const ManualBookingModal: React.FC<Props> = ({
  visible,
  onClose,
  onConfirm,
  slots,
  serviceName,
  selectedDate,
  loading = false,
  bookedSlotIds,
  disabledSlotIds,
}) => {
  const { theme } = useTheme();
  
  const [selectedSlots, setSelectedSlots] = React.useState<number[]>([]);
  const [isClosing, setIsClosing] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Reset state when modal opens
  React.useEffect(() => {
    if (visible) {
      setSelectedSlots([]);
      setIsClosing(false);
    }
  }, [visible]);

  // Filter slots for display
  // Logic: 
  // 1. Hide if Disabled (via ID or legacy property)
  // 2. Show if Booked (via ID or legacy property) but mark as booked
  const displaySlots = slots
    .filter((slot) => {
      // Calculate Logical ID
      const timeStr = slot.startTime.includes('T') ? slot.startTime.split('T')[1] : slot.startTime;
      const logicalId = parseInt(timeStr.split(':')[0], 10) + 1;

      // Check disabled status
      let isDisabled = !slot.enabled; // Default
      if (disabledSlotIds) {
        isDisabled = disabledSlotIds.includes(logicalId);
      }
      
      // We HIDE disabled slots
      return !isDisabled;
    })
    .sort((a, b) => a.id - b.id);
    
  // Helper to check if a specific slot is booked
  const isSlotBooked = (slot: SlotData) => {
      const timeStr = slot.startTime.includes('T') ? slot.startTime.split('T')[1] : slot.startTime;
      const logicalId = parseInt(timeStr.split(':')[0], 10) + 1;
      
      if (bookedSlotIds) {
          return bookedSlotIds.includes(logicalId);
      }
      return !!slot.isBooked;
  };
  
  // Count truly available slots for "Select All" logic
  // "Available" here means visible AND not booked
  const availableCount = displaySlots.filter(s => !isSlotBooked(s)).length;

  const toggleSlotSelection = (slotId: number) => {
    setSelectedSlots((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId]
    );
  };

  const selectAllSlots = () => {
    const selectableSlots = displaySlots.filter(s => !isSlotBooked(s)).map(s => s.id);
    
    // If all selectable slots are already selected, deselect all
    // Otherwise select all selectable slots
    // We check if current selection size matches selectable count
    // Note: This logic assumes selectedSlots only contains valid selectable IDs
    if (selectedSlots.length === selectableSlots.length && selectableSlots.length > 0) {
      setSelectedSlots([]);
    } else {
      setSelectedSlots(selectableSlots);
    }
  };

  const calculateTotal = () => {
    return selectedSlots.reduce((total, slotId) => {
      const slot = slots.find((s) => s.id === slotId);
      return total + (slot?.price || 0);
    }, 0);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleConfirm = () => {
    if (selectedSlots.length === 0) {
      Alert.alert("No Slots Selected", "Please select at least one slot to book.");
      return;
    }

    const selectedSlotDetails = selectedSlots
      .map((id) => slots.find((s) => s.id === id))
      .filter(Boolean)
      .map((slot) => `${formatTime(slot!.startTime)} - ${formatTime(slot!.endTime)}`)
      .join("\n");

    Alert.alert(
      "Confirm Manual Booking",
      `You are about to create a manual booking for:\n\n${selectedSlotDetails}\n\nTotal: ₹${calculateTotal()}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Booking",
          onPress: async () => {
            setIsSubmitting(true);
            try {
              await onConfirm(selectedSlots);
              
              Alert.alert(
                "Success",
                "Manual booking created successfully",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      setIsClosing(true);
                      setTimeout(() => {
                        onClose();
                      }, 300);
                    },
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to create booking. Please try again.",
                [{ text: "OK" }]
              );
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Modal
      visible={visible && !isClosing}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <ScreenWrapper style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
        >
          <View style={{ flex: 1 }}>
            {/* Header */}
            <View
              style={[
                styles.header,
                { 
                  borderBottomColor: theme.colors.border || 'rgba(0,0,0,0.1)', 
                  backgroundColor: theme.colors.card 
                },
              ]}
            >
              <View style={styles.headerTop}>
                <View style={styles.titleContainer}>
                  <Text style={[styles.title, { color: theme.colors.text }]}>
                    Manual Booking
                  </Text>
                  {serviceName && (
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                      {serviceName}
                    </Text>
                  )}
                </View>
                <TouchableOpacity 
                  onPress={handleClose} 
                  disabled={isSubmitting}
                  style={[styles.closeButton, { backgroundColor: theme.colors.background }]}
                >
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Date Display */}
            <View style={[styles.dateContainer, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.dateText, { color: theme.colors.text }]}>
                {formatDisplayDate(selectedDate)}
              </Text>
            </View>

            {/* Content */}
            <ScrollView
              contentContainerStyle={{ paddingBottom: 200 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Legend */}
              <View style={[styles.legendContainer, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.legendTitle, { color: theme.colors.text }]}>
                  Tap to select slots
                </Text>
                <View style={[styles.legendRow, { flexWrap: 'wrap' }]}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#10B981" }]} />
                    <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                      Available
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
                    <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                      Selected
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#EF4444" }]} />
                    <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                      Booked
                    </Text>
                  </View>
                </View>
              </View>

              {/* Select All Button */}
              {availableCount > 0 && (
                <View style={styles.selectAllContainer}>
                  <TouchableOpacity
                    style={[
                      styles.selectAllButton,
                      { 
                        backgroundColor: selectedSlots.length === availableCount 
                          ? theme.colors.primary + '20'
                          : theme.colors.card,
                        borderColor: theme.colors.primary,
                      },
                    ]}
                    onPress={selectAllSlots}
                    disabled={isSubmitting}
                  >
                    <Ionicons
                      name={selectedSlots.length === availableCount ? "checkbox" : "square-outline"}
                      size={20}
                      color={theme.colors.primary}
                    />
                    <Text style={[styles.selectAllText, { color: theme.colors.primary }]}>
                      {selectedSlots.length === availableCount ? "Deselect All" : "Select All"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Slots Grid */}
              {displaySlots.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="calendar-outline" size={48} color={theme.colors.textSecondary} />
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    No slots available for display
                  </Text>
                  <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                    All slots are disabled for this date
                  </Text>
                </View>
              ) : (
                <View style={styles.slotsContainer}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Slots ({displaySlots.length})
                  </Text>
                  
                  <View style={styles.slotsGrid}>
                    {displaySlots.map((slot) => {
                      const isSelected = selectedSlots.includes(slot.id);
                      const isBooked = isSlotBooked(slot);
                      
                      let bgColor = "#D1FAE5";
                      let borderColor = "#10B981";
                      let textColor = "#065F46";
                      
                      if (isBooked) {
                          bgColor = "#FEE2E2";
                          borderColor = "#EF4444";
                          textColor = "#991B1B";
                      } else if (isSelected) {
                          bgColor = theme.colors.primary + '20';
                          borderColor = theme.colors.primary;
                          textColor = theme.colors.primary;
                      }

                      return (
                        <TouchableOpacity
                          key={slot.id}
                          style={[
                            styles.slotChip,
                            {
                              backgroundColor: bgColor,
                              borderColor: borderColor,
                              borderWidth: isSelected ? 2 : 1,
                              opacity: isBooked ? 0.8 : 1,
                            },
                          ]}
                          onPress={() => toggleSlotSelection(slot.id)}
                          disabled={isSubmitting || isBooked}
                        >
                          <View style={styles.slotChipContent}>
                            <Text
                              style={[
                                styles.slotTime,
                                { 
                                  color: textColor,
                                  fontWeight: isSelected ? "700" : "600",
                                },
                              ]}
                            >
                              {formatTime(slot.startTime)}
                            </Text>
                            <Text
                              style={[
                                styles.slotPrice,
                                { color: textColor },
                              ]}
                            >
                              ₹{slot.price}
                            </Text>
                          </View>
                          {isSelected && !isBooked && (
                            <Ionicons
                              name="checkmark-circle"
                              size={16}
                              color={theme.colors.primary}
                              style={styles.checkIcon}
                            />
                          )}
                          {isBooked && (
                              <Ionicons
                                name="lock-closed"
                                size={14}
                                color={textColor}
                                style={styles.checkIcon}
                              />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Bottom Summary & Actions */}
            <View
              style={[
                styles.footer,
                { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border },
              ]}
            >
              {/* Summary */}
              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                    Selected Slots:
                  </Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                    {selectedSlots.length}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                    Total Amount:
                  </Text>
                  <Text style={[styles.totalAmount, { color: theme.colors.primary }]}>
                    ₹{calculateTotal()}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <Button
                  title="Cancel"
                  onPress={handleClose}
                  variant="outline"
                  style={styles.footerBtn}
                  disabled={isSubmitting}
                />
                <Button
                  title={isSubmitting ? "Creating..." : "Create Booking"}
                  onPress={handleConfirm}
                  loading={isSubmitting || loading}
                  style={styles.footerBtn}
                  disabled={selectedSlots.length === 0 || isSubmitting}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScreenWrapper>
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: { fontSize: 14 },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "600",
  },
  legendContainer: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: "row",
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
  },
  selectAllContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  selectAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  slotsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  slotChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 100,
  },
  slotChipContent: {
    flex: 1,
  },
  slotTime: {
    fontSize: 13,
  },
  slotPrice: {
    fontSize: 11,
    marginTop: 2,
  },
  checkIcon: {
    marginLeft: 4,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  summaryContainer: {
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  footerBtn: {
    flex: 1,
  },
});

export default ManualBookingModal;
