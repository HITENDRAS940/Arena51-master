import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Ionicons name={icon} size={64} color={theme.colors.gray} />
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: theme.colors.textSecondary }]}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default EmptyState;
