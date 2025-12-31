import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const LOADING_ITEMS = [
  { icon: 'basketball', label: 'Slam Dunk' }, 
  { icon: 'football', label: 'Kick Off' },
  { icon: 'tennisball', label: 'Game, Set, Match' },
  { icon: 'baseball', label: 'Home Run' },
  { icon: 'trophy', label: 'Victory Awaits' }
] as const;

const LoadingState = ({ message = 'Services Loading...' }: { message?: string }) => {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animateIcon = () => {
      // 1. Slide out to the left (fast)
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -300, // Move off screen left
          duration: 100, // Very fast exit
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        })
      ]).start(() => {
        // 2. Change content instantly while invisible
        setCurrentIndex((prev) => (prev + 1) % LOADING_ITEMS.length);
        
        // 3. Reset position to right side
        translateX.setValue(300); // Start off screen right
        
        // 4. Slide in from right (fast)
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
            duration: 300, // Fast entry with slight deceleration
            useNativeDriver: true,
            easing: Easing.out(Easing.back(1.5)), // Overshoot slightly for sporty feel
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start(() => {
            // Pause before next loop
            setTimeout(animateIcon, 800);
        });
      });
    };

    // Start the loop
    animateIcon();
    
    // Cleanup not strictly necessary for self-recalling function in this context, 
    // but in a fuller component we'd want to handle unmount safety.
  }, []); // Run once on mount to start the loop

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.contentContainer}>
        <Animated.View
          style={{
            transform: [{ translateX }],
            opacity,
            alignItems: 'center',
          }}
        >
          <Ionicons 
            name={LOADING_ITEMS[currentIndex].icon as any} 
            size={48} 
            color={theme.colors.primary} 
          />
          <Text style={[styles.sportLabel, { color: theme.colors.primary }]}>
            {LOADING_ITEMS[currentIndex].label}
          </Text>
        </Animated.View>
      </View>
      <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200, 
  },
  contentContainer: {
    height: 100, // Fixed height to prevent jumping
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  sportLabel: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.6,
  },
});

export default LoadingState;
