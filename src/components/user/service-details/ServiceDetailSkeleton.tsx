import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Skeleton from '../../shared/Skeleton';
import { useTheme } from '../../../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const ServiceDetailSkeleton = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Gallery Placeholder */}
        <Skeleton height={400} width={screenWidth} borderRadius={0} />

        {/* Content Card Overlap */}
        <View style={[styles.contentContainer, { backgroundColor: theme.colors.background }]}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Skeleton width="70%" height={32} borderRadius={8} style={{ marginBottom: 12 }} />
            
            <View style={styles.statsRow}>
              <Skeleton width={60} height={24} borderRadius={12} />
              <Skeleton width={100} height={20} borderRadius={4} />
            </View>

            <View style={styles.locationRow}>
              <Skeleton width={28} height={28} borderRadius={8} />
              <Skeleton width="80%" height={20} borderRadius={4} />
            </View>
          </View>

          {/* Quick Stats Section */}
          <View style={styles.quickStatsRow}>
            <Skeleton width="48%" height={64} borderRadius={16} />
            <Skeleton width="48%" height={64} borderRadius={16} />
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Skeleton width={140} height={28} borderRadius={4} />
            </View>
            <Skeleton width="100%" height={16} borderRadius={4} style={{ marginBottom: 8 }} />
            <Skeleton width="100%" height={16} borderRadius={4} style={{ marginBottom: 8 }} />
            <Skeleton width="60%" height={16} borderRadius={4} />
          </View>

          {/* Amenities Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Skeleton width={120} height={28} borderRadius={4} />
            </View>
            <View style={styles.amenitiesGrid}>
              <Skeleton width="48%" height={48} borderRadius={14} />
              <Skeleton width="48%" height={48} borderRadius={14} />
              <Skeleton width="48%" height={48} borderRadius={14} />
              <Skeleton width="48%" height={48} borderRadius={14} />
            </View>
          </View>

          {/* Map/Location Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Skeleton width={110} height={28} borderRadius={4} />
            </View>
            <Skeleton width="100%" height={80} borderRadius={20} />
          </View>
        </View>
      </ScrollView>

      {/* Footer Placeholder */}
      <View style={[styles.footerContainer, { paddingBottom: Math.max(20, insets.bottom + 10) }]}>
        <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.footerContent}>
            <View>
              <Skeleton width={80} height={12} borderRadius={4} style={{ marginBottom: 4 }} />
              <Skeleton width={100} height={24} borderRadius={4} />
            </View>
            <Skeleton width={120} height={48} borderRadius={18} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -32,
    paddingTop: 40,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  headerSection: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  section: {
    marginBottom: 26,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default ServiceDetailSkeleton;
