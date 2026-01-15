/**
 * ServiceDetailScreen - Enhanced with sliding image animation
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import {
  View,
  StyleSheet,
  Animated,
  Alert,
  StatusBar,
  Linking,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  InteractionManager,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { bookingAPI, serviceAPI, razorpayAPI } from '../../services/api';
import { Service, EphemeralSlot, Activity, DynamicBookingRequest, DynamicBookingResponse, Resource } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { format } from 'date-fns';
import BackIcon from '../../components/shared/icons/BackIcon';

// Extracted Components
import ServiceImageGallery from '../../components/user/service-details/ServiceImageGallery';
import ServiceInfo from '../../components/user/service-details/ServiceInfo';
import ServiceBookingSection from '../../components/user/service-details/ServiceBookingSection';
import ServiceDetailSkeleton from '../../components/user/service-details/ServiceDetailSkeleton';
import BookingSummarySheet from '../../components/user/service-details/BookingSummarySheet';
import { useAuth } from '../../contexts/AuthContext';
import { generateUUID } from '../../utils/helpers';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import RazorpayService from '../../services/RazorpayService';

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
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(10),
    elevation: 5,
  },
  stickyHeaderContent: {
    height: verticalScale(56),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  stickyBackButton: {
    position: 'absolute',
    left: scale(10),
    width: moderateScale(40),
    height: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyTitle: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    maxWidth: '70%',
    letterSpacing: -0.2,
  },
  contentContainer: {
    flex: 1,
    paddingTop: verticalScale(40),
    paddingHorizontal: scale(24),
    paddingBottom: verticalScale(140),
    zIndex: 10,
    minHeight: verticalScale(600),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(-15) },
    shadowOpacity: 0.12,
    shadowRadius: moderateScale(25),
    elevation: 30,
    borderTopLeftRadius: moderateScale(50),
    borderTopRightRadius: moderateScale(50),
    overflow: 'hidden',
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
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(10),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(24),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(20),
    elevation: 10,
  },
  detailsFooterContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingFooterContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionInfo: {
    flex: 1,
    marginRight: scale(8),
  },
  priceLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: verticalScale(2),
  },
  priceValue: {
    fontSize: moderateScale(22),
    fontWeight: '800',
  },
  totalAmount: {
    fontSize: moderateScale(24),
    fontWeight: '800',
  },
  slotCount: {
    fontSize: moderateScale(13),
    fontWeight: '500',
    marginTop: verticalScale(2),
  },
  primaryButton: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: scale(130),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(8),
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(17),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

const ServiceDetailScreen = ({ route, navigation }: any) => {
  const { serviceId } = route.params;
  const { user, setRedirectData } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  
  // Booking functionality state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<EphemeralSlot[]>([]);
  const [selectedSlotKeys, setSelectedSlotKeys] = useState<string[]>([]);
  const [selectedSlotPrice, setSelectedSlotPrice] = useState<number>(0);
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showBookingSection, setShowBookingSection] = useState(false);
  
  // Activity/Resource selection state
  const [resources, setResources] = useState<Resource[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [preBookingData, setPreBookingData] = useState<DynamicBookingResponse | null>(null);
  
  
  // Refs
  const scrollViewRef = React.useRef<any>(null);
  
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Animation values
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const entranceAnim = React.useRef(new Animated.Value(0)).current;
  const bookingEntranceAnim = React.useRef(new Animated.Value(0)).current;
  const footerCrossfadeAnim = React.useRef(new Animated.Value(0)).current; // 0 for detail, 1 for booking
  

  // Sticky Header Animations
  const headerOpacity = scrollY.interpolate({
    inputRange: [90, 180], // Appears more quickly as we scroll
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
    outputRange: [0, -140], // Parallax effect
    extrapolate: 'clamp',
  });

  const galleryOpacity = scrollY.interpolate({
    inputRange: [0, 200, 280],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    fetchServiceDetails();
    
    // Entrance Animation
    Animated.timing(entranceAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    return () => {
    };
  }, []);



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

  useEffect(() => {
    if (showBookingSection && service) {
      fetchAvailableSlots();
      // Animate booking section entrance
      Animated.timing(bookingEntranceAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
      
      // Crossfade footer
      Animated.timing(footerCrossfadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate out
      Animated.timing(bookingEntranceAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      Animated.timing(footerCrossfadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedDate, showBookingSection, service, selectedActivity]);

  // Restore booking session if coming back from Auth
  useEffect(() => {
    const restored = route.params?.restoredBooking;
    if (restored && activities.length > 0) {
      // Restoring booking session silently

      
      // Restore activity
      if (restored.selectedActivityCode) {
        const activity = activities.find((a: Activity) => a.code === restored.selectedActivityCode);
        if (activity) setSelectedActivity(activity);
      }
      
      // Restore date
      if (restored.selectedDate) {
        setSelectedDate(new Date(restored.selectedDate));
      }
      
      // Restore slots
      if (restored.selectedSlotKeys) {
        setSelectedSlotKeys(restored.selectedSlotKeys);
      }
      
      setShowBookingSection(true);
      
      // Scroll to booking section
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      });
      
      // Clear the params so they don't restore again on refresh
      navigation.setParams({ restoredBooking: undefined });
    }
  }, [route.params?.restoredBooking, activities]);

  const fetchServiceDetails = async () => {
    try {
      const response = await serviceAPI.getServiceById(serviceId);
      setService(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch service details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    if (!serviceId) return;
    setResourcesLoading(true);
    try {
      const response = await serviceAPI.getResourcesByServiceId(serviceId);
      const allResources: Resource[] = response.data;
      setResources(allResources);
      
      // Extract unique activities
      const activityMap = new Map<string, Activity>();
      allResources.forEach(res => {
        res.activities?.forEach((activity: Activity) => {
          if (!activityMap.has(activity.code)) {
            activityMap.set(activity.code, activity);
          }
        });
      });
      
      const uniqueActivities = Array.from(activityMap.values());
      setActivities(uniqueActivities);
      
      if (uniqueActivities.length > 0) {
        setSelectedActivity(uniqueActivities[0]);
      }
    } catch (error) {
    } finally {
      setResourcesLoading(false);
    }
  };

  const fetchMinPrice = async () => {
    if (!service?.id) return;
    
    setPriceLoading(true);
    try {
      const response = await serviceAPI.getLowestPrice(service.id);
      // API returns a simple double value like 1500.0 directly
      setMinPrice(response.data);
    } catch (error) {
      // If API fails, we'll show loading state or handle gracefully
      setMinPrice(null);
    } finally {
      setPriceLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!service) return;

    if (resourcesLoading || (activities.length > 0 && !selectedActivity)) {
      return;
    }

    setSlotsLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      let timeSlots: EphemeralSlot[] = [];

      if (selectedActivity) {
        const response = await serviceAPI.getActivityAvailability(service.id, (selectedActivity as any).code, dateStr);
        timeSlots = response.data.slots || response.data.content || [];
      }
      setAvailableSlots(timeSlots);
    } catch (error) {
    } finally {
      setSlotsLoading(false);
    }
  };

  // Sync price and idempotency whenever selection or available slots change
  useEffect(() => {
    if (availableSlots.length > 0 && selectedSlotKeys.length > 0) {
      const newPrice = availableSlots
        .filter(s => s.slotKey && selectedSlotKeys.includes(s.slotKey))
        .reduce((sum, s) => sum + (s.displayPrice || s.price || 0), 0);
      
      setSelectedSlotPrice(newPrice);
      if (!idempotencyKey) setIdempotencyKey(generateUUID());
    } else if (selectedSlotKeys.length === 0) {
      setSelectedSlotPrice(0);
      setIdempotencyKey(null);
    }
  }, [selectedSlotKeys, availableSlots]);

  const toggleSlotSelection = (slot: EphemeralSlot) => {
    if (!slot.available) {
      Alert.alert('Slot Unavailable', 'This time slot is no longer available');
      return;
    }

    if (!slot.slotKey) return;

    setSelectedSlotKeys(prev => {
      const isSelected = prev.includes(slot.slotKey!);
      if (isSelected) {
        return prev.filter(key => key !== slot.slotKey);
      } else {
        return [...prev, slot.slotKey!];
      }
    });
  };

  const handleActivitySelect = (activity: Activity) => {
    setSelectedActivity(activity);
    setSelectedSlotKeys([]);
    setSelectedSlotPrice(0);
    setIdempotencyKey(null);
  };

  const [showConfirmation, setShowConfirmation] = useState(false);

  // Derived state for booking summary
  const selectedSlotsList = React.useMemo(() => {
    return availableSlots.filter(slot => slot.slotKey && selectedSlotKeys.includes(slot.slotKey));
  }, [availableSlots, selectedSlotKeys]);

  // Restore booking session if coming back from Auth - REMOVED per user request
  // useEffect(() => {
  //   if (route.params?.restoredBooking) {
  //     fetchResources();
  //   }
  // }, [route.params?.restoredBooking]);

  const handleConfirmBooking = async () => {
     // Check if user is logged in
    if (!user) {
      const redirectInfo = { 
        name: 'User', 
        params: {
          screen: 'ServiceDetail',
          params: { 
            serviceId,
          }
        }
      };

      Alert.alert(
        'Login Required',
        'Please login to continue with your booking.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Login', 
            onPress: () => navigation.navigate('Auth', { 
              screen: 'PhoneEntry',
              params: { redirectTo: redirectInfo }
            }) 
          }
        ]
      );
      return;
    }

    if (selectedSlotKeys.length === 0 || !idempotencyKey) {
      Alert.alert('No Slots Selected', 'Please select at least one time slot');
      return;
    }

    // Trigger pre-booking before showing summary
    await handlePreBooking();
  };

  const handlePreBooking = async (allowSplit: boolean = false) => {
    const bookingRequest: DynamicBookingRequest = {
      slotKeys: selectedSlotKeys,
      idempotencyKey: idempotencyKey!,
      allowSplit,
      paymentMethod: 'RAZORPAY',
    };

    try {
      setBookingLoading(true);
      const response = await bookingAPI.createBooking(bookingRequest);
      const bookingData = response.data;

      if (bookingData.status === 'PARTIAL_AVAILABLE') {
        setBookingLoading(false);
        Alert.alert(
          'Split Booking Required',
          'A single ground is not available for the entire duration. Do you want to book separate grounds for these slots?',
          [
            { text: 'No', style: 'cancel' },
            { 
              text: 'Yes, Book Split', 
              onPress: () => handlePreBooking(true) 
            }
          ]
        );
        return;
      }

      if (bookingData.status === 'FAILED') {
        setBookingLoading(false);
        Alert.alert('Booking Failed', bookingData.message || 'The selected slots are no longer available.');
        fetchAvailableSlots();
        return;
      }

      // Success or Payment Pending - Show summary sheet
      setPreBookingData(bookingData);
      setShowConfirmation(true);
    } catch (error: any) {
      const message = error.response?.data?.message || 'The selected slot might no longer be available.';
      Alert.alert('Booking Failed', message, [{ text: 'Refresh Slots', onPress: fetchAvailableSlots }]);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleFinalBooking = useCallback(async () => {
    if (!preBookingData) return;
    
    try {
      setBookingLoading(true);
      
      // Step 2: Create the Razorpay Order
      console.log('Summary confirmed, creating Razorpay order for booking:', preBookingData.id);
      const orderResponse = await razorpayAPI.createOrder(preBookingData.id);
      const orderData = orderResponse.data;
      
      setBookingLoading(false);
      setShowConfirmation(false);
      
      // Step 2: Immediately navigate to Processing Screen
      // We pass orderData so the Processing screen can trigger the checkout modal
      console.log('Order created, navigating to PaymentLauncher screen to trigger checkout...');
      navigation.replace('PaymentLauncher', { 
        bookingId: preBookingData.id,
        orderData: orderData,
      });

    } catch (error: any) {
      console.error('Failed to create order:', error);
      setBookingLoading(false);
      Alert.alert('Error', error.response?.data?.message || error.message || 'Could not initiate payment. Please try again.');
    }
  }, [preBookingData, navigation]);

  const handleBookNow = useCallback(() => {
    // Stage 1: Clear selection
    setSelectedSlotKeys([]);
    setSelectedSlotPrice(0);
    setIdempotencyKey(null);
    
    // Stage 2: Show section and fetch data
    setShowBookingSection(true);
    setSlotsLoading(true);
    fetchResources();
    
    // Stage 3: Scroll to section
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });
  }, [fetchResources, serviceId]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSlotsLoading(true);
    // Reset selection when date changes
    setSelectedSlotKeys([]);
    setSelectedSlotPrice(0);
    setIdempotencyKey(null);
  };


  if (loading || !service) {
    return <ServiceDetailSkeleton />;
  }


  const images = service.images && service.images.length > 0 
    ? service.images 
    : service.image 
      ? [service.image] 
      : ['https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'];

  return (
    <ScreenWrapper 
      style={styles.container} 
      translucent={true} 
      safeAreaEdges={[]}
    >
      
      {/* Dynamic Sticky Top Bar */}
      <Animated.View 
        style={[
          styles.stickyHeader, 
          { 
            paddingTop: insets.top,
            backgroundColor: theme.colors.background,
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslate }],
            borderBottomColor: theme.colors.border + '20',
          }
        ]}
      >
        <View style={styles.stickyHeaderContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.stickyBackButton}>
             <BackIcon width={24} height={24} fill={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.stickyTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {service.name}
          </Text>
        </View>
      </Animated.View>
      
      {/* Refactored Gallery - Absolute positioned for native translateY */}
      <Animated.View 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1,
          opacity: galleryOpacity,
          transform: [{ translateY: galleryTranslate }]
        }}
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
        {/* Gallery Spacer */}
        <View style={{ height: 280 }} />
        
        <Animated.View 
          style={[
            styles.contentContainer, 
            { 
              backgroundColor: theme.colors.background,
              opacity: entranceAnim,
              transform: [{
                translateY: entranceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0]
                })
              }],
              marginTop: -verticalScale(20),
              borderTopLeftRadius: moderateScale(50),
              borderTopRightRadius: moderateScale(50),
            }
          ]}
        >
          <View style={styles.pullBarContainer}>
            <View style={[styles.pullBar, { backgroundColor: theme.colors.border }]} />
          </View>

          <ServiceInfo 
            service={service}
          />


          <Animated.View 
            style={{
              opacity: bookingEntranceAnim,
              transform: [{
                translateY: bookingEntranceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
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
                resources={activities as any} // Activities displayed in the same chip UI
                selectedResource={selectedActivity as any}
                onResourceSelect={handleActivitySelect as any}
                resourcesLoading={resourcesLoading}
              />
            )}
          </Animated.View>


          <BookingSummarySheet
            visible={showConfirmation}
            onClose={() => setShowConfirmation(false)}
            onConfirm={handleFinalBooking}
            serviceName={service.name}
            date={selectedDate}
            selectedSlots={selectedSlotsList}
            totalPrice={selectedSlotPrice}
            loading={bookingLoading}
            bookingData={preBookingData}
          />

        </Animated.View>
      </Animated.ScrollView>

      {/* Floating Modern Footer */}
      <Animated.View 
        style={[
          styles.footerContainer, 
          { 
            paddingBottom: Math.max(20, insets.bottom + 10),
            transform: [{
              translateY: entranceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0]
              })
            }]
          }
        ]}
      >
        <View style={[styles.footer, { 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }]}>
          {/* Detail View Footer Content */}
          <Animated.View 
            style={[
              styles.detailsFooterContent,
              {
                opacity: footerCrossfadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0]
                }),
                transform: [{
                  translateX: footerCrossfadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20]
                  })
                }],
                position: showBookingSection ? 'absolute' : 'relative',
                width: '100%',
                pointerEvents: showBookingSection ? 'none' : 'auto'
              }
            ]}
          >
            <View>
              <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>Starting from</Text>
              <Text style={[styles.priceValue, { color: theme.colors.primary }]}>
                {minPrice !== null ? `₹${minPrice}/hr` : 'Check Slots'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleBookNow}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primary + 'DD']}
                style={styles.primaryButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.primaryButtonText}>Explore Slots</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Booking View Footer Content */}
          <Animated.View 
            style={[
              styles.bookingFooterContent,
              {
                opacity: footerCrossfadeAnim,
                transform: [{
                  translateX: footerCrossfadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }],
                position: !showBookingSection ? 'absolute' : 'relative',
                width: '100%',
                pointerEvents: !showBookingSection ? 'none' : 'auto'
              }
            ]}
          >
            <View style={styles.selectionInfo}>
              <Text style={[styles.totalAmount, { color: theme.colors.text }]}>₹{selectedSlotPrice}</Text>
              <Text style={[styles.slotCount, { color: theme.colors.textSecondary }]}>
                {selectedSlotKeys.length > 0 ? `${selectedSlotKeys.length} slots selected` : 'No slot selected'}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[
                  styles.primaryButton, 
                  { backgroundColor: theme.colors.primary },
                  selectedSlotKeys.length === 0 && { opacity: 0.5 }
              ]}
              onPress={handleConfirmBooking}
              disabled={selectedSlotKeys.length === 0 || bookingLoading}
              activeOpacity={0.8}
            >
              {bookingLoading ? (
                <ActivityIndicator color="#FFFFFF" size={24} />
              ) : (
                <Text style={styles.primaryButtonText}>Confirm Booking</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>

    </ScreenWrapper>
  );
};



export default ServiceDetailScreen;
