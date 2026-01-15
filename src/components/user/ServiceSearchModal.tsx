import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../contexts/ThemeContext';
import { serviceAPI } from '../../services/api';
import { Service } from '../../types';
import DraggableModal from '../shared/DraggableModal';

interface ServiceSearchModalProps {
  visible: boolean;
  onClose: () => void;
  city: string;
  activity?: string;
  activityName?: string;
  onResultPress: (service: Service) => void;
}

const ServiceSearchModal: React.FC<ServiceSearchModalProps> = ({
  visible,
  onClose,
  city,
  activity,
  activityName,
  onResultPress,
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Service[]>([]);
  const [searching, setSearching] = useState(false);

  const performSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 3) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    try {
      const response = await serviceAPI.searchServices(
        query.trim(),
        city || '',
        activity?.toUpperCase()
      );
      setSearchResults(response.data);
    } catch (error) {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [city, activity]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 3) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  const renderSearchResult = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={styles.searchResultBanner}
      onPress={() => {
        handleClose();
        onResultPress(item);
      }}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#1F2937', '#111827']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bannerGradient}
      >
        <View style={styles.bannerMainContent}>
          <View style={styles.bannerTextSection}>
            <Text style={styles.bannerTitle} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.bannerLocationRow}>
              <Ionicons name="location" size={12} color="rgba(255,255,255,0.6)" />
              <Text style={styles.bannerLocationText} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
            
            <View style={styles.bannerTagsRow}>
              {item.rating && (
                <View style={[styles.bannerTag, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                  <Ionicons name="star" size={10} color="#FBBF24" />
                  <Text style={styles.bannerTagText}>{item.rating.toFixed(1)}</Text>
                </View>
              )}
              {item.price && (
                <View style={[styles.bannerTag, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                  <Text style={[styles.bannerTagText, { color: '#10B981' }]}>₹{item.price}/hr</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.bannerActionContainer}>
            <Ionicons name="arrow-forward-circle" size={44} color="#10B981" />
          </View>
        </View>

        {/* Decorative Background Icon */}
        <View style={styles.bannerDecorativeIcon}>
          <Ionicons 
            name="search" 
            size={100} 
            color="rgba(255, 255, 255, 0.05)" 
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <DraggableModal
      visible={visible}
      onClose={handleClose}
      height="85%"
      containerStyle={{ backgroundColor: theme.colors.background }}
    >
      <View style={styles.modalContent}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Search.</Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              {city || 'Everywhere'}.
            </Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchInputContainer,
              { 
                borderColor: theme.colors.border + '40', 
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            <Ionicons name="search" size={20} color={theme.colors.primary} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder={
                activityName
                  ? `Find ${activityName.toLowerCase()}...`
                  : 'Search venues...'
              }
              placeholderTextColor={theme.colors.textSecondary + '80'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
              returnKeyType="search"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={theme.colors.gray} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {searching ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary, marginTop: 16 }]}>
              Finding best venues...
            </Text>
          </View>
        ) : searchQuery.trim().length >= 3 && searchResults.length === 0 ? (
          <View style={styles.centerContainer}>
            <View style={[styles.noResultsIcon, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="search-outline" size={48} color={theme.colors.gray} />
            </View>
            <Text style={[styles.noResultsText, { color: theme.colors.text }]}>
              No venues found
            </Text>
            <Text style={[styles.noResultsSubtext, { color: theme.colors.textSecondary }]}>
              Try searching with a different name or location
            </Text>
          </View>
        ) : (
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              !searchQuery.trim() ? (
                <View style={styles.initialState}>
                  <Ionicons name="rocket-outline" size={60} color={theme.colors.border} />
                  <Text style={[styles.infoText, { color: theme.colors.textSecondary, marginTop: 16 }]}>
                    Type to explore venues
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </DraggableModal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '600',
  },
  clearButton: {
    padding: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  initialState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.6,
  },
  noResultsIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  noResultsText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  noResultsSubtext: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    opacity: 0.6,
  },
  listContent: {
    padding: 20,
    paddingBottom: 60,
  },
  searchResultBanner: {
    marginBottom: 16,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  bannerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    minHeight: 110,
    justifyContent: 'center',
    position: 'relative',
  },
  bannerMainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  bannerTextSection: {
    flex: 1,
    marginRight: 12,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  bannerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  bannerLocationText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '600',
  },
  bannerTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bannerTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  bannerActionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerDecorativeIcon: {
    position: 'absolute',
    bottom: -15,
    right: -10,
    zIndex: 1,
    opacity: 0.8,
  },
});

export default ServiceSearchModal;
