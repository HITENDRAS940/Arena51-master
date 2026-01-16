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
  ActivityIndicator,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { AuthPlaceholder } from '../../components/shared/AuthPlaceholder';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { formatPhoneForDisplay } from '../../utils/phoneUtils';
import { userAPI, walletAPI } from '../../services/api';
import { useTabBarScroll } from '../../hooks/useTabBarScroll';
import { formatCurrency } from '../../utils/helpers';
import { useIsFocused } from '@react-navigation/native';
import ProfileIcon from '../../components/shared/icons/ProfileIcon';
import LogoutIcon from '../../components/shared/icons/LogoutIcon';
import DraggableModal from '../../components/shared/DraggableModal';
import { useAlert } from '../../components/shared/CustomAlert';

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout, updateUser, setRedirectData } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
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

  const { showAlert } = useAlert();

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
          onPress: () => {},
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
          onPress: () => {},
        },
        {
          icon: 'language-outline',
          title: 'Language',
          subtitle: 'Choose your preferred language',
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
          onPress: () => {},
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
            setLegalContent(`This privacy policy applies to the HYPER app and relevant infrastructure (hereby referred to as "Application") for mobile devices that was created by Hitendra Singh Shaktawat and Manan Arora (hereby referred to as "Service Provider") as a Commercial service. This service is intended for use "AS IS".

Information Collection and Use
The Application collects information when you download and use it. This information may include information such as:
• Your device's Internet Protocol address (e.g. IP address)
• The pages of the Application that you visit, the time and date of your visit, the time spent on those pages
• The time spent on the Application
• The operating system you use on your mobile device

The Application collects your device's location, which helps the Service Provider determine your approximate geographical location and make use of in below ways:
• Geolocation Services: The Service Provider utilizes location data to provide features such as personalized content, relevant recommendations, and location-based services.
• Analytics and Improvements: Aggregated and anonymized location data helps the Service Provider to analyze user behavior, identify trends, and improve the overall performance and functionality of the Application.
• Third-Party Services: Periodically, the Service Provider may transmit anonymized location data to external services. These services assist them in enhancing the Application and optimizing their offerings.

The Service Provider may use the information you provided to contact you from time to time to provide you with important information, required notices and marketing promotions.

For a better experience, while using the Application, the Service Provider may require you to provide us with certain personally identifiable information, including but not limited to Name, Email, Contact number, age, gender. The information that the Service Provider request will be retained by them and used as described in this privacy policy.

Third Party Access
Only aggregated, anonymized data is periodically transmitted to external relevant services to aid the Service Provider in improving the Application and their service. The Service Provider may share your information with third parties in the ways that are described in this privacy statement.

The Service Provider may disclose User Provided and Automatically Collected Information:
• as required by law, such as to comply with a subpoena, or similar legal process;
• when they believe in good faith that disclosure is necessary to protect their rights, protect your safety or the safety of others, investigate fraud, or respond to a government request;
• with their trusted services providers who work on their behalf, do not have an independent use of the information we disclose to them, and have agreed to adhere to the rules set forth in this privacy statement.

Use of Artificial Intelligence
The Application uses Artificial Intelligence (AI) technologies to enhance user experience and provide certain features. The AI components may process user data to deliver personalized content, recommendations, or automated functionalities. All AI processing is performed in accordance with this privacy policy and applicable laws. If you have questions about the AI features or data processing, please contact the Service Provider.

Opt-Out Rights
You can stop all collection of information by the Application easily by uninstalling it. You may use the standard uninstall processes as may be available as part of your mobile device or via the mobile application marketplace or network.

Data Retention Policy
The Service Provider will retain User Provided data for as long as you use the Application and for a reasonable time thereafter. If you'd like them to delete User Provided Data that you have provided via the Application, please contact them at manan.arora0412@gmail.com and they will respond in a reasonable time.

Children
The Service Provider does not use the Application to knowingly solicit data from or market to children under the age of 13.
The Service Provider does not knowingly collect personally identifiable information from children. The Service Provider encourages all children to never submit any personally identifiable information through the Application and/or Services. The Service Provider encourage parents and legal guardians to monitor their children's Internet usage and to help enforce this Policy by instructing their children never to provide personally identifiable information through the Application and/or Services without their permission. If you have reason to believe that a child has provided personally identifiable information to the Service Provider through the Application and/or Services, please contact the Service Provider (manan.arora0412@gmail.com) so that they will be able to take the necessary actions. You must also be at least 16 years of age to consent to the processing of your personally identifiable information in your country (in some countries we may allow your parent or guardian to do so on your behalf).

Security
The Service Provider is concerned about safeguarding the confidentiality of your information. The Service Provider provides physical, electronic, and procedural safeguards to protect information the Service Provider processes and maintains.

Changes
This Privacy Policy may be updated from time to time for any reason. The Service Provider will notify you of any changes to the Privacy Policy by updating this page with the new Privacy Policy. You are advised to consult this Privacy Policy regularly for any changes, as continued use is deemed approval of all changes.

This privacy policy is effective as of 2026-01-03

Your Consent
By using the Application, you are consenting to the processing of your information as set forth in this Privacy Policy now and as amended by us.

Contact Us
If you have any questions regarding privacy while using the Application, or have questions about the practices, please contact the Service Provider via email at manan.arora0412@gmail.com or via contact number +91 7678457527.`);
            setIsLegalVisible(true);
          },
        },
        {
          icon: 'information-circle-outline',
          title: 'About',
          subtitle: 'App version and information',
          onPress: () => {},
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
        colors={['#10B981', '#059669']}
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
              style={[styles.modalButton, styles.saveButton, { backgroundColor: theme.colors.navy }]}
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
        <View style={styles.modalInner}>
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
  modalInner: {
    padding: 24,
    paddingTop: 8,
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
  legalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
