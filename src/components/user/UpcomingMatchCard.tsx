import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { format, differenceInSeconds, isAfter } from 'date-fns';
import { UserBooking } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { DiscoveryArrowIcon } from '../shared/icons/activities';
import ClockIcon from '../shared/icons/ClockIcon';
import HyperIcon from '../shared/icons/HyperIcon';

interface UpcomingMatchCardProps {
  booking: UserBooking | null;
  onPress: () => void;
}

const UpcomingMatchCard: React.FC<UpcomingMatchCardProps> = ({ booking, onPress }) => {
  const { theme } = useTheme();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!booking || !booking.date || !booking.slots?.[0]?.startTime) return;

      // Parse booking date and start time
      // Assuming booking.date is "YYYY-MM-DD" and startTime is "HH:mm"
      const [year, month, day] = booking.date.split('-').map(Number);
      const [hours, minutes] = booking.slots[0].startTime.split(':').map(Number);
      const bookingDateTime = new Date(year, month - 1, day, hours, minutes);

      const now = new Date();
      if (isAfter(now, bookingDateTime)) {
        setTimeLeft('Started');
        return;
      }

      const totalSeconds = differenceInSeconds(bookingDateTime, now);
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;

      if (h > 24) {
        setTimeLeft(`${Math.floor(h / 24)}d ${h % 24}h remaining`);
      } else if (h > 0) {
        setTimeLeft(`${h}h ${m}m ${s}s`);
      } else {
        setTimeLeft(`${m}m ${s}s`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [booking]);

  if (!booking) {
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[theme.colors.primary, '#4338CA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <View style={styles.badge}>
              <HyperIcon size={20} color="#FFFFFF" />
              <Text style={styles.badgeText}>GET HYPER</Text>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.info}>
              <Text style={styles.turfName}>Stay in the Hyper zone!</Text>
              <Text style={styles.subText}>
                Fuel your passion. Book your next match now.
              </Text>
            </View>
            
            <View style={styles.detailsButton}>
              <DiscoveryArrowIcon size={40} color="#FFFFFF" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[theme.colors.primary, '#4338CA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.badge}>
            <ClockIcon size={14} color="#FFFFFF" />
            <Text style={styles.badgeText}>UPCOMING MATCH</Text>
          </View>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{timeLeft}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.info}>
            <Text style={styles.turfName} numberOfLines={1}>{booking.serviceName}</Text>
            <Text style={styles.subText}>
              {format(new Date(booking.date), 'EEE, do MMM')} • {booking.slots?.[0]?.startTime}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.detailsButton} onPress={onPress}>
            <DiscoveryArrowIcon color='#FFFFFF'/>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: scale(20),
    borderRadius: moderateScale(24),
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: verticalScale(6) },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(15),
    marginBottom: verticalScale(20),
  },
  gradient: {
    padding: moderateScale(20),
    height: verticalScale(120),
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(80),
    gap: scale(4),
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: moderateScale(10),
    fontWeight: '900',
    letterSpacing: 1,
  },
  timerContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(10),
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: moderateScale(12),
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    zIndex: 2,
  },
  info: {
    flex: 1,
  },
  turfName: {
    color: '#FFFFFF',
    fontSize: moderateScale(20),
    fontWeight: '800',
    marginBottom: verticalScale(2),
  },
  subText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  detailsButton: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorativeIconContainer: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    zIndex: 1,
    transform: [{ rotate: '-15deg' }],
  },
});

export default UpcomingMatchCard;
