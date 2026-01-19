import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, theme as themeObj } from '../../../contexts/ThemeContext';
import { EphemeralSlot } from '../../../types';
import { format, addDays, isSameDay, isToday, isTomorrow } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import TimeSlotCard from '../../user/TimeSlotCard';
import { SkeletonList, TimeSlotSkeleton } from '../../shared/Skeletons';
import { ActivityIcons } from '../../shared/icons/activities';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

interface ServiceBookingSectionProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  availableSlots: EphemeralSlot[];
  selectedSlotKeys: string[];
  onSlotToggle: (slot: EphemeralSlot) => void;
  slotsLoading: boolean;
  onClose: () => void;
  resources: any[]; // Changed to any[] to support Activities or Resources
  selectedResource: any | null;
  onResourceSelect: (item: any) => void;
  resourcesLoading: boolean;
}

const ServiceBookingSection: React.FC<ServiceBookingSectionProps> = ({
  selectedDate,
  onDateSelect,
  availableSlots,
  selectedSlotKeys,
  onSlotToggle,
  slotsLoading,
  onClose,
  resources,
  selectedResource,
  onResourceSelect,
  resourcesLoading,
}) => {
  const { theme } = useTheme();

  // Generate next 14 days
  const dates = React.useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));
  }, []);

  const renderHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionTitleBar, { backgroundColor: theme.colors.primary }]} />
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {resources.length > 0 && (
        <View style={styles.section}>
          {renderHeader('Select Activity')}
          {resourcesLoading ? (
            <ActivityIndicator size="small" color={theme.colors.navy} />
          ) : (
            <View style={styles.resourceList}>
              {resources.map((activity) => {
                const isSelected = selectedResource?.id === activity.id;
                
                // Get activity icon based on name
                let IconComponent = ActivityIcons['Football']; // Default fallback
                const activityName = activity.name || '';
                
                // Try to find a match in ActivityIcons keys
                const matchingKey = Object.keys(ActivityIcons).find(key => 
                  activityName.toLowerCase().includes(key.toLowerCase()) ||
                  key.toLowerCase().includes(activityName.toLowerCase())
                );
                
                if (matchingKey) {
                  IconComponent = ActivityIcons[matchingKey];
                }

                return (
                  <TouchableOpacity
                    key={activity.id}
                    style={[
                      styles.resourceChip,
                      { 
                        backgroundColor: isSelected ? theme.colors.navy : theme.colors.surface,
                        borderColor: isSelected ? theme.colors.navy : theme.colors.border
                      },
                      isSelected && styles.selectedShadow
                    ]}
                    onPress={() => onResourceSelect(activity as any)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.chipContent}>
                      <View style={[
                        styles.chipIconContainer
                      ]}>
                        <IconComponent 
                          size={moderateScale(40)} 
                          color={isSelected ? '#FFFFFF' : theme.colors.primary} 
                        />
                      </View>
                      <Text 
                        style={[
                          styles.resourceChipText,
                          { color: isSelected ? '#FFFFFF' : theme.colors.text }
                        ]}
                        numberOfLines={1}
                      >
                        {activity.name}
                      </Text>
                      
                      {isSelected && (
                        <View style={styles.selectedIndicator}>
                          <Ionicons name="checkmark-circle" size={moderateScale(16)} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.bookingHeaderRow}>
          {renderHeader('Select Date')}
          <TouchableOpacity 
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={moderateScale(20)} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateList}
        >
          {dates.map((date, index) => {
            const isSelected = isSameDay(date, selectedDate);
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateChip,
                  { 
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  }
                ]}
                onPress={() => onDateSelect(date)}
                activeOpacity={0.9}
              >
                <LinearGradient
                   colors={isSelected ? [theme.colors.primary, theme.colors.secondary || theme.colors.primary] : [theme.colors.card, theme.colors.card]}
                   start={{ x: 0, y: 0 }}
                   end={{ x: 1, y: 1 }}
                   style={styles.dateChipGradient}
                >
                  <Text 
                    style={[
                      styles.dateChipDay, 
                      { color: isSelected ? '#FFFFFF' : theme.colors.textSecondary }
                    ]}
                  >
                    {isToday(date) ? 'TODAY' : isTomorrow(date) ? 'TOMR' : format(date, 'EEE')}
                  </Text>
                  <Text 
                    style={[
                      styles.dateChipNumber, 
                      { color: isSelected ? '#FFFFFF' : theme.colors.text }
                    ]}
                  >
                    {format(date, 'd')}
                  </Text>
                  
                  <View style={styles.dateIconContainer}>
                    <Ionicons 
                      name="calendar" 
                      size={moderateScale(48)} 
                      color={isSelected ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.03)"} 
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.section}>
        {renderHeader('Choose Slot')}
        
        {slotsLoading ? (
          <SkeletonList 
             count={5} 
             renderItem={() => <TimeSlotSkeleton />} 
             contentContainerStyle={styles.slotsGrid}
          />
        ) : availableSlots.length === 0 ? (
          <View style={[styles.emptySlots, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.border + '50' }]}>
               <Ionicons name="calendar-outline" size={moderateScale(32)} color={theme.colors.gray} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Slots Available</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
               Try selecting another date for your visit
            </Text>
          </View>
        ) : (
          <View style={styles.slotsGrid}>
            {availableSlots.map((slot) => {
              const isSelected = slot.slotKey ? selectedSlotKeys.includes(slot.slotKey) : false;
              return (
                <TimeSlotCard
                  key={slot.slotGroupId}
                  slot={slot}
                  isSelected={isSelected}
                  onPress={() => onSlotToggle(slot)}
                />
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: verticalScale(8),
  },
  section: {
    marginBottom: verticalScale(30),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  iconContainer: {
    width: scale(36),
    height: scale(36),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: moderateScale(17),
    fontWeight: '800',
    letterSpacing: -0.4,
    textTransform: 'uppercase',
    opacity: 0.9,
  },
  sectionTitleBar: {
    width: moderateScale(4),
    height: moderateScale(16),
    borderRadius: moderateScale(2),
  },
  bookingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  closeButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  dateList: {
    paddingVertical: verticalScale(8),
    gap: scale(12),
  },
  dateChip: {
    width: scale(65),
    height: verticalScale(85),
    borderRadius: moderateScale(20),
    overflow: 'hidden',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(8),
    elevation: 2,
  },
  dateChipGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  dateChipDay: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: verticalScale(4),
    zIndex: 2,
  },
  dateChipNumber: {
    fontSize: moderateScale(22),
    fontWeight: '900',
    zIndex: 2,
    letterSpacing: -0.5,
  },
  dateIconContainer: {
    position: 'absolute',
    bottom: -verticalScale(15),
    right: -scale(15),
    zIndex: 1,
    transform: [{ rotate: '-15deg' }],
  },
  loadingContainer: {
    padding: scale(50),
    alignItems: 'center',
    gap: scale(16),
  },
  loadingText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  emptySlots: {
    alignItems: 'center',
    padding: scale(30),
    borderRadius: moderateScale(24),
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  emptyIconContainer: {
    width: scale(64),
    height: scale(64),
    borderRadius: moderateScale(32),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  emptyTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    marginBottom: verticalScale(8),
  },
  emptySubtitle: {
    fontSize: moderateScale(14),
    textAlign: 'center',
    lineHeight: moderateScale(20),
  },
  slotsGrid: {
    paddingVertical: verticalScale(12),
    gap: scale(4),
  },
  resourceList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(10),
    paddingTop: verticalScale(8),
  },
  resourceChip: {
    flex: 1,
    minWidth: '30%',
    height: verticalScale(100),
    borderRadius: moderateScale(20),
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.04,
    shadowRadius: moderateScale(8),
    elevation: 2,
    padding: scale(2),
    overflow: 'hidden',
  },
  chipContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(4),
  },
  chipIconContainer: {
    width: scale(50),
    height: scale(50),
    borderRadius: moderateScale(18),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  resourceChipText: {
    fontSize: moderateScale(11),
    fontWeight: '800',
    letterSpacing: -0.2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  selectedShadow: {
    shadowColor: themeObj.colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(15),
    elevation: 4,
  },
  selectedIndicator: {
    position: 'absolute',
    top: verticalScale(4),
    right: scale(4),
  },
  resourceDescription: {
    fontSize: moderateScale(13),
    marginTop: verticalScale(8),
    fontStyle: 'italic',
    lineHeight: moderateScale(18),
  },
});

export default React.memo(ServiceBookingSection);
