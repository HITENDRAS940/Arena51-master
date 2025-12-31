import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";

interface Props {
  label: string;
  icon: any;
  value: string;
  error?: string;
  placeholder: string;
  required?: boolean;
  onChange: (v: string) => void;
  multiline?: boolean;
  large?: boolean;
  keyboardType?: any;
}

const FormField: React.FC<Props> = ({
  label,
  icon,
  value,
  error,
  placeholder,
  required,
  onChange,
  multiline,
  large,
  keyboardType,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.group}>
      {/* Label */}
      <View style={styles.row}>
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      </View>

      {/* Input Field */}
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        multiline={multiline}
        numberOfLines={multiline ? (large ? 4 : 2) : 1}
        keyboardType={keyboardType}
        style={[
          styles.input,
          multiline && styles.textArea,
          large && styles.textAreaLarge,
          {
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderColor: error ? theme.colors.error : theme.colors.border,
          },
        ]}
      />

      {/* Error */}
      {error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  group: {
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  required: {
    color: "#EF4444",
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  textAreaLarge: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
  },
});

export default FormField;