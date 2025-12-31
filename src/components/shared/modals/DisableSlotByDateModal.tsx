import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { ScreenWrapper } from "../ScreenWrapper";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../contexts/ThemeContext";
import Button from "../Button";
import { format } from "date-fns";

interface ServiceSlot {
  id: number;
  slotId: number;
  startTime: string;
  endTime: string;
  price: number;
  enabled: boolean;
  isBooked?: boolean;
}

interface DisableSlotByDateModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (slotId: number, reason: string) => Promise<void>;
  slots: any[]; // Was ServiceSlot
  selectedDate: string;
  serviceName: string;
}

const DisableSlotByDateModal: React.FC<DisableSlotByDateModalProps> = ({
  visible,
  onClose,
  onConfirm,
  slots,
  selectedDate,
  serviceName,
}) => {
  const { theme } = useTheme();
  
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Filter only available slots (not booked) - logic can be adjusted if we want to allow disabling booked slots (refund?) 
  // For now, let's assume we can disable any slot, but user should know if it's booked. 
  // Actually, usually you disable unbooked slots. If booked, it might error on backend or require cancellation.
  // I will just show all slots but highlight status.
  const displaySlots = slots.sort((a, b) => parseInt(a.startTime) - parseInt(b.startTime));

  useEffect(() => {
    if (visible) {
      setSelectedSlotId(null);
      setReason("");
      setLoading(false);
      setIsClosing(false);
    }
  }, [visible]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleConfirm = async () => {
    if (selectedSlotId === null) {
      Alert.alert("Selection Required", "Please select a slot to disable.");
      return;
    }
    if (!reason.trim()) {
      Alert.alert("Reason Required", "Please enter a reason for disabling the slot.");
      return;
    }

    setLoading(true);
    try {
      await onConfirm(selectedSlotId, reason);
      handleClose();
    } catch (error) {
      // Error handled by parent usually, but stop loading here
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const m = parseInt(minutes) || 0;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
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
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.headerTop}>
              <View>
                <Text style={[styles.title, { color: theme.colors.text }]}>Disable Slot</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  {serviceName} • {format(new Date(selectedDate), 'MMM dd, yyyy')}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {/* Slot Selection */}
            <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>
              Select Slot to Disable
            </Text>
            <View style={styles.slotsGrid}>
              {displaySlots.map((slot) => {
                const isSelected = selectedSlotId === slot.slotId;
                // If the slot is "disabled" via API result it might show as not enabled, but here we view base slots?
                // `slots` passed in `AdminServiceDetailScreen` are merged with bookings.
                // Assuming `enabled` refers to base configuration.
                
                return (
                  <TouchableOpacity
                    key={slot.id}
                    onPress={() => setSelectedSlotId(slot.slotId)}
                    style={[
                      styles.slotItem,
                      { 
                        backgroundColor: isSelected 
                          ? theme.colors.error 
                          : theme.colors.card,
                        borderColor: isSelected 
                          ? theme.colors.error 
                          : theme.colors.border,
                      }
                    ]}
                  >
                    <Text style={[
                      styles.slotTime, 
                      { 
                        color: isSelected ? '#FFFFFF' : theme.colors.text 
                      }
                    ]}>
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </Text>
                    {slot.isBooked && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>Booked</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Reason Input */}
            <Text style={[styles.sectionLabel, { color: theme.colors.text, marginTop: 24 }]}>
              Reason
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="e.g. Maintenance, Private Event..."
                placeholderTextColor={theme.colors.textSecondary}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={3}
              />
            </View>

          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
            <Button
              title={loading ? "Disabling..." : "Disable Slot"}
              onPress={handleConfirm}
              loading={loading}
              variant="primary" // Re-using primary button, but maybe custom style for destructiveness if needed?
              style={{ backgroundColor: theme.colors.error }} // Override color for visual warning
            />
          </View>

        </KeyboardAvoidingView>
      </ScreenWrapper>
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  content: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotItem: {
    width: '48%', // 2 columns roughly
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  slotTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#EF444420',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '700',
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    height: 100,
  },
  input: {
    flex: 1,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
});

export default DisableSlotByDateModal;
