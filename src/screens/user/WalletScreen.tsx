import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Animated,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { walletAPI } from '../../services/api';
import { WalletTransaction } from '../../types';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';

const { width } = Dimensions.get('window');

const WalletScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isStickyHeaderActive, setIsStickyHeaderActive] = useState(false);
  
  const scrollY = useRef(new Animated.Value(0)).current;

  const fetchData = useCallback(async () => {
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getTransactions(),
      ]);
      setBalance(balanceRes.data.balance || 0);
      setTransactions(transactionsRes.data.content || []);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTopRow}>
        <View style={styles.headerLeftSection}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.headerBackIconGroup}
          >
            <Ionicons name="chevron-back" size={32} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitleMain, { color: theme.colors.text }]}>
            Your money.
          </Text>
        </View>
      </View>
      <Text style={[styles.headerTitleSub, { color: theme.colors.textSecondary }]}>
        Your balance.
      </Text>

      <View style={styles.balanceCardContainer}>
        <LinearGradient
          colors={['#1F2937', '#111827']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceAmount}>₹{balance.toLocaleString()}</Text>
          </View>
        </LinearGradient>
      </View>
      
      <View style={styles.transactionSectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Transactions</Text>
      </View>
    </View>
  );

  const renderStickyHeader = () => (
    <Animated.View 
      pointerEvents={isStickyHeaderActive ? 'auto' : 'none'}
      style={[
        styles.stickyHeader, 
        { 
          paddingTop: insets.top,
          backgroundColor: theme.colors.background,
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslate }],
        }
      ]}
    >
      <View style={[styles.stickyHeaderContent, { borderBottomWidth: 1, borderBottomColor: theme.colors.border + '20' }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.stickyBackButton}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.stickyTitle, { color: theme.colors.text }]}>Wallet History</Text>
        <View style={{ width: 44 }} />
      </View>
    </Animated.View>
  );

  const renderTransactionItem = ({ item }: { item: WalletTransaction }) => {
    const isCredit = item.type === 'CREDIT';
    
    return (
      <View style={[styles.transactionCard, { backgroundColor: theme.colors.card }]}>
        <View style={[
          styles.transactionIcon, 
          { backgroundColor: isCredit ? theme.colors.success + '15' : theme.colors.error + '15' }
        ]}>
          <Ionicons 
            name={isCredit ? "arrow-down" : "arrow-up"} 
            size={20} 
            color={isCredit ? theme.colors.success : theme.colors.error} 
          />
        </View>
        
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionDesc, { color: theme.colors.text }]} numberOfLines={1}>
            {item.description}
          </Text>
          <Text style={[styles.transactionDate, { color: theme.colors.textSecondary }]}>
            {new Date(item.createdAt).toLocaleDateString('en-US', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            })}
          </Text>
        </View>
        
        <View style={styles.transactionRight}>
          <Text style={[
            styles.transactionAmount, 
            { color: isCredit ? theme.colors.success : theme.colors.text }
          ]}>
            {isCredit ? '+' : '-'}₹{item.amount}
          </Text>
          <Text style={[
              styles.statusText, 
              { color: item.status === 'COMPLETED' ? theme.colors.success : theme.colors.warning }
          ]}>
              {item.status ?? 'PENDING'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      safeAreaEdges={['bottom', 'left', 'right']}
    >
      {renderStickyHeader()}
      
      <Animated.FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
            styles.listContent,
            { paddingTop: insets.top + 20 }
        ]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color={theme.colors.border} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Transactions</Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                Your transaction history will appear here.
              </Text>
            </View>
          ) : (
            <View style={{ marginTop: 40 }}>
                <ActivityIndicator color={theme.colors.primary} />
            </View>
          )
        }
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
            progressViewOffset={insets.top + 20}
          />
        }
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  headerLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: -8,
  },
  headerBackIconGroup: {
    padding: 8,
  },
  headerTitleMain: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  headerTitleSub: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
    opacity: 0.5,
    marginTop: -4,
    marginLeft: 36,
  },
  balanceCardContainer: {
    marginBottom: 32,
  },
  balanceCard: {
    padding: 24,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  balanceAmount: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '800',
  },
  transactionSectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  stickyHeaderContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  stickyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  stickyBackButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 40,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 8,
  },
  transactionDesc: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});

export default WalletScreen;
