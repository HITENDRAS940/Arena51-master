import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

interface ProfileStatsProps {
  walletBalance: number | null;
  isWalletLoading: boolean;
  onRefreshWallet: () => void;
  theme: any;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({
  walletBalance,
  isWalletLoading,
  onRefreshWallet,
  theme,
}) => {
  return (
    <View style={styles.badgeContainer}>
      <TouchableOpacity 
        style={[styles.walletBadge, { backgroundColor: theme.colors.card, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: {width:0, height:4} }]}
        onPress={onRefreshWallet}
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
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    gap: scale(12),
    marginTop: verticalScale(16),
  },
  walletBadge: {
    flex: 1.2,
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
    flex: 1,
  },
  roleBadge: {
    flex: 1,
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
});

export default ProfileStats;
