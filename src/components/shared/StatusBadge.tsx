import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface StatusBadgeProps {
  status: 'CONFIRMED' | 'CANCELLED' | 'PENDING' | 'COMPLETED';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { theme } = useTheme();
  
  const getStatusStyle = () => {
    switch (status) {
      case 'CONFIRMED':
        return { backgroundColor: '#D1FAE5', color: theme.colors.success };
      case 'CANCELLED':
        return { backgroundColor: '#FEE2E2', color: theme.colors.error };
      case 'PENDING':
        return { backgroundColor: '#FEF3C7', color: theme.colors.warning };
      case 'COMPLETED':
        return { backgroundColor: '#E0E7FF', color: theme.colors.primary };
      default:
        return { backgroundColor: theme.colors.lightGray, color: theme.colors.gray };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <View style={[styles.badge, { backgroundColor: statusStyle.backgroundColor }]}>
      <Text style={[styles.text, { color: statusStyle.color }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default StatusBadge;
