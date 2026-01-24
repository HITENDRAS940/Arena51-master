import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import DraggableModal from '../shared/DraggableModal';

import { useTheme } from '../../contexts/ThemeContext';
import { serviceAPI } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import LocationIcon from '../shared/icons/LocationIcon';

interface CitySelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCity: (city: string) => void;
  onUseCurrentLocation: () => void;
  currentCity?: string;
}

const CitySelectionModal: React.FC<CitySelectionModalProps> = ({
  visible,
  onClose,
  onSelectCity,
  onUseCurrentLocation,
  currentCity,
}) => {
  const { theme } = useTheme();
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      fetchCities();
    }
  }, [visible]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = cities.filter(city => 
        city.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities(cities);
    }
  }, [searchQuery, cities]);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const response = await serviceAPI.getCities();
      const cityList = response.data;
      setCities(cityList);
      setFilteredCities(cityList);
    } catch (error) {
      // Silent error handling for UI
    } finally {
      setLoading(false);
    }
  };

  const renderCityItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.cityItem,
        currentCity === item && { backgroundColor: '#1A1A1A', borderColor: theme.colors.navy || '#1e3a8a' }
      ]}
      onPress={() => {
        onSelectCity(item);
        onClose();
      }}
    >
      <LocationIcon
        size={moderateScale(18)}
        color={currentCity === item ? (theme.colors.navy || '#1e3a8a') : '#9CA3AF'}
      />
      <Text style={[
        styles.cityText, 
        { color: currentCity === item ? (theme.colors.navy || '#1e3a8a') : '#FFFFFF' }
      ]}>
        {item}
      </Text>
      {currentCity === item && (
        <View style={[styles.activeDot, { backgroundColor: theme.colors.navy || '#1e3a8a' }]} />
      )}
    </TouchableOpacity>
  );

  return (
    <DraggableModal
      visible={visible}
      onClose={onClose}
      containerStyle={{ backgroundColor: '#121212' }}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: '#FFFFFF' }]}>Select City</Text>
          <Text style={[styles.subtitle, { color: '#9CA3AF' }]}>Find services in your area</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.05)' }]}>
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.05)' }]}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={[styles.searchInput, { color: '#FFFFFF' }]}
            placeholder="Search for your city..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
 
        {/* Use Current Location Card */}
        <TouchableOpacity
          style={[styles.currentLocationCard, { backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.05)' }]}
          onPress={() => {
            onUseCurrentLocation();
            onClose();
          }}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[theme.colors.navy || '#1e3a8a', (theme.colors.navy || '#1e3a8a') + 'DD']}
            style={styles.locationIconGradient}
          >
            <Ionicons name="navigate" size={18} color="#FFFFFF" />
          </LinearGradient>
          <View style={styles.locationCardContent}>
            <Text style={[styles.locationCardTitle, { color: '#FFFFFF' }]}>Current Location</Text>
            <Text style={[styles.locationCardSubtitle, { color: '#9CA3AF' }]}>Using GPS for better accuracy</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.1)" />
        </TouchableOpacity>

        <Text style={[styles.sectionLabel, { color: '#9CA3AF' }]}>POPULAR CITIES</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredCities}
            renderItem={renderCityItem}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No cities found
                </Text>
              </View>
            }
          />
        )}
      </View>
    </DraggableModal>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(24),
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    marginTop: verticalScale(2),
  },
  closeButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(24),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: moderateScale(16),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    marginBottom: verticalScale(24),
    gap: scale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.03,
    shadowRadius: moderateScale(10),
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(16),
    fontWeight: '500',
  },
  currentLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    marginBottom: verticalScale(30),
    gap: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(12),
    elevation: 3,
  },
  locationIconGradient: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationCardContent: {
    flex: 1,
  },
  locationCardTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    marginBottom: verticalScale(2),
  },
  locationCardSubtitle: {
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: verticalScale(16),
    marginLeft: scale(4),
  },
  listContent: {
    paddingBottom: verticalScale(40),
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(18),
    paddingHorizontal: scale(16),
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(10),
    gap: scale(14),
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cityText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    flex: 1,
  },
  activeDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: moderateScale(40),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: moderateScale(16),
    fontWeight: '500',
  },
});

export default CitySelectionModal;
