import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
             size={16}
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
    padding: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  availableLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  rightContent: {
    alignItems: 'flex-end',
    gap: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
    justifyContent: 'flex-end',
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default React.memo(TimeSlotCard);
