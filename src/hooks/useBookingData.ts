/**
 * useBookingData Hook
 * Custom hook for managing booking data
 * - Fetch bookings with filters
 * - Calculate revenue statistics
 * - Date-based filtering
 * - Loading and error states
 */

import { useState, useCallback, useMemo } from 'react';
import { adminAPI, serviceAPI } from '../services/api';
import { Alert } from 'react-native';
import { formatDateToYYYYMMDD } from '../utils/dateUtils';
import { calculateRevenueData, RevenueData } from '../utils/revenueUtils';
import { getBookedSlotIds, mapSlotsWithBookingInfo } from '../utils/slotUtils';

interface ServiceSlot {
  id: number;
  startTime: string;
  endTime: string;
  price: number;
  enabled: boolean;
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

interface UseBookingDataOptions {
  serviceId?: number;
  initialDate?: Date;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export const useBookingData = (options?: UseBookingDataOptions) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(options?.initialDate || new Date());
  const [allSlots, setAllSlots] = useState<ServiceSlot[]>([]);

  /**
   * Fetch bookings for a specific date and service
   */
  const fetchBookings = useCallback(async (serviceId: number, date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const formattedDate = formatDateToYYYYMMDD(date);
      const response = await adminAPI.getServiceBookings(serviceId, formattedDate);

      const fetchedBookings = response.data.bookings || [];
      setBookings(fetchedBookings);

      return fetchedBookings;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch bookings';
      setError(errorMsg);
      options?.onError?.(errorMsg);
      setError(errorMsg);
      options?.onError?.(errorMsg);
      Alert.alert('Error', errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  }, [options]);

  /**
   * Fetch bookings for current selected date
   */
  const refreshBookings = useCallback(async () => {
    if (options?.serviceId) {
      return await fetchBookings(options.serviceId, selectedDate);
    }
    return [];
  }, [options?.serviceId, selectedDate, fetchBookings]);

  /**
   * Fetch all bookings (no date filter)
   */
  const fetchAllBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAPI.getAllBookings();
      const fetchedBookings = response.data.bookings || [];
      setBookings(fetchedBookings);
      return fetchedBookings;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch bookings';
      setError(errorMsg);
      options?.onError?.(errorMsg);
      setError(errorMsg);
      options?.onError?.(errorMsg);
      Alert.alert('Error', errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  }, [options]);

  /**
   * Change selected date and fetch bookings
   */
  const changeDate = useCallback(async (newDate: Date) => {
    setSelectedDate(newDate);
    if (options?.serviceId) {
      return await fetchBookings(options.serviceId, newDate);
    }
  }, [options?.serviceId, fetchBookings]);

  /**
   * Get revenue statistics from bookings
   */
  const revenueStats = useMemo((): RevenueData | null => {
    if (allSlots.length === 0) return null;

    // Map slots with booking information
    const bookedSlotIds = getBookedSlotIds(bookings);
    const slotsWithBookings = mapSlotsWithBookingInfo(allSlots, bookedSlotIds);

    return calculateRevenueData(bookings, slotsWithBookings);
  }, [bookings, allSlots]);

  /**
   * Get slots with booking status
   */
  const slotsWithBookingStatus = useMemo(() => {
    const bookedSlotIds = getBookedSlotIds(bookings);
    return mapSlotsWithBookingInfo(allSlots, bookedSlotIds);
  }, [bookings, allSlots]);

  /**
   * Filter bookings by status
   */
  const getBookingsByStatus = useCallback((status: string) => {
    return bookings.filter(booking =>
      booking.status.toLowerCase() === status.toLowerCase()
    );
  }, [bookings]);

  /**
   * Get confirmed bookings
   */
  const confirmedBookings = useMemo(() => {
    return bookings.filter(b =>
      b.status === 'CONFIRMED' || b.status === 'confirmed'
    );
  }, [bookings]);

  /**
   * Get pending bookings
   */
  const pendingBookings = useMemo(() => {
    return bookings.filter(b =>
      b.status === 'PENDING' || b.status === 'pending'
    );
  }, [bookings]);

  /**
   * Get cancelled bookings
   */
  const cancelledBookings = useMemo(() => {
    return bookings.filter(b =>
      b.status === 'CANCELLED' || b.status === 'cancelled'
    );
  }, [bookings]);

  /**
   * Set slots data (for mapping with bookings)
   */
  const setSlots = useCallback((slots: ServiceSlot[]) => {
    setAllSlots(slots);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setBookings([]);
    setSelectedDate(options?.initialDate || new Date());
    setAllSlots([]);
  }, [options?.initialDate]);

  return {
    // State
    loading,
    error,
    bookings,
    selectedDate,
    revenueStats,
    slotsWithBookingStatus,

    // Filtered bookings
    confirmedBookings,
    pendingBookings,
    cancelledBookings,

    // Actions
    fetchBookings,
    fetchAllBookings,
    refreshBookings,
    changeDate,
    setSlots,
    getBookingsByStatus,
    clearError,
    reset,
  };
};
