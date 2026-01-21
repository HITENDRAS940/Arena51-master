import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Skeleton from '../../shared/Skeleton';
import { useTheme } from '../../../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const ServiceDetailSkeleton = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Absolute Gallery Placeholder */}
      <View style={styles.galleryPlaceholder}>
        <Skeleton height={280} width={screenWidth} borderRadius={0} />
        
        {/* Gallery Content Overlay Placeholder */}
        <View style={styles.galleryOverlay}>
          <Skeleton width="60%" height={28} borderRadius={8} style={{ marginBottom: 10 }} />
          <Skeleton width="40%" height={16} borderRadius={4} />
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Spacer for Absolute Gallery */}
        <View style={styles.gallerySpacer} />

        {/* Content Card */}
        <View style={[
          styles.contentContainer, 
          { 
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: moderateScale(50),
            borderTopRightRadius: moderateScale(50),
            marginTop: -verticalScale(20),
          }
        ]}>
          {/* Pull Bar */}
          <View style={styles.pullBarContainer}>
            <View style={[styles.pullBar, { backgroundColor: theme.colors.text, opacity: 0.1 }]} />
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionTitleBar, { backgroundColor: theme.colors.primary }]} />
              <Skeleton width={100} height={20} borderRadius={4} />
            </View>
            <View style={styles.infoCard}>
              <Skeleton width="100%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
              <Skeleton width="100%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
              <Skeleton width="80%" height={14} borderRadius={4} />
            </View>
          </View>

          {/* Amenities Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionTitleBar, { backgroundColor: theme.colors.primary }]} />
              <Skeleton width={120} height={20} borderRadius={4} />
            </View>
            <View style={styles.amenitiesGrid}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.amenityItem}>
                  <Skeleton width={32} height={32} borderRadius={10} />
                  <Skeleton width="50%" height={14} borderRadius={4} />
                </View>
              ))}
            </View>
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionTitleBar, { backgroundColor: theme.colors.primary }]} />
              <Skeleton width={110} height={20} borderRadius={4} />
            </View>
            <View style={styles.mapCard}>
              <View style={styles.mapContent}>
                <Skeleton width={48} height={48} borderRadius={24} />
                <View style={{ flex: 1, gap: 8 }}>
                  <Skeleton width="40%" height={16} borderRadius={4} />
                  <Skeleton width="80%" height={14} borderRadius={4} />
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Footer Placeholder */}
      <View style={[styles.footerContainer, { paddingBottom: Math.max(verticalScale(20), insets.bottom + verticalScale(10)) }]}>
        <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.footerContent}>
            <View>
              <Skeleton width={80} height={12} borderRadius={4} style={{ marginBottom: 6 }} />
              <Skeleton width={100} height={24} borderRadius={4} />
            </View>
            <Skeleton width={130} height={48} borderRadius={16} />
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
  galleryPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  galleryOverlay: {
    position: 'absolute',
    bottom: verticalScale(30),
    left: scale(20),
    right: scale(20),
  },
  scrollContent: {
    paddingBottom: verticalScale(140),
  },
  gallerySpacer: {
    height: verticalScale(230),
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(40),
    zIndex: 10,
  },
  pullBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: verticalScale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  pullBar: {
    width: scale(36),
    height: verticalScale(4),
    borderRadius: moderateScale(2),
  },
  section: {
    marginBottom: verticalScale(32),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
    gap: scale(6),
  },
  sectionTitleBar: {
    width: moderateScale(4),
    height: moderateScale(16),
    borderRadius: moderateScale(2),
  },
  infoCard: {
    padding: moderateScale(20),
    borderRadius: moderateScale(24),
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(10),
    borderRadius: moderateScale(16),
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    gap: scale(10),
    width: '48%',
    marginBottom: verticalScale(10),
  },
  mapCard: {
    borderRadius: moderateScale(24),
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    padding: moderateScale(20),
  },
  mapContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(16),
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(10),
  },
  footer: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(24),
    borderWidth: 1,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default ServiceDetailSkeleton;
