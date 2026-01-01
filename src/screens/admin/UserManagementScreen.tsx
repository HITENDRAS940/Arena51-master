import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { adminAPI } from '../../services/api';
import { ManagerUser } from '../../types';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';

const UserManagementScreen = () => {
  const { theme } = useTheme();
  const [users, setUsers] = useState<ManagerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchUsers = useCallback(async (pageNum: number, isRefresh: boolean = false) => {
    try {
      if (!isRefresh && pageNum > 0) setLoadingMore(true);
      const response = await adminAPI.getUsers(pageNum, 10);
      const { content, last } = response.data;

      if (isRefresh) {
        setUsers(content);
      } else {
        setUsers(prev => [...prev, ...content]);
      }
      setHasMore(!last);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(0);
  }, [fetchUsers]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(0);
    fetchUsers(0, true);
  };

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchUsers(nextPage);
    }
  };

  const renderUserItem = ({ item }: { item: ManagerUser }) => (
    <View style={[styles.userCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.userHeader}>
        <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary + '15' }]}>
          <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
            {item.name ? item.name.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.colors.text }]}>{item.name || 'Unknown'}</Text>
          <Text style={[styles.userPhone, { color: theme.colors.textSecondary }]}>{item.phone}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.enabled ? theme.colors.success + '15' : theme.colors.error + '15' }]}>
          <Text style={[styles.statusText, { color: item.enabled ? theme.colors.success : theme.colors.error }]}>
            {item.enabled ? 'Active' : 'Disabled'}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.colors.border + '50' }]} />

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Wallet Balance</Text>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>₹{item.wallet.balance.toFixed(2)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total Bookings</Text>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{item.totalBookings}</Text>
        </View>
      </View>

      <View style={styles.bookingSummary}>
        <View style={styles.summaryItem}>
          <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
          <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>{item.confirmedBookings} Confirmed</Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="close-circle" size={14} color={theme.colors.error} />
          <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>{item.cancelledBookings} Cancelled</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenWrapper style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>User Management</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>Manage your registered customers</Text>
      </View>

      {loading && page === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator style={styles.footerLoader} color={theme.colors.primary} /> : null
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="people-outline" size={64} color={theme.colors.border} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No users found</Text>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    marginTop: 4,
    opacity: 0.8,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  userCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
  },
  userPhone: {
    fontSize: 14,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  bookingSummary: {
    flexDirection: 'row',
    gap: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  footerLoader: {
    marginVertical: 20,
  },
});

export default UserManagementScreen;
