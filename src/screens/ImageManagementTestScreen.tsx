import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import ImageManagementModal from '../components/shared/modals/ImageManagementModal';

interface ImageAsset {
  uri: string;
  width?: number;
  height?: number;
  base64?: string | null;
}

const ImageManagementTestScreen: React.FC = () => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([
    'https://via.placeholder.com/300',
    'https://via.placeholder.com/300/FF0000',
    'https://via.placeholder.com/300/00FF00',
  ]);

  const handleUpload = async (images: ImageAsset[]) => {
    console.log('Uploading images:', images.length);
    setUploading(true);
    
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add uploaded images to existing
    const newUrls = images.map(img => img.uri);
    setExistingImages(prev => [...prev, ...newUrls]);
    
    setUploading(false);
    console.log('Upload complete');
  };

  const handleDelete = async (imageUrls: string[]) => {
    console.log('Deleting images:', imageUrls.length);
    setDeleting(true);
    
    // Simulate delete
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Remove deleted images
    setExistingImages(prev => prev.filter(url => !imageUrls.includes(url)));
    
    setDeleting(false);
    console.log('Delete complete');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          ImageManagement Modal Test
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Test the visibility and functionality
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Open Image Management Modal</Text>
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={[styles.infoText, { color: theme.colors.text }]}>
          Current images: {existingImages.length}
        </Text>
        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
          Tap the button above to test the modal
        </Text>
      </View>

      <ImageManagementModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onUpload={handleUpload}
        onDelete={handleDelete}
        existingImages={existingImages}
        uploading={uploading}
        deleting={deleting}
        turfName="Test Turf"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
});

export default ImageManagementTestScreen;
