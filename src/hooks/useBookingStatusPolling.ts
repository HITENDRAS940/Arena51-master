import { useState, useEffect, useRef, useCallback } from 'react';
import { bookingAPI } from '../services/api';

export type BookingPollStatus = 'polling' | 'confirmed' | 'failed';

/**
 * useBookingStatusPolling
 * 
 * Minimal, focused polling hook for booking confirmation.
 * 
 * WHY this architecture:
 * - Polling starts UNCONDITIONALLY on mount (no AppState/focus dependencies)
 * - Fresh mount = fresh polling = reliable behavior after Razorpay closes
 * - Android timer pauses are handled naturally: when JS resumes, polling resumes
 * - Backend is single source of truth, not Razorpay callbacks
 */
export const useBookingStatusPolling = (bookingId: number) => {
    const [status, setStatus] = useState<BookingPollStatus>('polling');
    const [bookingData, setBookingData] = useState<any>(null);

    // Refs prevent stale closures in interval callbacks
    const isFetchingRef = useRef(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isTerminalRef = useRef(false);

    const checkStatus = useCallback(async () => {
        // Guard: prevent overlapping requests or polling after completion
        if (isFetchingRef.current || isTerminalRef.current) return;

        try {
            isFetchingRef.current = true;


            const { data } = await bookingAPI.getBookingStatus(bookingId);

            if (data.bookingStatus === 'CONFIRMED' || data.isCompleted) {

                setStatus('confirmed');
                setBookingData(data);
                isTerminalRef.current = true;
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            } else if (data.bookingStatus === 'FAILED' || data.bookingStatus === 'CANCELLED') {

                setStatus('failed');
                setBookingData(data);
                isTerminalRef.current = true;
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            }
            // Still pending? Keep polling (do nothing, interval continues)
        } catch (error: any) {
            // Network errors: log and continue polling (self-healing)

        } finally {
            isFetchingRef.current = false;
        }
    }, [bookingId]);

    useEffect(() => {

        isTerminalRef.current = false;

        // 1. Immediate first check on mount
        checkStatus();

        // 2. Poll every 3 seconds - unconditionally
        intervalRef.current = setInterval(checkStatus, 3000);

        return () => {

            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [bookingId, checkStatus]);

    return { status, bookingData };
};
