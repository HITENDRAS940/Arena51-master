import { useState, useEffect, useCallback, useMemo } from 'react';
import { Animated } from 'react-native';
import { format } from 'date-fns';
import { serviceAPI, bookingAPI } from '../services/api';
import { Service, EphemeralSlot, Activity, Resource, DynamicBookingRequest } from '../types';
import { generateUUID } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../components/shared/CustomAlert';

export const useServiceBooking = (serviceId: string, service: Service | null, navigation: any) => {
    const { user } = useAuth();
    const { showAlert } = useAlert();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [availableSlots, setAvailableSlots] = useState<EphemeralSlot[]>([]);
    const [selectedSlotKeys, setSelectedSlotKeys] = useState<string[]>([]);
    const [selectedSlotPrice, setSelectedSlotPrice] = useState<number>(0);
    const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [showBookingSection, setShowBookingSection] = useState(false);
    const [resources, setResources] = useState<Resource[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [resourcesLoading, setResourcesLoading] = useState(false);

    const bookingEntranceAnim = useMemo(() => new Animated.Value(0), []);
    const footerCrossfadeAnim = useMemo(() => new Animated.Value(0), []);

    const fetchResources = useCallback(async () => {
        if (!serviceId) return;
        setResourcesLoading(true);
        try {
            const response = await serviceAPI.getResourcesByServiceId(serviceId);
            const allResources: Resource[] = response.data;
            setResources(allResources);

            const activityMap = new Map<string, Activity>();
            allResources.forEach(res => {
                res.activities?.forEach((activity: Activity) => {
                    if (!activityMap.has(activity.code)) {
                        activityMap.set(activity.code, activity);
                    }
                });
            });

            const uniqueActivities = Array.from(activityMap.values());
            setActivities(uniqueActivities);

            if (uniqueActivities.length > 0) {
                setSelectedActivity(uniqueActivities[0]);
            }
        } catch (error) {
        } finally {
            setResourcesLoading(false);
        }
    }, [serviceId]);

    const fetchAvailableSlots = useCallback(async () => {
        if (!service) return;
        if (resourcesLoading || (activities.length > 0 && !selectedActivity)) {
            return;
        }

        setSlotsLoading(true);
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            let timeSlots: EphemeralSlot[] = [];

            if (selectedActivity) {
                const response = await serviceAPI.getActivityAvailability(service.id, (selectedActivity as any).code, dateStr);
                timeSlots = response.data.slots || response.data.content || [];
            }
            setAvailableSlots(timeSlots);
        } catch (error) {
        } finally {
            setSlotsLoading(false);
        }
    }, [service, resourcesLoading, activities.length, selectedActivity, selectedDate]);

    useEffect(() => {
        if (showBookingSection && service) {
            fetchAvailableSlots();
            Animated.timing(bookingEntranceAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();

            Animated.timing(footerCrossfadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(bookingEntranceAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();

            Animated.timing(footerCrossfadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [selectedDate, showBookingSection, service, selectedActivity, fetchAvailableSlots, bookingEntranceAnim, footerCrossfadeAnim]);

    useEffect(() => {
        if (availableSlots.length > 0 && selectedSlotKeys.length > 0) {
            const newPrice = availableSlots
                .filter(s => s.slotKey && selectedSlotKeys.includes(s.slotKey))
                .reduce((sum, s) => sum + (s.displayPrice || s.price || 0), 0);

            setSelectedSlotPrice(newPrice);
            if (!idempotencyKey) setIdempotencyKey(generateUUID());
        } else if (selectedSlotKeys.length === 0) {
            setSelectedSlotPrice(0);
            setIdempotencyKey(null);
        }
    }, [selectedSlotKeys, availableSlots, idempotencyKey]);

    const toggleSlotSelection = (slot: EphemeralSlot) => {
        if (!slot.available) {
            showAlert({
                title: 'Slot Unavailable',
                message: 'This time slot is no longer available',
                type: 'warning',
            });
            return;
        }

        if (!slot.slotKey) return;

        setSelectedSlotKeys(prev => {
            const isSelected = prev.includes(slot.slotKey!);
            if (isSelected) {
                return prev.filter(key => key !== slot.slotKey);
            } else {
                return [...prev, slot.slotKey!];
            }
        });
    };

    const handleActivitySelect = (activity: Activity) => {
        setSelectedActivity(activity);
        setSelectedSlotKeys([]);
        setSelectedSlotPrice(0);
        setIdempotencyKey(null);
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setSlotsLoading(true);
        setSelectedSlotKeys([]);
        setSelectedSlotPrice(0);
        setIdempotencyKey(null);
    };

    const handlePreBooking = useCallback(async (allowSplit: boolean = false) => {
        const bookingRequest: DynamicBookingRequest = {
            slotKeys: selectedSlotKeys,
            idempotencyKey: idempotencyKey!,
            allowSplit,
            paymentMethod: 'RAZORPAY',
        };

        try {
            setBookingLoading(true);
            const response = await bookingAPI.createBooking(bookingRequest);
            const bookingData = response.data;

            if (bookingData.status === 'PARTIAL_AVAILABLE') {
                setBookingLoading(false);
                showAlert({
                    title: 'Split Booking Required',
                    message: 'A single ground is not available for the entire duration. Do you want to book separate grounds for these slots?',
                    type: 'info',
                    buttons: [
                        { text: 'No', style: 'cancel' },
                        {
                            text: 'Yes, Book Split',
                            onPress: () => handlePreBooking(true)
                        }
                    ],
                });
                return;
            }

            if (bookingData.status === 'FAILED') {
                setBookingLoading(false);
                showAlert({
                    title: 'Booking Failed',
                    message: bookingData.message || 'The selected slots are no longer available.',
                    type: 'error',
                });
                fetchAvailableSlots();
                return;
            }

            setBookingLoading(false);
            navigation.navigate('BookingSummary', {
                bookingData,
                service: service!
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'The selected slot might no longer be available.';
            showAlert({
                title: 'Booking Failed',
                message: message,
                type: 'error',
                buttons: [{ text: 'Refresh Slots', onPress: fetchAvailableSlots }],
            });
        } finally {
            setBookingLoading(false);
        }
    }, [selectedSlotKeys, idempotencyKey, service, navigation, fetchAvailableSlots, showAlert]);

    const handleConfirmBooking = async () => {
        if (!user) {
            const redirectInfo = {
                name: 'User',
                params: {
                    screen: 'ServiceDetail',
                    params: { serviceId }
                }
            };

            showAlert({
                title: 'Login Required',
                message: 'Please login to continue with your booking.',
                type: 'info',
                buttons: [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Login',
                        onPress: () => navigation.navigate('Auth', {
                            screen: 'PhoneEntry',
                            params: { redirectTo: redirectInfo }
                        })
                    }
                ],
            });
            return;
        }

        if (selectedSlotKeys.length === 0 || !idempotencyKey) {
            showAlert({
                title: 'No Slots Selected',
                message: 'Please select at least one time slot',
                type: 'warning',
            });
            return;
        }

        await handlePreBooking();
    };

    const handleBookNow = useCallback(() => {
        setSelectedSlotKeys([]);
        setSelectedSlotPrice(0);
        setIdempotencyKey(null);
        setShowBookingSection(true);
        setSlotsLoading(true);
        fetchResources();
    }, [fetchResources]);

    return {
        selectedDate,
        availableSlots,
        selectedSlotKeys,
        selectedSlotPrice,
        slotsLoading,
        bookingLoading,
        showBookingSection,
        setShowBookingSection,
        resources,
        activities,
        selectedActivity,
        resourcesLoading,
        bookingEntranceAnim,
        footerCrossfadeAnim,
        handleDateSelect,
        toggleSlotSelection,
        handleActivitySelect,
        handleConfirmBooking,
        handleBookNow,
        setSelectedActivity,
        setSelectedSlotKeys,
        setSelectedDate
    };
};
