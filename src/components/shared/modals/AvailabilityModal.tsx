/**
 * AvailabilityModal – Fullscreen iOS-Friendly Version
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { ScreenWrapper } from "../ScreenWrapper";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../../contexts/ThemeContext";
import Button from "../Button";
import { adminAPI } from "../../../services/api";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (isAvailable: boolean) => void;
  currentAvailability: boolean;
  loading?: boolean;
  serviceName?: string;
  serviceId?: number;
}

const AvailabilityModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  currentAvailability,
  loading = false,
  serviceName,
  serviceId,
}) => {
  const { theme } = useTheme();
  const [isAvailable, setIsAvailable] = React.useState(currentAvailability);
  const [fetchedAvailability, setFetchedAvailability] = React.useState<boolean | null>(null);
  const [fetchingStatus, setFetchingStatus] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  // Fetch availability from API when modal opens
  React.useEffect(() => {
    const fetchAvailability = async () => {
      if (visible && serviceId) {
        setFetchingStatus(true);
        try {
          const response = await adminAPI.getServiceAvailability(serviceId);
          const availabilityStatus = response.data;
          setFetchedAvailability(availabilityStatus);
          setIsAvailable(availabilityStatus);
        } catch (error) {
          console.error('Error fetching availability:', error);
          // Fallback to currentAvailability prop if API fails
          setIsAvailable(currentAvailability);
        } finally {
          setFetchingStatus(false);
        }
      }
    };

    fetchAvailability();
  }, [visible, serviceId]);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!visible) {
      setFetchedAvailability(null);
      setIsClosing(false);
    }
  }, [visible]);

  // Use fetched availability if available, otherwise use prop
  const actualCurrentAvailability = fetchedAvailability !== null ? fetchedAvailability : currentAvailability;
  const hasChanged = isAvailable !== actualCurrentAvailability;

  const handleSave = async () => {
    if (!hasChanged) return;
    
    try {
      await onSave(isAvailable);
      
      // Show success alert and close modal after user acknowledges
      Alert.alert(
        'Success',
        `Service is now ${isAvailable ? 'available' : 'unavailable'} for booking`,
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
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to update availability. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
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
            {/* HEADER */}
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
                    Service Availability
                  </Text>
                  {serviceName && (
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                      {serviceName}
                    </Text>
                  )}
                </View>
                <TouchableOpacity 
                  onPress={handleClose} 
                  disabled={loading}
                  style={[styles.closeButton, { backgroundColor: theme.colors.background }]}
                >
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* SCROLL CONTENT */}
            <ScrollView
              contentContainerStyle={{ padding: 20, paddingBottom: 200 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Loading indicator while fetching status */}
              {fetchingStatus ? (
                <View style={styles.fetchingContainer}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={[styles.fetchingText, { color: theme.colors.textSecondary }]}>
                    Fetching current status...
                  </Text>
                </View>
              ) : (
                <>
                  {/* STATUS BANNER */}
                  <View
                    style={[
                      styles.statusBanner,
                      {
                        backgroundColor: actualCurrentAvailability
                          ? theme.colors.success + "15"
                          : theme.colors.error + "15",
                      },
                    ]}
                  >
                    <Ionicons
                      name={actualCurrentAvailability ? "checkmark-circle" : "close-circle"}
                      size={28}
                      color={actualCurrentAvailability ? theme.colors.success : theme.colors.error}
                    />

                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.labelSmall, { color: theme.colors.textSecondary }]}>
                        Current Status
                      </Text>
                      <Text
                        style={[
                          styles.bannerTitle,
                          {
                            color: actualCurrentAvailability
                              ? theme.colors.success
                              : theme.colors.error,
                          },
                        ]}
                      >
                        {actualCurrentAvailability ? "Available for Booking" : "Not Available"}
                      </Text>
                    </View>
                  </View>

                  {/* AVAILABILITY TOGGLE */}
                  <View
                    style={[
                      styles.toggleBox,
                      {
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.card,
                      },
                    ]}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1, gap: 12 }}>
                      <Ionicons
                        name={isAvailable ? "calendar" : "calendar-outline"}
                        size={28}
                        color={isAvailable ? theme.colors.success : theme.colors.textSecondary}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.toggleTitle, { color: theme.colors.text }]}>
                          Accept Bookings
                        </Text>
                        <Text style={[styles.toggleDescription, { color: theme.colors.textSecondary }]}>
                          {isAvailable
                            ? "Users can book this service"
                            : "Service is hidden from users"}
                        </Text>
                      </View>
                    </View>

                    <Switch
                      value={isAvailable}
                      onValueChange={setIsAvailable}
                      trackColor={{ false: theme.colors.border, true: theme.colors.success }}
                      thumbColor={isAvailable ? "#fff" : "#ccc"}
                      disabled={loading || fetchingStatus}
                    />
                  </View>

                  {/* WARNING / INFO */}
                  {!isAvailable && hasChanged && (
                    <View
                      style={[
                        styles.warningBox,
                        { backgroundColor: theme.colors.warning + "15" },
                      ]}
                    >
                      <Ionicons name="warning" size={22} color={theme.colors.warning} />
                      <Text style={[styles.warningText, { color: theme.colors.warning }]}>
                        Making this service unavailable hides it from all users. Existing bookings
                        are not affected.
                      </Text>
                    </View>
                  )}

                  {isAvailable && hasChanged && (
                    <View
                      style={[
                        styles.infoBox,
                        { backgroundColor: theme.colors.primary + "15" },
                      ]}
                    >
                      <Ionicons name="information-circle" size={22} color={theme.colors.primary} />
                      <Text style={[styles.infoText, { color: theme.colors.primary }]}>
                        Making this service available shows it to all users.
                      </Text>
                    </View>
                  )}

                  {/* FEATURES */}
                  <Text style={[styles.featuresTitle, { color: theme.colors.text }]}>
                    When {isAvailable ? "Available" : "Unavailable"}:
                  </Text>

                  {isAvailable ? (
                    <>
                      {row("checkmark", theme.colors.success, "Visible in service listings")}
                      {row("checkmark", theme.colors.success, "Users can view details & slots")}
                      {row("checkmark", theme.colors.success, "Bookings can be made")}
                    </>
                  ) : (
                    <>
                      {row("close", theme.colors.error, "Hidden from service listings")}
                      {row("close", theme.colors.error, "Not accessible to users")}
                      {row("close", theme.colors.error, "New bookings disabled")}
                    </>
                  )}
                </>
              )}
            </ScrollView>

            {/* FIXED BOTTOM ACTION BAR */}
            <View
              style={[
                styles.footer,
                { borderTopColor: theme.colors.border, backgroundColor: theme.colors.card },
              ]}
            >
              <Button
                title="Cancel"
                onPress={handleClose}
                variant="outline"
                disabled={loading}
                style={{ flex: 1 }}
              />

              <Button
                title={loading ? "Saving..." : "Save Changes"}
                onPress={handleSave}
                disabled={!hasChanged || loading}
                loading={loading}
                style={{ flex: 1 }}
              />
            </View>

            {/* LOADING OVERLAY */}
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </ScreenWrapper>
    </Modal>
  );
};

// Small helper component for feature row
const row = (icon: any, color: string, text: string) => (
  <View style={styles.featureRow}>
    <Ionicons name={icon} size={18} color={color} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

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

  fetchingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 12,
  },
  fetchingText: {
    fontSize: 14,
  },

  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },

  bannerTitle: { fontSize: 16, fontWeight: "700" },
  labelSmall: { fontSize: 12, marginBottom: 2 },

  toggleBox: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
  },
  toggleTitle: { fontSize: 16, fontWeight: "600" },
  toggleDescription: { fontSize: 13 },

  warningBox: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 10,
  },
  warningText: { flex: 1, fontSize: 13, lineHeight: 18 },

  infoBox: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 10,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },

  featuresTitle: { fontSize: 14, fontWeight: "600", marginBottom: 12 },

  featureRow: { flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 10 },
  featureText: { fontSize: 14 },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
});

export default AvailabilityModal;