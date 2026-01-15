declare module 'react-native-razorpay' {
    export interface RazorpayOptions {
        description?: string;
        image?: string;
        currency: string;
        key: string;
        amount: number;
        order_id: string;
        name: string;
        prefill?: {
            email?: string;
            contact?: string;
            name?: string;
        };
        theme?: {
            color?: string;
        };
        modal?: {
            ondismiss?: () => void;
        };
    }

    export interface SuccessResponse {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
    }

    export interface ErrorResponse {
        code: number;
        description: string;
        metadata: any;
    }

    export default class RazorpayCheckout {
        static open(options: RazorpayOptions): Promise<SuccessResponse>;
        static onExternalWalletSelection(callback: (walletName: string) => void): void;
    }
}
