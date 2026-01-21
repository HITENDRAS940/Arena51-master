import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Animated,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAlert } from '../../components/shared/CustomAlert';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';


import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackIcon from '../../components/shared/icons/BackIcon';
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
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Params for category filtering
  const { activityId, activityName, activityCode, city: paramCity } = route.params || {};

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
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
    activityCode?: string;
    maxDistanceKm?: number;
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

      if (!isLoadMore) {
        setServices([]);
        showAlert({
          title: 'Error',
          message: 'Failed to fetch services. Please try again.',
          type: 'error'
        });
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

      return () => {
        // Optional cleanup
      };
    }, [effectiveCity, locationLoading, activityId, navigation])
  );

  // Handle category change if screen stays mounted but params change
  useEffect(() => {
    if (effectiveCity) {
      fetchServices(effectiveCity, 0, false);
    }
  }, [activityId]);

  const renderServiceItem = useCallback(({ item, index }: { item: any; index: number }) => {
    if (loading) {
      return (
        <View style={[styles.cardWrapper, { marginBottom: verticalScale(16) }]}>
          <ServiceSkeletonCard />
        </View>
      );
    }
    return (
      <Reanimated.View 
        entering={FadeInDown.delay(index * 100).duration(600).springify()}
        style={styles.cardWrapper}
      >
        <ServiceCard
          service={item}
          onPress={() => navigation.navigate('ServiceDetail', { 
            serviceId: item.id,
            initialService: item 
          })}
        />
      </Reanimated.View>
    );
  }, [loading, navigation]);

  const handleLoadMore = () => {
    if (!hasMore || loadingMore || loading || isFilterActive || !effectiveCity) return;
    fetchServices(effectiveCity, page + 1, true); 
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (isFilterActive && activeFilterParams) {
      const fetchFiltered = async () => {
        try {
          let response;
          if (activeFilterParams.maxDistanceKm !== undefined && location) {
            response = await api.location.filterServicesByDistance({
              userLatitude: location.latitude,
              userLongitude: location.longitude,
              maxDistanceKm: activeFilterParams.maxDistanceKm,
              minDistanceKm: 0,
              city: activeFilterParams.city
            });
            // Map the specific response format [ { id, name, location, availability, images: [] } ]
            const mappedServices = (response.data as any[]).map(s => ({
              ...s,
              image: s.images && s.images.length > 0 ? s.images[0] : (s.image || ''),
              rating: s.rating || 0 // Explicitly fallback if not in response
            }));
            setServices(mappedServices);
          } else {
            response = await serviceAPI.searchByAvailability(activeFilterParams);
            setServices(response.data as any);
          }
        } catch (error) {

        } finally {
          setRefreshing(false);
        }
      };
      fetchFiltered();
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
    
    return <View style={{ height: verticalScale(20) }} />;
  };

  const handleFilterApply = async (params: { 
    date: string; 
    startTime: string; 
    endTime: string; 
    city: string; 
    activityCode?: string;
    maxDistanceKm?: number;
  }) => {
    setLoading(true);
    setHasMore(false); 
    
    try {
      let response;
      if (params.maxDistanceKm !== undefined && location) {
        // Distance based filtering - New POST flow
        response = await api.location.filterServicesByDistance({
          userLatitude: location.latitude,
          userLongitude: location.longitude,
          maxDistanceKm: params.maxDistanceKm,
          minDistanceKm: 0,
          city: params.city
        });
        
        // Map response: [ { id, name, location, availability, images: [] } ]
        const mappedServices = (response.data as any[]).map(s => ({
          ...s,
          image: s.images && s.images.length > 0 ? s.images[0] : (s.image || ''),
          rating: s.rating || 0
        }));
        setServices(mappedServices);
      } else {
        // Time/Availability based filtering
        response = await serviceAPI.searchByAvailability(params);
        setServices(response.data as any);
      }
      
      setIsFilterActive(true);
      setActiveFilterParams(params);
    } catch (error) {

      showAlert({
        title: 'Error',
        message: 'Failed to search services. Please try again.',
        type: 'error'
      });
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

  const mainHeaderTranslateY = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, -150],
    extrapolate: 'clamp',
  });

  const renderMainHeader = () => (
    <Animated.View style={[
      styles.headerContainer,
      { 
        position: 'absolute',
        top: insets.top + verticalScale(20),
        left: 0,
        right: 0,
        zIndex: 5,
        transform: [{ translateY: mainHeaderTranslateY }]
      }
    ]}>
      <View style={styles.headerTopRow}>
        <View style={styles.headerLeftSection}>
          {navigation.canGoBack() && (
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.headerBackIconGroup}
            >
              <BackIcon width={28} height={28} fill={theme.colors.text} />
            </TouchableOpacity>
          )}
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
              <Ionicons name="search" size={30} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.headerActionIconGroup}>
              <Ionicons 
                name={isFilterActive ? "funnel" : "funnel-outline"} 
                size={30} 
                color={isFilterActive ? theme.colors.warning : theme.colors.text} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
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
    </Animated.View>
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
            borderBottomColor: theme.colors.border + '20',
          }
        ]}
      >
        <View style={styles.stickyHeaderContent}>
          {navigation.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
               <BackIcon width={24} height={24} fill={theme.colors.text} />
            </TouchableOpacity>
          )}
          <Text style={[styles.stickyTitle, { color: theme.colors.text }]}>
            {activityName ? `${activityName}.` : 'Explore.'}
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
        
      {renderMainHeader()}
        
      <Animated.FlatList<any>
        data={loading ? [1, 2, 3, 4] : services}
        renderItem={renderServiceItem}
        keyExtractor={(item: any, index: number) => 
          loading ? `skeleton-${index}` : item.id.toString()
        }
        ListHeaderComponent={
          <View style={{ 
            height: isFilterActive ? verticalScale(150) : verticalScale(110),
          }} />
        }
        contentContainerStyle={[
          styles.list, 
          { paddingTop: insets.top + verticalScale(20) },
          !loading && services.length === 0 && { flexGrow: 1 }
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
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressViewOffset={insets.top + (isFilterActive ? 150 : 110) + 20}
          />
        }
        ListEmptyComponent={
          !loading ? (
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
          ) : null
        }
      />

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
  list: { paddingBottom: verticalScale(40) },
  cardWrapper: {
    paddingHorizontal: scale(20),
  },
  headerContainer: {
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(8),
    paddingTop: verticalScale(8),
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
    marginLeft: -scale(16),
  },
  headerBackIconGroup: { 
    padding: scale(8),
    marginTop: verticalScale(2), // Align with large text
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerRightActionsGroup: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: verticalScale(8),
  },
  headerActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    marginRight: -scale(16),
  },
  headerActionIconGroup: { padding: scale(8) },
  headerTitleMain: {
    fontSize: moderateScale(34),
    fontWeight: '800',
    lineHeight: moderateScale(40),
    letterSpacing: -1,
  },
  headerTitleSub: {
    fontSize: moderateScale(34),
    fontWeight: '800',
    lineHeight: moderateScale(40),
    letterSpacing: -1,
    opacity: 0.5,
  },
  clearFilterButton: {
    marginTop: verticalScale(16),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(12),
  },
  clearFilterText: {
    fontWeight: '700',
    fontSize: moderateScale(14),
  },
  activeFilterBadgeContainer: {
    marginTop: verticalScale(12),
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    gap: scale(5),
  },
  filterBadgeText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  clearFilterIconButton: {
    marginLeft: scale(2),
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
    height: verticalScale(56),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  backButton: {
    position: 'absolute',
    left: scale(10),
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
  stickyActions: {
    position: 'absolute',
    right: scale(20),
    flexDirection: 'row',
    gap: scale(16),
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: verticalScale(20),
    alignItems: 'center',
  },
  endListFooter: {
    paddingVertical: verticalScale(32),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  footerDivider: {
    width: scale(60),
    height: verticalScale(4),
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: moderateScale(2),
    marginBottom: verticalScale(20),
  },
  footerText: {
     textAlign: 'center',
  },
});

export default ServiceExploreScreen;
