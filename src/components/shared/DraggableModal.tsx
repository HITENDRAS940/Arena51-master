import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

interface DraggableModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: any;
  overlayStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  showPullBar?: boolean;
  pullBarColor?: string;
  backdropColor?: string;
}

const DraggableModal: React.FC<DraggableModalProps> = ({
  visible,
  onClose,
  children,
  height = '85%',
  overlayStyle,
  containerStyle,
  showPullBar = true,
  pullBarColor,
  backdropColor,
}) => {
  const screenHeight = Dimensions.get('window').height;
  const panY = useRef(new Animated.Value(screenHeight)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [realVisible, setRealVisible] = React.useState(visible);

  useEffect(() => {
    if (visible) {
      setRealVisible(true);
      Animated.parallel([
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 90,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(panY, {
          toValue: screenHeight,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setRealVisible(false);
      });
    }
  }, [visible, panY, opacity, screenHeight]);

  const handleDismiss = () => {
    onClose(); // This will trigger the useEffect for slide down
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
          // Optional: decrease opacity as user drags down
          const newOpacity = 1 - (gestureState.dy / screenHeight);
          opacity.setValue(Math.max(0, newOpacity));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          handleDismiss();
        } else {
          Animated.parallel([
            Animated.spring(panY, {
              toValue: 0,
              useNativeDriver: true,
              damping: 20,
              stiffness: 120,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  return (
    <Modal
      visible={realVisible}
      animationType="none"
      transparent={true}
      onRequestClose={handleDismiss}
    >
      <View style={[styles.overlay, overlayStyle, backdropColor ? { backgroundColor: backdropColor } : null]}>
        <Animated.View 
          style={[
            styles.backdrop,
            { opacity }
          ]}
        >
          <TouchableOpacity 
            style={{ flex: 1 }} 
            activeOpacity={1} 
            onPress={handleDismiss} 
          />
        </Animated.View>
        <Animated.View 
          style={[
            styles.modalContent, 
            { 
              height: height as any,
              transform: [{ translateY: panY }]
            },
            containerStyle
          ]}
        >
          {showPullBar && (
            <View 
              style={styles.pullBarContainer}
              {...panResponder.panHandlers}
            >
              <View style={[styles.pullBar, pullBarColor ? { backgroundColor: pullBarColor } : null]} />
            </View>
          )}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(32),
    borderTopRightRadius: moderateScale(32),
    overflow: 'hidden',
  },
  pullBarContainer: {
    alignItems: 'center',
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(8),
  },
  pullBar: {
    width: scale(40),
    height: verticalScale(4),
    borderRadius: moderateScale(2),
    backgroundColor: '#E2E8F0',
    opacity: 0.5,
  },
});

export default DraggableModal;
