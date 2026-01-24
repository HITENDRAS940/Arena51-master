import React, { useEffect, useState, useCallback } from 'react';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';

import { Booking, UserBooking } from '../../types';
import { serviceAPI, bookingAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ActivitySkeletonCard, SkeletonList } from '../../components/shared/Skeletons';
import { useLocation } from '../../hooks/useLocation';
import { useTabBarScroll } from '../../hooks/useTabBarScroll';
import CitySelectionModal from '../../components/user/CitySelectionModal';
import { theme as themeObj } from '../../contexts/ThemeContext';
import { Activity } from '../../types';
import { DiscoveryArrowIcon } from '../../components/shared/icons/activities';
import LocationIcon from '../../components/shared/icons/LocationIcon';
import UpcomingMatchCard from '../../components/user/UpcomingMatchCard';
import BookingDetailsModal from '../../components/user/BookingDetailsModal';
import { isAfter, addHours } from 'date-fns';
import ActivityCard from '../../components/user/ActivityCard';



const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getStatusGradient = (status: string): [string, string] => {
  switch (status?.toUpperCase()) {
    case 'CONFIRMED':
    case 'SUCCESS':
      return ['#065F46', '#10B981']; // Deep Teal to Emerald
    case 'CANCELLED':
    case 'FAILED':
      return ['#EF4444', '#DC2626']; // Red
    case 'PENDING':
    case 'PAYMENT_PENDING':
      return ['#F59E0B', '#D97706']; // Orange
    default:
      return ['#4B5563', '#1F2937']; // Gray for other/unknown
  }
};




const HomeScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { user, redirectData, setRedirectData } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);
  const [upcomingBooking, setUpcomingBooking] = useState<UserBooking | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const entranceAnimation = React.useRef(new Animated.Value(0)).current; // For entrance animation

  // Location bits
  const { location, manualCity, setCityManually, detectAndSetToCurrentCity, loading: locationLoading } = useLocation();
  const [showCityModal, setShowCityModal] = useState(false);
  const [isHeaderActive, setIsHeaderActive] = useState(false);
  const { onScroll: onTabBarScroll } = useTabBarScroll(navigation, { isRootTab: true });

  useEffect(() => {
    // Trigger entrance animation
    Animated.timing(entranceAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const id = scrollY.addListener(({ value }) => {
      const active = value > 60;
      if (active !== isHeaderActive) {
        setIsHeaderActive(active);
      }
    });
    return () => scrollY.removeListener(id);
  }, [isHeaderActive]);
  
  // Handle post-login redirection
  useEffect(() => {
    if (redirectData) {
      const data = redirectData;
      setRedirectData(null); // Clear it
      
      if (data.name) {
        navigation.navigate(data.name, data.params);
      }
    }
  }, [redirectData]);

  useEffect(() => {
    fetchActivities();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchLastBooking();
      } else {
        setLastBooking(null);
      }
    }, [user])
  );


  const fetchActivities = async () => {
    setLoading(true);
    try {
        const response = await serviceAPI.getActivities();
        setActivities(response.data);
    } catch (error) {
        // Silent error handling for UI
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
  };

  const fetchLastBooking = async () => {
    try {
      // 1. Fetch all bookings to find the nearest upcoming one
      const allBookingsResponse = await bookingAPI.getUserBookings();
      const allBookings = allBookingsResponse.data || [];
      
      const now = new Date();
      const threshold = addHours(now, 48); // Show if match is within 48 hours

      const upcoming = allBookings
        .filter(b => b.status === 'CONFIRMED')
        .find(b => {
          if (!b.date || !b.slots?.[0]?.startTime) return false;
          // Assuming date is YYYY-MM-DD and startTime is HH:mm
          const [hours, minutes] = b.slots[0].startTime.split(':').map(Number);
          const [y, m, d] = b.date.split('-').map(Number);
          const bookingDate = new Date(y, m - 1, d, hours, minutes);
          return isAfter(bookingDate, now) && !isAfter(bookingDate, threshold);
        });

      setUpcomingBooking(upcoming || null);

      // 2. Fetch last booking for the "Jump Back In" section
      const response = await bookingAPI.getLastBooking();
      if (response.data) {
        setLastBooking(response.data);
      } else {
        setLastBooking(null);
      }
    } catch (error) {
      // Fail silently for UI
      setLastBooking(null);
      setUpcomingBooking(null);
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [60, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 60, 100],
    outputRange: [-100, -10, 0],
    extrapolate: 'clamp',
  });

  const mainHeaderTranslateY = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, -120],
    extrapolate: 'clamp',
  });

  const handleActivityPress = useCallback((activity: Activity) => {
      const city = manualCity || location?.city || '';
      navigation.navigate('CategoryServices', { 
          activityId: activity.id, 
          activityName: activity.name,
          activityCode: activity.code,
          city 
      });
  }, [manualCity, location?.city, navigation]);

  const renderActivityItem = useCallback(({ item }: { item: Activity }) => (
    <ActivityCard 
      item={item} 
      onPress={handleActivityPress} 
    />
  ), [handleActivityPress]);


  const renderMainHeader = () => (
    <Animated.View style={[
      styles.headerContainer, 
      { 
        position: 'absolute',
        top: Math.max(insets.top + 20, 20),
        left: 0,
        right: 0,
        zIndex: 5,
        transform: [{ translateY: mainHeaderTranslateY }]
      }
    ]}>
      <View style={styles.headerTopRow}>
          <View>
              <Animated.Text style={[styles.headerTitleMain, { color: theme.colors.text }]}>
                  Your game.
              </Animated.Text>
              <Animated.Text style={[styles.headerTitleSub, { color: theme.colors.textSecondary }]}>
                  Your venue.
              </Animated.Text>
          </View>
          
          <TouchableOpacity 
              style={[styles.locationBadge, { backgroundColor: theme.colors.card, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: {width:0, height:4} }]}
              onPress={() => setShowCityModal(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
              <LocationIcon size={20} color={theme.colors.primary} />
              <Text style={[styles.locationText, { color: theme.colors.text }]}>
                  {manualCity || location?.city || 'Select city...'}
              </Text>
          </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <ScreenWrapper 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      safeAreaEdges={['left', 'right']}
    >
      <Animated.View style={{ 
        flex: 1,
        opacity: entranceAnimation,
        transform: [{
          translateY: entranceAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0]
          })
        }]
      }}>
        {/* Sticky Header */}
        <Animated.View 
          pointerEvents={isHeaderActive ? 'auto' : 'none'}
          style={[
            styles.stickyHeader, 
            { 
              backgroundColor: theme.colors.background,
              paddingTop: insets.top,
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslate }],
              borderBottomColor: theme.colors.border,
            }
          ]}
        >
          <View style={styles.stickyHeaderContent}>
            <View>
              <Text style={[styles.stickyTitle, { color: theme.colors.text }]}>HOME</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.stickyLocation, { backgroundColor: theme.colors.card }]}
              onPress={() => setShowCityModal(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <LocationIcon size={14} color={theme.colors.primary} />
              <Text style={[styles.stickyLocationText, { color: theme.colors.text }]} numberOfLines={1}>
                {manualCity || location?.city || 'Select...'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {renderMainHeader()}

        <Animated.ScrollView
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true, listener: onTabBarScroll }
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchActivities();
                if (user) fetchLastBooking();
              }}
              progressViewOffset={200}
            />
          }
        >
          <View style={{ 
            height: (insets.top + 20) + 100,
          }} />
        
        {/* Upcoming Match Countdown */}
        <UpcomingMatchCard 
          booking={upcomingBooking}
          onPress={() => {
            if (upcomingBooking?.id) {
              setSelectedBookingId(upcomingBooking.id);
              setIsModalVisible(true);
            } else {
              // If no booking, scroll to sport selection
              // For now, let's just let it be a decorative card or add a scroll logic if we had a ref
            }
          }}
        />
        
        {/* Activity List */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Choose your Sport</Text>
        </View>
        <View style={styles.activityListContainer}>
            {loading ? (
              <SkeletonList
                  count={3}
                  horizontal
                  renderItem={() => <ActivitySkeletonCard />}
                  contentContainerStyle={styles.activityListContent}
              />
            ) : (
              <FlatList
                data={activities}
                renderItem={renderActivityItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                initialNumToRender={5}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
                nestedScrollEnabled={true}
                contentContainerStyle={[
                  styles.activityListContent,
                  { paddingHorizontal: scale(20) }
                ]}
              />
            )}
        </View>

        {/* Discover All Card */}
        <View style={{ padding: 20 }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 16 }]}>All Venues</Text>
          <TouchableOpacity
            style={[styles.exploreButton, { backgroundColor: theme.colors.card }]}
            onPress={() => navigation.navigate('AllServices', { city: manualCity || location?.city })}
            activeOpacity={0.9}
          >
             <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]} 
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.exploreGradient}
              >
                  <View style={[styles.exploreContent, { zIndex: 2 }]}>
                      <Text style={styles.exploreTitle}>Discover All Venues</Text>
                      <Text style={styles.exploreSubtitle}>Find the perfect Venue in {manualCity || location?.city || 'your city'}</Text>
                  </View>
                  <DiscoveryArrowIcon size={60} color="#10B981" style={{zIndex: 2}} />
              </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recent Booking / Guest Login Banner */}
        <View style={styles.bannerSection}>
          <View style={styles.sectionHeaderContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Jump Back In</Text>
          </View>
          
          {!user ? (
            <TouchableOpacity 
              style={[styles.guestBanner, { backgroundColor: theme.colors.card }]}
              onPress={() => navigation.navigate('Auth')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[theme.colors.primary, '#4338CA']} // Keep some accent color for guest banner unless specified otherwise, but using primary
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.guestBannerGradient}
              >
                <View style={[styles.guestBannerContent, { zIndex: 2 }]}>
                  <View style={styles.guestTextContainer}>
                    <Text style={styles.guestBannerTitle}>See Your History</Text>
                    <Text style={styles.guestBannerSubtitle}>
                      Login to view your last visited venues and quickly rebook them.
                    </Text>
                  </View>
                  <View style={styles.guestActionContainer}>
                    <View style={styles.actionIconCircle}>
                      <Ionicons name="arrow-forward" size={24} color="#4338CA" />
                    </View>
                  </View>
                </View>
                {/* Decorative Icon */}
                <View style={styles.brandIconDecor}>
                   <Ionicons name="time" size={120} color="rgba(255, 255, 255, 0.1)" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ) : lastBooking ? (
            <TouchableOpacity 
              style={[styles.recentBookingCard, { backgroundColor: theme.colors.card }]}
              activeOpacity={0.9}
              onPress={() => {
                if (lastBooking?.serviceId) {
                  navigation.navigate('ServiceDetail', { serviceId: lastBooking.serviceId });
                }
              }}
            >
              <LinearGradient
                colors={getStatusGradient(lastBooking.status)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.recentBookingGradient}
              >
                <View style={[styles.recentBookingContent, { zIndex: 2 }]}>
                  <View style={styles.recentBookingHeader}>
                      <View style={[styles.recentIconBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                          <Ionicons name="football" size={24} color="#FFFFFF" />
                      </View>
                      <View style={styles.recentInfo}>
                          <View style={styles.recentTitleRow}>
                            <Text style={styles.recentTitle} numberOfLines={1}>
                                {lastBooking.serviceName}
                            </Text>
                            {lastBooking.status === 'CONFIRMED' && (
                              <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
                            )}
                          </View>
                          <Text style={styles.recentDate} numberOfLines={1}>
                               {lastBooking.date || lastBooking.bookingDate}
                          </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                          <Text style={styles.statusText}>
                              {lastBooking.status}
                          </Text>
                      </View>
                  </View>
                  
                  <View style={styles.rebookDivider} />
                  
                  <View style={styles.rebookActionRow}>
                      <Text style={styles.rebookActionText}>Book this venue again</Text>
                      <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                  </View>
                </View>

                {/* Decorative Background Icon */}
                <View style={styles.recentCardDecor}>
                  <Ionicons name="trophy" size={140} color="rgba(255, 255, 255, 0.1)" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ) : null}
        </View>


        </Animated.ScrollView>
      </Animated.View>

      <CitySelectionModal
        visible={showCityModal}
        onClose={() => setShowCityModal(false)}
        onSelectCity={(city) => setCityManually(city)}
        onUseCurrentLocation={detectAndSetToCurrentCity}
        currentCity={manualCity || location?.city}
      />

      <BookingDetailsModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        bookingId={selectedBookingId}
      />
    </ScreenWrapper>
  );

};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(24),
  },
  headerTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: verticalScale(20),
  },
  headerTitleMain: {
      fontSize: moderateScale(34),
      fontWeight: 'condensedBold',
      fontFamily: themeObj.fonts.bold,
      lineHeight: moderateScale(40),
      letterSpacing: -1,
  },
  headerTitleSub: {
    fontSize: moderateScale(34),
    fontWeight: 'condensedBold', 
    fontFamily: themeObj.fonts.bold,
    lineHeight: moderateScale(40),
    letterSpacing: -1,
    opacity: 0.5,
  },
  locationBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(12),
      borderRadius: moderateScale(100),
      gap: scale(8),
  },
  locationText: {
      fontSize: moderateScale(16),
      fontWeight: '700',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    marginTop: verticalScale(8),
    marginBottom: verticalScale(16),
  },
  sectionTitle: {
    fontSize: moderateScale(22),
    fontWeight: '800', 
    letterSpacing: -0.5,
  },
  activityListContainer: {
    paddingVertical: verticalScale(8),
    paddingBottom: verticalScale(8),
  },
  activityListContent: {
      // paddingHorizontal: scale(20),
      // paddingTop: verticalScale(20),
      gap: 0,
      paddingBottom: verticalScale(10),
  },
  exploreButton: {
      borderRadius: moderateScale(24),
      marginTop: verticalScale(4),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: verticalScale(8) },
      shadowOpacity: 0.2,
      shadowRadius: moderateScale(16),
      elevation: 8,
  },
  exploreGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: moderateScale(24),
      borderRadius: moderateScale(24),
      overflow: 'hidden', 
      height: verticalScale(120),
  },
  exploreContent: {
      flex: 1,
      marginRight: scale(16),
      justifyContent: 'center',
  },
  exploreTitle: {
      fontSize: moderateScale(20),
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: verticalScale(6),
  },
  exploreSubtitle: {
      fontSize: moderateScale(13),
      color: 'rgba(255,255,255,0.7)',
      fontWeight: '500',
  },
  
  // Recent Booking Styles
  recentBookingCard: {
      borderRadius: moderateScale(24),
      overflow: 'hidden',
      shadowColor: '#065F46',
      shadowOffset: { width: 0, height: verticalScale(8) },
      shadowOpacity: 0.25,
      shadowRadius: moderateScale(16),
      elevation: 8,
  },
  recentBookingGradient: {
      padding: moderateScale(24),
      minHeight: verticalScale(140),
      justifyContent: 'space-between',
  },
  recentBookingContent: {
      flex: 1,
      zIndex: 2,
  },
  rebookDivider: {
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.2)',
      marginBottom: verticalScale(12),
  },
  recentBookingHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(16),
      zIndex: 2,
  },
  recentIconBox: {
      width: moderateScale(48),
      height: moderateScale(48),
      borderRadius: moderateScale(16),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: scale(16),
  },
  recentInfo: {
      flex: 1,
      justifyContent: 'center',
      paddingRight: scale(8),
  },
  recentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(2),
  },
  recentTitle: {
      fontSize: moderateScale(16),
      fontWeight: '700',
      color: '#FFFFFF',
      flexShrink: 1,
  },
  recentDate: {
      fontSize: moderateScale(12),
      color: 'rgba(255,255,255,0.85)',
      fontWeight: '500',
  },
  statusBadge: {
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(6),
      borderRadius: moderateScale(12),
  },
  statusText: {
      fontSize: moderateScale(11),
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
  },
  rebookActionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: verticalScale(16),
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.15)',
      zIndex: 2,
  },
  rebookActionText: {
      color: '#FFFFFF',
      fontSize: moderateScale(15),
      fontWeight: '700',
  },
  // Guest Banner Styles
  bannerSection: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(30),
  },
  actionIconCircle: {
      width: moderateScale(48),
      height: moderateScale(48),
      borderRadius: moderateScale(24),
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
  },
  guestBanner: {
    borderRadius: moderateScale(24),
    overflow: 'hidden',
    shadowColor: themeObj.colors.primary,
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.25,
    shadowRadius: moderateScale(16),
    elevation: 8,
  },
  guestBannerGradient: {
    padding: moderateScale(24),
    minHeight: verticalScale(140),
    justifyContent: 'center',
  },
  guestBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guestTextContainer: {
    flex: 1,
    marginRight: scale(16),
    zIndex: 2,
  },
  guestActionContainer: {
    zIndex: 2,
  },
  guestBannerTitle: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: verticalScale(8),
  },
  guestBannerSubtitle: {
    fontSize: moderateScale(14),
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    lineHeight: moderateScale(20),
  },
  brandIconDecor: {
    position: 'absolute',
    bottom: -20,
    right: -10,
    zIndex: 1,
    transform: [{ rotate: '-15deg' }],
  },
  recentCardDecor: {
    position: 'absolute',
    bottom: -20,
    right: -10,
    zIndex: 1,
    transform: [{ rotate: '-15deg' }],
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: 1,
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(12),
  },
  stickyHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: verticalScale(60),
  },
  stickyTitle: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  stickyLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    gap: scale(6),
    maxWidth: scale(150),
  },
  stickyLocationText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
  },

});

export default HomeScreen;

