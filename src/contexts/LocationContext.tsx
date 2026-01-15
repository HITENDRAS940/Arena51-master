import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserLocation {
    latitude: number;
    longitude: number;
    city?: string;
    state?: string;
}

interface LocationContextType {
    location: UserLocation | null;
    errorMsg: string | null;
    loading: boolean;
    manualCity: string | null;
    detectLocation: () => Promise<void>;
    detectAndSetToCurrentCity: () => Promise<void>;
    setCityManually: (city: string) => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const CACHE_KEY_CITY = 'user_city';
const CACHE_KEY_COORDS = 'user_coords';

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [location, setLocation] = useState<UserLocation | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [manualCity, setManualCity] = useState<string | null>(null);
    
    // Ref to prevent multiple geocoding calls during app launch
    const hasGeocoded = useRef(false);

    // Initial load from cache
    useEffect(() => {
        const init = async () => {
            try {
                const savedCity = await AsyncStorage.getItem(CACHE_KEY_CITY);
                const savedCoords = await AsyncStorage.getItem(CACHE_KEY_COORDS);
                
                if (savedCity) {
                    setManualCity(savedCity);
                }
                
                if (savedCoords) {
                    const coords = JSON.parse(savedCoords);
                    setLocation({
                        ...coords,
                        city: savedCity || undefined
                    });
                }
                
                // Auto-detect on launch if not already set or even if set (to keep coords fresh)
                // but follow the "geocode once" rule.
                detectLocation();
            } catch (e) {
                detectLocation();
            }
        };
        init();
    }, []);

    const reverseGeocode = async (latitude: number, longitude: number, force: boolean = false) => {
        // Strict Rule: ONLY ONCE per app launch or explicit user action (force)
        if (hasGeocoded.current && !force) {
            return null;
        }

        try {
            const addressResponse = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (addressResponse && addressResponse.length > 0) {
                const address = addressResponse[0];
                const { city, subregion, district, name, region, postalCode } = address;
                
                // Priority: City -> District -> Subregion -> Name -> PostalCode
                const finalCity = city || district || subregion || name || postalCode || 'Unknown';
                const state = region || undefined;
                
                hasGeocoded.current = true;
                return { city: finalCity, state };
            }
        } catch (error) {

        }
        return null;
    };

    const detectLocation = async (isManualAction: boolean = false) => {
        if (loading) return;
        setLoading(true);
        setErrorMsg(null);

        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            // 1. Try last known position for fast response
            let current = await Location.getLastKnownPositionAsync();
            
            // 2. If no last known or needed fresh, get current with timeout
            if (!current) {
                current = await Location.getCurrentPositionAsync({ 
                    accuracy: Location.Accuracy.Balanced,
                });
            }
            
            if (!current) {
                throw new Error('Could not retrieve coordinates');
            }
            
            const { latitude, longitude } = current.coords;
            
            // Successively store coords
            await AsyncStorage.setItem(CACHE_KEY_COORDS, JSON.stringify({ latitude, longitude }));

            // 3. Reverse geocode only if needed (once per launch or manual action)
            const result = await reverseGeocode(latitude, longitude, isManualAction);
            
            if (result) {
                const { city, state } = result;
                
                if (isManualAction && city !== 'Unknown') {
                    setManualCity(city);
                    await AsyncStorage.setItem(CACHE_KEY_CITY, city);
                }

                setLocation({
                    latitude,
                    longitude,
                    city: city === 'Unknown' ? (manualCity || undefined) : city,
                    state
                });
            } else {
                // Keep coords, use cached city if any
                const savedCity = await AsyncStorage.getItem(CACHE_KEY_CITY);
                setLocation(prev => ({
                    latitude,
                    longitude,
                    city: savedCity || prev?.city || undefined,
                    state: prev?.state || undefined
                }));
            }
        } catch (error) {

            setErrorMsg('Failed to get current location');
        } finally {
            setLoading(false);
        }
    };

    const detectAndSetToCurrentCity = async () => {
        await detectLocation(true);
    };

    const setCityManually = async (city: string) => {
        setManualCity(city);
        await AsyncStorage.setItem(CACHE_KEY_CITY, city);
        setLocation(prev => prev ? { ...prev, city } : { latitude: 0, longitude: 0, city });
    };

    return (
        <LocationContext.Provider value={{
            location,
            errorMsg,
            loading,
            manualCity,
            detectLocation: () => detectLocation(false),
            detectAndSetToCurrentCity,
            setCityManually
        }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocationContext = () => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocationContext must be used within a LocationProvider');
    }
    return context;
};
