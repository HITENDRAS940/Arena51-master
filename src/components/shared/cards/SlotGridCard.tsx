/**
 * SlotGridCard Component
 * Reusable card for displaying slot status in a grid layout
 * - Visual slot status (Available, Booked, Disabled)
 * - Color-coded chips
 * - Legend display
 * - Lock icon for booked slots
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { formatTime, getSlotColors } from '../../../utils/slotUtils';

interface SlotData {
  id: number;
  startTime: string;
  endTime: string;
  enabled: boolean;
  isBooked?: boolean;
}

interface SlotGridCardProps {
  slots: SlotData[];
  style?: any;
  showTitle?: boolean;
  title?: string;
  showLegend?: boolean;
  onSlotPress?: (slot: SlotData) => void;
  bookedSlotIds?: number[];
  disabledSlotIds?: number[];
}

const SlotGridCard: React.FC<SlotGridCardProps> = ({
  slots,
  style,
  showTitle = true,
  title,
  showLegend = true,
  onSlotPress,
  bookedSlotIds,
  disabledSlotIds,
}) => {
  const { theme } = useTheme();

  if (slots.length === 0) return null;

  // Calculate counts based on provided arrays or internal props
  let enabledCount = 0;
  
  if (disabledSlotIds) {
     // If disabled IDs provided, enabled count depends on total slots minus disabled ones (assuming 1-24 range or slots length)
     // Actually better to calculate per slot iteration
     enabledCount = slots.filter(s => {
       const timeStr = s.startTime.includes('T') ? s.startTime.split('T')[1] : s.startTime;
       const logicalId = parseInt(timeStr.split(':')[0], 10) + 1;
       return !disabledSlotIds.includes(logicalId);
     }).length;
  } else {
     enabledCount = slots.filter((s) => s.enabled).length;
  }

  const defaultTitle = `Slot Status (${enabledCount} Active)`;

  return (
    <View style={[styles.container, style]}>
      {showTitle && (
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {title || defaultTitle}
        </Text>
      )}

      {showLegend && (
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
              Available
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
              Booked
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#9CA3AF' }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
              Disabled
            </Text>
          </View>
        </View>
      )}

      <View style={styles.grid}>
        {slots.map((slot) => {
          // Calculate Logical ID for status check (12 AM -> 00:00 -> 1 ... 11 PM -> 23:00 -> 24)
          const timeStr = slot.startTime.includes('T') ? slot.startTime.split('T')[1] : slot.startTime;
          const logicalId = parseInt(timeStr.split(':')[0], 10) + 1;

          // Determine status
          let isEnabled = slot.enabled;
          let isBooked = slot.isBooked;

          // Override if arrays are provided
          if (disabledSlotIds) {
            isEnabled = !disabledSlotIds.includes(logicalId);
          }
          
          if (bookedSlotIds) {
            isBooked = bookedSlotIds.includes(logicalId);
          }

          const colors = getSlotColors(isEnabled, isBooked);
          
          return (
            <View
              key={slot.id}
              style={[
                styles.chip,
                {
                  backgroundColor: colors.backgroundColor,
                  borderColor: colors.borderColor,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: colors.textColor }]}>
                {formatTime(slot.startTime)}
              </Text>
              {isBooked && (
                <Ionicons name="lock-closed" size={10} color={colors.textColor} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default SlotGridCard;
