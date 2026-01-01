/**
 * ServiceDetailScreen - Enhanced with sliding image animation
 */

import React, { useEffect, useState, useCallback } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { bookingAPI, serviceAPI } from '../../services/api';
import { Service, EphemeralSlot, Activity, DynamicBookingRequest, DynamicBookingResponse, Resource } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { format } from 'date-fns';

// Extracted Components
import ServiceImageGallery from '../../components/user/service-details/ServiceImageGallery';
import ServiceInfo from '../../components/user/service-details/ServiceInfo';
import ServiceBookingSection from '../../components/user/service-details/ServiceBookingSection';
import ServiceDetailSkeleton from '../../components/user/service-details/ServiceDetailSkeleton';
import { useAuth } from '../../contexts/AuthContext';
import { generateUUID } from '../../utils/helpers';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';

const ServiceDetailScreen = ({ route, navigation }: any) => {
  const { serviceId } = route.params;
  const { user } = useAuth();
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
  
  // Refs
  const scrollViewRef = React.useRef<any>(null);
  
  // Animation values
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const contentOpacity = React.useRef(new Animated.Value(1)).current;
  
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

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

  useEffect(() => {
    fetchServiceDetails();
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
    }
  }, [selectedDate, showBookingSection, service, selectedActivity]);

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
      console.error('Error fetching resources:', error);
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

    // Guard: If we're still loading resources or waiting for an activity selection,
    // don't attempt to fetch slots and don't reset the loading state.
    // This prevents the "No Slots Available" flash.
    if (resourcesLoading || (activities.length > 0 && !selectedActivity)) {
      return;
    }

    setSlotsLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      let timeSlots: EphemeralSlot[] = [];

      if (selectedActivity) {
        console.log(`🔄 Fetching availability for activity ${selectedActivity.code} on ${dateStr}`);
        const response = await serviceAPI.getActivityAvailability(service.id, selectedActivity.code, dateStr);
        // The API response now follows the EphemeralSlotResponse structure
        timeSlots = response.data.slots;
      }
      setAvailableSlots(timeSlots);
      // Reset selection when slots are refreshed
      setSelectedSlotKeys([]);
      setSelectedSlotPrice(0);
      setIdempotencyKey(null);
    } catch (error) {
      console.error('❌ Error fetching slot availability:', error);
      Alert.alert('Error', 'Failed to fetch available slots');
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const toggleSlotSelection = (slot: EphemeralSlot) => {
    if (!slot.available) {
      Alert.alert('Slot Unavailable', 'This time slot is no longer available');
      return;
    }

    if (!slot.slotKey) return;

    setSelectedSlotKeys(prev => {
      const isSelected = prev.includes(slot.slotKey!);
      let newKeys;
      if (isSelected) {
        newKeys = prev.filter(key => key !== slot.slotKey);
      } else {
        newKeys = [...prev, slot.slotKey!];
      }

      // Update total price and idempotency key
      const newPrice = availableSlots
        .filter(s => s.slotKey && newKeys.includes(s.slotKey))
        .reduce((sum, s) => sum + s.displayPrice, 0);
      
      setSelectedSlotPrice(newPrice);
      
      if (newKeys.length > 0) {
        if (!idempotencyKey) setIdempotencyKey(generateUUID());
      } else {
        setIdempotencyKey(null);
      }

      return newKeys;
    });
  };


  const handleConfirmBooking = async () => {
    // Check if user is logged in
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please login to continue with your booking.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Login', 
            onPress: () => navigation.navigate('Auth', { 
              screen: 'PhoneEntry',
              params: { 
                redirectTo: { 
                  name: 'User', 
                  params: {
                    screen: 'HomeTab',
                    params: {
                      screen: 'ServiceDetail',
                      params: { serviceId }
                    }
                  }
                } 
              }
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

    const performBooking = async (allowSplit: boolean = false) => {
      const bookingRequest: DynamicBookingRequest = {
        slotKeys: selectedSlotKeys,
        idempotencyKey: idempotencyKey,
        allowSplit
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
                onPress: () => performBooking(true) 
              }
            ]
          );
          return;
        }

        // Handle failure status from backend
        if (bookingData.status === 'FAILED') {
          Alert.alert('Booking Failed', bookingData.message || 'The selected slots are no longer available. Please pick another ones.');
          fetchAvailableSlots();
          return;
        }

        // Confirm booking directly and redirect
        Alert.alert(
          'Booking Request Submitted',
          'Your booking request has been submitted successfully and is awaiting manual confirmation.',
          [
            { 
              text: 'View Bookings', 
              onPress: () => {
                navigation.popToTop();
                navigation.navigate('MainTabs', { screen: 'Bookings' });
              } 
            }
          ]
        );

      } catch (error: any) {
        // Handle booking failure by refreshing slot list
        let message = 'The selected slot might no longer be available. Please pick another one.';
        if (error.response?.data?.message) {
          message = error.response.data.message;
        }

        Alert.alert(
          'Booking Failed', 
          message,
          [{ text: 'Refresh Slots', onPress: fetchAvailableSlots }]
        );
      } finally {
        setBookingLoading(false);
      }
    };

    performBooking();
  };

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
  }, [fetchResources]);

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
             <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.stickyTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {service.name}
          </Text>
        </View>
      </Animated.View>
      
      <Animated.ScrollView 
        ref={scrollViewRef} 
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ServiceImageGallery
          serviceId={service.id}
          images={images}
          serviceName={service.name}
          scrollY={scrollY}
          onBackPress={() => navigation.goBack()}
        />
        
        <Animated.View 
          style={[
            styles.contentContainer, 
            { 
              backgroundColor: theme.colors.background,
              opacity: contentOpacity,
              marginTop: -32,
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
            }
          ]}
        >
          <ServiceInfo 
            service={service}
          />

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
              onResourceSelect={setSelectedActivity as any}
              resourcesLoading={resourcesLoading}
            />
          )}
        </Animated.View>
      </Animated.ScrollView>

      {/* Floating Modern Footer */}
      <View style={[styles.footerContainer, { paddingBottom: Math.max(20, insets.bottom + 10) }]}>
        <View style={[styles.footer, { 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }]}>
          {showBookingSection ? (
            <View style={styles.bookingFooterContent}>
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
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Confirm Booking</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.detailsFooterContent}>
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
            </View>
          )}
        </View>
      </View>

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
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  stickyHeaderContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  stickyBackButton: {
    position: 'absolute',
    left: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyTitle: {
    fontSize: 18,
    fontWeight: '700',
    maxWidth: '70%',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 140,
    zIndex: 10,
    minHeight: 600,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 25,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
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
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '800',
  },
  slotCount: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  primaryButton: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default ServiceDetailScreen;
