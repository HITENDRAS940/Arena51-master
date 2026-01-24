import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import ProfileIcon from '../../shared/icons/ProfileIcon';

interface ProfileMenuItemProps {
  item: {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    isProfileIcon?: boolean;
    isDanger?: boolean;
  };
  theme: any;
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ item, theme }) => {
  return (
    <TouchableOpacity
      key={item.title}
      style={[styles.menuItemCard, { shadowColor: '#10B981' }]}
      onPress={item.onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#1e31a1ff', '#0d1432ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.menuItemGradient}
      >
        <View style={styles.menuItemLeft}>
          <View style={[styles.iconBox, { backgroundColor: item.isDanger ? theme.colors.error + '20' : 'rgba(255, 255, 255, 0.2)' }]}>
            {item.isProfileIcon ? (
              <ProfileIcon size={22} color={item.isDanger ? theme.colors.error : "#FFFFFF"} />
            ) : (
              <Ionicons name={item.icon as any} size={22} color={item.isDanger ? theme.colors.error : "#FFFFFF"} />
            )}
          </View>
          <View style={styles.menuItemContent}>
            <Text style={[styles.menuItemText, { color: item.isDanger ? theme.colors.error : '#FFFFFF' }]}>{item.title}</Text>
            <Text style={[styles.menuItemSubtitle, { color: item.isDanger ? theme.colors.error + '80' : 'rgba(255, 255, 255, 0.7)' }]}>{item.subtitle}</Text>
          </View>
        </View>
        
        {/* Decorative Background Icon */}
        <View style={styles.menuCardDecorativeIcon}>
          {item.isProfileIcon ? (
            <ProfileIcon size={80} color="rgba(255, 255, 255, 0.1)" />
          ) : (
            <Ionicons name={item.icon as any} size={80} color="rgba(255, 255, 255, 0.1)" />
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  menuItemCard: {
    borderRadius: moderateScale(22),
    overflow: 'hidden',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  menuItemGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(20),
    height: verticalScale(75),
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
});

export default ProfileMenuItem;
