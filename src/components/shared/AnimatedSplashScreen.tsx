import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import HyperIcon from './icons/HyperIcon';

const { width, height } = Dimensions.get('window');
const LOGO_SIZE = 120;

type Props = {
  onAnimationComplete: () => void;
};

const SplashScreen: React.FC<Props> = ({ onAnimationComplete }) => {
  useEffect(() => {
    // Simple delay to show the logo before transitioning to the app
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <HyperIcon 
          size={LOGO_SIZE} 
          color="#f3f4f6" 
        />
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B4B', // Navy
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});