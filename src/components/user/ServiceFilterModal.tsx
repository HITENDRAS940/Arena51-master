import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import BrandedLoader from '../shared/BrandedLoader';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { serviceAPI } from '../../services/api';
import { Activity } from '../../types';

const { width } = Dimensions.get('window');

interface ServiceFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (params: {
    date: string;
    startTime: string;
    endTime: string;
    city: string;
    activityCode?: string;
    maxDistanceKm?: number;
  }) => void;
  initialCity: string;
  activityCode?: string;
}

const DEFAULT_SLOTS = [
  { id: 0, label: '12:00 AM', value: '00:00' },
  { id: 1, label: '01:00 AM', value: '01:00' },
  { id: 2, label: '02:00 AM', value: '02:00' },
  { id: 3, label: '03:00 AM', value: '03:00' },
  { id: 4, label: '04:00 AM', value: '04:00' },
  { id: 5, label: '05:00 AM', value: '05:00' },
  { id: 6, label: '06:00 AM', value: '06:00' },
  { id: 7, label: '07:00 AM', value: '07:00' },
  { id: 8, label: '08:00 AM', value: '08:00' },
  { id: 9, label: '09:00 AM', value: '09:00' },
  { id: 10, label: '10:00 AM', value: '10:00' },
  { id: 11, label: '11:00 AM', value: '11:00' },
  { id: 12, label: '12:00 PM', value: '12:00' },
  { id: 13, label: '01:00 PM', value: '13:00' },
  { id: 14, label: '02:00 PM', value: '14:00' },
  { id: 15, label: '03:00 PM', value: '15:00' },
  { id: 16, label: '04:00 PM', value: '16:00' },
  { id: 17, label: '05:00 PM', value: '17:00' },
  { id: 18, label: '06:00 PM', value: '18:00' },
  { id: 19, label: '07:00 PM', value: '19:00' },
  { id: 20, label: '08:00 PM', value: '20:00' },
  { id: 21, label: '09:00 PM', value: '21:00' },
  { id: 22, label: '10:00 PM', value: '22:00' },
  { id: 23, label: '11:00 PM', value: '23:00' },
];

