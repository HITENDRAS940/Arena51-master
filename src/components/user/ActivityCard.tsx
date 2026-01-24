import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useTheme, ACTIVITY_THEMES, DEFAULT_THEME } from '../../contexts/ThemeContext';
import { Activity } from '../../types';
import { ActivityIcons } from '../shared/icons/activities';

interface ActivityCardProps {
  item: Activity;
  onPress: (activity: Activity) => void;
}

const ActivityCard = React.memo(({ item, onPress }: ActivityCardProps) => {
  const themeConfig = ACTIVITY_THEMES[item.name] || DEFAULT_THEME;
  const { theme } = useTheme();

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        style={[styles.activityCard, { backgroundColor: theme.colors.card }]}
        onPress={() => onPress(item)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={themeConfig.colors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.activityCardGradient}
        >
          <Text style={styles.activityCardTitle} numberOfLines={1} adjustsFontSizeToFit>
            {item.name}
          </Text>

          <View style={styles.activityIconContainer}>
            {useMemo(() => {
              const IconComponent = ActivityIcons[item.name];
              const iconColor = themeConfig.iconColor || 'rgba(255,255,255,0.25)';
              const fallbackColor = themeConfig.iconColor || 'rgba(255,255,255,0.2)';

              if (IconComponent) {
                return <IconComponent size={100} color={iconColor} />;
              }
              return (
                <Ionicons
                  name={themeConfig.icon as any}
                  size={100}
                  color={fallbackColor}
                />
              );
            }, [item.name, themeConfig])}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
});

export default ActivityCard;

const styles = StyleSheet.create({
  cardWrapper: {
    width: scale(140),
    marginRight: scale(16),
  },
  activityCard: {
    width: '100%',
    height: verticalScale(180),
    borderRadius: moderateScale(24),
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(8),
    backgroundColor: '#FFFFFF',
  },
  activityCardGradient: {
    flex: 1,
    padding: moderateScale(16),
    justifyContent: 'space-between',
  },
  activityCardTitle: {
    color: '#FFFFFF',
    fontSize: moderateScale(18),
    fontWeight: '800',
    zIndex: 2,
  },
  activityIconContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    zIndex: 1,
    transform: [{ rotate: '-10deg' }],
  },
});
