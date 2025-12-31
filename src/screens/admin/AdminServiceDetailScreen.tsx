// filepath: /Users/hitendrasingh/Desktop/EzTurf/src/screens/admin/AdminTurfDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { adminAPI, serviceAPI } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Shared Components
import RevenueCard from '../../components/shared/cards/RevenueCard';
import SlotGridCard from '../../components/shared/cards/SlotGridCard';
import BookingCard from '../../components/shared/cards/BookingCard';
import SlotsManagementModal from '../../components/shared/modals/SlotsManagementModal';
import AvailabilityModal from '../../components/shared/modals/AvailabilityModal';
import ManualBookingModal from '../../components/shared/modals/ManualBookingModal';
import DisableSlotByDateModal from '../../components/shared/modals/DisableSlotByDateModal';

// Utilities
import { formatDateToYYYYMMDD } from '../../utils/dateUtils';
import { calculateRevenueData } from '../../utils/revenueUtils';
import { mapSlotsWithBookingInfo } from '../../utils/slotUtils';

// Types
import { SlotConfig } from '../../types';

interface ServiceSlot {
  id: number;
  slotId: number;
  startTime: string;
  endTime: string;
  price: number;
  enabled: boolean;
  isBooked?: boolean;
  isDisabledDate?: boolean; // New flag for date-specific disable
  disableReason?: string;
}

interface ServiceBooking {
  id: number;
  user: {
    name: string;
    phone: string;
  };
  reference: string;
  amount: number;
  status: string;
  serviceName: string;
  slotTime: string;
  slots: Array<{
    slotId: number;
    startTime: string;
    endTime: string;
    price: number;
  }>;
  bookingDate: string;
  createdAt: string;
}

interface RevenueData {
  totalRevenue: number;
  totalBookings: number;
  bookedSlots: number;
  availableSlots: number;
}

type ModalStep = 'none' | 'slots' | 'availability' | 'manualBooking' | 'disableSlot';

const AdminServiceDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { service } = route.params;
  
  // State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true); // Initial loading
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [slotsWithBookings, setSlotsWithBookings] = useState<ServiceSlot[]>([]);
  const [bookedSlotIds, setBookedSlotIds] = useState<number[]>([]);
  const [disabledSlotIds, setDisabledSlotIds] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState<ModalStep>('none');
  const [activeTab, setActiveTab] = useState<'slots' | 'bookings'>('slots');
  
  // Modal-specific state
  const [slots, setSlots] = useState<SlotConfig[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [currentServiceData, setCurrentServiceData] = useState(service);

  // Data Fetching
  useEffect(() => {
    // Determine what to fetch based on active tab
    if (activeTab === 'slots') {
      fetchSlotData();
    } else {
      fetchBookingData();
    }
  }, [selectedDate, activeTab]);

  const fetchSlotData = async () => {
    try {
      setLoadingSlots(true);
      const dateStr = formatDateToYYYYMMDD(selectedDate);
      
      // Fetch slot status (booked and disabled slots)
      const slotStatusResponse = await serviceAPI.getSlotStatus(service.id, dateStr);
      const { disabled: disabledSlotIds, booked: bookedSlotIds } = slotStatusResponse.data;
      
      // Create Sets for efficient lookup - COERCE TO NUMBERS to handle string IDs from API
      // We pass the logical IDs (1-24) to the card.
      // If the API returns db IDs, we might need to map them back to logical IDs, but the request implies we can just pass them.
      // However, if the API returns mixed, we should probably stick to what we have, but the requirement specifically asked to pass IDs.
      // Let's pass the arrays derived from the API response.
      const disabledIds = (disabledSlotIds || []).map((id: any) => Number(id));
      const bookedIds = (bookedSlotIds || []).map((id: any) => Number(id));

      setDisabledSlotIds(disabledIds);
      setBookedSlotIds(bookedIds);

      // Use slots from route params (initial service data) or state if previously updated
      const baseSlots = currentServiceData.slots || service.slots || [];

      // Map base slots to ensure correct format, but status logic is now in the Card
      const slotsData: ServiceSlot[] = baseSlots.map((slot: any) => {
        const dbId = slot.id || slot.slotId;
        return {
          ...slot,
          slotId: dbId,
          // We can leave enabled/isBooked "raw" from base config or default, 
          // because the Card will override them with the ID props.
          // But to be safe, let's just pass them as is.
          enabled: slot.enabled !== false, 
          isBooked: false, // Default false, card overrides
        };
      });

      // Sort slots by start time to ensure they appear in order
      slotsData.sort((a, b) => {
        let timeA = a.startTime;
        let timeB = b.startTime;
        if (timeA.includes('T')) timeA = timeA.split('T')[1];
        if (timeB.includes('T')) timeB = timeB.split('T')[1];
        return timeA.localeCompare(timeB);
      });

      setSlotsWithBookings(slotsData);
    } catch (error: any) {
      console.error('Error fetching slot data:', error);
      Alert.alert('Error', 'Failed to fetch slot details');
      
      // Fallback
      const rawSlotsData = mapSlotsWithBookingInfo(service.slots || [], new Set());
      setSlotsWithBookings(rawSlotsData.map(slot => ({ ...slot, slotId: slot.id })));
    } finally {
      setLoadingSlots(false);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchBookingData = async () => {
    try {
      setLoadingBookings(true);
      const dateStr = formatDateToYYYYMMDD(selectedDate);
      
      // Fetch bookings for this service on the selected date
      const bookingsData = await adminAPI.getServiceBookings(service.id, dateStr);
      
      let bookingsList: ServiceBooking[] = [];
      
      if (Array.isArray(bookingsData)) {
        bookingsList = bookingsData;
      } else if (bookingsData && Array.isArray(bookingsData.bookings)) {
        bookingsList = bookingsData.bookings;
      } else if (bookingsData && bookingsData.data && Array.isArray(bookingsData.data)) {
        bookingsList = bookingsData.data;
      }
      
      // Filter bookings to only show those matching the selected date
      const filteredBookings = bookingsList.filter((b: ServiceBooking) => {
        return b.bookingDate === dateStr;
      });
      
      setBookings(filteredBookings);

      // We need slot structure to calculate availability for Revenue Card
      // We can reuse the slots from state if available, or base structure
      const baseSlots = currentServiceData.slots || service.slots || [];
      // Simplistic mapping for revenue calc - we just need counts
      const slotsForRevenue: ServiceSlot[] = baseSlots.map((slot: any) => ({
         ...slot,
         slotId: slot.id || slot.slotId,
         // We know which are booked from filteredBookings if we wanted to be precise, 
         // but revenueUtils calculates this from bookings list + total slots.
         // Effectively we just need the array length and prices.
      }));
      
      const revenueData = calculateRevenueData(filteredBookings, slotsForRevenue);
      setRevenue(revenueData);

    } catch (error: any) {
      console.error('Error fetching booking data:', error);
      Alert.alert('Error', 'Failed to fetch bookings');
      setBookings([]);
      setRevenue(null);
    } finally {
      setLoadingBookings(false);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (activeTab === 'slots') {
      fetchSlotData();
    } else {
      fetchBookingData();
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
    // Loading state is handled in individual fetch functions which will trigger via useEffect
  };

  // Management Actions


  const handleManageSlots = async () => {
    await loadSlots();
    setCurrentStep('slots');
  };

  const handleManageAvailability = () => {
    setCurrentStep('availability');
  };
  
  const loadSlots = async () => {
    setSlotsLoading(true);
    try {
      const response = await adminAPI.getServiceSlots(service.id);
      const dbSlots = response.data;
      
      if (dbSlots && dbSlots.length > 0) {
        const mappedSlots = dbSlots.map((dbSlot: any, index: number) => ({
          slotId: dbSlot.id || dbSlot.slotId || (index + 1),
          startTime: dbSlot.startTime,
          endTime: dbSlot.endTime,
          price: dbSlot.price,
          enabled: dbSlot.enabled === true,
        }));
        
        setSlots(mappedSlots);
      }
    } catch (error: any) {
      console.error('Error loading slots:', error);
      Alert.alert('Error', 'Failed to load slots');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDeleteService = () => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${service.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await adminAPI.deleteService(service.id);
              Alert.alert('Success', 'Service deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete service');
            }
          }
        },
      ]
    );
  };



  const handleManualBooking = () => {
    setCurrentStep('manualBooking');
  };

  const handleDisableSlot = () => {
    setCurrentStep('disableSlot'); // Use the new ModalStep type
  };

  const handleDisableSlotConfirm = async (slotId: number, reason: string) => {
    try {
      const dateStr = formatDateToYYYYMMDD(selectedDate);
      
      await adminAPI.disableSlotForDate({
        serviceId: service.id,
        slotId: slotId,
        date: dateStr,
        reason: reason,
      });

      Alert.alert('Success', 'Slot disabled successfully');
      // Only refresh if on slots tab, which we likely are if disabling a slot
      if (activeTab === 'slots') fetchSlotData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to disable slot');
      throw error;
    }
  };

  const handleManualBookingConfirm = async (slotIds: number[]) => {
    try {
      const dateStr = formatDateToYYYYMMDD(selectedDate);
      
      await adminAPI.createManualBooking({
        serviceId: service.id,
        slotIds: slotIds,
        bookingDate: dateStr,
      });
      
      // Refresh data to show new booking
      // If we are on slots tab, update slot status. If on bookings, update bookings.
      // Usually manual booking will keep us on the same screen. We should probably refresh the current view.
      if (activeTab === 'slots') fetchSlotData();
      else fetchBookingData();
    } catch (error: any) {
      throw error; // Re-throw to let modal handle the error
    }
  };

  // Modal Callbacks


  const handleSlotsSave = async (updatedSlots: SlotConfig[]) => {
    try {
      // Update each slot
      for (const slot of updatedSlots) {
        if (slot.price !== undefined) {
          await adminAPI.updateSlotPrice(service.id, slot.slotId, slot.price);
        }
        
        if (slot.enabled) {
          await adminAPI.enableSlot(service.id, slot.slotId);
        } else {
          await adminAPI.disableSlot(service.id, slot.slotId);
        }
      }
      
      // Refresh service data to reflect latest DB state
      if (activeTab === 'slots') fetchSlotData();
      else fetchBookingData();
    } catch (error: any) {
      throw error; // Re-throw to let modal handle the error
    }
  };

  const handleAvailabilitySave = async (isAvailable: boolean) => {
    try {
      if (isAvailable) {
        await adminAPI.setServiceAvailable(service.id);
      } else {
        await adminAPI.setServiceNotAvailable(service.id);
      }

      if (activeTab === 'slots') fetchSlotData();
      else fetchBookingData();
    } catch (error: any) {
      throw error; // Re-throw to let modal handle the error
    }
  };



  const closeModal = () => {
    setCurrentStep('none');
  };



  // Render Bookings List
  const renderBookingsList = () => {
    if (bookings.length === 0) {
      return (
        <View style={styles.emptyBookings}>
          <Ionicons name="calendar-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No bookings for this date
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.bookingsContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Bookings ({bookings.length})
        </Text>

        {bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            variant="admin"
          />
        ))}
      </View>
    );
  };

  return (
    <ScreenWrapper 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      safeAreaEdges={['bottom', 'left', 'right']}
    >
      <StatusBar barStyle="light-content" />
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: insets.top + 10 }]}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {service.name}
              </Text>
              <View style={styles.headerLocationRow}>
                <Ionicons name="location-outline" size={14} color="rgba(255, 255, 255, 0.9)" />
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  {service.location}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={handleDeleteService}
              style={[styles.backButton, { marginLeft: 16, marginRight: 0, backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}
            >
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Management Action Buttons */}
      <View style={[styles.actionButtonsContainer, { backgroundColor: theme.colors.background }]}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.actionButtonsRow}
        >
          <TouchableOpacity 
            style={[styles.actionChip, { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary + '30' }]}
            onPress={handleManageSlots}
          >
            <Ionicons name="time" size={18} color={theme.colors.primary} />
            <Text style={[styles.actionChipText, { color: theme.colors.primary }]}>Slots</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionChip, { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary + '30' }]}
            onPress={handleManageAvailability}
          >
            <Ionicons name="toggle" size={18} color={theme.colors.primary} />
            <Text style={[styles.actionChipText, { color: theme.colors.primary }]}>Availability</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionChip, { backgroundColor: '#10B98115', borderColor: '#10B98130' }]}
            onPress={handleManualBooking}
          >
            <Ionicons name="add-circle" size={18} color="#10B981" />
            <Text style={[styles.actionChipText, { color: '#10B981' }]}>Book</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionChip, { backgroundColor: '#F9731615', borderColor: '#F9731630' }]}
            onPress={handleDisableSlot}
          >
            <Ionicons name="ban" size={18} color="#F97316" />
            <Text style={[styles.actionChipText, { color: '#F97316' }]}>Disable</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Date Selector */}
      <View style={[styles.dateSelector, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity 
          onPress={() => changeDate(-1)}
          style={styles.dateButton}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.dateDisplay}>
          <Text style={[styles.dateText, { color: theme.colors.text }]}>
            {format(selectedDate, 'EEE, MMM dd, yyyy')}
          </Text>
          {formatDateToYYYYMMDD(selectedDate) === formatDateToYYYYMMDD(new Date()) && (
            <View style={[styles.todayBadge, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={[styles.todayText, { color: theme.colors.primary }]}>Today</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          onPress={() => changeDate(1)}
          style={styles.dateButton}
        >
          <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>



      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <View style={[styles.tabSelector, { backgroundColor: theme.colors.card }]}>
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'slots' && { backgroundColor: theme.colors.primary }
            ]}
            onPress={() => setActiveTab('slots')}
          >
            <Text style={[
              styles.tabText, 
              { color: activeTab === 'slots' ? '#FFF' : theme.colors.textSecondary }
            ]}>Slots</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'bookings' && { backgroundColor: theme.colors.primary }
            ]}
            onPress={() => setActiveTab('bookings')}
          >
            <Text style={[
              styles.tabText, 
              { color: activeTab === 'bookings' ? '#FFF' : theme.colors.textSecondary }
            ]}>Bookings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={styles.content}>
          
          {activeTab === 'slots' ? (
            // SLOTS TAB CONTENT
            loadingSlots ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                  Loading slots...
                </Text>
              </View>
            ) : (
              <View style={styles.cardContainer}>
                {slotsWithBookings.length > 0 ? (
                  <SlotGridCard
                    slots={slotsWithBookings}
                    bookedSlotIds={bookedSlotIds}
                    disabledSlotIds={disabledSlotIds}
                  />
                ) : (
                   <View style={styles.emptyBookings}>
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                      No slots configured
                    </Text>
                   </View>
                )}
              </View>
            )
          ) : (
            // BOOKINGS TAB CONTENT
            loadingBookings ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                  Loading bookings...
                </Text>
              </View>
            ) : (
              <>
                {revenue && (
                  <View style={styles.cardContainer}>
                    <RevenueCard
                      data={{
                        totalRevenue: revenue.totalRevenue,
                        totalBookings: revenue.totalBookings,
                        bookedSlots: revenue.bookedSlots,
                        availableSlots: revenue.availableSlots,
                      }}
                    />
                  </View>
                )}
                
                <View style={styles.cardContainer}>
                  {renderBookingsList()}
                </View>
              </>
            )
          )}

        </View>
      </ScrollView>

      {/* Modals */}


      <SlotsManagementModal
        visible={currentStep === 'slots'}
        onClose={closeModal}
        onSave={handleSlotsSave}
        slots={slots}
        loading={slotsLoading}
        showRefresh={true}
        onRefresh={() => loadSlots()}
        serviceName={service.name}
      />

      <AvailabilityModal
        visible={currentStep === 'availability'}
        onClose={closeModal}
        onSave={handleAvailabilitySave}
        currentAvailability={service.isAvailable || false}
        serviceName={service.name}
        serviceId={service.id}
      />



      <ManualBookingModal
        visible={currentStep === 'manualBooking'}
        onClose={closeModal}
        onConfirm={handleManualBookingConfirm}
        slots={slotsWithBookings}
        serviceName={service.name}
        selectedDate={formatDateToYYYYMMDD(selectedDate)}
        bookedSlotIds={bookedSlotIds}
        disabledSlotIds={disabledSlotIds}
      />

      <DisableSlotByDateModal
        visible={currentStep === 'disableSlot'}
        onClose={closeModal}
        onConfirm={handleDisableSlotConfirm}
        slots={slotsWithBookings}
        selectedDate={formatDateToYYYYMMDD(selectedDate)}
        serviceName={service.name}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    overflow: 'hidden',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    backgroundColor: '#fff',
  },
  headerGradient: {
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  actionButtonsContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  actionChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  dateButton: {
    padding: 8,
  },
  dateDisplay: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  todayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  todayText: {
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  cardContainer: {
    marginBottom: 24,
  },
  bookingsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyBookings: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  tabContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tabSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AdminServiceDetailScreen;