const ServiceFilterModal: React.FC<ServiceFilterModalProps> = ({
  visible,
  onClose,
  onApply,
  initialCity,
  activityCode,
}) => {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(activityCode || null);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [isDistanceFilter, setIsDistanceFilter] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoadingActivities(true);
      try {
        const response = await serviceAPI.getActivities();
        setActivities(response.data);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoadingActivities(false);
      }
    };
    fetchActivities();
  }, []);

  useEffect(() => {
    setSelectedActivity(activityCode || null);
  }, [activityCode]);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const handleSlotPress = (time: string) => {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      // Start a new selection
      setRangeStart(time);
      setRangeEnd(null);
    } else {
      // We have rangeStart but no rangeEnd
      if (time > rangeStart) {
        setRangeEnd(time);
      } else {
        // Tapped an earlier time, reset start
        setRangeStart(time);
      }
    }
  };

  const handleApply = () => {
    if (!rangeStart || !rangeEnd) {
      Alert.alert('Selection Required', 'Please select both start and end times for the range.');
      return;
    }

    onApply({
      date: selectedDate.toISOString().split('T')[0],
      startTime: rangeStart,
      endTime: rangeEnd,
      city: initialCity,
      activityCode: selectedActivity || undefined,
      maxDistanceKm: isDistanceFilter ? 50 : undefined,
    });
    onClose();
  };

  const isSlotInPast = (timeStr: string) => {
    const isToday = selectedDate.toDateString() === new Date().toDateString();
    if (!isToday) return false;

    const [hours] = timeStr.split(':').map(Number);
    const currentHour = new Date().getHours();
    return hours <= currentHour;
  };

  const isSlotInRange = (time: string) => {
    if (!rangeStart || !rangeEnd) return false;
    return time > rangeStart && time < rangeEnd;
  };

  const renderDateItem = ({ item }: { item: Date }) => {
    const isSelected = item.toDateString() === selectedDate.toDateString();
    return (
      <TouchableOpacity
        style={[
          styles.dateItem,
          { backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface },
          isSelected ? styles.selectedShadow : styles.unselectedShadow,
        ]}
        onPress={() => {
          setSelectedDate(item);
          setRangeStart(null); // Reset range on date change
          setRangeEnd(null);
        }}
      >
        <Text style={[styles.dateDay, { color: isSelected ? '#FFF' : theme.colors.textSecondary }]}>
          {item.toLocaleDateString('en-US', { weekday: 'short' })}
        </Text>
        <Text style={[styles.dateNum, { color: isSelected ? '#FFF' : theme.colors.text }]}>
          {item.getDate()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Filter Search</Text>
              <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
                {!rangeStart ? 'Select start time' : !rangeEnd ? `Select end time after ${rangeStart}` : 'Perfect! Your range is ready.'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Filter Mode Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Search Mode</Text>
              <View style={styles.filterModeContainer}>
                <TouchableOpacity 
                  onPress={() => setIsDistanceFilter(false)}
                  style={[
                    styles.modeButton, 
                    !isDistanceFilter && { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary }
                  ]}
                >
                  <Ionicons name="time-outline" size={20} color={!isDistanceFilter ? theme.colors.primary : theme.colors.textSecondary} />
                  <Text style={[styles.modeButtonText, { color: !isDistanceFilter ? theme.colors.primary : theme.colors.textSecondary }]}>By Time</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    setIsDistanceFilter(true);
                    onApply({
                      date: new Date().toISOString().split('T')[0],
                      startTime: '00:00',
                      endTime: '23:59',
                      city: initialCity,
                      activityCode: activityCode,
                      maxDistanceKm: 50,
                    });
                    onClose();
                  }}
                  style={[
                    styles.modeButton, 
                    isDistanceFilter && { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary }
                  ]}
                >
                  <Ionicons name="location-outline" size={20} color={isDistanceFilter ? theme.colors.primary : theme.colors.textSecondary} />
                  <Text style={[styles.modeButtonText, { color: isDistanceFilter ? theme.colors.primary : theme.colors.textSecondary }]}>By Distance</Text>
                </TouchableOpacity>
              </View>
              {isDistanceFilter && (
                <Text style={[styles.distanceHint, { color: theme.colors.textSecondary }]}>
                  Showing venues within 50km of your location.
                </Text>
              )}
            </View>

            {/* Content based on Mode */}
            {!isDistanceFilter ? (
              <>
                {!activityCode && (
                  <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Select Activity</Text>
                {loadingActivities ? (
                  <BrandedLoader size={24} color={theme.colors.primary} />
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activityList}>
                    {activities.map((activity) => {
                      // Use activity.code for logic, but ensure it's unique. 
                      // Fallback to name if code is missing to avoid 'all-selected' bug
                      const selectionKey = activity.code || activity.name;
                      const isSelected = selectedActivity === selectionKey;
                      
                      return (
                        <TouchableOpacity
                          key={activity.id}
                          onPress={() => setSelectedActivity(isSelected ? null : selectionKey)}
                          style={[
                            styles.activityBadge,
                            { 
                              backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                              borderColor: isSelected ? theme.colors.primary : theme.colors.border
                            }
                          ]}
                        >
                          <Text style={[
                            styles.activityText,
                            { color: isSelected ? '#FFF' : theme.colors.text }
                          ]}>
                            {activity.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
            )}
            {/* Date Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Pick a Day</Text>
              <FlatList
                data={dates}
                renderItem={renderDateItem}
                keyExtractor={(item) => item.toISOString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dateList}
              />
            </View>

            {/* Time Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Pick Range</Text>
              <View style={styles.slotsGrid}>
                {DEFAULT_SLOTS.map((slot) => {
                  const isStart = rangeStart === slot.value;
                  const isEnd = rangeEnd === slot.value;
                  const inRange = isSlotInRange(slot.value);
                  const isDisabled = isSlotInPast(slot.value);

                  return (
                    <TouchableOpacity
                      key={slot.value}
                      style={[
                        styles.slotItem,
                        {
                          backgroundColor: (isStart || isEnd)
                            ? theme.colors.primary
                            : inRange
                              ? theme.colors.primary + '20'
                              : isDisabled
                                ? theme.colors.background
                                : theme.colors.surface,
                          borderColor: (isStart || isEnd) ? theme.colors.primary : theme.colors.border,
                        },
                        isDisabled && { opacity: 0.3 }
                      ]}
                      onPress={() => !isDisabled && handleSlotPress(slot.value)}
                      disabled={isDisabled}
                    >
                      <Text style={[
                        styles.slotText,
                        { 
                          color: (isStart || isEnd) 
                            ? '#FFF' 
                            : inRange
                              ? theme.colors.primary
                              : isDisabled 
                                ? theme.colors.textSecondary 
                                : theme.colors.text 
                        }
                      ]}>
                        {slot.label}
                      </Text>
                      {(isStart || isEnd) && (
                        <View style={styles.slotIndicator}>
                          <Text style={styles.slotIndicatorText}>{isStart ? 'START' : 'END'}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            </>
            ) : (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Selected Range</Text>
                  <View style={[styles.infoBanner, { backgroundColor: theme.colors.primary + '10' }]}>
                    <Ionicons name="navigate-circle" size={24} color={theme.colors.primary} />
                    <Text style={[styles.infoBannerText, { color: theme.colors.text }]}>
                      We'll find the best venues within <Text style={{fontWeight: '800'}}>50km</Text> in {initialCity}.
                    </Text>
                  </View>
                </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: theme.colors.border + '20' }]}>
            <TouchableOpacity
              style={[styles.applyButton, { opacity: (isDistanceFilter || (rangeStart && rangeEnd)) ? 1 : 0.6 }]}
              onPress={handleApply}
              disabled={!isDistanceFilter && !(rangeStart && rangeEnd)}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primary + 'EE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.applyGradient}
              >
                <Text style={styles.applyButtonText}>Show Venues</Text>
                <Ionicons name="search" size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '75%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  dateList: {
    paddingRight: 24,
  },
  dateItem: {
    width: 64,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dateDay: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dateNum: {
    fontSize: 20,
    fontWeight: '700',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  slotItem: {
    width: (width - 72) / 3,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  slotText: {
    fontSize: 14,
    fontWeight: '700',
  },
  slotIndicator: {
    position: 'absolute',
    bottom: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  slotIndicatorText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFF',
  },
  activityList: {
    paddingRight: 24,
    gap: 12,
  },
  activityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  applyButton: {
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
  },
  applyGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  selectedShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  unselectedShadow: {
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  filterModeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: '#00000005',
    gap: 8,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  distanceHint: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
    opacity: 0.7,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  infoBannerText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});

export default ServiceFilterModal;
