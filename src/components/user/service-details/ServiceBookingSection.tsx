import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { EphemeralSlot } from '../../../types';
import { format, addDays, isSameDay, isToday, isTomorrow } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import TimeSlotCard from '../../user/TimeSlotCard';
import { SkeletonList, TimeSlotSkeleton } from '../../shared/Skeletons';
import { ActivityIcons } from '../../shared/icons/activities';
import { moderateScale } from 'react-native-size-matters';

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
                          color={isSelected ? '#FFFFFF' : theme.colors.navy} 
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
                          <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
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
            <Ionicons name="close" size={20} color={theme.colors.text} />
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
                    borderColor: isSelected ? theme.colors.navy : theme.colors.border,
                  }
                ]}
                onPress={() => onDateSelect(date)}
                activeOpacity={0.9}
              >
                <LinearGradient
                   colors={isSelected ? [theme.colors.navy, theme.colors.secondary || theme.colors.navy] : [theme.colors.card, theme.colors.card]}
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
                      size={48} 
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
               <Ionicons name="calendar-outline" size={32} color={theme.colors.gray} />
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
    paddingTop: 8,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  bookingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  dateList: {
    paddingVertical: 8,
    gap: 12,
  },
  dateChip: {
    width: 65,
    height: 85,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
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
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
    zIndex: 2,
  },
  dateChipNumber: {
    fontSize: 20,
    fontWeight: '800',
    zIndex: 2,
  },
  dateIconContainer: {
    position: 'absolute',
    bottom: -15,
    right: -15,
    zIndex: 1,
    transform: [{ rotate: '-15deg' }],
  },
  loadingContainer: {
    padding: 50,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptySlots: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  slotsGrid: {
    paddingVertical: 12,
    gap: 4,
  },
  resourceList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 8,
  },
  resourceChip: {
    width: (Dimensions.get('window').width - 58) / 3,
    height: 110,
    borderRadius: 24,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    padding: 4,
    overflow: 'hidden',
  },
  chipContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  chipIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  resourceChipText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  selectedShadow: {
    shadowColor: '#1E1B4B',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 4,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  resourceDescription: {
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});

export default ServiceBookingSection;
