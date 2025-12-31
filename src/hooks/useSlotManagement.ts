/**
 * useSlotManagement Hook
 * Custom hook for managing slot configurations
 * - Fetch slot configurations
 * - Update slot prices and availability
 * - Bulk operations
 * - Loading and error states
 */

import { useState, useCallback } from 'react';
import { adminAPI } from '../services/api';
import { Alert } from 'react-native';
import { SlotConfig, SlotUpdate } from '../types';
import { sortSlotConfigsByTime, mapDbSlotsToConfig, DEFAULT_SLOTS } from '../utils/slotUtils';

interface UseSlotManagementOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export const useSlotManagement = (options?: UseSlotManagementOptions) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotConfig[]>([]);
  const [slotsLoaded, setSlotsLoaded] = useState(false);

  /**
   * Fetch slot configurations for a service
   */
  const fetchSlots = useCallback(async (serviceId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAPI.getServiceSlots(serviceId);
      const dbSlots = response.data.slots || [];

      // Map database slots to app format and sort
      const mappedSlots = mapDbSlotsToConfig(dbSlots);
      const sortedSlots = sortSlotConfigsByTime(mappedSlots);

      setSlots(sortedSlots);
      setSlotsLoaded(true);
      return sortedSlots;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch slots';
      setError(errorMsg);
      options?.onError?.(errorMsg);

      // Fallback to default slots if fetch fails
      const defaultSlots = sortSlotConfigsByTime([...DEFAULT_SLOTS]);
      setSlots(defaultSlots);
      setSlotsLoaded(true);

      setSlots(defaultSlots);
      setSlotsLoaded(true);

      Alert.alert('Info', 'Using default slot configuration');

      return defaultSlots;
    } finally {
      setLoading(false);
    }
  }, [options]);

  /**
   * Update slot configurations
   */
  const updateSlots = useCallback(async (serviceId: number, slotUpdates: SlotUpdate[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAPI.updateService(serviceId, { slots: slotUpdates });
      const successMsg = 'Slot configurations updated successfully';
      options?.onSuccess?.(successMsg);
      Alert.alert('Success', successMsg);

      // Refresh slots after update
      await fetchSlots(serviceId);

      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update slots';
      setError(errorMsg);
      options?.onError?.(errorMsg);
      Alert.alert('Error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSlots, options]);

  /**
   * Toggle slot enabled/disabled
   */
  const toggleSlot = useCallback((slotId: number) => {
    setSlots(prev =>
      prev.map(slot =>
        slot.slotId === slotId
          ? { ...slot, enabled: !slot.enabled }
          : slot
      )
    );
  }, []);

  /**
   * Update slot price
   */
  const updateSlotPrice = useCallback((slotId: number, price: number) => {
    setSlots(prev =>
      prev.map(slot =>
        slot.slotId === slotId
          ? { ...slot, price }
          : slot
      )
    );
  }, []);

  /**
   * Apply same price to all enabled slots
   */
  const applyMasterPrice = useCallback((price: number) => {
    setSlots(prev =>
      prev.map(slot =>
        slot.enabled
          ? { ...slot, price }
          : slot
      )
    );
  }, []);

  /**
   * Enable all slots
   */
  const enableAllSlots = useCallback(() => {
    setSlots(prev =>
      prev.map(slot => ({ ...slot, enabled: true }))
    );
  }, []);

  /**
   * Disable all slots
   */
  const disableAllSlots = useCallback(() => {
    setSlots(prev =>
      prev.map(slot => ({ ...slot, enabled: false }))
    );
  }, []);

  /**
   * Reset to default slots
   */
  const resetToDefaults = useCallback(() => {
    const defaultSlots = sortSlotConfigsByTime([...DEFAULT_SLOTS]);
    setSlots(defaultSlots);
  }, []);

  /**
   * Get enabled slots count
   */
  const getEnabledCount = useCallback(() => {
    return slots.filter(s => s.enabled).length;
  }, [slots]);

  /**
   * Get disabled slots count
   */
  const getDisabledCount = useCallback(() => {
    return slots.filter(s => !s.enabled).length;
  }, [slots]);

  /**
   * Validate slot configurations
   */
  const validateSlots = useCallback(() => {
    const enabledSlots = slots.filter(s => s.enabled);

    if (enabledSlots.length === 0) {
      return {
        isValid: false,
        error: 'At least one slot must be enabled',
      };
    }

    const invalidPrices = enabledSlots.filter(s => !s.price || s.price <= 0);
    if (invalidPrices.length > 0) {
      return {
        isValid: false,
        error: 'All enabled slots must have a valid price',
      };
    }

    return { isValid: true };
  }, [slots]);

  /**
   * Prepare slot updates for API
   */
  const prepareSlotUpdates = useCallback((): SlotUpdate[] => {
    return slots.map(slot => ({
      slotId: slot.slotId,
      enabled: slot.enabled,
      price: slot.price || 0,
      priceChanged: true,
      enabledChanged: true,
    }));
  }, [slots]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSlots([]);
    setSlotsLoaded(false);
  }, []);

  return {
    // State
    loading,
    error,
    slots,
    slotsLoaded,

    // Actions
    fetchSlots,
    updateSlots,
    toggleSlot,
    updateSlotPrice,
    applyMasterPrice,
    enableAllSlots,
    disableAllSlots,
    resetToDefaults,

    // Helpers
    getEnabledCount,
    getDisabledCount,
    validateSlots,
    prepareSlotUpdates,
    clearError,
    reset,
  };
};
