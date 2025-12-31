/**
 * CustomCalendar - Theme-integrated calendar component for turf booking
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Alert } from 'react-native';

interface CustomCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  visible: boolean;
  onClose: () => void;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  selectedDate,
  onDateSelect,
  visible,
  onClose
}) => {
  const { theme } = useTheme();

  const formatDateString = (date: Date): string => {
    // Use local timezone formatting to avoid UTC offset issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Debug effect to track selectedDate changes
  useEffect(() => {
    console.log('📅 CustomCalendar selectedDate changed:', {
      selectedDate: selectedDate.toDateString(),
      selectedDateString: formatDateString(selectedDate),
      visible
    });
  }, [selectedDate, visible]);

  if (!visible) return null;

  // Get current date and ensure it's at start of day to properly disable past dates
  const today = new Date();
  const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const selectedDateString = formatDateString(selectedDate);
  const minDateString = formatDateString(currentDate);

  console.log('📅 Calendar Display Debug:', {
    selectedDate: selectedDate.toDateString(),
    selectedDateString,
    currentDate: currentDate.toDateString(),
    minDateString,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const handleDayPress = (day: DateData) => {
    const selectedDate = new Date(day.year, day.month - 1, day.day);
    
    console.log('🖱️ Calendar Day Press:', {
      dayData: day,
      constructedDate: selectedDate.toDateString(),
      dateString: formatDateString(selectedDate)
    });
    
    // Additional check to prevent selecting past dates
    const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    console.log('🗓️ Date selection attempt:', {
      selected: selectedDateOnly.toDateString(),
      today: todayOnly.toDateString(),
      isPast: selectedDateOnly < todayOnly,
      isToday: selectedDateOnly.getTime() === todayOnly.getTime(),
      isFuture: selectedDateOnly > todayOnly
    });
    
    if (selectedDateOnly < todayOnly) {
      console.log('❌ Business Rule Violation: Attempted to select past date');
      console.log('❌ Selected:', selectedDateOnly.toDateString());
      console.log('❌ Current:', todayOnly.toDateString());
      
      // Show user-friendly feedback
      Alert.alert('Invalid Date', 'Please select today or a future date');
      
      return; // Don't allow past date selection
    }
    
    console.log('✅ Valid date selected:', selectedDateOnly.toDateString());
    onDateSelect(selectedDate);
    onClose();
  };

  const calendarTheme = {
    backgroundColor: theme.colors.background,
    calendarBackground: theme.colors.surface,
    textSectionTitleColor: theme.colors.text,
    textSectionTitleDisabledColor: theme.colors.gray,
    selectedDayBackgroundColor: theme.colors.navy,
    selectedDayTextColor: '#FFFFFF',
    todayTextColor: theme.colors.navy,
    dayTextColor: theme.colors.text,
    textDisabledColor: theme.colors.gray,
    dotColor: theme.colors.navy,
    selectedDotColor: '#FFFFFF',
    arrowColor: theme.colors.navy,
    disabledArrowColor: theme.colors.gray,
    monthTextColor: theme.colors.text,
    indicatorColor: theme.colors.navy,
    textDayFontFamily: 'System',
    textMonthFontFamily: 'System',
    textDayHeaderFontFamily: 'System',
    textDayFontWeight: '500' as const,
    textMonthFontWeight: '600' as const,
    textDayHeaderFontWeight: '600' as const,
    textDayFontSize: 16,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 14,
  };

  return (
    <View style={styles.overlay}>
      <View style={[styles.calendarContainer, { backgroundColor: theme.colors.surface }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Select Date</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <Calendar
          key={selectedDateString} // Force re-render when date changes
          current={selectedDateString}
          minDate={minDateString}
          maxDate={undefined}
          onDayPress={handleDayPress}
          markedDates={{
            [selectedDateString]: {
              selected: true,
              disableTouchEvent: true,
              selectedColor: theme.colors.navy,
              selectedTextColor: '#FFFFFF',
            },
          }}
          theme={calendarTheme}
          enableSwipeMonths={true}
          hideArrows={false}
          hideExtraDays={true}
          disableMonthChange={false}
          firstDay={1} // Monday as first day
          hideDayNames={false}
          showWeekNumbers={false}
          disableArrowLeft={false}
          disableArrowRight={false}
          disableAllTouchEventsForDisabledDays={true}
          renderArrow={(direction) => (
            <Ionicons 
              name={direction === 'left' ? 'chevron-back' : 'chevron-forward'} 
              size={20} 
              color={theme.colors.navy} 
            />
          )}
          style={styles.calendar}
        />

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Select any date from today onwards
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  calendarContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  calendar: {
    paddingHorizontal: 20,
  },
  footer: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default CustomCalendar;
