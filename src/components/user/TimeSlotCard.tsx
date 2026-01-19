import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Ionicons } from '@expo/vector-icons';
import { EphemeralSlot } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { formatToTwelveHour } from '../../utils/dateUtils';

interface TimeSlotCardProps {
  slot: EphemeralSlot;
  isSelected: boolean;
  onPress: () => void;
}

const TimeSlotCard: React.FC<TimeSlotCardProps> = ({ 
  slot, 
  isSelected, 
  onPress 
}) => {
  const { theme } = useTheme();
  
  const getCardStyle = () => {
    if (!slot.available) {
      return [styles.card, { 
        backgroundColor: theme.colors.surface + '80',
        borderColor: theme.colors.border + '30' 
      }];
    }
    if (isSelected) {
      return [styles.card, { 
        borderColor: theme.colors.navy,
        backgroundColor: theme.colors.navy + '10' 
      }];
    }
    return [styles.card, { 
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border 
    }];
  };

  const getTextColor = () => {
    if (!slot.available) return theme.colors.gray;
    if (isSelected) return theme.colors.navy;
    return theme.colors.text;
  };

  return (
    <TouchableOpacity
      style={getCardStyle()}
      onPress={onPress}
      disabled={!slot.available}
      activeOpacity={slot.available ? 0.7 : 1}
    >
      <View style={styles.leftContent}>
        <View style={[
          styles.iconCircle, 
          { 
            backgroundColor: isSelected ? theme.colors.navy : (!slot.available ? theme.colors.border : theme.colors.navy + '15')
          }
        ]}>
           <Ionicons
             name={isSelected ? 'checkmark' : 'time'}
             size={moderateScale(16)}
             color={isSelected ? '#FFFFFF' : (!slot.available ? theme.colors.gray : theme.colors.navy)}
           />
        </View>
        <View>
           <Text style={[styles.timeLabel, { color: theme.colors.textSecondary }]}>Time Slot</Text>
           <Text style={[styles.timeValue, { color: getTextColor() }]}>
             {formatToTwelveHour(slot.startTime)} - {formatToTwelveHour(slot.endTime)}
           </Text>
           {slot.available && slot.availableCount !== undefined && slot.availableCount > 0 && (
             <Text style={[
               styles.availableLabel, 
               { color: slot.availableCount <= 2 ? theme.colors.error : theme.colors.textSecondary }
             ]}>
               {slot.availableCount === 1 ? 'Only 1 spot left!' : `${slot.availableCount} spots left`}
             </Text>
           )}
        </View>
      </View>
      
      <View style={styles.rightContent}>
        <View style={styles.priceContainer}>
          <Text style={[styles.priceValue, { color: getTextColor() }]}>
            ₹{slot.displayPrice}
          </Text>
        </View>
        {!slot.available && (
          <View style={[
            styles.statusBadge, 
            { backgroundColor: theme.colors.error + '15' }
          ]}>
            <Text style={[styles.statusText, { color: theme.colors.error }]}>
              UNAVAILABLE
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: scale(14),
    borderRadius: moderateScale(20),
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(14),
    flex: 1,
  },
  iconCircle: {
    width: scale(36),
    height: scale(36),
    borderRadius: moderateScale(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: moderateScale(10),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: verticalScale(1),
  },
  timeValue: {
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  availableLabel: {
    fontSize: moderateScale(10),
    fontWeight: '500',
    marginTop: verticalScale(2),
  },
  rightContent: {
    alignItems: 'flex-end',
    gap: scale(4),
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: moderateScale(18),
    fontWeight: '800',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(4),
    marginTop: verticalScale(2),
    justifyContent: 'flex-end',
  },
  tag: {
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(4),
  },
  tagText: {
    fontSize: moderateScale(8),
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(6),
  },
  statusText: {
    fontSize: moderateScale(9),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default React.memo(TimeSlotCard);
