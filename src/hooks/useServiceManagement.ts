/**
 * useServiceManagement Hook
 * Custom hook for managing service CRUD operations
 * - Fetch service data
 * - Create/update/delete services
 * - Loading and error states
 * - Success/error notifications
 */

import { useState, useCallback } from 'react';
import { adminAPI, serviceAPI } from '../services/api';
import { Alert } from 'react-native';
import { ServiceDetails } from '../types';

interface UseServiceManagementOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

interface Service extends ServiceDetails {
  id: number;
  isAvailable?: boolean;
  [key: string]: any;
}

export const useServiceManagement = (options?: UseServiceManagementOptions) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [service, setService] = useState<Service | null>(null);

  /**
   * Fetch service by ID
   */
  const fetchService = useCallback(async (serviceId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serviceAPI.getServiceById(serviceId);
      setService(response.data as unknown as Service);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch service details';
      setError(errorMsg);
      options?.onError?.(errorMsg);
      Alert.alert('Error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  /**
   * Create new service
   */
  const createService = useCallback(async (serviceData: {
    name: string;
    location: string;
    price: number;
    description?: string;
    amenities?: string | string[];
    contactNumber?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      // Normalize amenities to string[]
      const normalizedData = {
        ...serviceData,
        amenities: typeof serviceData.amenities === 'string'
          ? serviceData.amenities.split(',').map(s => s.trim()).filter(s => s)
          : serviceData.amenities
      };

      const response = await adminAPI.createService(normalizedData);
      const successMsg = 'Service created successfully';
      options?.onSuccess?.(successMsg);
      Alert.alert('Success', successMsg);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to create service';
      setError(errorMsg);
      options?.onError?.(errorMsg);
      Alert.alert('Error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  /**
   * Update service details
   */
  const updateService = useCallback(async (serviceId: number, serviceData: {
    name?: string;
    location?: string;
    price?: number;
    description?: string;
    amenities?: string | string[];
    contactNumber?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      // Normalize amenities to string[]
      const normalizedData = {
        ...serviceData,
        amenities: typeof serviceData.amenities === 'string'
          ? serviceData.amenities.split(',').map(s => s.trim()).filter(s => s)
          : serviceData.amenities
      };

      const response = await adminAPI.updateService(serviceId, normalizedData);
      const successMsg = 'Service updated successfully';
      Alert.alert('Success', successMsg);

      // Update local state
      if (service && service.id === serviceId) {
        setService({ ...service, ...normalizedData } as Service);
      }

      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update service';
      setError(errorMsg);
      options?.onError?.(errorMsg);
      Alert.alert('Error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service, options]);

  /**
   * Delete service
   */
  const deleteService = useCallback(async (serviceId: number) => {
    setLoading(true);
    setError(null);
    try {
      await adminAPI.deleteService(serviceId);
      const successMsg = 'Service deleted successfully';
      options?.onSuccess?.(successMsg);
      Alert.alert('Success', successMsg);

      // Clear local state if deleted service was loaded
      if (service && service.id === serviceId) {
        setService(null);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to delete service';
      setError(errorMsg);
      options?.onError?.(errorMsg);
      Alert.alert('Error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service, options]);

  /**
   * Set service availability
   */
  const setAvailability = useCallback(async (serviceId: number, isAvailable: boolean) => {
    setLoading(true);
    setError(null);
    try {
      // Use the correct API methods
      if (isAvailable) {
        await adminAPI.setServiceAvailable(serviceId);
      } else {
        await adminAPI.setServiceNotAvailable(serviceId);
      }

      const successMsg = 'Availability updated successfully';
      Alert.alert('Success', successMsg);

      // Update local state
      if (service && service.id === serviceId) {
        setService({ ...service, isAvailable });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update availability';
      setError(errorMsg);
      options?.onError?.(errorMsg);
      Alert.alert('Error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service, options]);

  /**
   * Fetch all services
   */
  const fetchAllServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Note: adminAPI doesn't have getAllServices, so this would need to be implemented
      // or use a different approach. For now, returning empty array.
      console.warn('getAllServices not implemented in adminAPI');
      return [];
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch services';
      setError(errorMsg);
      options?.onError?.(errorMsg);
      Alert.alert('Error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

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
    setService(null);
  }, []);

  return {
    // State
    loading,
    error,
    service,

    // Actions
    fetchService,
    createService,
    updateService,
    deleteService,
    setAvailability,
    fetchAllServices,
    clearError,
    reset,
  };
};

