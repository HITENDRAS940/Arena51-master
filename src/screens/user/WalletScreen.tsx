import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Animated,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { walletAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { AuthPlaceholder } from '../../components/shared/AuthPlaceholder';
import { WalletTransaction } from '../../types';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

const WalletScreen = () => {
  const { theme } = useTheme();
  const { user, setRedirectData } = useAuth();
  const navigation = useNavigation<any>();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  // fetchData defined below

  const fetchData = async () => {
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getTransactions(),
      ]);
      setBalance(balanceRes.data.balance);
      setTransactions(transactionsRes.data.content);
    } catch (error) {
      // Silent error handling for UI
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const onRefresh = () => {
    if (!user) return;
    setRefreshing(true);
    fetchData();
  };

  if (!user) {
    return (
      <AuthPlaceholder
        titleMain="Your wallet."
        titleSub="Your money."
        description="Login to view your balance, transaction history, and manage your payments."
        onLoginPress={() => {
          setRedirectData({ name: 'Wallet' });
          navigation.navigate('Auth', { screen: 'PhoneEntry' });
        }}
      />
    );
  }

  const renderTransactionItem = ({ item }: { item: WalletTransaction }) => {
    const isCredit = item.type === 'CREDIT' || item.type === 'REFUND';
    return (
      <View style={[styles.transactionItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={[styles.iconContainer, { backgroundColor: isCredit ? '#E8F5E9' : '#FFEBEE' }]}>
          <Ionicons 
            name={isCredit ? "arrow-down-outline" : "arrow-up-outline"} 
            size={24} 
            color={isCredit ? '#4CAF50' : '#F44336'} 
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionTitle, { color: theme.colors.text }]}>
            {item.description || (isCredit ? 'Wallet Top-up' : 'Service Booking')}
          </Text>
          <Text style={[styles.transactionDate, { color: theme.colors.textSecondary }]}>
            {format(new Date(item.createdAt), 'MMM dd, yyyy • HH:mm')}
          </Text>
        </View>
        <Text style={[styles.transactionAmount, { color: isCredit ? '#4CAF50' : '#F44336' }]}>
          {isCredit ? '+' : '-'}₹{item.amount}
        </Text>
      </View>
    );
  };

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [280, 200],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary || theme.colors.primary]}
          style={StyleSheet.absoluteFill}
        />
        
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceAmount}>₹{balance.toLocaleString()}</Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.content}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 0 }]}>Transactions.</Text>
        </View>
        
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={transactions}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false } // height interpolation requires false for non-native transforms usually, but layout is fine. 
                                         // Actually headerHeight uses scrollY, so we should try to keep it native if possible.
                                         // But height cannot be animated with native driver.
            )}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                progressViewOffset={250}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={64} color={theme.colors.border} />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No transactions yet.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    zIndex: 10,
  },
  headerContent: {
    paddingHorizontal: 24,
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceContainer: {
    marginTop: 10,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  content: {
    flex: 1,
    marginTop: -30,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  listContent: {
    paddingBottom: 40,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    fontWeight: '500',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WalletScreen;
