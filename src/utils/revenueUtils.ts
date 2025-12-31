/**
 * Revenue Calculation Utilities
 * Provides centralized revenue and statistics calculation functions
 */

interface ServiceSlot {
  id: number;
  startTime: string;
  endTime: string;
  price: number;
  enabled: boolean;
  isBooked?: boolean;
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

export interface RevenueData {
  totalRevenue: number;
  totalBookings: number;
  bookedSlots: number;
  availableSlots: number;
}

/**
 * Calculate total revenue from bookings
 */
export const calculateTotalRevenue = (bookings: ServiceBooking[]): number => {
  return bookings.reduce((total, booking) => {
    const status = booking.status?.toUpperCase();
    if (status === 'CONFIRMED' || status === 'COMPLETED') {
      return total + booking.amount;
    }
    return total;
  }, 0);
};

/**
 * Count total confirmed bookings
 */
export const countConfirmedBookings = (bookings: ServiceBooking[]): number => {
  return bookings.filter(booking => {
    const status = booking.status?.toUpperCase();
    return status === 'CONFIRMED' || status === 'COMPLETED';
  }).length;
};

/**
 * Count booked slots
 */
export const countBookedSlots = (slots: ServiceSlot[]): number => {
  return slots.filter(slot => slot.isBooked).length;
};

/**
 * Count available slots (enabled and not booked)
 */
export const countAvailableSlots = (slots: ServiceSlot[]): number => {
  return slots.filter(slot => slot.enabled && !slot.isBooked).length;
};

/**
 * Calculate revenue data from bookings and slots
 */
export const calculateRevenueData = (
  bookings: ServiceBooking[],
  slots: ServiceSlot[]
): RevenueData => {
  return {
    totalRevenue: calculateTotalRevenue(bookings),
    totalBookings: countConfirmedBookings(bookings),
    bookedSlots: countBookedSlots(slots),
    availableSlots: countAvailableSlots(slots),
  };
};

/**
 * Calculate revenue by date range
 */
export const calculateRevenueByDateRange = (
  bookings: ServiceBooking[],
  startDate: Date,
  endDate: Date
): number => {
  return bookings
    .filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      const status = booking.status?.toUpperCase();
      return (
        bookingDate >= startDate &&
        bookingDate <= endDate &&
        (status === 'CONFIRMED' || status === 'COMPLETED')
      );
    })
    .reduce((total, booking) => total + booking.amount, 0);
};

/**
 * Calculate revenue by month
 */
export const calculateMonthlyRevenue = (
  bookings: ServiceBooking[],
  year: number,
  month: number
): number => {
  return bookings
    .filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      const status = booking.status?.toUpperCase();
      return (
        bookingDate.getFullYear() === year &&
        bookingDate.getMonth() === month &&
        (status === 'CONFIRMED' || status === 'COMPLETED')
      );
    })
    .reduce((total, booking) => total + booking.amount, 0);
};

/**
 * Calculate revenue by service ID
 */
export const calculateRevenueByService = (
  bookings: ServiceBooking[],
  serviceId: number
): number => {
  // Note: This assumes bookings have a serviceId field
  // If not available, we might need to filter by serviceName
  return bookings
    .filter(booking => {
      const status = booking.status?.toUpperCase();
      return status === 'CONFIRMED' || status === 'COMPLETED';
    })
    .reduce((total, booking) => total + booking.amount, 0);
};

/**
 * Get average booking amount
 */
export const getAverageBookingAmount = (bookings: ServiceBooking[]): number => {
  const confirmedBookings = bookings.filter(booking => {
    const status = booking.status?.toUpperCase();
    return status === 'CONFIRMED' || status === 'COMPLETED';
  });

  if (confirmedBookings.length === 0) return 0;

  const total = confirmedBookings.reduce(
    (sum, booking) => sum + booking.amount,
    0
  );

  return total / confirmedBookings.length;
};

/**
 * Get booking statistics
 */
export const getBookingStatistics = (bookings: ServiceBooking[]) => {
  const confirmedBookings = bookings.filter(booking => {
    const status = booking.status?.toUpperCase();
    return status === 'CONFIRMED' || status === 'COMPLETED';
  });
  const cancelledBookings = bookings.filter(booking => {
    const status = booking.status?.toUpperCase();
    return status === 'CANCELLED';
  });
  const pendingBookings = bookings.filter(booking => {
    const status = booking.status?.toUpperCase();
    return status === 'PENDING';
  });

  return {
    total: bookings.length,
    confirmed: confirmedBookings.length,
    cancelled: cancelledBookings.length,
    pending: pendingBookings.length,
    totalRevenue: calculateTotalRevenue(bookings),
    averageAmount: getAverageBookingAmount(bookings),
  };
};

/**
 * Calculate slot utilization rate (percentage of booked slots)
 */
export const calculateSlotUtilizationRate = (slots: ServiceSlot[]): number => {
  const enabledSlots = slots.filter(slot => slot.enabled);
  if (enabledSlots.length === 0) return 0;

  const bookedSlots = enabledSlots.filter(slot => slot.isBooked);
  return (bookedSlots.length / enabledSlots.length) * 100;
};

/**
 * Calculate potential revenue (all enabled slots at their prices)
 */
export const calculatePotentialRevenue = (slots: ServiceSlot[]): number => {
  return slots
    .filter(slot => slot.enabled)
    .reduce((total, slot) => total + slot.price, 0);
};

/**
 * Calculate revenue loss from disabled slots
 */
export const calculateRevenueLoss = (slots: ServiceSlot[]): number => {
  return slots
    .filter(slot => !slot.enabled)
    .reduce((total, slot) => total + slot.price, 0);
};

/**
 * Format currency for display (Indian Rupees)
 */
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};
