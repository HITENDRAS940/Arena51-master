import { useState } from 'react';
import { api } from '../services/api';

export interface RefundPreview {
    canCancel: boolean;
    bookingId: number;
    bookingReference: string;
    originalAmount: number;
    minutesBeforeSlot: number;
    refundPercent: number;
    refundAmount: number;
    deductionAmount: number;
    currency: string;
    message: string;
    policyMessage: string;
    reasonNotAllowed?: string;
}

export const useRefundPreview = () => {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<RefundPreview | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchPreview = async (bookingId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/bookings/${bookingId}/cancel-preview`);
            setPreview(response.data);
            return response.data;
        } catch (err: any) {
            const message = err.response?.data?.message || err.response?.data?.error || 'Failed to fetch refund details';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const resetPreview = () => {
        setPreview(null);
        setError(null);
        setLoading(false);
    };

    return { preview, loading, error, fetchPreview, resetPreview };
};
