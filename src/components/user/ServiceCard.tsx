import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, ActivityIndicator, Linking, Platform } from 'react-native';
import Animated, { withSpring, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Service } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { Alert } from 'react-native';
import { ACTIVITY_THEMES, DEFAULT_THEME } from '../../contexts/ThemeContext';

interface ServiceCardProps {
  service: Service;
  onPress: () => void;
  showBookButton?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  onPress, 
  showBookButton = true 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { theme } = useTheme();
  
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
          <Animated.Image 
            source={{ uri: images[0] }} 
            style={styles.image}
            resizeMode="cover"
            onLoadStart={() => handleImageLoadStart(0)}
            onLoadEnd={() => handleImageLoadEnd(0)}
            onError={() => console.log(`Failed to load image: ${images[0]}`)}
            // @ts-ignore
            sharedTransitionTag={`img-${service.id}`}
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
              <Animated.Image 
                source={{ uri: imageUrl }} 
                style={styles.image}
                resizeMode="cover"
                onLoadStart={() => handleImageLoadStart(index)}
                onLoadEnd={() => handleImageLoadEnd(index)}
                onError={() => console.log(`Failed to load image: ${imageUrl}`)}
                // @ts-ignore
                sharedTransitionTag={index === 0 ? `img-${service.id}` : undefined}
              />
              {imageLoading[index] && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
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
        <Animated.View 
          style={styles.contentOverlay}
          entering={FadeInDown.duration(600).delay(200)}
        >
          <View style={styles.header}>
            <Animated.Text 
              style={styles.name} 
              numberOfLines={1}
              // @ts-ignore
              sharedTransitionTag={`name-${service.id}`}
            >
              {service.name}
            </Animated.Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>{service.rating || 'New'}</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#E2E8F0" />
            <Animated.Text 
              style={styles.location} 
              numberOfLines={1}
              // @ts-ignore
              sharedTransitionTag={`loc-${service.id}`}
            >
              {service.location}
            </Animated.Text>
          </View>
        </Animated.View>

        {hasMultipleImages && (
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {currentImageIndex + 1}/{images.length}
            </Text>
          </View>
        )}
      </View>
      
      <View style={[styles.footer, { borderTopColor: theme.colors.border + '20' }]}>
        {/* Left Side - Activities Icons */}
        <View style={styles.activitiesContainer}>
          {(service.activities && service.activities.length > 0 ? service.activities : ['Football', 'Cricket']).slice(0, 3).map((activityName, index) => {
            const themeConfig = ACTIVITY_THEMES[activityName] || DEFAULT_THEME;
            return (
              <View 
                key={index} 
                style={[styles.activityIconCircle, { backgroundColor: theme.colors.lightGray }]}
              >
                <Ionicons 
                  name={themeConfig.icon} 
                  size={14} 
                  color={theme.colors.navy} 
                />
              </View>
            );
          })}
          {((service.activities && service.activities.length > 0 ? service.activities : ['Football', 'Cricket']).length) > 3 && (
            <Text style={[styles.moreActivitiesText, { color: theme.colors.textSecondary }]}>
              +{((service.activities && service.activities.length > 0 ? service.activities : ['Football', 'Cricket']).length) - 3}
            </Text>
          )}
        </View>

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
                <Ionicons name="chevron-forward-circle" size={24} color="#FFFFFF" />
              </View>
              
              {/* Subtle background decoration */}
              <View style={styles.buttonDecorIcon}>
                <Ionicons name="football" size={40} color="#FFFFFF" />
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
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    // Use theme shadow color if available, or fallback
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, // Reduced height
    shadowOpacity: 0.08, // Very subtle
    shadowRadius: 8,
    elevation: 3, // Standard Material Card elevation
    borderWidth: 1, 
    // borderColor and backgroundColor handled via inline styles with theme
  },
  image: {
    width: '100%',
    height: 220,
    backgroundColor: '#F1F5F9',
  },
  imageWrapper: {
    position: 'relative',
    width: Dimensions.get('window').width - 32, // Simplified for testing
    height: 220,
  },
  imageScrollView: {
    height: 220,
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
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
    padding: 16,
  },
  imageCounter: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    // borderTopColor handled via inline style
  },
  activitiesContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activityIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  moreActivitiesText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 2,
  },

  bookButtonContainer: {
    borderRadius: 100, // Capsule container
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bookButton: {
    height: 48,
    paddingLeft: 20,
    paddingRight: 12,
    borderRadius: 100,
    position: 'relative',
    overflow: 'hidden',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
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
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default ServiceCard;