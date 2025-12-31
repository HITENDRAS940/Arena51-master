import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../services/api';
import { Service } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Shared Components
import LoadingState from '../../components/shared/LoadingState';
import EmptyState from '../../components/shared/EmptyState';
import Button from '../../components/shared/Button';
import AdminServiceCard from '../../components/admin/AdminServiceCard';


const ServiceManagementScreen = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  
  // State
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      if (!user?.id) {
        setServices([]);
        return;
      }
      const response = await adminAPI.getAdminServices(user.id);
      const serviceList = response.data || response || [];
      setServices(Array.isArray(serviceList) ? serviceList : []);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch services');
      setServices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  // Create Handler


  const handleServicePress = (service: Service) => {
    navigation.navigate('AdminServiceDetail', { service });
  };

  return (
    <ScreenWrapper 
      style={styles.container}
      safeAreaEdges={['bottom', 'left', 'right']}
    >
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: insets.top + 10 }]}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Service Management</Text>
              <Text style={styles.headerSubtitle}>Manage your listings</Text>
            </View>

          </View>
        </LinearGradient>
      </View>

      {/* Service List */}
      {loading ? (
        <LoadingState />
      ) : services.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="golf"
            title="No Services Yet"
            description="Create your first service to get started"
          />

        </View>
      ) : (
        <FlatList
          data={services}
          renderItem={({ item }) => (
            <AdminServiceCard 
              service={item} 
              onPress={() => handleServicePress(item)}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modals */}

    </ScreenWrapper>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    overflow: 'hidden',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    backgroundColor: theme.colors.surface,
  },
  headerGradient: {
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },

  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

});

export default ServiceManagementScreen;
