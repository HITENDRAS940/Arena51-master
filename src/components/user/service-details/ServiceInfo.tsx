import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import MapPinIcon from '../../shared/icons/MapPinIcon';
import { useTheme } from '../../../contexts/ThemeContext';
import { Service } from '../../../types';

interface ServiceInfoProps {
  service: Service;
  showShadow?: boolean;
}

const ServiceInfo: React.FC<ServiceInfoProps> = ({ service, showShadow = false }) => {
  const { theme } = useTheme();

  // ✅ Safely parse coordinates
  const { lat, lng, hasValidCoords } = useMemo(() => {
    const l = service.latitude != null ? Number(service.latitude) : null;
    const g = service.longitude != null ? Number(service.longitude) : null;
    const valid = l != null && g != null && !Number.isNaN(l) && !Number.isNaN(g);
    return { lat: l, lng: g, hasValidCoords: valid };
  }, [service.latitude, service.longitude]);

  const openInMaps = useCallback(() => {
    const label = encodeURIComponent(service.name);

    if (hasValidCoords && lat !== null && lng !== null) {
      const url = Platform.select({
        ios: `maps:0,0?q=${label}@${lat},${lng}`,
        android: `geo:0,0?q=${lat},${lng}(${label})`,
      });

      if (url) {
        Linking.openURL(url);
      }
    } else {
      const query = encodeURIComponent(`${service.name} ${service.location}`);
      const url = Platform.select({
        ios: `maps:0,0?q=${query}`,
        android: `geo:0,0?q=${query}`,
      });

      if (url) {
        Linking.openURL(url);
      }
    }
  }, [service.name, service.location, hasValidCoords, lat, lng]);

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

  const amenities = useMemo(() => {
    return (service.amenities && Array.isArray(service.amenities))
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
  }, [service.amenities]);

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionTitleBar, { backgroundColor: theme.colors.primary }]} />
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* About Section */}
      <View style={styles.section}>
        {renderSectionHeader('About')}
        <View style={[
          styles.infoCard,
          showShadow && styles.cardShadow,
          { 
            backgroundColor: theme.colors.card, 
            borderColor: theme.colors.border,
            shadowColor: theme.colors.shadow,
          }
        ]}>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {service.description || 'Welcome to this premium venue offering top-notch facilities for your favorite sports activities. Book now for an amazing experience.'}
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
                  showShadow && styles.amenityShadow,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                    shadowColor: theme.colors.shadow,
                  }
                ]}
              >
              <View style={[styles.amenityIconBox, { backgroundColor: theme.colors.background }]}>
                 <Ionicons name={amenity.icon as any} size={moderateScale(18)} color={theme.colors.primary} />
              </View>
              <Text style={[styles.amenityText, { color: theme.colors.text }]} numberOfLines={1}>
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
          style={[
            styles.mapCard,
            showShadow && styles.cardShadow,
            { 
              backgroundColor: theme.colors.card,
              shadowColor: theme.colors.shadow,
            }
          ]}
          onPress={openInMaps}
          activeOpacity={0.9}
        >
          <LinearGradient
             colors={[theme.colors.card, theme.colors.surface]}
             style={styles.mapGradient}
          >
             <View style={styles.mapContent}>
                <View style={styles.mapIconCircle}>
                    <MapPinIcon size={moderateScale(40)} color={theme.colors.primary} />
                </View>
                <View style={styles.mapTextContainer}>
                  <Text style={[styles.mapLabel, { color: theme.colors.text }]}>View on Map</Text>
                  <Text style={[styles.mapAddress, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                    {service.location}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={moderateScale(20)} color={theme.colors.textSecondary} />
             </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(20),
  },
  section: {
    marginBottom: verticalScale(32),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
    gap: scale(6),
  },
  sectionTitle: {
    fontSize: moderateScale(17),
    fontWeight: '800',
    letterSpacing: -0.4,
    textTransform: 'uppercase',
    opacity: 0.9,
  },
  sectionTitleBar: {
    width: moderateScale(4),
    height: moderateScale(16),
    borderRadius: moderateScale(2),
  },
  infoCard: {
    padding: moderateScale(20),
    borderRadius: moderateScale(24),
    borderWidth: 1.5,
  },
  cardShadow: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  description: {
    fontSize: moderateScale(15),
    lineHeight: moderateScale(24),
    fontWeight: '400',
    opacity: 0.8,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(10),
    borderRadius: moderateScale(16),
    borderWidth: 1.5,
    gap: scale(10),
    width: '48%',
    marginBottom: verticalScale(10),
  },
  amenityShadow: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
  },
  amenityIconBox: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  amenityText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    flex: 1,
    letterSpacing: -0.1,
  },
  mapCard: {
    borderRadius: moderateScale(24),
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  mapGradient: {
    padding: moderateScale(20),
  },
  mapContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(16),
  },
  mapIconCircle: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapTextContainer: {
    flex: 1,
  },
  mapLabel: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    marginBottom: verticalScale(4),
  },
  mapAddress: {
    fontSize: moderateScale(13),
    fontWeight: '400',
    lineHeight: moderateScale(18),
    opacity: 0.7,
  },
});

export default React.memo(ServiceInfo);
