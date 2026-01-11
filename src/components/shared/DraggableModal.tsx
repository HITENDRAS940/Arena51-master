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

  useEffect(() => {
    if (visible) {
      Animated.spring(panY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }).start();
    }
  }, [visible, panY]);

  const handleDismiss = () => {
    Animated.timing(panY, {
      toValue: screenHeight,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          handleDismiss();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 120,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={handleDismiss}
    >
      <View style={[styles.overlay, overlayStyle, backdropColor ? { backgroundColor: backdropColor } : null]}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={handleDismiss} 
        />
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
