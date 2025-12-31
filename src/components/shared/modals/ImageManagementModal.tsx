/**
 * ImageManagementModal Component
 * Reusable modal for managing turf images
 * - Upload multiple images
 * - Delete images (multi-select)
 * - Preview grid
 * - Progress indicators
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../../contexts/ThemeContext';
import Button from '../Button';

interface ImageAsset {
  uri: string;
  width?: number;
  height?: number;
  base64?: string | null;
}

interface ImageManagementModalProps {
  visible: boolean;
  onClose: () => void;
  onUpload: (images: ImageAsset[]) => Promise<void>;
  onDelete: (imageUrls: string[]) => Promise<void>;
  existingImages: string[];
  uploading?: boolean;
  deleting?: boolean;
  turfName?: string;
}

const ImageManagementModal: React.FC<ImageManagementModalProps> = ({
  visible,
  onClose,
  onUpload,
  onDelete,
  existingImages,
  uploading = false,
  deleting = false,
  turfName,
}) => {
  const { theme } = useTheme();
  const [selectedImages, setSelectedImages] = React.useState<ImageAsset[]>([]);
  const [deleteMode, setDeleteMode] = React.useState(false);
  const [selectedImageUrls, setSelectedImageUrls] = React.useState<string[]>([]);
  const [imageLoadingStates, setImageLoadingStates] = React.useState<{ [key: string]: boolean }>({});

  const handleImageLoadStart = (uri: string) => {
    setImageLoadingStates(prev => ({ ...prev, [uri]: true }));
  };

  const handleImageLoadEnd = (uri: string) => {
    setImageLoadingStates(prev => ({ ...prev, [uri]: false }));
  };

  // Reset states when modal closes
  React.useEffect(() => {
    if (!visible) {
      setSelectedImages([]);
      setDeleteMode(false);
      setSelectedImageUrls([]);
    }
  }, [visible]);

  const selectImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant permission to access your photo library to upload images.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions?.Images || ('images' as any),
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [16, 9],
        base64: false,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        const newAssets: ImageAsset[] = result.assets.map(asset => ({
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          base64: asset.base64 || null,
        }));
        setSelectedImages((prev) => [...prev, ...newAssets]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select images. Please try again.');
    }
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('No Images', 'Please select images to upload.');
      return;
    }

    await onUpload(selectedImages);
    setSelectedImages([]);
  };

  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setSelectedImageUrls([]);
  };

  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImageUrls((prev) =>
      prev.includes(imageUrl)
        ? prev.filter((url) => url !== imageUrl)
        : [...prev, imageUrl]
    );
  };

  const handleDelete = async () => {
    if (selectedImageUrls.length === 0) {
      Alert.alert('No Selection', 'Please select images to delete.');
      return;
    }

    Alert.alert(
      'Delete Images',
      `Are you sure you want to delete ${selectedImageUrls.length} image${
        selectedImageUrls.length !== 1 ? 's' : ''
      }?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await onDelete(selectedImageUrls);
            setSelectedImageUrls([]);
            setDeleteMode(false);
          },
        },
      ]
    );
  };

  const handleClose = () => {
    if (selectedImages.length > 0) {
      Alert.alert(
        'Unsaved Changes',
        'You have selected images that haven\'t been uploaded. Do you want to close?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Close',
            onPress: () => {
              setSelectedImages([]);
              onClose();
            },
          },
        ]
      );
    } else {
      onClose();
    }
  };

  const isLoading = uploading || deleting;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={handleClose}
      presentationStyle="pageSheet"
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { 
          backgroundColor: theme.colors.card,
          borderBottomColor: theme.colors.border || 'rgba(0,0,0,0.1)',
        }]}>
          <View style={styles.headerTop}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Manage Images
              </Text>
              {turfName && (
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  {turfName}
                </Text>
              )}
            </View>
            <TouchableOpacity 
              onPress={handleClose} 
              disabled={isLoading}
              style={[styles.closeButton, { backgroundColor: theme.colors.background }]}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Bar */}
        <View style={[styles.actionBar, { 
          backgroundColor: theme.colors.card,
          borderBottomColor: theme.colors.border || 'rgba(0,0,0,0.1)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }]}>
          {!deleteMode ? (
            <>
              <Button
                title="Add Images"
                onPress={selectImages}
                variant="outline"
                style={styles.actionButton}
                disabled={isLoading}
              />

              {existingImages.length > 0 && (
                <Button
                  title="Delete Mode"
                  onPress={toggleDeleteMode}
                  variant="outline"
                  style={styles.actionButton}
                  disabled={isLoading}
                />
              )}

              {selectedImages.length > 0 && (
                <Button
                  title={uploading ? 'Uploading...' : `Upload (${selectedImages.length})`}
                  onPress={handleUpload}
                  style={styles.actionButton}
                  disabled={isLoading}
                  loading={uploading}
                />
              )}
            </>
          ) : (
            <>
              <Button
                title="Cancel"
                onPress={toggleDeleteMode}
                variant="outline"
                style={styles.actionButton}
                disabled={isLoading}
              />

              {selectedImageUrls.length > 0 && (
                <Button
                  title={deleting ? 'Deleting...' : `Delete (${selectedImageUrls.length})`}
                  onPress={handleDelete}
                  variant="danger"
                  style={styles.actionButton}
                  disabled={isLoading}
                  loading={deleting}
                />
              )}
            </>
          )}
        </View>

        {/* Delete Mode Helper */}
        {deleteMode && (
          <View style={[styles.helperBar, { backgroundColor: theme.colors.card }]}>
            <Ionicons name="information-circle" size={18} color={theme.colors.primary} />
            <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
              Tap on images to select them for deletion
            </Text>
          </View>
        )}

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Selected Images (To Upload) */}
          {selectedImages.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="cloud-upload" size={20} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Ready to Upload ({selectedImages.length})
                </Text>
              </View>

              <View style={styles.imageGrid}>
                {selectedImages.map((asset, index) => (
                  <View
                    key={`new-${index}`}
                    style={[styles.imageCard, { backgroundColor: theme.colors.card }]}
                  >
                    <View style={styles.imageWrapper}>
                      <Image 
                        source={{ uri: asset.uri }} 
                        style={styles.image} 
                        resizeMode="cover"
                        onLoadStart={() => handleImageLoadStart(asset.uri)}
                        onLoadEnd={() => handleImageLoadEnd(asset.uri)}
                      />
                      {imageLoadingStates[asset.uri] && (
                        <View style={styles.imageLoadingOverlay}>
                          <ActivityIndicator size="small" color={theme.colors.primary} />
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      style={[styles.removeButton, { backgroundColor: theme.colors.error }]}
                      onPress={() => removeSelectedImage(index)}
                    >
                      <Ionicons name="close" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.imageBadge}>
                      <Text style={styles.imageBadgeText}>NEW</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="images" size={20} color={theme.colors.text} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Current Images ({existingImages.length})
                </Text>
                {deleteMode && selectedImageUrls.length > 0 && (
                  <Text style={[styles.selectionCount, { color: theme.colors.error }]}>
                    {selectedImageUrls.length} selected
                  </Text>
                )}
              </View>

              <View style={styles.imageGrid}>
                {existingImages.map((imageUrl, index) => (
                  <TouchableOpacity
                    key={`existing-${index}`}
                    style={[
                      styles.imageCard,
                      { backgroundColor: theme.colors.card },
                      deleteMode && styles.selectableImage,
                      deleteMode &&
                        selectedImageUrls.includes(imageUrl) && [
                          styles.selectedImage,
                          { borderColor: theme.colors.error },
                        ],
                    ]}
                    onPress={() => deleteMode && toggleImageSelection(imageUrl)}
                    disabled={!deleteMode}
                    activeOpacity={deleteMode ? 0.7 : 1}
                  >
                    <View style={styles.imageWrapper}>
                      <Image 
                        source={{ uri: imageUrl }} 
                        style={styles.image} 
                        resizeMode="cover"
                        onLoadStart={() => handleImageLoadStart(imageUrl)}
                        onLoadEnd={() => handleImageLoadEnd(imageUrl)}
                      />
                      {imageLoadingStates[imageUrl] && (
                        <View style={styles.imageLoadingOverlay}>
                          <ActivityIndicator size="small" color={theme.colors.primary} />
                        </View>
                      )}
                    </View>
                    {deleteMode && selectedImageUrls.includes(imageUrl) && (
                      <View style={styles.selectedOverlay} />
                    )}
                    {deleteMode && (
                      <View style={styles.selectionCheckbox}>
                        <View
                          style={[
                            styles.checkbox,
                            {
                              backgroundColor: selectedImageUrls.includes(imageUrl)
                                ? theme.colors.error
                                : 'rgba(255, 255, 255, 0.9)',
                              borderColor: theme.colors.error,
                            },
                          ]}
                        >
                          {selectedImageUrls.includes(imageUrl) && (
                            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                          )}
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Empty State */}
          {existingImages.length === 0 && selectedImages.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="image-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No images available
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                Tap "Add Images" to upload photos
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={[styles.loadingCard, { backgroundColor: theme.colors.card }]}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                {uploading ? 'Uploading images...' : 'Deleting images...'}
              </Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  actionBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  actionButton: {
    flexShrink: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 38,
  },
  helperBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  helperText: {
    fontSize: 14,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  selectionCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  imageGrid: {
    flexDirection: 'column',
    gap: 16,
    marginTop: 4,
  },
  imageCard: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectableImage: {
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  selectedImage: {
    borderWidth: 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  imageBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  imageBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  selectionCheckbox: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(243, 244, 246, 0.5)',
  },
});

export default ImageManagementModal;
