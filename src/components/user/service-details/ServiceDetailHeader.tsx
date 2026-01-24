import React from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import BackIcon from '../../shared/icons/BackIcon';
import { useTheme } from '../../../contexts/ThemeContext';

interface ServiceDetailHeaderProps {
  isVisible: boolean;
  opacity: Animated.AnimatedInterpolation<number>;
  translateY: Animated.AnimatedInterpolation<number>;
  title: string;
  onBackPress: () => void;
  insetsTop: number;
}

const ServiceDetailHeader: React.FC<ServiceDetailHeaderProps> = ({
  isVisible,
  opacity,
  translateY,
  title,
  onBackPress,
  insetsTop,
}) => {
  const { theme } = useTheme();

  return (
    <Animated.View
      pointerEvents={isVisible ? 'auto' : 'none'}
      style={[
        styles.stickyHeader,
        {
          paddingTop: insetsTop,
          backgroundColor: theme.colors.background,
          opacity: opacity,
          transform: [{ translateY: translateY }],
          borderBottomColor: theme.colors.border + '20',
        },
      ]}
    >
      <View style={styles.stickyHeaderContent}>
        <TouchableOpacity onPress={onBackPress} style={styles.stickyBackButton}>
          <BackIcon width={24} height={24} fill={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.stickyTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(10),
    elevation: 5,
  },
  stickyHeaderContent: {
    height: verticalScale(56),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  stickyBackButton: {
    position: 'absolute',
    left: scale(10),
    width: moderateScale(40),
    height: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyTitle: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    maxWidth: '70%',
    letterSpacing: -0.2,
  },
});

export default ServiceDetailHeader;
