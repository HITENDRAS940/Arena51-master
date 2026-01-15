import React, { useState, useEffect, useCallback, useRef } from 'react';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Animated,
} from 'react-native';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { bookingAPI } from '../../services/api';
import { UserBooking } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import BookingCard from '../../components/user/BookingCard';
import EmptyState from '../../components/shared/EmptyState';
import { useTabBarScroll } from '../../hooks/useTabBarScroll';
import { BookingSkeletonCard } from '../../components/shared/Skeletons';
import { useAuth } from '../../contexts/AuthContext';
import { AuthPlaceholder } from '../../components/shared/AuthPlaceholder';
import RazorpayService from '../../services/RazorpayService';

const MyBookingsScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { user, setRedirectData } = useAuth();
  const insets = useSafeAreaInsets();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isStickyHeaderActive, setIsStickyHeaderActive] = useState(false);
  const { onScroll: onTabBarScroll } = useTabBarScroll(navigation, { isRootTab: true });
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      if (value > 60 && !isStickyHeaderActive) {
        setIsStickyHeaderActive(true);
      } else if (value <= 60 && isStickyHeaderActive) {
        setIsStickyHeaderActive(false);
      }
    });
    return () => scrollY.removeListener(listenerId);
  }, [isStickyHeaderActive]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 60, 100],
    outputRange: [-100, -10, 0],
    extrapolate: 'clamp',
  });

  const mainHeaderTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  // Check if there's a new booking to display (from successful booking flow)
  const newBooking = route.params?.newBooking;
  const showSuccess = route.params?.showSuccess;

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getUserBookings();
      
      let bookingsData = response.data;
      
      // Ensure it's an array
      if (!Array.isArray(bookingsData)) {
        bookingsData = [];
      }
      
      // Sort bookings by created date (newest first)
      const sortedBookings = bookingsData.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date || '').getTime();
        const dateB = new Date(b.createdAt || b.date || '').getTime();
        return dateB - dateA;
      });
      
      setBookings(sortedBookings);
      
      // Show success alert if coming from successful booking
      if (showSuccess && newBooking) {
        Alert.alert('Booking Successful! 🎉', `Reference: ${newBooking.reference}`);
      }
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to fetch bookings';
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    if (!user) {
      setRefreshing(false);
      return;
    }
    setRefreshing(true);
    fetchBookings();
  }, [user]);

  const handleBookingPress = useCallback((booking: UserBooking) => {
    // Navigate to booking details screen (implement if needed)
  }, []);

  const confirmCancelBooking = useCallback(async (booking: UserBooking) => {
    try {
      
      await bookingAPI.cancelBooking(booking.id);
      
      // Update the booking status locally
      setBookings(prevBookings =>
        prevBookings.map(b =>
          b.id === booking.id
            ? { ...b, status: 'CANCELLED' as const }
            : b
        )
      );
      
      Alert.alert('UserBooking Cancelled', `Your booking at ${booking.serviceName} has been cancelled`);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to cancel booking';
      
      Alert.alert('Cancellation Failed', errorMessage);
    }
  }, []);

  const handleCancelBooking = useCallback(async (booking: UserBooking) => {
    Alert.alert(
      'Cancel UserBooking',
      `Are you sure you want to cancel your booking at ${booking.serviceName}?\n\nThis action cannot be undone.`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => confirmCancelBooking(booking),
        },
      ]
    );
  }, [confirmCancelBooking]);

  useEffect(() => {
    if (user) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Clear route params after showing success message
  useEffect(() => {
    if (showSuccess) {
      navigation.setParams({ showSuccess: false, newBooking: null });
    }
  }, [showSuccess, navigation]);

  const renderBookingCard = useCallback(({ item }: { item: UserBooking | number }) => {
    if (typeof item === 'number') {
      return <BookingSkeletonCard />;
    }
    return (
      <BookingCard
        booking={item}
        onPress={() => handleBookingPress(item)}
        onCancel={() => handleCancelBooking(item)}
        onPay={async () => {
          try {
            const result = await RazorpayService.initiatePayment(item.id, item);
            if (result.status === 'SUCCESS') {
              fetchBookings();
              Alert.alert('Payment Successful!', 'Your booking is now confirmed.');
            }
          } catch (error: any) {
            if (!error.message.includes('cancelled')) {
              Alert.alert('Payment Failed', error.message);
            }
          }
        }}
        showActions={true}
      />
    );
  }, [handleBookingPress, handleCancelBooking]);

  const renderEmptyState = () => (
    <EmptyState
      icon="calendar-outline"
      title="No Bookings Yet"
      description="Your turf bookings will appear here once you make your first booking."
    />
  );

  const renderMainHeader = () => (
    <Animated.View style={[
      styles.headerContainer,
      { 
        position: 'absolute',
        top: insets.top + verticalScale(20),
        left: 0,
        right: 0,
        zIndex: 5,
        transform: [{ translateY: mainHeaderTranslateY }]
      }
    ]}>
      <View style={styles.headerTitleGroup}>
        <Text style={[styles.headerTitleMain, { color: theme.colors.text }]}>
          Your games.
        </Text>
        <Text style={[styles.headerTitleSub, { color: theme.colors.textSecondary }]}>
          Your history.
        </Text>
      </View>
    </Animated.View>
  );

  if (!user) {
    return (
      <AuthPlaceholder
        titleMain="Your games."
        titleSub="Your history."
        description="Login to view your previous bookings, manage upcoming games, and rebook your favorite venues."
        onLoginPress={() => {
          navigation.navigate('Auth', {
            screen: 'PhoneEntry',
            params: { 
              redirectTo: { 
                name: 'User', 
                params: { 
                  screen: 'MainTabs', 
                  params: { screen: 'Bookings' } 
                } 
              } 
            }
          });
        }}
      />
    );
  }

  return (
    <ScreenWrapper 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      safeAreaEdges={['bottom', 'left', 'right']}
    >
      
      {/* Dynamic Sticky Top Bar */}
      <Animated.View 
        pointerEvents={isStickyHeaderActive ? 'auto' : 'none'}
        style={[
          styles.stickyHeader, 
          { 
            paddingTop: insets.top,
            backgroundColor: theme.colors.background,
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslate }],
          }
        ]}
      >
        <View style={[styles.stickyHeaderContent, { borderBottomWidth: 1, borderBottomColor: theme.colors.border + '20' }]}>
          <Text style={[styles.stickyTitle, { color: theme.colors.text }]}>My Bookings</Text>
        </View>
      </Animated.View>

      {renderMainHeader()}

      <Animated.FlatList
        data={loading ? [1, 2, 3, 4] : bookings}
        renderItem={renderBookingCard}
        keyExtractor={(item, index) => (typeof item === 'number' ? `skeleton-${index}` : item.id.toString())}
        ListHeaderComponent={
          <View style={{ 
            height: verticalScale(100),
          }} />
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + verticalScale(20) },
          !loading && bookings.length === 0 && styles.emptyContent
        ]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true, listener: onTabBarScroll }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            progressViewOffset={insets.top + 80}
          />
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(24),
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerTitleMain: {
    fontSize: moderateScale(34),
    fontWeight: '800',
    lineHeight: moderateScale(40),
    letterSpacing: -1,
  },
  headerTitleSub: {
    fontSize: moderateScale(34),
    fontWeight: '800',
    lineHeight: moderateScale(40),
    letterSpacing: -1,
    opacity: 0.5,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  stickyHeaderContent: {
    height: verticalScale(56),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  stickyTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
  listContent: {
    padding: scale(20),
    paddingBottom: verticalScale(120), // Extra space for tab bar
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(16),
  },
});

export default MyBookingsScreen;
