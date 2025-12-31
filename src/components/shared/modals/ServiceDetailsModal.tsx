/**
 * ServiceDetailsModal – Clean Final Version (with reusable FormField)
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { ScreenWrapper } from "../ScreenWrapper";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../contexts/ThemeContext";

import Button from "../Button";
import FormField from "../FormField";



export interface ServiceDetailsData {
  name: string;
  location: string;
  city: string;
  latitude: string;
  longitude: string;
  description: string;
  contactNumber: string;
}

interface ServiceDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (details: ServiceDetailsData) => void;
  initialData: ServiceDetailsData;
  loading?: boolean;
  isEditMode?: boolean;
}

const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({
  visible,
  onClose,
  onSave,
  initialData,
  loading = false,
  isEditMode = false,
}) => {
  const { theme } = useTheme();

  const [formData, setFormData] = React.useState<ServiceDetailsData>(initialData);
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof ServiceDetailsData, string>>
  >({});
  const [isClosing, setIsClosing] = React.useState(false);

  React.useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Reset closing state when modal becomes visible
  React.useEffect(() => {
    if (visible) {
      setIsClosing(false);
    }
  }, [visible]);

  const handleChange = (field: keyof ServiceDetailsData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ServiceDetailsData, string>> = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.latitude) newErrors.latitude = "Latitude is required";
    if (!formData.longitude) newErrors.longitude = "Longitude is required";
    if (!formData.contactNumber) newErrors.contactNumber = "Contact Number is required";
    if (!formData.description) newErrors.description = "Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      await onSave(formData);
      // Trigger smooth close animation
      setIsClosing(true);
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // -------------------------------
  // HEADER
  // -------------------------------
  const renderHeader = () => (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.colors.card,
          borderBottomColor: theme.colors.border || "rgba(0,0,0,0.15)",
        },
      ]}
    >
      <View style={styles.headerTop}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {isEditMode ? "Edit Service Details" : "Create New Service"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleClose}
          style={[styles.closeButton, { backgroundColor: theme.colors.background }]}
        >
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // -------------------------------
  // FORM FIELDS
  // -------------------------------
  const renderForm = () => (
    <View>
      <FormField
        label="Service Name"
        icon="business-outline"
        required
        value={formData.name}
        error={errors.name}
        placeholder="Enter service name"
        onChange={(v) => handleChange("name", v)}
      />

      <FormField
        label="Location"
        icon="location-outline"
        required
        value={formData.location}
        error={errors.location}
        placeholder="Enter location"
        onChange={(v) => handleChange("location", v)}
      />
      
      <FormField
        label="City"
        icon="map-outline"
        required
        value={formData.city}
        error={errors.city}
        placeholder="Enter city"
        onChange={(v) => handleChange("city", v)}
      />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
           <FormField
            label="Latitude"
            icon="navigate-outline"
            required
            value={formData.latitude}
            error={errors.latitude}
            placeholder="Ex: 12.9716"
            onChange={(v) => handleChange("latitude", v)}
          />
        </View>
        <View style={{ flex: 1 }}>
           <FormField
            label="Longitude"
            icon="navigate-outline"
            required
            value={formData.longitude}
            error={errors.longitude}
            placeholder="Ex: 77.5946"
            onChange={(v) => handleChange("longitude", v)}
          />
        </View>
      </View>

      <FormField
        label="Contact Number"
        icon="call-outline"
        required
        value={formData.contactNumber}
        error={errors.contactNumber}
        placeholder="Enter contact number"
        onChange={(v) => handleChange("contactNumber", v)}
      />

      <FormField
        label="Description"
        icon="document-text-outline"
        multiline
        large
        value={formData.description}
        error={errors.description}
        placeholder="Enter service description"
        onChange={(v) => handleChange("description", v)}
      />
    </View>
  );

  // -------------------------------
  // MAIN MODAL LAYOUT
  // -------------------------------
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
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
          <View style={{ flex: 1 }}>
            {renderHeader()}

            <ScrollView
              contentContainerStyle={{
                padding: 20,
                paddingBottom: 200,
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {renderForm()}
            </ScrollView>

            {/* Fixed Action Bar */}
            <View
              style={[
                styles.bottomBar,
                {
                  backgroundColor: theme.colors.card,
                  borderTopColor: theme.colors.border,
                },
              ]}
            >
              <Button
                title={loading ? "Saving..." : (isEditMode ? "Save Changes" : "Create Service")}
                onPress={handleSave}
                loading={loading}
                disabled={loading}
              />
            </View>

            {/* Loading Overlay */}
            {loading && (
              <View style={[styles.loadingOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <View style={[styles.loadingContainer, { backgroundColor: theme.colors.card }]}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                    {isEditMode ? "Making changes please wait..." : "Creating new Service please wait..."}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </ScreenWrapper>
    </Modal>
  );
};

// ----------------------------------
// STYLES
// ----------------------------------
const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ServiceDetailsModal;