import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface StatCardProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  value: number | string;
  iconColor: string;
  backgroundColor: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  iconColor,
  backgroundColor,
  subtitle,
}) => {
  const { theme } = useTheme();
  
  const formatValue = (val: number | string): string => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <View style={[styles.card, { 
      backgroundColor,
      shadowColor: theme.colors.gray 
    }]}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
        <Ionicons name={icon} size={24} color="#FFFFFF" />
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.value, { color: theme.colors.text }]}>{formatValue(value)}</Text>
        <Text style={[styles.title, { color: theme.colors.textSecondary }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default StatCard;
