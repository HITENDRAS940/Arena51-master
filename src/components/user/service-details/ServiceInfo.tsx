import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../contexts/ThemeContext';
import { Service } from '../../../types';

interface ServiceInfoProps {
  service: Service;
}

const ServiceInfo: React.FC<ServiceInfoProps> = ({ service }) => {
  const { theme } = useTheme();

  // ✅ Safely parse coordinates
  const lat = service.latitude != null ? Number(service.latitude) : null;
  const lng = service.longitude != null ? Number(service.longitude) : null;

  const hasValidCoords =
    lat != null &&
    lng != null &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng);

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}.</Text>
    </View>
  );

  const openInMaps = () => {
    const label = encodeURIComponent(service.name);

    if (hasValidCoords && lat !== null && lng !== null) {
      const url = Platform.select({
        ios: `maps:0,0?q=${label}@${lat},${lng}`,
        android: `geo:0,0?q=${lat},${lng}(${label})`,
      });

      if (url) {
        Linking.openURL(url).catch(err => console.error('An error occurred', err));
      }
    } else {
      const query = encodeURIComponent(`${service.name} ${service.location}`);
      const url = Platform.select({
        ios: `maps:0,0?q=${query}`,
        android: `geo:0,0?q=${query}`,
      });

      if (url) {
        Linking.openURL(url).catch(err => console.error('An error occurred', err));
      }
    }
  };

  const getAmenityIcon = (name: string): keyof typeof Ionicons.glyphMap => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('parking')) return 'car';
    if (lowercaseName.includes('water')) return 'water';
    if (lowercaseName.includes('washroom') || lowercaseName.includes('toilet')) return 'male-female';
    if (lowercaseName.includes('changing') || lowercaseName.includes('room')) return 'shirt';
    if (lowercaseName.includes('flood') || lowercaseName.includes('light')) return 'flashlight';
    if (lowercaseName.includes('shower')) return 'thermometer';
    if (lowercaseName.includes('condition') || lowercaseName.includes('ac')) return 'snow';
    if (lowercaseName.includes('power') || lowercaseName.includes('backup') || lowercaseName.includes('generator')) return 'flash';
    if (lowercaseName.includes('wifi')) return 'wifi';
    if (lowercaseName.includes('cafe') || lowercaseName.includes('food')) return 'fast-food';
    if (lowercaseName.includes('locker')) return 'lock-closed';
    if (lowercaseName.includes('seat') || lowercaseName.includes('bench')) return 'people';
    if (lowercaseName.includes('equipment') || lowercaseName.includes('rental')) return 'construct';
    if (lowercaseName.includes('first aid') || lowercaseName.includes('medical')) return 'medical';
    return 'checkmark-circle';
  };

  const amenities = (service.amenities && Array.isArray(service.amenities))
    ? service.amenities.map(name => ({
        name,
        icon: getAmenityIcon(name)
      }))
    : [
        { name: 'Parking', icon: 'car' },
        { name: 'Water', icon: 'water' },
        { name: 'Changing Room', icon: 'shirt' },
        { name: 'Floodlights', icon: 'flashlight' }
      ];

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text
          style={[styles.serviceName, { color: theme.colors.text }]}
        >
          {service.name}
        </Text>

        <View style={styles.statsRow}>
          <View style={[styles.ratingBadge, { backgroundColor: '#FBBF2415' }]}>
            <Ionicons name="star" size={14} color="#FBBF24" />
            <Text style={[styles.ratingText, { color: '#D97706' }]}>{service.rating || 'New'}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        </View>

        <TouchableOpacity
          style={styles.locationContainer}
          onPress={openInMaps}
          activeOpacity={0.7}
        >
          <View style={[styles.locationIcon, { backgroundColor: theme.colors.navy + '10' }]}>
            <Ionicons name="location" size={14} color={theme.colors.navy} />
          </View>
          <Text
            style={[styles.locationText, { color: theme.colors.textSecondary }]}
          >
            {service.location}
          </Text>
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        {renderSectionHeader('About')}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {service.description || 'Welcome to EzTurf! This premium venue offers top-notch facilities for your favorite sports activities. Book now for an amazing experience.'}
          </Text>
        </View>
      </View>

      {/* Amenities Section */}
      <View style={styles.section}>
        {renderSectionHeader('Amenities')}
        <View style={styles.amenitiesGrid}>
          {amenities.map((amenity, index) => (
            <View
              key={index}
              style={[
                styles.amenityItem,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  shadowColor: theme.colors.shadow
                }
              ]}
            >
              <LinearGradient
                colors={[theme.colors.navy, theme.colors.navy + 'DD']}
                style={styles.amenityIconGradient}
              >
                <Ionicons name={amenity.icon as any} size={14} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.amenityText, { color: theme.colors.text }]} numberOfLines={2}>
                {amenity.name}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Location Map Card */}
      <View style={styles.section}>
        {renderSectionHeader('Location')}
        <TouchableOpacity
          style={[styles.mapCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={openInMaps}
          activeOpacity={0.9}
        >
          <View style={styles.mapInfo}>
            <View style={styles.mapIconCircle}>
                <Ionicons name="map" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.mapTextContainer}>
              <Text style={[styles.mapLabel, { color: theme.colors.text }]}>Open in Maps</Text>
              <Text style={[styles.mapAddress, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                {service.location}
              </Text>
            </View>
            <View style={[styles.mapBadge, { backgroundColor: theme.colors.navy + '10' }]}>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.navy} />
            </View>
          </View>
          
          <View style={[styles.hintContainer, { backgroundColor: theme.colors.background }]}>
              <Ionicons name="information-circle-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.hintText, { color: theme.colors.textSecondary }]}>
                  Tap to view detailed directions
              </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  headerSection: {
    marginBottom: 24,
  },
  serviceName: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 14,
  },
  reviewCount: {
    fontSize: 15,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  section: {
    marginBottom: 26,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  infoCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    width: '48%',
    marginBottom: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  amenityIconGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  amenityText: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  mapCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  mapInfo: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  mapIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapTextContainer: {
    flex: 1,
  },
  mapLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  mapAddress: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  mapBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB', // Slightly lighter border for separator
  },
  hintText: {
      fontSize: 12,
      fontWeight: '500',
  }
});

export default React.memo(ServiceInfo);
