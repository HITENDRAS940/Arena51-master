import { useLocationContext, UserLocation } from '../contexts/LocationContext';

export type { UserLocation };

/**
 * useLocation Hook
 * 
 * Refactored to consume LocationContext to ensure global state consistency,
 * strict geocoding rules, and efficient caching.
 */
export const useLocation = () => {
    const context = useLocationContext();

    return {
        location: context.location,
        errorMsg: context.errorMsg,
        loading: context.loading,
        detectLocation: context.detectLocation,
        setCityManually: context.setCityManually,
        detectAndSetToCurrentCity: context.detectAndSetToCurrentCity,
        manualCity: context.manualCity,
    };
};
