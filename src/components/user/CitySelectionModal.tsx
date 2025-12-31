import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { serviceAPI } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';

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
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCityItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.cityItem,
        currentCity === item && { backgroundColor: theme.colors.surface, borderColor: theme.colors.navy }
      ]}
      onPress={() => {
        onSelectCity(item);
        onClose();
      }}
    >
      <Ionicons 
        name="location-sharp" 
        size={20} 
        color={currentCity === item ? theme.colors.navy : theme.colors.gray} 
      />
      <Text style={[
        styles.cityText, 
        { color: currentCity === item ? theme.colors.navy : theme.colors.text }
      ]}>
        {item}
      </Text>
      {currentCity === item && (
        <View style={[styles.activeDot, { backgroundColor: theme.colors.navy }]} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.colors.text }]}>Select City</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Find services in your area</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Ionicons name="close" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search for your city..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Use Current Location Card */}
          <TouchableOpacity
            style={[styles.currentLocationCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => {
              onUseCurrentLocation();
              onClose();
            }}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[theme.colors.navy, theme.colors.navy + 'DD']}
              style={styles.locationIconGradient}
            >
              <Ionicons name="navigate" size={18} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.locationCardContent}>
              <Text style={[styles.locationCardTitle, { color: theme.colors.text }]}>Current Location</Text>
              <Text style={[styles.locationCardSubtitle, { color: theme.colors.textSecondary }]}>Using GPS for better accuracy</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.border} />
          </TouchableOpacity>

          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>POPULAR CITIES</Text>

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
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  currentLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 30,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  locationIconGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationCardContent: {
    flex: 1,
  },
  locationCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  locationCardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 16,
    marginLeft: 4,
  },
  listContent: {
    paddingBottom: 40,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 10,
    gap: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cityText: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CitySelectionModal;
