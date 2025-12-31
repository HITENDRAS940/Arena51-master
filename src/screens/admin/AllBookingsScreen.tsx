import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../services/api';
import { Booking } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingState from '../../components/shared/LoadingState';
import EmptyState from '../../components/shared/EmptyState';
import { formatPhoneForDisplay } from '../../utils/phoneUtils';
import StatusBadge from '../../components/shared/StatusBadge';
import { format } from 'date-fns';
import { Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GradientHeader from '../../components/shared/GradientHeader';

const AllBookingsScreen = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const filters = [
    { key: 'ALL', label: 'All', count: bookings.length },
    { key: 'CONFIRMED', label: 'Confirmed', count: bookings.filter(b => b.status === 'CONFIRMED').length },
    { key: 'PENDING', label: 'Pending', count: bookings.filter(b => b.status === 'PENDING').length },
    { key: 'CANCELLED', label: 'Cancelled', count: bookings.filter(b => b.status === 'CANCELLED').length },
    { key: 'COMPLETED', label: 'Completed', count: bookings.filter(b => b.status === 'COMPLETED').length },
  ];

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await adminAPI.getAllBookings();
      setBookings(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const filteredBookings = selectedFilter === 'ALL' 
    ? bookings 
    : bookings.filter(booking => booking.status === selectedFilter);

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <View style={[
      styles.bookingCard, 
      { 
        backgroundColor: theme.colors.card, 
        shadowColor: theme.colors.shadow,
        borderColor: theme.colors.border,
      }
    ]}>
      <View style={styles.cardHeader}>
        <View style={styles.turfInfo}>
          <Text style={[styles.turfName, { color: theme.colors.text }]}>{item.serviceName}</Text>
          <StatusBadge status={item.status as any} />
        </View>
        <Text style={[styles.referenceText, { color: theme.colors.textSecondary }]}>
          #{item.reference}
        </Text>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="person-outline" size={16} color={theme.colors.primary} />
          </View>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            {item.user?.name || 'N/A'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="call-outline" size={16} color={theme.colors.primary} />
          </View>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            {item.user?.phone ? formatPhoneForDisplay(item.user.phone) : 'N/A'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
          </View>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            {format(new Date(item.bookingDate || item.date || item.createdAt), 'dd MMM yyyy')}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
          </View>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            {item.slotTime || item.slots?.map(s => `${s.startTime}-${s.endTime}`).join(', ') || 'N/A'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="cash-outline" size={16} color={theme.colors.primary} />
          </View>
          <Text style={[styles.priceText, { color: theme.colors.text }]}>₹{item.amount}</Text>
        </View>

        {item.slots && item.slots.length > 0 && (
          <View style={[styles.slotsContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.slotsHeader, { color: theme.colors.textSecondary }]}>
              Slot Details:
            </Text>
            {item.slots.map((slot, index) => (
              <View key={index} style={styles.slotDetailRow}>
                <Text style={[styles.slotText, { color: theme.colors.text }]}>
                  Slot {slot.slotId}: {slot.startTime}-{slot.endTime}
                </Text>
                <Text style={[styles.slotPrice, { color: theme.colors.primary }]}>
                  ₹{slot.price}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        {item.createdAt && (
          <View style={styles.footerRow}>
            <Ionicons name="receipt-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.infoSubText, { color: theme.colors.textSecondary }]}>
              Booked on {format(new Date(item.createdAt), 'dd MMM yyyy, HH:mm')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderFilterButton = (filter: any) => {
    const isSelected = selectedFilter === filter.key;
    return (
      <TouchableOpacity
        key={filter.key}
        style={[
          styles.filterButton,
          { 
            backgroundColor: isSelected ? theme.colors.primary : theme.colors.card,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
            shadowColor: theme.colors.shadow,
          }
        ]}
        onPress={() => setSelectedFilter(filter.key)}
      >
        <Text style={[
          styles.filterText,
          { color: isSelected ? '#FFFFFF' : theme.colors.textSecondary }
        ]}>
          {filter.label} ({filter.count})
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <ScreenWrapper 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      safeAreaEdges={['left', 'right', 'bottom']}
    >
      <GradientHeader
        title="All Bookings"
        subtitle="Manage all turf bookings"
      />

      <View style={styles.filtersWrapper}>
        <FlatList
          horizontal
          data={filters}
          renderItem={({ item }) => renderFilterButton(item)}
          keyExtractor={item => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        />
      </View>

      {filteredBookings.length === 0 ? (
        <EmptyState 
          icon="calendar-outline"
          title="No Bookings Found"
          description={`No ${selectedFilter.toLowerCase()} bookings available.`}
        />
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  filtersWrapper: {
    marginTop: 16,
    marginBottom: 8,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  bookingCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  turfInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  turfName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 15,
    flex: 1,
    fontWeight: '500',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
  },
  infoSubText: {
    fontSize: 12,
    flex: 1,
  },
  referenceText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    opacity: 0.7,
  },
  slotsContainer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
  },
  slotsHeader: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  slotDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  slotText: {
    fontSize: 14,
    flex: 1,
  },
  slotPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
});

export default AllBookingsScreen;
