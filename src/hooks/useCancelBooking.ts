import { useState } from 'react';
import { api } from '../services/api';

export interface CancellationResult {
    success: boolean;
    bookingId: number;
    bookingReference: string;
    bookingStatus: string;
    refundAmount: number;
    refundPercent: number;
    refundStatus: string;
    message: string;
}

export const useCancelBooking = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<CancellationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const cancelBooking = async (bookingId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post(`/bookings/${bookingId}/cancel`);
            setResult(response.data);
            return response.data;
        } catch (err: any) {
            const message = err.response?.data?.message || err.response?.data?.error || 'Failed to cancel booking';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    return { result, loading, error, cancelBooking };
};
