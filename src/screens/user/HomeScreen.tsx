import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Service, Booking } from '../../types';
import { serviceAPI, bookingAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingState from '../../components/shared/LoadingState';
import { ActivitySkeletonCard, SkeletonList } from '../../components/shared/Skeletons';
import { useLocation } from '../../hooks/useLocation';
import { useTabBarScroll } from '../../hooks/useTabBarScroll';
import CitySelectionModal from '../../components/user/CitySelectionModal';
import { ACTIVITY_THEMES, DEFAULT_THEME } from '../../contexts/ThemeContext';
import { Activity } from '../../types';

const OFFERS = [
  {
    id: '1',
    title: '50% OFF',
    description: 'On your first booking this weekend!',
    code: 'FIRST50',
    colors: ['#F59E0B', '#D97706'],
    icon: 'gift',
  },
  {
    id: '2',
    title: '₹200 Cashback',
    description: 'Valid on all turf bookings above ₹1000',
    code: 'TURF200',
    colors: ['#3B82F6', '#2563EB'],
    icon: 'wallet',
  },
  {
    id: '3',
    title: 'Free Drink',
    description: 'Get a free energy drink on every booking',
    code: 'ENERGY',
    colors: ['#EF4444', '#DC2626'],
    icon: 'flask',
  },
];

const HomeScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollY = React.useRef(new Animated.Value(0)).current;

  // Location bits
  const { location, manualCity, setCityManually, detectAndSetToCurrentCity, loading: locationLoading } = useLocation();
  const [showCityModal, setShowCityModal] = useState(false);
  const [isHeaderActive, setIsHeaderActive] = useState(false);
  const { onScroll: onTabBarScroll } = useTabBarScroll(navigation, { isRootTab: false });

  useEffect(() => {
    const id = scrollY.addListener(({ value }) => {
      const active = value > 60;
      if (active !== isHeaderActive) {
        setIsHeaderActive(active);
      }
    });
    return () => scrollY.removeListener(id);
  }, [isHeaderActive]);

  useEffect(() => {
     fetchActivities();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLastBooking();
    }, [])
  );

  const fetchActivities = async () => {
    setLoading(true);
    try {
        const response = await serviceAPI.getActivities();
        setActivities(response.data);
    } catch (error) {
        console.error("Failed to fetch activities", error);
    } finally {
        setLoading(false);
    }
  };

  const fetchLastBooking = async () => {
    try {
      const response = await bookingAPI.getUserBookings();
      // Check if response.data is array directly or inside a property (handling potential mock variations)
      const data = Array.isArray(response.data) ? response.data : (response.data as any)?.bookings || [];
      
      if (Array.isArray(data) && data.length > 0) {
        // Sort by bookingDate descending
        const sorted = [...data].sort((a: Booking, b: Booking) => {
          const dateB = new Date(b.bookingDate || b.date || b.createdAt).getTime();
          const dateA = new Date(a.bookingDate || a.date || a.createdAt).getTime();
          return dateB - dateA;
        });
        setLastBooking(sorted[0]);
      } else {
        setLastBooking(null);
      }
    } catch (error) {
      console.log('Failed to fetch bookings', error);
      // Fail silently for UI
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

  const handleActivityPress = (activity: Activity) => {
      const city = manualCity || location?.city || '';
      navigation.navigate('CategoryServices', { 
          activityId: activity.id, 
          activityName: activity.name,
          activityCode: activity.code,
          city 
      });
  };

  const renderActivityItem = ({ item }: { item: Activity }) => {
      const themeConfig = ACTIVITY_THEMES[item.name] || DEFAULT_THEME;
      
      return (
        <TouchableOpacity
            style={styles.activityCard}
            onPress={() => handleActivityPress(item)}
            activeOpacity={0.9}
        >
            <LinearGradient
              colors={themeConfig.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.activityCardGradient}
            >
              <Text style={styles.activityCardTitle} numberOfLines={1} adjustsFontSizeToFit>
                  {item.name}
              </Text>
              
              <View style={styles.activityIconContainer}>
                  <Ionicons 
                      name={themeConfig.icon} 
                      size={64} 
                      color="rgba(255,255,255,0.25)" 
                  />
              </View>
            </LinearGradient>
        </TouchableOpacity>
      );
  };

  const renderOfferItem = ({ item }: { item: typeof OFFERS[0] }) => {
    return (
      <TouchableOpacity
        style={styles.offerCard}
        activeOpacity={0.9}
        onPress={() => Alert.alert('Offer Copied', `Promo code ${item.code} has been copied to your clipboard!`)}
      >
        <LinearGradient
          colors={item.colors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.offerGradient}
        >
          <View style={styles.offerContent}>
            <View style={styles.offerTextGroup}>
              <Text style={styles.offerTitle}>{item.title}</Text>
              <Text style={styles.offerDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
            <View style={styles.offerBadge}>
              <Text style={styles.offerCode}>{item.code}</Text>
            </View>
          </View>
          
          <View style={styles.offerIconDecor}>
            <Ionicons name={item.icon as any} size={80} color="rgba(255,255,255,0.15)" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      safeAreaEdges={['left', 'right']}
    >
      

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
            <Ionicons name="location" size={14} color={theme.colors.primary} />
            <Text style={[styles.stickyLocationText, { color: theme.colors.text }]} numberOfLines={1}>
              {manualCity || location?.city || 'Select...'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true, listener: onTabBarScroll }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Custom Header */}
        <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top + 20, 20) }]}>
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
                  <Ionicons name="location" size={20} color={theme.colors.primary} />
                  <Text style={[styles.locationText, { color: theme.colors.text }]}>
                      {manualCity || location?.city || 'Select City'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
          </View>
        </View>
      
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
              contentContainerStyle={styles.activityListContent}
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
                colors={['#1F2937', '#111827']} 
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.exploreGradient}
            >
                <View style={[styles.exploreContent, { zIndex: 2 }]}>
                    <Text style={styles.exploreTitle}>Discover All Venues</Text>
                    <Text style={styles.exploreSubtitle}>Find the perfect Venue in {manualCity || location?.city || 'your city'}</Text>
                </View>
                <Ionicons name="arrow-forward-circle" size={44} color="#10B981" style={{zIndex: 2}} />
                
                <View style={{ position: 'absolute', bottom: -10, right: -10, zIndex: 1, opacity: 0.1 }}> 
                   <Ionicons 
                      name="map" 
                      size={120} 
                      color="#FFFFFF" 
                   />
                </View>
           </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Recent Booking / Guest Login Banner */}
      {!user ? (
        <View style={{ paddingHorizontal: 20, paddingBottom: 30 }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 16 }]}>Jump Back In</Text>
          <TouchableOpacity 
            style={[styles.guestBanner, { backgroundColor: theme.colors.card }]}
            onPress={() => navigation.navigate('Auth')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#4F46E5', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.guestBannerGradient}
            >
              <View style={styles.guestBannerContent}>
                <View style={styles.guestTextContainer}>
                  <Text style={styles.guestBannerTitle}>See Your History</Text>
                  <Text style={styles.guestBannerSubtitle}>
                    Login to view your last visited venues and quickly rebook them.
                  </Text>
                </View>
                <View style={styles.guestActionContainer}>
                  <Ionicons name="arrow-forward-circle" size={40} color="#FFFFFF" />
                </View>

                {/* Decorative Background Icon */}
                <View style={styles.brandIconDecor}>
                  <Ionicons name="sparkles" size={100} color="rgba(255, 255, 255, 0.15)" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        lastBooking && (
          <View style={{ paddingHorizontal: 20, paddingBottom: 30 }}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 16 }]}>Jump Back In</Text>
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
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.recentBookingGradient}
              >
                <View style={styles.recentBookingHeader}>
                    <View style={[styles.recentIconBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                        <Ionicons name="football" size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.recentInfo}>
                        <Text style={[styles.recentTitle, { color: '#FFFFFF' }]} numberOfLines={1}>
                            {lastBooking.serviceName}
                        </Text>
                        <Text style={[styles.recentDate, { color: 'rgba(255,255,255,0.8)' }]}>
                            Last visited on {lastBooking.date || lastBooking.bookingDate}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                        <Text style={[styles.statusText, { color: '#FFFFFF' }]}>
                            {lastBooking.status}
                        </Text>
                    </View>
                </View>
                
                <View style={styles.rebookActionRow}>
                    <Text style={styles.rebookActionText}>Book this venue again</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </View>

                {/* Decorative Background Icon */}
                <View style={styles.brandIconDecor}>
                  <Ionicons name="trophy" size={110} color="rgba(255, 255, 255, 0.12)" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )
      )}

      {/* Exclusive Offers Section */}
      <View style={{ paddingBottom: 30 }}>
        <View style={styles.sectionHeaderContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Exclusive Offers</Text>
            <TouchableOpacity>
                <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>View All</Text>
            </TouchableOpacity>
        </View>
        <FlatList
          data={OFFERS}
          renderItem={renderOfferItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.offerListContent}
          snapToInterval={280 + 16}
          decelerationRate="fast"
        />
      </View>
      </Animated.ScrollView>

      <CitySelectionModal
        visible={showCityModal}
        onClose={() => setShowCityModal(false)}
        onSelectCity={(city) => setCityManually(city)}
        onUseCurrentLocation={detectAndSetToCurrentCity}
        currentCity={manualCity || location?.city}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
  },
  headerTitleMain: {
      fontSize: 34,
      fontWeight: '800',
      lineHeight: 40,
      letterSpacing: -1,
  },
  headerTitleSub: {
    fontSize: 34,
    fontWeight: '800', 
    lineHeight: 40,
    letterSpacing: -1,
    opacity: 0.5,
  },
  locationBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 100,
      gap: 8,
  },
  locationText: {
      fontSize: 16,
      fontWeight: '700',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800', 
    letterSpacing: -0.5,
  },
  activityListContainer: {
     paddingBottom: 8,
  },
  activityListContent: {
      paddingHorizontal: 20,
      gap: 16,
      paddingBottom: 16,
  },
  activityCard: {
      width: 140, 
      height: 180, 
      borderRadius: 24,
      overflow: 'hidden',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      backgroundColor: '#FFFFFF',
  },
  activityCardGradient: {
      flex: 1,
      padding: 16,
      justifyContent: 'space-between',
  },
  activityCardTitle: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '800',
      zIndex: 2,
  },
  activityIconContainer: {
      position: 'absolute',
      bottom: -15,
      right: -15,
      zIndex: 1,
      transform: [{rotate: '-10deg'}] 
  },
  exploreButton: {
      borderRadius: 24,
      marginTop: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
  },
  exploreGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 24,
      borderRadius: 24,
      overflow: 'hidden', 
      height: 120,
  },
  exploreContent: {
      flex: 1,
      marginRight: 16,
      justifyContent: 'center',
  },
  exploreTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 6,
  },
  exploreSubtitle: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.7)',
      fontWeight: '500',
  },
  
  // Recent Booking Styles
  recentBookingCard: {
      borderRadius: 24,
      overflow: 'hidden',
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
  },
  recentBookingGradient: {
      padding: 24,
      minHeight: 140,
      justifyContent: 'space-between',
  },
  recentBookingHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      zIndex: 2,
  },
  recentIconBox: {
      width: 48,
      height: 48,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
  },
  recentInfo: {
      flex: 1,
  },
  recentTitle: {
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 4,
  },
  recentDate: {
      fontSize: 13,
      fontWeight: '600',
  },
  statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
  },
  statusText: {
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
  },
  rebookActionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.15)',
      zIndex: 2,
  },
  rebookActionText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
  },
  // Guest Banner Styles
  guestBanner: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  guestBannerGradient: {
    padding: 24,
    minHeight: 140,
    justifyContent: 'center',
  },
  guestBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guestTextContainer: {
    flex: 1,
    marginRight: 16,
    zIndex: 2,
  },
  guestActionContainer: {
    zIndex: 2,
  },
  guestBannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  guestBannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    lineHeight: 20,
  },
  brandIconDecor: {
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
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  stickyHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
  },
  stickyTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  stickyLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    maxWidth: 150,
  },
  stickyLocationText: {
    fontSize: 13,
    fontWeight: '600',
  },
  offerListContent: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 10,
  },
  offerCard: {
    width: 280,
    height: 140,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  offerGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  offerContent: {
    zIndex: 2,
    flex: 1,
    justifyContent: 'space-between',
  },
  offerTextGroup: {
    flex: 1,
  },
  offerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  offerDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    maxWidth: '80%',
  },
  offerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  offerCode: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  offerIconDecor: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    zIndex: 1,
    transform: [{ rotate: '-10deg' }],
  },
});

export default HomeScreen;

