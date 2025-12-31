/**
 * useImageManagement Hook
 * Custom hook for managing service images
 * - Upload multiple images
 * - Delete images
 * - Permission handling
 * - Loading and error states
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { adminAPI } from '../services/api';

interface ImageAsset {
  uri: string;
  width?: number;
  height?: number;
  base64?: string;
}

interface UseImageManagementOptions {
  serviceId?: number;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
  onUploadComplete?: () => void;
  onDeleteComplete?: () => void;
}

export const useImageManagement = (options?: UseImageManagementOptions) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<ImageAsset[]>([]);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  /**
   * Request media library permissions
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const granted = status === 'granted';
      setPermissionGranted(granted);

      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please grant permission to access your photo library to upload images.'
        );
      }

      return granted;
    } catch (err) {
      setPermissionGranted(false);
      return false;
    }
  }, []);

  /**
   * Select images from library
   */
  const selectImages = useCallback(async () => {
    try {
      // Check permission first
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions?.Images || ('images' as any),
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [16, 9],
        base64: false,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        const mappedAssets: ImageAsset[] = result.assets.map(asset => ({
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          base64: asset.base64 || undefined,
        }));
        setSelectedImages((prev) => [...prev, ...mappedAssets]);
        return mappedAssets;
      }

      return [];
    } catch (err: any) {
      const errorMsg = 'Failed to select images. Please try again.';
      setError(errorMsg);
      options?.onError?.(errorMsg);
      Alert.alert('Error', errorMsg);
      return [];
    }
  }, [requestPermission, options]);

  /**
   * Remove a selected image (before upload)
   */
  const removeSelectedImage = useCallback((index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Clear all selected images
   */
  const clearSelectedImages = useCallback(() => {
    setSelectedImages([]);
  }, []);

  /**
   * Upload selected images to service
   */
  const uploadImages = useCallback(async (serviceId?: number) => {
    const id = serviceId || options?.serviceId;

    if (!id) {
      const errorMsg = 'Service ID is required for image upload';
      setError(errorMsg);
      options?.onError?.(errorMsg);
      Alert.alert('Error', errorMsg);
      return;
    }

    if (selectedImages.length === 0) {
      Alert.alert('No Images', 'Please select images to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      selectedImages.forEach((asset, index) => {
        formData.append('images', {
          uri: asset.uri,
          type: 'image/jpeg',
          name: `image_${index}.jpg`,
        } as any);
      });

      await adminAPI.uploadServiceImages(id, formData);

      const successMsg = `${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''} uploaded successfully`;
      options?.onSuccess?.(successMsg);
      Alert.alert('Success', successMsg);

      // Clear selected images after successful upload
      setSelectedImages([]);
      options?.onUploadComplete?.();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to upload images';
      setError(errorMsg);
      options?.onError?.(errorMsg);
      Alert.alert('Error', errorMsg);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [selectedImages, options]);

  /**
   * Delete images from service
   */
  const deleteImages = useCallback(async (serviceId: number, imageUrls: string[]) => {
    if (imageUrls.length === 0) {
      Alert.alert('No Selection', 'Please select images to delete.');
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await adminAPI.deleteServiceImages(serviceId, imageUrls);

      const successMsg = `${imageUrls.length} image${imageUrls.length > 1 ? 's' : ''} deleted successfully`;
      options?.onSuccess?.(successMsg);
      Alert.alert('Success', successMsg);

      options?.onDeleteComplete?.();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to delete images';
      setError(errorMsg);
      options?.onError?.(errorMsg);
      Alert.alert('Error', errorMsg);
      throw err;
    } finally {
      setDeleting(false);
    }
  }, [options]);

  /**
   * Delete images with confirmation
   */
  const deleteImagesWithConfirmation = useCallback(async (
    serviceId: number,
    imageUrls: string[]
  ) => {
    if (imageUrls.length === 0) {
      Alert.alert('No Selection', 'Please select images to delete.');
      return;
    }

    Alert.alert(
      'Delete Images',
      `Are you sure you want to delete ${imageUrls.length} image${imageUrls.length !== 1 ? 's' : ''
      }?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteImages(serviceId, imageUrls),
        },
      ]
    );
  }, [deleteImages]);

  /**
   * Check if there are unsaved images
   */
  const hasUnsavedImages = useCallback(() => {
    return selectedImages.length > 0;
  }, [selectedImages]);

  /**
   * Warn about unsaved images
   */
  const warnUnsavedImages = useCallback((onConfirm: () => void) => {
    if (selectedImages.length > 0) {
      Alert.alert(
        'Unsaved Changes',
        "You have selected images that haven't been uploaded. Do you want to discard them?",
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            onPress: () => {
              setSelectedImages([]);
              onConfirm();
            },
          },
        ]
      );
    } else {
      onConfirm();
    }
  }, [selectedImages]);

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
    setUploading(false);
    setDeleting(false);
    setError(null);
    setSelectedImages([]);
  }, []);

  return {
    // State
    uploading,
    deleting,
    error,
    selectedImages,
    permissionGranted,

    // Actions
    requestPermission,
    selectImages,
    removeSelectedImage,
    clearSelectedImages,
    uploadImages,
    deleteImages,
    deleteImagesWithConfirmation,

    // Helpers
    hasUnsavedImages,
    warnUnsavedImages,
    clearError,
    reset,
  };
};
