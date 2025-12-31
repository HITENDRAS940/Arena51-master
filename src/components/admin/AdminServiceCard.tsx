import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Service } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface AdminServiceCardProps {
  service: Service;
  onPress?: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40; // Full width minus padding

const AdminServiceCard: React.FC<AdminServiceCardProps> = ({
  service,
  onPress,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  const availabilityStatus = service.availability ?? true;
  const statusColor = availabilityStatus ? theme.colors.success : theme.colors.error;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      {/* Status Border (Top) */}
      <View style={[styles.statusBorder, { backgroundColor: statusColor }]} />

      {/* Watermark Icon */}
      <View style={styles.watermarkContainer}>
        <Ionicons 
          name="football-outline" 
          size={180} 
          color={theme.colors.lightGray} 
          style={{ opacity: 0.2 }} 
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.mainInfo}>
          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {availabilityStatus ? 'Active' : 'Inactive'}
            </Text>
          </View>

          {/* Name */}
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {service.name}
          </Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={18} color={theme.colors.textSecondary} />
            <Text style={[styles.location, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {service.location}
            </Text>
          </View>
        </View>

        {/* Manage Button */}
        <TouchableOpacity 
          style={styles.manageButton}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.manageButtonGradient}
          >
            <Text style={styles.manageButtonText}>Manage</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 16,
    flexDirection: 'column',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    width: CARD_WIDTH,
    aspectRatio: 4/3,
    position: 'relative',
  },
  statusBorder: {
    width: '100%',
    height: 6,
  },
  watermarkContainer: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    zIndex: 0,
    transform: [{ rotate: '-15deg' }],
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  mainInfo: {
    flex: 1,
    gap: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
    lineHeight: 34,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 16,
    fontWeight: '500',
  },
  manageButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 'auto',
    width: '100%',
  },
  manageButtonGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  manageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default AdminServiceCard;
