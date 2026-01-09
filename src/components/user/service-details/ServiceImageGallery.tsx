import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackIcon from '../../shared/icons/BackIcon';
import BrandedLoader from '../../shared/BrandedLoader';

const { width: screenWidth } = Dimensions.get('window');

interface ServiceImageGalleryProps {
  serviceId: number | string;
  images: string[];
  serviceName: string;
  scrollY: Animated.Value;
  onBackPress: () => void;
}

const ServiceImageGallery: React.FC<ServiceImageGalleryProps> = ({
  serviceId,
  images,
  serviceName,
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

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-200, 0],
    outputRange: [1.3, 1],
    extrapolate: 'clamp',
  });

  const backButtonOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE - 40, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.container, { height: headerHeight }]}>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: imageScrollX } } }],
          { 
            useNativeDriver: false,
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
                <BrandedLoader size={48} color="#FFFFFF" />
              </View>
            )}
          </View>
        ))}
      </Animated.ScrollView>

      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'transparent']}
        style={styles.topGradient}
      />

      <Animated.View style={[styles.backButton, { top: insets.top + 10, opacity: backButtonOpacity }]}>
        <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
          <BackIcon width={24} height={24} fill="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      {images.length > 1 && (
        <View style={styles.indicators}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentImageIndex ? styles.indicatorActive : styles.indicatorInactive
              ]}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
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
  indicators: {
    position: 'absolute',
    bottom: 24,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    height: 4,
    borderRadius: 2,
  },
  indicatorActive: {
    width: 24,
    backgroundColor: '#FFFFFF',
  },
  indicatorInactive: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
});

export default ServiceImageGallery;
