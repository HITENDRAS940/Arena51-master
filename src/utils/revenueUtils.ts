/**
 * Revenue Utilities
 * Helper functions for currency formatting and revenue calculations
 */

export interface RevenueData {
    totalRevenue: number;
    confirmedRevenue: number;
    pendingRevenue: number;
    cancelledRevenue: number;
    totalBookings: number;
    confirmedBookingsCount: number;
    pendingBookingsCount: number;
    cancelledBookingsCount: number;
    occupancyRate: number;
}

/**
 * Format number to Indian Currency (INR)
 * @param amount - Amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
    return `₹${(amount || 0).toLocaleString('en-IN')}`;
};

/**
 * Calculate revenue statistics from bookings and slots
 * @param bookings - Array of booking objects
 * @param slots - Array of slot objects for the period
 * @returns RevenueData summary
 */
export const calculateRevenueData = (bookings: any[], slots: any[]): RevenueData => {
    const stats: RevenueData = {
        totalRevenue: 0,
        confirmedRevenue: 0,
        pendingRevenue: 0,
        cancelledRevenue: 0,
        totalBookings: bookings.length,
        confirmedBookingsCount: 0,
        pendingBookingsCount: 0,
        cancelledBookingsCount: 0,
        occupancyRate: 0,
    };

    bookings.forEach(booking => {
        const amount = booking.amount || booking.totalAmount || 0;
        const status = (booking.status || 'PENDING').toUpperCase();

        stats.totalRevenue += amount;

        if (status === 'CONFIRMED') {
            stats.confirmedRevenue += amount;
            stats.confirmedBookingsCount++;
        } else if (status === 'PENDING') {
            stats.pendingRevenue += amount;
            stats.pendingBookingsCount++;
        } else if (status === 'CANCELLED') {
            stats.cancelledRevenue += amount;
            stats.cancelledBookingsCount++;
        }
    });

    // Calculate occupancy if slots information is provided
    if (slots && slots.length > 0) {
        const totalEnabledSlots = slots.filter(s => s.enabled !== false).length;
        const bookedSlots = slots.filter(s => s.isBooked).length;

        if (totalEnabledSlots > 0) {
            stats.occupancyRate = (bookedSlots / totalEnabledSlots) * 100;
        }
    }

    return stats;
};
