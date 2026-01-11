import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import BrandedLoader from '../shared/BrandedLoader';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Service } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface ServiceCardProps {
  service: Service;
  onPress: () => void;
  showBookButton?: boolean;
}

import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import LocationIcon from '../shared/icons/LocationIcon';
import { DiscoveryArrowIcon } from '../shared/icons/activities';
import DistanceIcon from '../shared/icons/DistanceIcon';

import { useLocationContext } from '../../contexts/LocationContext';
import api from '../../services/api';

// ... (existing imports)

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  onPress, 
  showBookButton = true 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { theme } = useTheme();
  const { location } = useLocationContext();
  const [distanceInfo, setDistanceInfo] = useState<{ formattedDistance: string } | null>(null);
  const [distanceLoading, setDistanceLoading] = useState(false);

  React.useEffect(() => {
    if (service.distance) {
      setDistanceInfo({ formattedDistance: typeof service.distance === 'number' ? `${service.distance.toFixed(1)} km` : `${service.distance}` });
      return;
    }

    const fetchDistance = async () => {
      if (location?.latitude && location?.longitude && service.id) {
        setDistanceLoading(true);
        try {
          const response = await api.location.calculateDistance({
            serviceId: service.id,
            userLatitude: location.latitude,
            userLongitude: location.longitude
          });
          if (response.data) {
             setDistanceInfo(response.data);
          }
        } catch (error) {
           // Silent fail, keep default state
        } finally {
          setDistanceLoading(false);
        }
      }
    };
    
    fetchDistance();
  }, [location?.latitude, location?.longitude, service.id, service.distance]);
  
  // Get images array, fallback to single image if images array is empty/undefined
  const images = service.images && service.images.length > 0 ? service.images : [service.image];
  const hasMultipleImages = images.length > 1;

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentImageIndex(index);
  };

  const [imageLoading, setImageLoading] = useState<{[key: number]: boolean}>({});

  const handleImageLoadStart = (index: number) => {
    setImageLoading(prev => ({ ...prev, [index]: true }));
  };

  const handleImageLoadEnd = (index: number) => {
    setImageLoading(prev => ({ ...prev, [index]: false }));
  };

  return (
    <View 
      style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
    >
      <View style={styles.imageContainer}>
      {!hasMultipleImages ? (
        <View style={styles.imageWrapper}>
          <Image 
            source={{ uri: images[0] }} 
            style={styles.image}
            resizeMode="cover"
            onLoadStart={() => handleImageLoadStart(0)}
            onLoadEnd={() => handleImageLoadEnd(0)}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageGradient}
          />
        </View>
      ) : (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.imageScrollView}
        >
          {images.map((imageUrl, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.image}
                resizeMode="cover"
                onLoadStart={() => handleImageLoadStart(index)}
                onLoadEnd={() => handleImageLoadEnd(index)}
              />
              {imageLoading[index] && (
                <View style={styles.loadingOverlay}>
                  <BrandedLoader size={20} color={theme.colors.primary} />
                </View>
              )}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.imageGradient}
              />
            </View>
          ))}
        </ScrollView>
      )}
        
        {/* Content Overlay */}
        <View 
          style={styles.contentOverlay}
        >
          <View style={styles.header}>
            <Text 
              style={styles.name} 
              numberOfLines={1}
            >
              {service.name}
            </Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={moderateScale(14)} color="#F59E0B" />
              <Text style={styles.ratingText}>{service.rating || 'New'}</Text>
            </View>
          </View>
 
          <View style={styles.locationRow}>
            <LocationIcon size={moderateScale(14)} color="#E2E8F0" />
            <Text 
              style={styles.location} 
              numberOfLines={1}
            >
              {service.location}
            </Text>
          </View>
        </View>
 
        {hasMultipleImages && (
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {currentImageIndex + 1}/{images.length}
            </Text>
          </View>
        )}
      </View>
      
      <View style={[styles.footer, { borderTopColor: theme.colors.border + '20' }]}>
        {/* Left Side - Distance or Instant Booking Status */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusIconWrapper]}>
            <DistanceIcon size={moderateScale(30)} color={theme.colors.primary} />
          </View>
          <Text style={[styles.statusText, { color: theme.colors.text }]}>
            {distanceLoading 
              ? 'Calculating distance...' 
              : distanceInfo?.formattedDistance || 'Instant Booking'}
          </Text>
        </View>
        
        {/* ... (rest of footer) */}

        {/* Right Side - Book Now Button */}
        {showBookButton && (
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={onPress}
            style={[styles.bookButtonContainer, { shadowColor: theme.colors.primary }]}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bookButton}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.bookButtonText}>Book Now</Text>
                <DiscoveryArrowIcon size={moderateScale(24)} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: moderateScale(20),
    marginBottom: verticalScale(20),
    overflow: 'hidden',
    // Use theme shadow color if available, or fallback
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: verticalScale(2) }, // Reduced height
    shadowOpacity: 0.08, // Very subtle
    shadowRadius: moderateScale(8),
    elevation: 3, // Standard Material Card elevation
    borderWidth: 1, 
    // borderColor and backgroundColor handled via inline styles with theme
  },
  image: {
    width: '100%',
    height: verticalScale(160),
    backgroundColor: '#F1F5F9',
  },
  imageWrapper: {
    position: 'relative',
    width: Dimensions.get('window').width - scale(32), // Simplified for testing
    height: verticalScale(160),
  },
  imageScrollView: {
    height: verticalScale(160),
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: verticalScale(80),
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(241, 245, 249, 0.5)',
  },
  imageContainer: {
    position: 'relative',
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: moderateScale(16),
  },
  imageCounter: {
    position: 'absolute',
    top: moderateScale(16),
    right: moderateScale(16),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  name: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: scale(8),
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
    gap: scale(4),
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  location: {
    fontSize: moderateScale(14),
    color: '#E2E8F0',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(12),
    borderTopWidth: 1,
    // borderTopColor handled via inline style
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  statusIconWrapper: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  bookButtonContainer: {
    borderRadius: 100, // Capsule container
    overflow: 'hidden',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(8),
    elevation: 6,
  },
  bookButton: {
    height: verticalScale(40),
    paddingLeft: scale(20),
    paddingRight: scale(12),
    borderRadius: 100,
    position: 'relative',
    overflow: 'hidden',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(10),
    height: '100%',
    zIndex: 2,
  },
  buttonDecorIcon: {
    position: 'absolute',
    right: -10,
    bottom: -15,
    zIndex: 1,
    opacity: 0.1,
    transform: [{ rotate: '-15deg' }],
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(15),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default ServiceCard;