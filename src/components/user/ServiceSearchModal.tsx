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
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
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
              <Ionicons name="location" size={moderateScale(12)} color="rgba(255,255,255,0.6)" />
              <Text style={styles.bannerLocationText} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
            
            <View style={styles.bannerTagsRow}>
              {item.rating && (
                <View style={[styles.bannerTag, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                  <Ionicons name="star" size={moderateScale(10)} color="#FBBF24" />
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
            <Ionicons name="arrow-forward-circle" size={moderateScale(44)} color="#10B981" />
          </View>
        </View>

        {/* Decorative Background Icon */}
        <View style={styles.bannerDecorativeIcon}>
          <Ionicons 
            name="search" 
            size={moderateScale(100)} 
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
      containerStyle={{ backgroundColor: '#121212' }}
    >
      <View style={styles.modalContent}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Search.</Text>
            <Text style={[styles.headerSubtitle, { color: '#9CA3AF' }]}>
              {city || 'Everywhere'}.
            </Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={moderateScale(24)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchInputContainer,
              { 
                borderColor: 'rgba(255,255,255,0.05)', 
                backgroundColor: '#1A1A1A',
              },
            ]}
          >
            <Ionicons name="search" size={moderateScale(20)} color={theme.colors.primary} />
            <TextInput
              style={[styles.searchInput, { color: '#FFFFFF' }]}
              placeholder={
                activityName
                  ? `Find ${activityName.toLowerCase()}...`
                  : 'Search venues...'
              }
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
              returnKeyType="search"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={moderateScale(20)} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {searching ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.infoText, { color: '#9CA3AF', marginTop: verticalScale(16) }]}>
              Finding best venues...
            </Text>
          </View>
        ) : searchQuery.trim().length >= 3 && searchResults.length === 0 ? (
          <View style={styles.centerContainer}>
            <View style={[styles.noResultsIcon, { backgroundColor: '#1A1A1A' }]}>
              <Ionicons name="search-outline" size={moderateScale(48)} color="#9CA3AF" />
            </View>
            <Text style={[styles.noResultsText, { color: '#FFFFFF' }]}>
              No venues found
            </Text>
            <Text style={[styles.noResultsSubtext, { color: '#9CA3AF' }]}>
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
                  <Ionicons name="rocket-outline" size={moderateScale(60)} color="#1A1A1A" />
                  <Text style={[styles.infoText, { color: '#9CA3AF', marginTop: verticalScale(16) }]}>
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
    padding: scale(24),
    paddingTop: verticalScale(8),
  },
  headerTitle: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: moderateScale(14),
    marginTop: verticalScale(4),
  },
  closeButton: {
    padding: scale(8),
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: moderateScale(12),
  },
  searchSection: {
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(20),
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(20),
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(10),
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(16),
    marginLeft: scale(12),
    fontWeight: '600',
  },
  clearButton: {
    padding: scale(4),
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(40),
    paddingBottom: verticalScale(40),
  },
  initialState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: verticalScale(40),
  },
  infoText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    opacity: 0.6,
  },
  noResultsIcon: {
    width: scale(80),
    height: scale(80),
    borderRadius: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  noResultsText: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  noResultsSubtext: {
    fontSize: moderateScale(15),
    textAlign: 'center',
    marginTop: verticalScale(8),
    lineHeight: moderateScale(22),
    opacity: 0.6,
  },
  listContent: {
    padding: scale(20),
    paddingBottom: verticalScale(60),
  },
  searchResultBanner: {
    marginBottom: verticalScale(16),
    borderRadius: moderateScale(28),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(16),
    elevation: 10,
  },
  bannerGradient: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(15),
    minHeight: verticalScale(110),
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
    marginRight: scale(12),
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: moderateScale(18),
    fontWeight: '800',
    marginBottom: verticalScale(4),
    letterSpacing: -0.5,
  },
  bannerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    marginBottom: verticalScale(8),
  },
  bannerLocationText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  bannerTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  bannerTag: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(8),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  bannerTagText: {
    color: '#FFFFFF',
    fontSize: moderateScale(10),
    fontWeight: '800',
  },
  bannerActionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerDecorativeIcon: {
    position: 'absolute',
    bottom: -verticalScale(15),
    right: -scale(10),
    zIndex: 1,
    opacity: 0.8,
  },
});

export default ServiceSearchModal;
