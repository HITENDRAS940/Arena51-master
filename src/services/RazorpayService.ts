import RazorpayCheckout from 'react-native-razorpay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { razorpayAPI } from './api';
import { Alert, Platform } from 'react-native';

class RazorpayService {
    /**
     * JS Thread Resumption Strategy:
     * Android sometimes deadlocks the JS thread when returning from native modules.
     * We force the event loop to wake up by chaining multiple timeouts.
     */
    private forceWake(callback: () => void) {
        if (Platform.OS !== 'android') {
            callback();
            return;
        }

        setTimeout(() => {
            setTimeout(() => {
                callback();
            }, 800); // Second tick helps bridge catch up
        }, 0); // Initial yield
    }

    /**
     * Initialize payment for a booking and verify on backend
     */
    async openCheckout(bookingId: number, orderData: any, themeColor: string = '#2563eb') {


        // 1. Prepare User Info for prefill
        let user = {};
        try {
            const userStr = await AsyncStorage.getItem('user');
            user = userStr ? JSON.parse(userStr) : {};
        } catch (e) {

        }

        // 2. Razorpay Options
        const options = {
            description: `Booking #${bookingId}`,
            image: 'https://cdn-icons-png.flaticon.com/512/825/825561.png', // Consistent logo
            currency: orderData.currency || 'INR',
            key: orderData.keyId,
            amount: orderData.amount,
            order_id: orderData.orderId,
            name: 'Hyper Booking',
            prefill: {
                email: (user as any).email || '',
                contact: (user as any).phone || '',
                name: (user as any).name || '',
            },
            theme: {
                color: themeColor,
            },
            modal: {

            },
        };

        return new Promise<{ status: 'SUCCESS' | 'CANCELLED' | 'FAILED', paymentData?: any, orderId?: string, error?: string }>((resolve) => {


            RazorpayCheckout.open(options)
                .then((paymentResponse: any) => {

                    this.forceWake(() => {
                        resolve({
                            status: 'SUCCESS',
                            paymentData: paymentResponse,
                            orderId: orderData.orderId,
                        });
                    });
                })
                .catch((error: any) => {


                    this.forceWake(() => {
                        // 1. Normalize the error object
                        let innerError = error?.error || error;

                        // Sometimes the description is a stringified JSON of the actual error
                        if (typeof error.description === 'string' && error.description.startsWith('{')) {
                            try {
                                const parsed = JSON.parse(error.description);
                                if (parsed.error) innerError = parsed.error;
                            } catch (e) {
                                // Ignore parse error
                            }
                        }

                        // 2. Check for explicit user cancellation (error code 2)
                        if (error.code === 2) {

                            resolve({ status: 'CANCELLED' });
                            return;
                        }

                        // 3. Map "BAD_REQUEST_ERROR" during "payment_authentication" to CANCELLED
                        // This typically happens when a user presses back or aborts during the OTP/bank stage.
                        if (
                            innerError?.code === 'BAD_REQUEST_ERROR' &&
                            (innerError?.step === 'payment_authentication' || innerError?.reason === 'payment_cancelled')
                        ) {

                            resolve({ status: 'CANCELLED' });
                            return;
                        }

                        // 4. Other genuine errors
                        const errorDescription = innerError?.description || error.description || error.message || 'Payment failed';
                        resolve({
                            status: 'FAILED',
                            error: errorDescription === 'undefined' ? 'Payment aborted by user' : errorDescription
                        });
                    });
                });
        });
    }

    async initiatePayment(bookingId: number, themeColor?: string) {
        try {

            const orderResponse = await razorpayAPI.createOrder(bookingId);
            const orderData = orderResponse.data;
            return await this.openCheckout(bookingId, orderData, themeColor);
        } catch (error: any) {

            throw error;
        }
    }

    /**
     * Get payment details (if needed)
     */
    async getPaymentDetails(paymentId: string) {
        try {
            const response = await razorpayAPI.getPaymentDetails(paymentId);
            return response.data;
        } catch (error) {

            throw error;
        }
    }
}

export default new RazorpayService();
