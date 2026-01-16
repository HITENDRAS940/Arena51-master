import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import BackIcon from '../../shared/icons/BackIcon';
import LocationIcon from '../../shared/icons/LocationIcon';


const { width: screenWidth } = Dimensions.get('window');

interface ServiceImageGalleryProps {
  serviceId: number | string;
  images: string[];
  serviceName: string;
  location: string;
  rating?: number | string;
  scrollY: Animated.Value;
  onBackPress: () => void;
}

const ServiceImageGallery: React.FC<ServiceImageGalleryProps> = ({
  serviceId,
  images,
  serviceName,
  location,
  rating,
  scrollY,
  onBackPress,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: string]: boolean }>({});
  
  const imageScrollX = useRef(new Animated.Value(0)).current;

  const handleImageScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const imageIndex = Math.round(contentOffset.x / screenWidth);
    setCurrentImageIndex(Math.max(0, Math.min(imageIndex, images.length - 1)));
  };

  const HEADER_MAX_HEIGHT = 400;
  const HEADER_MIN_HEIGHT = 100 + insets.top;
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  const imageScale = scrollY.interpolate({
    inputRange: [-200, 0],
    outputRange: [1.3, 1],
    extrapolate: 'clamp',
  });

  const backButtonOpacity = scrollY.interpolate({
    inputRange: [0, 90],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: imageScrollX } } }],
          { 
            useNativeDriver: true,
            listener: handleImageScroll
          }
        )}
        scrollEventThrottle={16}
      >
        {images.map((imageUri, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Animated.Image
              source={{ uri: imageUri }}
              style={[
                styles.image,
                { transform: [{ scale: imageScale }] }
              ]}
              onLoadStart={() => setImageLoadingStates(prev => ({ ...prev, [imageUri]: true }))}
              onLoadEnd={() => setImageLoadingStates(prev => ({ ...prev, [imageUri]: false }))}
            />
            {imageLoadingStates[imageUri] && (
              <View style={styles.loaderOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            )}
          </View>
        ))}
      </Animated.ScrollView>

      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'transparent']}
        style={styles.topGradient}
        pointerEvents="none"
      />

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {/* Content Overlay */}
      <View style={styles.contentOverlay} pointerEvents="none">
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {serviceName}
          </Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={moderateScale(14)} color="#F59E0B" />
            <Text style={styles.ratingText}>{rating || 'New'}</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <LocationIcon size={moderateScale(14)} color="#E2E8F0" />
          <Text style={styles.location} numberOfLines={1}>
            {location}
          </Text>
        </View>
      </View>

      {images.length > 1 && (
        <View style={[styles.imageCounter, { top: insets.top + 10 }]}>
          <Text style={styles.imageCounterText}>
            {currentImageIndex + 1}/{images.length}
          </Text>
        </View>
      )}

      <Animated.View style={[styles.backButton, { top: insets.top + 10, opacity: backButtonOpacity }]}>
        <TouchableOpacity onPress={onBackPress} style={styles.iconButton} activeOpacity={0.7}>
          <BackIcon width={24} height={24} fill="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    height: 280,
    overflow: 'hidden',
    position: 'relative',
  },
  imageWrapper: {
    width: screenWidth,
    height: '100%',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 1,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: verticalScale(140),
    zIndex: 1,
  },
  contentOverlay: {
    position: 'absolute',
    bottom: verticalScale(0), // Anchored perfectly on top of the sheet's 20pt overlap
    left: 0,
    right: 0,
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScale(12),
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  name: {
    fontSize: moderateScale(26),
    fontWeight: '900',
    color: '#FFFFFF',
    flex: 1,
    marginRight: scale(8),
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    letterSpacing: -0.5,
  },
  ratingBadge: {
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
    fontSize: moderateScale(13),
    fontWeight: '800',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  location: {
    fontSize: moderateScale(15),
    color: '#E2E8F0',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  imageCounter: {
    position: 'absolute',
    right: moderateScale(20),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
    zIndex: 20,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
});

export default ServiceImageGallery;
