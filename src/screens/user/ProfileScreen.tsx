import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { AuthPlaceholder } from '../../components/shared/AuthPlaceholder';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, theme as themeObj } from '../../contexts/ThemeContext';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { userAPI, walletAPI } from '../../services/api';
import { PRIVACY_POLICY, ABOUT_APP } from '../../constants/legal';
import { useTabBarScroll } from '../../hooks/useTabBarScroll';
import { useAlert } from '../../components/shared/CustomAlert';
import DeleteAccountModal from '../../components/user/profile/DeleteAccountModal';
import LegalModal from '../../components/user/profile/LegalModal';
import ProfileMenuItem from '../../components/user/profile/ProfileMenuItem';

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout, updateUser } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  
  const [walletBalance, setWalletBalance] = useState<number | null>(user?.walletBalance ?? null);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [isLegalVisible, setIsLegalVisible] = useState(false);
  const [legalTitle, setLegalTitle] = useState('');
  const [legalContent, setLegalContent] = useState('');
  
  const { onScroll } = useTabBarScroll(navigation, { isRootTab: true });
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isStickyHeaderActive, setIsStickyHeaderActive] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  React.useEffect(() => {
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
    inputRange: [60, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 60, 100],
    outputRange: [-100, -10, 0],
    extrapolate: 'clamp',
  });

  const mainHeaderTranslateY = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, -120],
    extrapolate: 'clamp',
  });

  const confirmAccountDeletion = async (reason: string, confirmationText: string) => {
    if (!reason) {
      showAlert({ title: 'Error', message: 'Please select a reason for deletion', type: 'error' });
      return;
    }

    if (confirmationText !== 'DELETE MY ACCOUNT') {
      showAlert({ title: 'Error', message: 'Please type "DELETE MY ACCOUNT" exactly to confirm', type: 'error' });
      return;
    }

    setIsDeletingAccount(true);
    try {
      await userAPI.deleteAccount(reason, confirmationText);
      await logout();
      setIsDeleteModalVisible(false);
      showAlert({
        title: 'Account Deleted',
        message: 'Your account has been successfully deleted. We hope to see you again!',
        type: 'success',
      });
    } catch (error) {
      showAlert({
        title: 'Error',
        message: 'Failed to delete account. Please contact support.',
        type: 'error',
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

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
      const balance = response.data.balance;
      setWalletBalance(balance);
      await updateUser({ ...user, walletBalance: balance });
    } catch (error) {
    } finally {
      setIsWalletLoading(false);
    }
  };

  const menuSections = [
    {
      title: 'Payments',
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
    {
      title: 'Account Actions',
      items: [
        {
          icon: 'log-out-outline',
          title: 'Logout',
          subtitle: 'Logout from your account',
          onPress: handleLogout,
          isDanger: true,
        },
        {
          icon: 'trash-outline',
          title: 'Delete Account',
          subtitle: 'Permanently remove your\n account and data',
          onPress: () => setIsDeleteModalVisible(true),
          isDanger: true,
        },
      ],
    }
  ];

  const renderMainHeader = () => (
    <Animated.View style={[
      styles.headerContainer, 
      { 
        position: 'absolute',
        top: Math.max(insets.top + 20, 20),
        left: 0,
        right: 0,
        zIndex: 5,
        transform: [{ translateY: mainHeaderTranslateY }]
      }
    ]}>
      <View style={styles.headerTitleGroup}>
        <Text style={[styles.headerTitleMain, { color: theme.colors.text }]}>
          Your profile.
        </Text>
        <Text style={[styles.headerTitleSub, { color: theme.colors.textSecondary }]}>
          {user?.name || 'Guest'}
        </Text>
      </View>
    </Animated.View>
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
      <Animated.View 
        pointerEvents={isStickyHeaderActive ? 'auto' : 'none'}
        style={[
          styles.stickyHeader, 
          { 
            backgroundColor: theme.colors.background,
            paddingTop: insets.top,
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslate }],
            borderBottomColor: theme.colors.border,
          }
        ]}
      >
        <View style={styles.stickyHeaderContent}>
          <Text style={[styles.stickyTitle, { color: theme.colors.text }]}>PROFILE</Text>
        </View>
      </Animated.View>

      {renderMainHeader()}

      <Animated.ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true, listener: onScroll }
        )}
        scrollEventThrottle={16}
      >
        <View style={{ height: (insets.top + 20) + 120 }} />

        <View style={{ marginTop: 24 }}>
          {menuSections.map((section) => (
            <View key={section.title} style={styles.menuSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{section.title}</Text>
              <View style={styles.sectionItems}>
                {section.items.map((item) => (
                  <ProfileMenuItem key={item.title} item={item} theme={theme} />
                ))}
              </View>
            </View>
          ))}
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.version, { color: theme.colors.textSecondary + '60' }]}>
            Version 1.0.0 (Build 124)
          </Text>
        </View>
      </Animated.ScrollView>

      <DeleteAccountModal 
        isVisible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        isDeleting={isDeletingAccount}
        onConfirm={confirmAccountDeletion}
        theme={theme}
      />

      <LegalModal 
        isVisible={isLegalVisible}
        onClose={() => setIsLegalVisible(false)}
        title={legalTitle}
        content={legalContent}
      />
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
    zIndex: 10,
    borderBottomWidth: 1,
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(12),
  },
  stickyHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: verticalScale(60),
  },
  stickyTitle: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerTitleGroup: {
    flex: 1,
    marginBottom: verticalScale(20),
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
  footer: {
    alignItems: 'center',
    padding: scale(24),
  },
  version: {
    fontSize: moderateScale(12),
  },
});

export default ProfileScreen;
