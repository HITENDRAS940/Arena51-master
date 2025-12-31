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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});
  
  const imageScrollViewRef = useRef<any>(null);
  const imageScrollX = useRef(new Animated.Value(0)).current;

  // Constants
  const HEADER_MAX_HEIGHT = 400; // Increased for a more immersive feel
  const HEADER_MIN_HEIGHT = 100 + insets.top;
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  const handleImageLoadStart = (imageUri: string) => {
    setImageLoadingStates(prev => ({ ...prev, [imageUri]: true }));
  };

  const handleImageLoadEnd = (imageUri: string) => {
    setImageLoadingStates(prev => ({ ...prev, [imageUri]: false }));
  };

  const handleImageError = (imageUri: string) => {
    setImageLoadingStates(prev => ({ ...prev, [imageUri]: false }));
    setImageErrors(prev => ({ ...prev, [imageUri]: true }));
  };

  const handleImageScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const imageIndex = Math.round(contentOffset.x / screenWidth);
    const newIndex = Math.max(0, Math.min(imageIndex, images.length - 1));
    
    if (Platform.OS === 'android') {
      requestAnimationFrame(() => {
        setCurrentImageIndex(newIndex);
      });
    } else {
      setCurrentImageIndex(newIndex);
    }
  };

  // Animation interpolations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-200, -100, 0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1.3, 1.2, 1, 0.98, 0.95],
    extrapolate: 'clamp',
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -30],
    extrapolate: 'clamp',
  });

  const bounceScale = scrollY.interpolate({
    inputRange: [-100, -50, 0],
    outputRange: [1.1, 1.05, 1],
    extrapolate: 'clamp',
  });

  const overlayOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0.2, 0.8],
    extrapolate: 'clamp',
  });

  const backButtonScale = scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [1, 0.95, 0.9],
      extrapolate: 'clamp',
  });

  const backButtonOpacity = scrollY.interpolate({
    inputRange: [200, 260],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.imageGalleryContainer, { height: headerHeight }]}>
      {/* Background container that slides in sync with scroll */}
      {/* Use standard Animated.View because it uses standard Animated interpolations */}
      <Animated.View 
        style={[
          styles.backgroundContainer,
          {
            width: images.length * screenWidth,
            transform: [
              { scale: imageScale },
              { scaleY: bounceScale },
              { translateY: imageTranslateY },
              { 
                translateX: imageScrollX.interpolate({
                  inputRange: [0, images.length * screenWidth],
                  outputRange: [0, -images.length * screenWidth],
                  extrapolate: 'clamp',
                })
              }
            ]
          } as any
        ]}
      >
        {images.map((imageUri, index) => (
          <View
            key={`bg-${index}`}
            style={[
              styles.backgroundImageWrapper,
              {
                left: index * screenWidth,
                width: screenWidth,
                height: '100%',
              }
            ]}
          >
            <Image 
              source={{ uri: imageUri }}
              style={styles.backgroundImage}
              resizeMode="cover"
              onLoadStart={() => handleImageLoadStart(imageUri)}
              onLoadEnd={() => handleImageLoadEnd(imageUri)}
              onError={() => handleImageError(imageUri)}
            />
          </View>
        ))}
      </Animated.View>
      
      {/* Transparent foreground for touch handling */}
      <View style={styles.foregroundContainer}>
        <Animated.ScrollView 
          ref={imageScrollViewRef}
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          style={styles.foregroundScrollView}
          contentContainerStyle={{
            width: images.length * screenWidth,
          }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: imageScrollX } } }],
            { 
              useNativeDriver: false,
              listener: handleImageScroll,
            }
          )}
          scrollEventThrottle={Platform.OS === 'ios' ? 8 : 16}
          decelerationRate={Platform.OS === 'ios' ? 'fast' : 'normal'}
          bounces={Platform.OS === 'ios'}
          scrollEnabled={images.length > 1}
          snapToInterval={screenWidth}
          snapToAlignment="start"
          directionalLockEnabled={true}
          overScrollMode={Platform.OS === 'android' ? 'never' : 'auto'}
        >
          {images.map((imageUri, index) => (
            <View 
              key={index} 
              style={styles.imageContainer}
            >
              {imageErrors[imageUri] ? (
                <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.lightGray }]}>
                  <Ionicons name="image-outline" size={64} color={theme.colors.gray} />
                  <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>
                    Image not available
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.transparentImage} />
                  {imageLoadingStates[imageUri] && (
                    <View style={styles.imageLoader}>
                      <ActivityIndicator size="large" color="#FFFFFF" />
                    </View>
                  )}
                </>
              )}
            </View>
          ))}
        </Animated.ScrollView>
      </View>
      
      {/* UI Overlays */}
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'transparent']}
        style={styles.topGradient}
      />

      <Animated.View 
        style={[
            styles.backButton, 
            { 
               top: insets.top + 10,
               opacity: backButtonOpacity,
               transform: [{ scale: backButtonScale }]
            }
        ]}>
        <TouchableOpacity
          onPress={onBackPress}
          style={styles.backButtonTouchable}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      {images.length > 1 && (
        <View style={styles.bottomOverlays}>
          <View style={styles.imageIndicators}>
            {images.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.indicator, 
                  { 
                    backgroundColor: index === currentImageIndex ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                    width: index === currentImageIndex ? 24 : 8,
                    opacity: index === currentImageIndex ? 1 : 0.6
                  }
                ]} 
              />
            ))}
          </View>
          
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {currentImageIndex + 1} / {images.length}
            </Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  imageGalleryContainer: {
    width: '100%',
    overflow: 'hidden',
    zIndex: 1,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    flexDirection: 'row',
  },
  backgroundImageWrapper: {
    position: 'absolute',
    top: 0,
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  foregroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  foregroundScrollView: {
    flex: 1,
  },
  imageContainer: {
    width: screenWidth,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transparentImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  imageLoader: {
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
    zIndex: 5,
  },
  scrollOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 6,
    pointerEvents: 'none',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
  },
  backButtonTouchable: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  collapsedTitle: {
    position: 'absolute',
    left: 74,
    right: 20,
    zIndex: 10,
    height: 44,
    justifyContent: 'center',
  },
  collapsedTitleText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  bottomOverlays: {
    position: 'absolute',
    bottom: 45,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 4,
  },
  imageIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    height: 4,
    borderRadius: 2,
    marginHorizontal: 2,
  },
  imageCounter: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default ServiceImageGallery;
