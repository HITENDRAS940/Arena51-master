import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import BrandedLoader from '../../components/shared/BrandedLoader';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { AuthPlaceholder } from '../../components/shared/AuthPlaceholder';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { formatPhoneForDisplay } from '../../utils/phoneUtils';
import { userAPI, walletAPI } from '../../services/api';
import { useTabBarScroll } from '../../hooks/useTabBarScroll';
import { formatCurrency } from '../../utils/helpers';
import { useIsFocused } from '@react-navigation/native';
import ProfileIcon from '../../components/shared/icons/ProfileIcon';

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout, updateUser } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(user?.walletBalance ?? null);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const isFocused = useIsFocused();
  const { onScroll } = useTabBarScroll(navigation, { isRootTab: true });
  const scrollY = useRef(new Animated.Value(0)).current;

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

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const fetchWalletBalance = async () => {
    if (!user) return;
    setIsWalletLoading(true);
    try {
      const response = await walletAPI.getBalance();
      const balance = response.data.balance; // Assuming response is { balance: 500 }
      setWalletBalance(balance);
      await updateUser({ ...user, walletBalance: balance });
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
    } finally {
      setIsWalletLoading(false);
    }
  };



  const handleUpdateName = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    if (newName.trim() === user?.name) {
      setIsEditingName(false);
      return;
    }

    setIsSavingName(true);
    try {
      await userAPI.setName(newName.trim());
      if (user) {
        await updateUser({ ...user, name: newName.trim() });
      }
      setIsEditingName(false);
      Alert.alert('Success', 'Name updated successfully');
    } catch (error) {
      console.error('Failed to update name:', error);
      Alert.alert('Error', 'Failed to update name. Please try again.');
    } finally {
      setIsSavingName(false);
    }
  };

  const openEditNameModal = () => {
    setNewName(user?.name || '');
    setIsEditingName(true);
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person-outline',
          isProfileIcon: true,
          title: 'Edit Name',
          subtitle: 'Update your name',
          onPress: openEditNameModal,
        },
        {
          icon: 'wallet-outline',
          title: 'Wallet History',
          subtitle: 'View your transaction history',
          onPress: () => navigation.navigate('Wallet' as never),
        },
        {
          icon: 'card-outline',
          title: 'Payment Methods',
          subtitle: 'Manage your payment options',
          onPress: () => console.log('Payment Methods'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: 'notifications-outline',
          title: 'Notifications',
          subtitle: 'Manage notification settings',
          onPress: () => console.log('Notifications'),
        },
        {
          icon: 'language-outline',
          title: 'Language',
          subtitle: 'Choose your preferred language',
          onPress: () => console.log('Language'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle-outline',
          title: 'Help & Support',
          subtitle: 'Get help and contact support',
          onPress: () => console.log('Help & Support'),
        },
        {
          icon: 'star-outline',
          title: 'Rate App',
          subtitle: 'Rate our app on the store',
          onPress: () => console.log('Rate App'),
        },
        {
          icon: 'document-text-outline',
          title: 'Terms & Privacy',
          subtitle: 'Read our terms and privacy policy',
          onPress: () => console.log('Terms & Privacy'),
        },
        {
          icon: 'information-circle-outline',
          title: 'About',
          subtitle: 'App version and information',
          onPress: () => console.log('Version 1.0.0'),
        },
      ],
    },
  ];

  const renderMenuItem = (item: any) => (
    <TouchableOpacity
      key={item.title}
      style={[styles.menuItemCard, { shadowColor: theme.colors.primary }]}
      onPress={item.onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.menuItemGradient}
      >
        <View style={styles.menuItemLeft}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
            {item.isProfileIcon ? (
              <ProfileIcon size={22} color="#FFFFFF" />
            ) : (
              <Ionicons name={item.icon} size={22} color="#FFFFFF" />
            )}
          </View>
          <View style={styles.menuItemContent}>
            <Text style={[styles.menuItemText, { color: '#FFFFFF' }]}>{item.title}</Text>
            <Text style={[styles.menuItemSubtitle, { color: 'rgba(255, 255, 255, 0.7)' }]}>{item.subtitle}</Text>
          </View>
        </View>
        
        {/* Decorative Background Icon */}
        <View style={styles.menuCardDecorativeIcon}>
          {item.isProfileIcon ? (
            <ProfileIcon size={80} color="rgba(255, 255, 255, 0.1)" />
          ) : (
            <Ionicons name={item.icon} size={80} color="rgba(255, 255, 255, 0.1)" />
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderSection = (section: any) => (
    <View key={section.title} style={styles.menuSection}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{section.title}</Text>
      <View style={styles.sectionItems}>
        {section.items.map(renderMenuItem)}
      </View>
    </View>
  );

  if (!user) {
    return (
      <AuthPlaceholder
        titleMain="Your profile."
        titleSub="Your identity."
        description="Login to manage your account, track your wallet balance, and customize your experience."
        onLoginPress={() => navigation.navigate('Auth', { 
          screen: 'PhoneEntry', 
          params: { redirectTo: { name: 'User', params: { screen: 'Profile' } } } 
        })}
      />
    );
  }

  return (
    <ScreenWrapper 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      safeAreaEdges={['bottom', 'left', 'right']}
    >
      
      {/* Dynamic Sticky Top Bar */}
      <Animated.View 
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
          <Text style={[styles.stickyTitle, { color: theme.colors.text }]}>Profile</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.stickyLogout}>
            <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true, listener: onScroll }
        )}
        scrollEventThrottle={16}
      >
        {/* Large Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTitleGroup}>
              <Text style={[styles.headerTitleMain, { color: theme.colors.text }]}>
                Your profile.
              </Text>
              <Text style={[styles.headerTitleSub, { color: theme.colors.textSecondary }]}>
                {user?.name || 'Guest'}
              </Text>
            </View>
            
            <TouchableOpacity onPress={handleLogout} style={[styles.headerLogoutButton, { backgroundColor: theme.colors.card }]}>
              <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
            </TouchableOpacity>
          </View>

          {/* Profile Badges */}
          <View style={styles.badgeContainer}>
            <TouchableOpacity 
              style={[styles.walletBadge, { backgroundColor: theme.colors.card, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: {width:0, height:4} }]}
              onPress={fetchWalletBalance}
            >
              <Ionicons name="wallet" size={20} color={theme.colors.navy} />
              <Text style={[styles.walletText, { color: theme.colors.text }]}>
                 {isWalletLoading ? '...' : `₹${walletBalance ?? 0}`}
              </Text>
              <Ionicons name="refresh-outline" size={14} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.roleBadge, { backgroundColor: theme.colors.card, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: {width:0, height:2} }]}>
              <Ionicons name="shield-checkmark" size={16} color={theme.colors.success} />
              <Text style={[styles.roleText, { color: theme.colors.textSecondary }]}>
                Verified User
              </Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          {menuSections.map(renderSection)}
        </View>
      </Animated.ScrollView>


      <Modal
        visible={isEditingName}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsEditingName(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Edit Name</Text>
            
            <TextInput
              style={[
                styles.input, 
                { 
                  color: theme.colors.text,
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border 
                }
              ]}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter your name"
              placeholderTextColor={theme.colors.textSecondary}
              autoFocus={true}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: theme.colors.border }]}
                onPress={() => setIsEditingName(false)}
                disabled={isSavingName}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: theme.colors.navy }]}
                onPress={handleUpdateName}
                disabled={isSavingName}
              >
                {isSavingName ? (
                  <BrandedLoader size={20} color="#FFFFFF" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
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
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  stickyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  stickyLogout: {
    position: 'absolute',
    right: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitleGroup: {
    flex: 1,
  },
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
  headerLogoutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    gap: 8,
  },
  walletText: {
    fontSize: 16,
    fontWeight: '700',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  menuSection: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    marginLeft: 4,
    letterSpacing: -0.5,
  },
  sectionItems: {
    gap: 16,
  },
  menuItemCard: {
    borderRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  menuItemGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    height: 100, // Fixed height for consistency like Home banners
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    zIndex: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemContent: {
    marginLeft: 16,
    flex: 1,
  },
  menuItemText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  menuCardDecorativeIcon: {
    position: 'absolute',
    bottom: -15,
    right: -10,
    zIndex: 1,
    transform: [{ rotate: '-15deg' }],
  },
  footer: {
    alignItems: 'center',
    padding: 24,
  },
  version: {
    fontSize: 12,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  saveButton: {
    
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
