import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Skeleton from './Skeleton';
import { useTheme } from '../../contexts/ThemeContext';

export const ActivitySkeletonCard = () => (
  <View style={styles.activityCard}>
    <Skeleton width="100%" height="100%" borderRadius={24} />
  </View>
);

export const ServiceSkeletonCard = () => {
    const { theme } = useTheme();
    return (
        <View style={[styles.serviceCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            {/* Image Placeholder */}
            <Skeleton width="100%" height={160} borderRadius={0} />
            
            <View style={styles.serviceContent}>
                {/* Title and Badge Row */}
                <View style={styles.rowBetween}>
                    <Skeleton width="60%" height={24} borderRadius={4} />
                    <Skeleton width={60} height={24} borderRadius={12} />
                </View>

                {/* Location Row */}
                <View style={[styles.row, { marginTop: 12 }]}>
                    <Skeleton width={16} height={16} borderRadius={8} />
                    <Skeleton width="40%" height={16} borderRadius={4} style={{ marginLeft: 8 }} />
                </View>

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginVertical: 12 }} />

                {/* Footer Info */}
                <View style={styles.rowBetween}>
                    <Skeleton width={80} height={16} borderRadius={4} />
                    <Skeleton width={60} height={16} borderRadius={4} />
                </View>
            </View>
        </View>
    );
};

export const BookingSkeletonCard = () => {
    const { theme } = useTheme();
    return (
        <View style={[styles.bookingCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            {/* Header section matching BookingCard */}
            <View style={styles.rowBetween}>
                <View style={{ flex: 1, marginRight: 12 }}>
                    <View style={[styles.row, { marginBottom: 4 }]}>
                        <Skeleton width={8} height={8} borderRadius={4} style={{ marginRight: 8 }} />
                        <Skeleton width="70%" height={20} borderRadius={4} />
                    </View>
                    <Skeleton width="40%" height={14} borderRadius={4} />
                </View>
                <Skeleton width={80} height={28} borderRadius={12} />
            </View>
            
            <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginVertical: 16 }} />
            
            {/* Details Grid (2 columns) */}
            <View style={[styles.rowBetween, { marginBottom: 20 }]}>
                <View style={[styles.row, { flex: 1 }]}>
                    <Skeleton width={36} height={36} borderRadius={12} />
                    <View style={{ marginLeft: 10 }}>
                        <Skeleton width={30} height={10} borderRadius={2} style={{ marginBottom: 4 }} />
                        <Skeleton width={70} height={14} borderRadius={4} />
                    </View>
                </View>
                <View style={[styles.row, { flex: 1 }]}>
                    <Skeleton width={36} height={36} borderRadius={12} />
                    <View style={{ marginLeft: 10 }}>
                        <Skeleton width={30} height={10} borderRadius={2} style={{ marginBottom: 4 }} />
                        <Skeleton width={90} height={14} borderRadius={4} />
                    </View>
                </View>
            </View>

            {/* Price & Ref Row */}
            <View style={[styles.rowBetween, { marginBottom: 16 }]}>
                <Skeleton width={100} height={14} borderRadius={4} />
                <Skeleton width={60} height={24} borderRadius={4} />
            </View>

            {/* Footer */}
            <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: 16 }} />
            <Skeleton width={120} height={12} borderRadius={4} />
        </View>
    );
};

export const TimeSlotSkeleton = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.timeSlotCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.row}>
        <Skeleton width={36} height={36} borderRadius={18} />
        <View style={{ marginLeft: 14 }}>
          <Skeleton width={60} height={10} borderRadius={2} style={{ marginBottom: 4 }} />
          <Skeleton width={120} height={16} borderRadius={4} />
        </View>
      </View>
      <Skeleton width={50} height={20} borderRadius={4} />
    </View>
  );
};

// Layout Helper to render multiple skeletons in a list
export const SkeletonList = ({ 
    count = 3, 
    renderItem, 
    horizontal = false,
    contentContainerStyle
}: { 
    count?: number; 
    renderItem: () => React.ReactNode;
    horizontal?: boolean;
    contentContainerStyle?: any;
}) => {
    return (
        <ScrollView 
            horizontal={horizontal}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={contentContainerStyle}
            scrollEnabled={false} // Prevent scrolling skeleton list usually
        >
            {Array.from({ length: count }).map((_, index) => (
                <View key={index} style={horizontal ? styles.horizontalItem : styles.verticalItem}>
                    {renderItem()}
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
  activityCard: {
    width: 140, 
    height: 180, 
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 16,
  },
  serviceCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceContent: {
      padding: 16,
  },
  bookingCard: {
      padding: 20,
      borderRadius: 24,
      marginBottom: 16,
      borderWidth: 1,
  },
  row: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  horizontalItem: {
      
  },
  verticalItem: {
      
  },
  timeSlotCard: {
    padding: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  }
});
