import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

interface GradientHeaderProps {
  title: string;
  subtitle?: string | React.ReactNode;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  onBackPress?: () => void;
  children?: React.ReactNode;
}

const GradientHeader: React.FC<GradientHeaderProps> = ({ 
  title, 
  subtitle, 
  showBack = false, 
  rightElement,
  onBackPress,
  children
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { theme } = useTheme();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <LinearGradient
      colors={['#1F2937', '#111827']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.headerGradient, { paddingTop: insets.top + 10 }]}
    >
      {children ? (
        children
      ) : (
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            {showBack ? (
              <TouchableOpacity 
                onPress={handleBack} 
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 40 }} />
            )}

            <View>
            <Text style={styles.headerTitle}>{title}</Text>
            {subtitle && (
              <Text style={styles.headerSubtitle}>{subtitle}</Text>
            )}
          </View>
            
            {rightElement ? (
              rightElement
            ) : (
              <View style={{ width: 40 }} />
            )}
          </View>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    paddingTop: 10,
    gap: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
});

export default GradientHeader;
