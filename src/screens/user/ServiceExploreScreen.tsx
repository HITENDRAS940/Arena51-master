import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import ReAnimated from 'react-native-reanimated';

import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Service } from '../../types';
import api, { serviceAPI } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import { ServiceSkeletonCard, SkeletonList } from '../../components/shared/Skeletons';
import EmptyState from '../../components/shared/EmptyState';
import ServiceCard from '../../components/user/ServiceCard';
import ServiceFilterModal from '../../components/user/ServiceFilterModal';
import { useLocation } from '../../hooks/useLocation';
import ServiceSearchModal from '../../components/user/ServiceSearchModal';

const ServiceExploreScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Params for category filtering
  const { activityId, activityName, activityCode, city: paramCity } = route.params || {};

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [-10, 0],
    extrapolate: 'clamp',
  });
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [activeFilterParams, setActiveFilterParams] = useState<{
    date: string; 
    startTime: string; 
    endTime: string; 
    city: string; 
    activityCode?: string 
  } | null>(null);
  
  const { location, manualCity, setCityManually, detectAndSetToCurrentCity, loading: locationLoading } = useLocation();
  const [isStickyHeaderActive, setIsStickyHeaderActive] = useState(false);

  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      if (value > 60 && !isStickyHeaderActive) {
        setIsStickyHeaderActive(true);
      } else if (value <= 60 && isStickyHeaderActive) {
        setIsStickyHeaderActive(false);
      }
    });
    return () => scrollY.removeListener(listenerId);
  }, [isStickyHeaderActive]);

  const effectiveCity = paramCity || manualCity || location?.city;

  const fetchServices = async (city: string, pageNo: number, isLoadMore: boolean = false) => {
    if (!isLoadMore) setLoading(true);
    else setLoadingMore(true);

    try {
      let response;
      if (activityId) {
        // Category specific fetch
        response = await api.service.getServicesByActivity(activityId, city, pageNo, 6);
      } else {
        // General city fetch
        response = await serviceAPI.getServicesByCity(city, pageNo, 6);
      }

      const newServices = response.data.content || [];
      const isLast = response.data.last;

      if (isLoadMore) {
        setServices(prev => [...prev, ...newServices]);
      } else {
        setServices(newServices);
      }
      
      setHasMore(!isLast);
      setPage(pageNo);
    } catch (error) {
      console.error('Error fetching services:', error);
      if (!isLoadMore) {
        setServices([]);
        Alert.alert('Error', 'Failed to fetch services. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Hide tab bar on focus
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: 'none' }
      });
      
      if (isFilterActive || locationLoading) return;

      if (effectiveCity) {
         if(services.length === 0) {
             fetchServices(effectiveCity, 0, false);
         }
      } else if (!locationLoading) {
         setLoading(false);
      }

      // Restore tab bar visibility when leaving (optional, usually handled by navigator, 
      // but good for safety if navigator logic is glitching)
      return () => {
        // Only restore if we are going back to Home
        // navigation.getParent()?.setOptions({ tabBarStyle: undefined });
      };
    }, [effectiveCity, locationLoading, activityId, navigation])
  );

  // Handle category change if screen stays mounted but params change
  useEffect(() => {
    if (effectiveCity) {
      fetchServices(effectiveCity, 0, false);
    }
  }, [activityId]);

  const handleLoadMore = () => {
    if (!hasMore || loadingMore || loading || isFilterActive || !effectiveCity) return;
    fetchServices(effectiveCity, page + 1, true); 
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (isFilterActive && activeFilterParams) {
      serviceAPI.searchByAvailability(activeFilterParams)
        .then(response => {
          setServices(response.data as any); 
        })
        .finally(() => {
          setRefreshing(false);
        });
    } else {
      if (effectiveCity) {
        fetchServices(effectiveCity, 0, false);
      } else {
        setRefreshing(false);
      }
    }
  };
  
  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      );
    }
    
    if (!hasMore && services.length > 0 && !loading && !isFilterActive) {
      return (
        <View style={styles.endListFooter}>
          <View style={styles.footerDivider} />
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            You've reached the end! {'\n'}
            More top-tier services are being onboarded soon.
          </Text>
        </View>
      );
    }
    
    return <View style={{ height: 20 }} />;
  };

  const handleFilterApply = async (params: { 
    date: string; 
    startTime: string; 
    endTime: string; 
    city: string; 
    activityCode?: string 
  }) => {
    setLoading(true);
    setHasMore(false); 
    
    try {
      const response = await serviceAPI.searchByAvailability(params);
      setServices(response.data as any);
      setIsFilterActive(true);
      setActiveFilterParams(params);
    } catch (error) {
      console.error('Error searching by availability:', error);
      Alert.alert('Error', 'Failed to search services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setIsFilterActive(false);
    setActiveFilterParams(null);
    if (effectiveCity) {
       fetchServices(effectiveCity, 0, false);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTopRow}>
        <View style={styles.headerLeftSection}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.headerBackIconGroup}
          >
            <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleGroup}>
            <Text style={[styles.headerTitleMain, { color: theme.colors.text }]}>
              {activityName ? `${activityName}.` : 'Explore.'}
            </Text>
            <Text style={[styles.headerTitleSub, { color: theme.colors.textSecondary }]}>
              {effectiveCity || 'Locating'}.
            </Text>
          </View>
        </View>
        
        <View style={styles.headerRightActionsGroup}>
          <View style={styles.headerActionButtons}>
            <TouchableOpacity onPress={() => setShowSearchModal(true)} style={styles.headerActionIconGroup}>
              <Ionicons name="search" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.headerActionIconGroup}>
              <Ionicons 
                name={isFilterActive ? "funnel" : "funnel-outline"} 
                size={24} 
                color={isFilterActive ? theme.colors.warning : theme.colors.text} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Active Filter Badge - Below everything if active */}
      {isFilterActive && (
        <View style={styles.activeFilterBadgeContainer}>
          <View style={[styles.filterBadge, { backgroundColor: theme.colors.warning + '15', borderColor: theme.colors.warning + '40' }]}>
            <Ionicons name="funnel" size={12} color={theme.colors.warning} />
            <Text style={[styles.filterBadgeText, { color: theme.colors.warning }]}>
              Filters Applied
            </Text>
            <TouchableOpacity 
              onPress={clearFilters}
              style={styles.clearFilterIconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={16} color={theme.colors.warning} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <ScreenWrapper 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      safeAreaEdges={['left', 'right', 'bottom']}
    >
      
        
      {/* Sticky Top Bar */}
      <Animated.View 
        pointerEvents={isStickyHeaderActive ? 'auto' : 'none'}
        style={[
          styles.stickyHeader, 
          { 
            paddingTop: insets.top,
            backgroundColor: theme.colors.background,
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslate }],
            borderBottomColor: theme.colors.border + '20',
          }
        ]}
      >
        <View style={styles.stickyHeaderContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
             <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.stickyTitle, { color: theme.colors.text }]}>
            {activityName || 'Explore'}
          </Text>
          <View style={styles.stickyActions}>
            <TouchableOpacity onPress={() => setShowSearchModal(true)}>
               <Ionicons name="search" size={22} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowFilterModal(true)}>
              <Ionicons 
                  name={isFilterActive ? "funnel" : "funnel-outline"} 
                  size={22} 
                  color={isFilterActive ? theme.colors.warning : theme.colors.text} 
                />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
        
      {loading ? (
        <View style={{ paddingTop: insets.top + 20 }}>
          {renderHeader()}
          <SkeletonList
              count={4}
              renderItem={() => <ServiceSkeletonCard />}
              contentContainerStyle={[styles.list, { paddingHorizontal: 20 }]}
          />
        </View>
      ) : (
        <Animated.FlatList<Service>
          data={services}
          renderItem={({ item }: { item: Service }) => (
            <View style={styles.cardWrapper}>
              <ServiceCard
                service={item}
                onPress={() => navigation.navigate('ServiceDetail', { 
                  serviceId: item.id,
                  initialService: item 
                })}
              />
            </View>
          )}
          keyExtractor={(item: Service) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={[
            styles.list, 
            { paddingTop: insets.top + 20 },
            services.length === 0 && { flexGrow: 1 }
          ]}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              progressViewOffset={insets.top + 20}
            />
          }
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 }}>
              <EmptyState
                icon={isFilterActive ? "search-outline" : activityId ? "search-outline" : "football-outline"} 
                title={isFilterActive ? "No Matching Venues" : activityId ? "No Services Found" : "No Available Services"}
                description={isFilterActive ? "Try adjusting your filters or checking a different date." : activityId ? `No ${activityName} services found in ${effectiveCity}.` : "Check back later."}
              />
              {isFilterActive && (
                <TouchableOpacity 
                  onPress={clearFilters}
                  style={[styles.clearFilterButton, { backgroundColor: theme.colors.primary + '15' }]}
                >
                  <Text style={[styles.clearFilterText, { color: theme.colors.primary }]}>Clear All Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      <ServiceSearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        city={effectiveCity || ''}
        activity={activityName?.toUpperCase()}
        onResultPress={(service) => navigation.navigate('ServiceDetail', { 
          serviceId: service.id,
          initialService: service
        })}
      />

      <ServiceFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleFilterApply}
        initialCity={effectiveCity || ''}
        activityCode={activityCode}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingBottom: 40 },
  cardWrapper: {
    paddingHorizontal: 20,
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
    paddingTop: 8,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLeftSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginLeft: -16,
  },
  headerBackIconGroup: { 
    padding: 8,
    marginTop: 2, // Align with large text
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerRightActionsGroup: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  headerActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: -16,
  },
  headerActionIconGroup: { padding: 8 },
  headerTitleMain: {
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -1,
  },
  headerTitleSub: {
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -1,
    opacity: 0.5,
  },
  clearFilterButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  clearFilterText: {
    fontWeight: '700',
    fontSize: 14,
  },
  activeFilterBadgeContainer: {
    marginTop: 12,
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 5,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  clearFilterIconButton: {
    marginLeft: 2,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: 1,
  },
  stickyHeaderContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    left: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  stickyActions: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  endListFooter: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  footerDivider: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginBottom: 20,
  },
  footerText: {
     textAlign: 'center',
  },
});

export default ServiceExploreScreen;
