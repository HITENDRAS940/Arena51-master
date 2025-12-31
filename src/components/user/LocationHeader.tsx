import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LocationHeaderProps {
  city?: string;
  onPress: () => void;
  loading?: boolean;
  showBack?: boolean;
  onBackPress?: () => void;
}

const LocationHeader: React.FC<LocationHeaderProps & { children?: React.ReactNode }> = ({ 
  city, 
  onPress,
  loading = false,
  showBack,
  onBackPress,
  children
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1F2937', '#111827']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.content}>
          {showBack && (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={onBackPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.locationButton} 
            onPress={onPress}
            activeOpacity={0.7}
          >
            <View style={styles.locationIconContainer}>
              <Ionicons name="location" size={20} color="#FFFFFF" />
            </View>
            <View>
              <View style={styles.row}>
                <Text style={styles.locationLabel}>Location</Text>
                <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.8)" style={styles.chevron} />
              </View>
              <Text style={styles.cityText} numberOfLines={1}>
                {loading ? 'Detecting...' : city || 'Select Location'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileButton}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>U</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {children && (
          <View style={styles.childrenContainer}>
            {children}
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  gradient: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  childrenContainer: {
    marginTop: 20,
  },
  content: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  locationLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  chevron: {
    marginTop: 1,
  },
  cityText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  profileButton: {
    marginLeft: 16,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default LocationHeader;
