/**
 * ServiceDetailScreen - Enhanced with sliding image animation
 */

import React, { useEffect, useState } from 'react';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { serviceAPI } from '../../services/api';
import { Service } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

// Existing Extracted Components
import ServiceImageGallery from '../../components/user/service-details/ServiceImageGallery';
import ServiceInfo from '../../components/user/service-details/ServiceInfo';
import ServiceBookingSection from '../../components/user/service-details/ServiceBookingSection';
import ServiceDetailSkeleton from '../../components/user/service-details/ServiceDetailSkeleton';

// New Extracted Components
import ServiceDetailHeader from '../../components/user/service-details/ServiceDetailHeader';
import ServiceDetailFooter from '../../components/user/service-details/ServiceDetailFooter';

// Hooks
import { useServiceBooking } from '../../hooks/useServiceBooking';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { useAlert } from '../../components/shared/CustomAlert';

const ServiceDetailScreen = ({ route, navigation }: any) => {
  const { serviceId } = route.params;
  const { showAlert } = useAlert();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [showShadow, setShowShadow] = useState(false);
  const [isStickyHeaderActive, setIsStickyHeaderActive] = useState(false);
  
  // Refs
  const scrollViewRef = React.useRef<any>(null);
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Booking Hook
  const {
    selectedDate,
    availableSlots,
    selectedSlotKeys,
    selectedSlotPrice,
    slotsLoading,
    bookingLoading,
    showBookingSection,
    setShowBookingSection,
    activities,
    selectedActivity,
    resourcesLoading,
    bookingEntranceAnim,
    footerCrossfadeAnim,
    handleDateSelect,
    toggleSlotSelection,
    handleActivitySelect,
    handleConfirmBooking,
    handleBookNow,
    setSelectedActivity,
    setSelectedSlotKeys,
    setSelectedDate
  } = useServiceBooking(serviceId, service, navigation);

  // Animation values
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const entranceAnim = React.useRef(new Animated.Value(0)).current;

  // Sticky Header Animations
  const headerOpacity = scrollY.interpolate({
    inputRange: [90, 180],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [90, 180],
    outputRange: [-20, 0],
    extrapolate: 'clamp',
  });

  const galleryTranslate = scrollY.interpolate({
    inputRange: [0, 280],
    outputRange: [0, -140],
    extrapolate: 'clamp',
  });

  const galleryOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    fetchServiceDetails();
    
    Animated.timing(entranceAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      setShowShadow(true);
    }, 150);
  }, []);

  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      if (value > 90 && !isStickyHeaderActive) {
        setIsStickyHeaderActive(true);
      } else if (value <= 90 && isStickyHeaderActive) {
        setIsStickyHeaderActive(false);
      }
    });

    return () => {
      scrollY.removeListener(listenerId);
    };
  }, [isStickyHeaderActive]);

  React.useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' },
    });
  }, [navigation]);

  useEffect(() => {
    if (service?.id) {
      fetchMinPrice();
    }
  }, [service]);

  // Restore booking session if coming back from Auth
  useEffect(() => {
    const restored = route.params?.restoredBooking;
    if (restored && activities.length > 0) {
      if (restored.selectedActivityCode) {
        const activity = activities.find((a: any) => a.code === restored.selectedActivityCode);
        if (activity) setSelectedActivity(activity);
      }
      if (restored.selectedDate) setSelectedDate(new Date(restored.selectedDate));
      if (restored.selectedSlotKeys) setSelectedSlotKeys(restored.selectedSlotKeys);
      
      setShowBookingSection(true);
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      });
      navigation.setParams({ restoredBooking: undefined });
    }
  }, [route.params?.restoredBooking, activities]);

  const fetchServiceDetails = async () => {
    try {
      const response = await serviceAPI.getServiceById(serviceId);
      setService(response.data);
    } catch (error) {
      showAlert({
        title: 'Error',
        message: 'Failed to fetch service details',
        type: 'error',
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const fetchMinPrice = async () => {
    if (!service?.id) return;
    setPriceLoading(true);
    try {
      const response = await serviceAPI.getLowestPrice(service.id);
      setMinPrice(response.data);
    } catch (error) {
      setMinPrice(null);
    } finally {
      setPriceLoading(false);
    }
  };

  const handleBookNowScroll = () => {
    handleBookNow();
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });
  };

  if (loading || !service) {
    return <ServiceDetailSkeleton />;
  }

  return (
    <ScreenWrapper style={styles.container} translucent={true} safeAreaEdges={[]}>
      <ServiceDetailHeader
        isVisible={isStickyHeaderActive}
        opacity={headerOpacity}
        translateY={headerTranslate}
        title={service.name}
        onBackPress={() => navigation.goBack()}
        insetsTop={insets.top}
      />

      <View style={[styles.backgroundFill, { backgroundColor: '#FFFFFF' }]} />
      
      <Animated.View 
        style={[styles.galleryContainer, { 
          opacity: galleryOpacity,
          transform: [{ translateY: galleryTranslate }]
        }]}
        pointerEvents="box-none"
      >
        <ServiceImageGallery
          serviceId={service.id}
          images={service.images || []}
          serviceName={service.name}
          location={service.location}
          rating={service.rating}
          scrollY={scrollY}
          onBackPress={() => navigation.goBack()}
        />
      </Animated.View>
      
      <Animated.ScrollView 
        ref={scrollViewRef} 
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={{ height: verticalScale(230) }} />
        
        <Animated.View 
          style={[
            styles.contentContainer,
            showShadow && styles.contentContainerShadow,
            { 
              backgroundColor: theme.colors.background,
              opacity: entranceAnim,
              transform: [{
                translateY: entranceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [verticalScale(40), 0]
                })
              }],
            }
          ]}
        >
          <View style={styles.pullBarContainer}>
            <View style={[styles.pullBar, { backgroundColor: theme.colors.border }]} />
          </View>

          <ServiceInfo service={service} showShadow={showShadow} />

          <Animated.View 
            style={{
              opacity: bookingEntranceAnim,
              transform: [{
                translateY: bookingEntranceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [verticalScale(20), 0]
                })
              }]
            }}
          >
            {showBookingSection && (
              <ServiceBookingSection
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                availableSlots={availableSlots}
                selectedSlotKeys={selectedSlotKeys}
                onSlotToggle={toggleSlotSelection}
                slotsLoading={slotsLoading}
                onClose={() => setShowBookingSection(false)}
                resources={activities as any}
                selectedResource={selectedActivity as any}
                onResourceSelect={handleActivitySelect as any}
                resourcesLoading={resourcesLoading}
              />
            )}
          </Animated.View>
        </Animated.View>
      </Animated.ScrollView>

      <ServiceDetailFooter
        entranceAnim={entranceAnim}
        footerCrossfadeAnim={footerCrossfadeAnim}
        showBookingSection={showBookingSection}
        minPrice={minPrice}
        selectedSlotPrice={selectedSlotPrice}
        selectedSlotKeys={selectedSlotKeys}
        bookingLoading={bookingLoading}
        onBookNow={handleBookNowScroll}
        onConfirmBooking={handleConfirmBooking}
        insetsBottom={insets.bottom}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  backgroundFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: verticalScale(300),
    zIndex: 0,
  },
  galleryContainer: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    zIndex: 10,
  },
  contentContainer: {
    flex: 1,
    paddingTop: verticalScale(40),
    paddingHorizontal: scale(24),
    paddingBottom: verticalScale(140),
    zIndex: 10,
    minHeight: verticalScale(600),
    borderTopLeftRadius: moderateScale(50),
    borderTopRightRadius: moderateScale(50),
    overflow: 'hidden',
    marginTop: -verticalScale(20),
  },
  contentContainerShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(-15) },
    shadowOpacity: 0.12,
    shadowRadius: moderateScale(25),
    elevation: 30,
  },
  pullBarContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(8),
    position: 'absolute',
    top: 0,
    zIndex: 100,
  },
  pullBar: {
    width: scale(36),
    height: verticalScale(4),
    borderRadius: moderateScale(2),
    opacity: 0.25,
  },
});

export default ServiceDetailScreen;
