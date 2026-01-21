import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { AuthPlaceholder } from '../../components/shared/AuthPlaceholder';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, theme as themeObj } from '../../contexts/ThemeContext';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { userAPI, walletAPI } from '../../services/api';
import { PRIVACY_POLICY, ABOUT_APP } from '../../constants/legal';
import { useTabBarScroll } from '../../hooks/useTabBarScroll';
import { useIsFocused } from '@react-navigation/native';
import ProfileIcon from '../../components/shared/icons/ProfileIcon';
import LogoutIcon from '../../components/shared/icons/LogoutIcon';
import DraggableModal from '../../components/shared/DraggableModal';
import { useAlert } from '../../components/shared/CustomAlert';

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout, updateUser, setRedirectData } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(user?.walletBalance ?? null);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [isLegalVisible, setIsLegalVisible] = useState(false);
  const [legalTitle, setLegalTitle] = useState('');
  const [legalContent, setLegalContent] = useState('');
  const isFocused = useIsFocused();
  const { onScroll } = useTabBarScroll(navigation, { isRootTab: true });
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isStickyHeaderActive, setIsStickyHeaderActive] = useState(false);

  React.useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      // Threshold should match when the sticky header starts becoming visible/relevant
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

  const handleLogout = async () => {
    showAlert({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      type: 'warning',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              showAlert({
                title: 'Error',
                message: 'Failed to logout',
                type: 'error',
              });
            }
          },
        },
      ],
    });
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

    } finally {
      setIsWalletLoading(false);
    }
  };



  const handleUpdateName = async () => {
    if (!newName.trim()) {
      showAlert({
        title: 'Error',
        message: 'Name cannot be empty',
        type: 'error'
      });
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
      showAlert({
        title: 'Success',
        message: 'Name updated successfully',
        type: 'success'
      });
    } catch (error) {

      showAlert({
        title: 'Error',
        message: 'Failed to update name. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSavingName(false);
    }
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
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
          onPress: () => {},
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
          onPress: () => navigation.navigate('HelpSupport'),
        },
        {
          icon: 'star-outline',
          title: 'Rate App',
          subtitle: 'Rate our app on the store',
          onPress: () => {},
        },
        {
          icon: 'document-text-outline',
          title: 'Terms & Privacy',
          subtitle: 'Read our terms and privacy policy',
          onPress: () => {
            setLegalTitle('Privacy Policy');
            setLegalContent(PRIVACY_POLICY);
            setIsLegalVisible(true);
          },
        },
        {
          icon: 'information-circle-outline',
          title: 'About',
          subtitle: 'App version and information',
          onPress: () => {
            setLegalTitle('About Hyper');
            setLegalContent(ABOUT_APP);
            setIsLegalVisible(true);
          },
        },
      ],
    },
  ];

  const renderMenuItem = (item: any) => (
    <TouchableOpacity
      key={item.title}
      style={[styles.menuItemCard, { shadowColor: '#10B981' }]}
      onPress={item.onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#333333', '#000000']}
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
        onLoginPress={() => {
          navigation.navigate('Auth', { 
            screen: 'PhoneEntry', 
            params: { 
              redirectTo: { 
                name: 'User', 
                params: { 
                  screen: 'MainTabs',
                  params: { screen: 'Profile' } 
                } 
              } 
            } 
          });
        }}
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
          <Text style={[styles.stickyTitle, { color: theme.colors.text }]}>Profile</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.stickyLogout}>
            <LogoutIcon size={20} color={theme.colors.error} />
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
              <LogoutIcon size={24} color={theme.colors.error} />
            </TouchableOpacity>
          </View>

          {/* Profile Badges */}
          <View style={styles.badgeContainer}>
            <TouchableOpacity 
              style={[styles.walletBadge, { backgroundColor: theme.colors.card, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: {width:0, height:4} }]}
              onPress={fetchWalletBalance}
            >
              <Ionicons name="wallet" size={20} color={theme.colors.primary} />
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


      <DraggableModal
        visible={isEditingName}
        onClose={() => setIsEditingName(false)}
        height="auto"
        containerStyle={{ backgroundColor: theme.colors.surface }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalInner}
        >
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
              style={[styles.modalButton, styles.saveButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleUpdateName}
              disabled={isSavingName}
            >
              {isSavingName ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </DraggableModal>

      <DraggableModal
        visible={isLegalVisible}
        onClose={() => setIsLegalVisible(false)}
        height="80%"
        containerStyle={{ backgroundColor: theme.colors.surface }}
      >
        <View style={[styles.modalInner, { flex: 1 }]}>
          <View style={styles.legalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text, textAlign: 'left', marginBottom: 0 }]}>
              {legalTitle}
            </Text>
            <TouchableOpacity onPress={() => setIsLegalVisible(false)}>
              <Ionicons name="close-circle" size={28} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            showsVerticalScrollIndicator={false}
            style={styles.legalScroll}
            contentContainerStyle={styles.legalScrollContent}
          >
            <Text style={[styles.legalText, { color: theme.colors.textSecondary }]}>
              {legalContent}
            </Text>
          </ScrollView>
        </View>
      </DraggableModal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(8),
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
    height: verticalScale(56),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  stickyTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
  stickyLogout: {
    position: 'absolute',
    right: scale(20),
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(16),
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerTitleMain: {
    fontSize: moderateScale(34),
    fontWeight: 'condensedBold',
    fontFamily: themeObj.fonts.bold,
    lineHeight: moderateScale(40),
    letterSpacing: -1,
  },
  headerTitleSub: {
    fontSize: moderateScale(34),
    fontWeight: 'condensedBold',
    fontFamily: themeObj.fonts.bold,
    lineHeight: moderateScale(40),
    letterSpacing: -1,
    opacity: 0.5,
  },
  headerLogoutButton: {
    width: scale(48),
    height: scale(48),
    borderRadius: moderateScale(24),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(10),
    elevation: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(100),
    gap: scale(8),
  },
  walletText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(100),
    gap: scale(6),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  roleText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(120),
  },
  menuSection: {
    marginHorizontal: scale(20),
    marginBottom: verticalScale(32),
  },
  sectionTitle: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    marginBottom: verticalScale(16),
    marginLeft: scale(4),
    letterSpacing: -0.5,
  },
  sectionItems: {
    gap: verticalScale(16),
  },
  menuItemCard: {
    borderRadius: moderateScale(24),
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(16),
    elevation: 8,
    overflow: 'hidden',
  },
  menuItemGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(20),
    height: verticalScale(100), // Fixed height for consistency like Home banners
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    zIndex: 2,
  },
  iconBox: {
    width: scale(48),
    height: scale(48),
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemContent: {
    marginLeft: scale(16),
    flex: 1,
  },
  menuItemText: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    marginBottom: verticalScale(2),
  },
  menuItemSubtitle: {
    fontSize: moderateScale(13),
    fontWeight: '500',
  },
  menuCardDecorativeIcon: {
    position: 'absolute',
    bottom: -verticalScale(15),
    right: -scale(10),
    zIndex: 1,
    transform: [{ rotate: '-15deg' }],
  },
  footer: {
    alignItems: 'center',
    padding: scale(24),
  },
  version: {
    fontSize: moderateScale(12),
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: scale(20),
  },
  modalInner: {
    padding: scale(24),
    paddingTop: verticalScale(8),
  },
  modalTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    marginBottom: verticalScale(16),
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: moderateScale(12),
    padding: scale(16),
    fontSize: moderateScale(16),
    marginBottom: verticalScale(24),
  },
  modalButtons: {
    flexDirection: 'row',
    gap: scale(12),
  },
  modalButton: {
    flex: 1,
    padding: scale(16),
    borderRadius: moderateScale(12),
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
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  legalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  legalScroll: {
    flex: 1,
  },
  legalScrollContent: {
    paddingBottom: verticalScale(60),
  },
  legalText: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(22),
    fontWeight: '500',
  },
});

export default ProfileScreen;
