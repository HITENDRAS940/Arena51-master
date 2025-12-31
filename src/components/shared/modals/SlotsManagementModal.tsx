/**
 * SlotsManagementModal – Fullscreen iOS-Friendly Version
 * Super stable layout with fixed footer + full scrollable content
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { ScreenWrapper } from "../ScreenWrapper";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../../contexts/ThemeContext";
import Button from "../Button";
import { SlotConfig } from "../../../types";
import { validatePrice } from "../../../utils/validationUtils";
import { sortSlotConfigsByTime } from "../../../utils/slotUtils";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (slots: SlotConfig[]) => void;
  onSkip?: () => void;
  slots: SlotConfig[];
  loading?: boolean;
  showRefresh?: boolean;

  onRefresh?: () => void;
  serviceName?: string;
}

const SlotsManagementModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  onSkip,
  slots: initialSlots,
  loading = false,
  showRefresh,
  onRefresh,
  serviceName,
}) => {
  const { theme } = useTheme();

  const [slots, setSlots] = React.useState<SlotConfig[]>(initialSlots);
  const [samePriceForAll, setSamePriceForAll] = React.useState(false);
  const [masterPrice, setMasterPrice] = React.useState("");
  const [priceError, setPriceError] = React.useState("");
  const [isClosing, setIsClosing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Reset isClosing when modal opens
  React.useEffect(() => {
    if (visible) {
      setIsClosing(false);
    }
  }, [visible]);

  React.useEffect(() => {
    setSlots(sortSlotConfigsByTime([...initialSlots]));
  }, [initialSlots]);

  const handleSamePriceToggle = (value: boolean) => {
    setSamePriceForAll(value);
    if (value && masterPrice) {
      const price = parseFloat(masterPrice);
      if (!isNaN(price)) {
        setSlots((prev) =>
          prev.map((slot) => ({
            ...slot,
            price: slot.enabled ? price : slot.price,
          }))
        );
      }
    }
  };

  const handleMasterPriceChange = (text: string) => {
    setMasterPrice(text);
    setPriceError("");

    const validation = validatePrice(text);
    if (!validation.isValid && text !== "") {
      setPriceError(validation.error || "Invalid price");
      return;
    }

    const price = parseFloat(text);
    if (!isNaN(price) && price > 0) {
      setSlots((prev) =>
        prev.map((slot) => ({
          ...slot,
          price: slot.enabled ? price : slot.price,
        }))
      );
    }
  };

  const toggleSlotEnabled = (slotId: number) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.slotId === slotId
          ? { ...slot, enabled: !slot.enabled }
          : slot
      )
    );
  };

  const updateSlotPrice = (slotId: number, priceText: string) => {
    const price = parseFloat(priceText);
    if (isNaN(price) && priceText !== "") return;

    setSlots((prev) =>
      prev.map((slot) =>
        slot.slotId === slotId
          ? { ...slot, price: priceText === "" ? 0 : price }
          : slot
      )
    );
  };

  const validateSlots = () => {
    const enabledSlots = slots.filter((s) => s.enabled);

    if (enabledSlots.length === 0) {
      setPriceError("At least one slot must be enabled");
      return false;
    }

    if (enabledSlots.some((s) => !s.price || s.price <= 0)) {
      setPriceError("All enabled slots must have a valid price");
      return false;
    }

    return true;
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSave = () => {
    if (!validateSlots()) return;

    const enabledSlots = slots.filter((s) => s.enabled);
    
    // Show confirmation alert before saving
    Alert.alert(
      'Confirm Changes',
      `You are about to save ${enabledSlots.length} enabled slot(s). Do you want to continue?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Save',
          onPress: async () => {
            setIsSaving(true);
            try {
              await onSave(slots);
              
              // Show success alert and close modal after user acknowledges
              Alert.alert(
                'Success',
                'Slot configurations saved successfully',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Trigger smooth close animation
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
                'Error',
                error.response?.data?.message || 'Failed to save slot configurations. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible && !isClosing} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
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
                    Slot Management
                  </Text>
                  {serviceName && (
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                      {serviceName}
                    </Text>
                  )}
                </View>
                <TouchableOpacity 
                  onPress={handleClose}
                  disabled={loading || isSaving}
                  style={[styles.closeButton, { backgroundColor: theme.colors.background }]}
                >
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Scrollable content */}
            <ScrollView
              contentContainerStyle={{ paddingBottom: 200 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Price Controls */}
              <View style={styles.section}>
                <View style={styles.rowBetween}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>
                    Same Price for All Slots
                  </Text>
                  <Switch
                    value={samePriceForAll}
                    onValueChange={handleSamePriceToggle}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                    thumbColor={samePriceForAll ? "#fff" : "#ccc"}
                    disabled={loading}
                  />
                </View>

                {samePriceForAll && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={[styles.labelSmall, { color: theme.colors.text }]}>
                      Master Price (₹/hour)
                    </Text>

                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.colors.card,
                          color: theme.colors.text,
                          borderColor: priceError ? theme.colors.error : theme.colors.border,
                        },
                      ]}
                      value={masterPrice}
                      onChangeText={handleMasterPriceChange}
                      placeholder="Enter price for all slots"
                      placeholderTextColor={theme.colors.textSecondary}
                      keyboardType="numeric"
                    />
                  </View>
                )}

                {priceError && (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {priceError}
                  </Text>
                )}
              </View>

              {/* Slot List */}
              {slots.map((slot, index) => (
                <View
                  key={slot.slotId}
                  style={[
                    styles.slotCard,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.rowBetween}>
                    <View style={styles.row}>
                      <Text style={[styles.slotNumber, { color: theme.colors.textSecondary }]}>
                        #{index + 1}
                      </Text>
                      <Text style={[styles.slotTime, { color: theme.colors.text }]}>
                        {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                      </Text>
                    </View>

                    <Switch
                      value={slot.enabled}
                      onValueChange={() => toggleSlotEnabled(slot.slotId)}
                      trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                      thumbColor={slot.enabled ? "#fff" : "#ccc"}
                      disabled={loading}
                    />
                  </View>

                  {slot.enabled && (
                    <View style={styles.priceRow}>
                      <Text style={[styles.priceLabel, { color: theme.colors.text }]}>₹</Text>

                      <TextInput
                        style={[
                          styles.priceInput,
                          {
                            backgroundColor: theme.colors.background,
                            color: theme.colors.text,
                            borderColor: theme.colors.border,
                          },
                        ]}
                        value={slot.price?.toString() || ""}
                        onChangeText={(text) => updateSlotPrice(slot.slotId, text)}
                        keyboardType="numeric"
                        editable={!samePriceForAll}
                        placeholder="Price"
                        placeholderTextColor={theme.colors.textSecondary}
                      />
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            {/* BOTTOM ACTION BAR */}
            <View
              style={[
                styles.footer,
                { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border },
              ]}
            >
              <Button
                title="Cancel"
                onPress={handleClose}
                variant="outline"
                style={styles.footerBtn}
                disabled={isSaving}
              />

              {onSkip && (
                <Button
                  title="Skip"
                  onPress={onSkip}
                  variant="outline"
                  style={styles.footerBtn}
                  disabled={isSaving}
                />
              )}

              <Button
                title={loading || isSaving ? "Saving..." : "Save & Continue"}
                onPress={handleSave}
                loading={loading || isSaving}
                style={styles.footerBtn}
                disabled={isSaving}
              />
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

  section: { padding: 16, borderBottomWidth: 1 },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  row: { flexDirection: "row", alignItems: "center", gap: 8 },

  label: { fontSize: 16, fontWeight: "600" },
  labelSmall: { fontSize: 14, fontWeight: "600" },

  input: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
  },

  errorText: { marginTop: 8, fontSize: 12 },

  infoText: { fontSize: 13, fontWeight: "600" },

  refreshButton: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  refreshText: { fontSize: 12, fontWeight: "600" },

  slotCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
  },

  slotNumber: { fontSize: 12, fontWeight: "600" },
  slotTime: { fontSize: 16, fontWeight: "600" },

  priceRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  priceLabel: { fontSize: 14 },

  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 14,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },

  footerBtn: { flex: 1 },
});

export default SlotsManagementModal;