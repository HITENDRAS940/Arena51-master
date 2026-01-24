import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  Keyboard,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import DraggableModal from '../../shared/DraggableModal';

interface DeleteAccountModalProps {
  isVisible: boolean;
  onClose: () => void;
  isDeleting: boolean;
  onConfirm: (reason: string, confirmationText: string) => void;
  theme: any;
}

const deletionReasons = [
  "No longer use the app",
  "Privacy concerns",
  "Technical issues / bugs",
  "Found better alternative",
  "Too many notifications",
  "Other"
];

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isVisible,
  onClose,
  isDeleting,
  onConfirm,
  theme,
}) => {
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const keyboardShift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showListener = Keyboard.addListener(showEvent, (e) => {
      if (isVisible) {
        Animated.timing(keyboardShift, {
          toValue: 1,
          duration: e.duration || 300,
          easing: e.easing === 'keyboard' ? Easing.bezier(0.33, 1, 0.68, 1) : Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start();
      }
    });

    const hideListener = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(keyboardShift, {
        toValue: 0,
        duration: e.duration || 300,
        easing: e.easing === 'keyboard' ? Easing.bezier(0.33, 1, 0.68, 1) : Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, [isVisible]);

  const handleConfirm = () => {
    onConfirm(deleteReason, deleteConfirmationText);
  };

  return (
    <DraggableModal
      visible={isVisible}
      onClose={onClose}
      height="85%"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <Animated.View 
          style={{
            opacity: keyboardShift.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
            height: keyboardShift.interpolate({ inputRange: [0, 1], outputRange: [verticalScale(80), 0] }),
            marginBottom: keyboardShift.interpolate({ inputRange: [0, 1], outputRange: [verticalScale(12), 0] }),
            overflow: 'hidden',
            paddingHorizontal: scale(24),
            paddingTop: verticalScale(12),
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={styles.modalTitleContainer}>
              <Text style={[styles.modalTitle, { color: theme.colors.error }]}>Delete Account</Text>
              <Text style={styles.modalSubtitle}>This action cannot be undone</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: scale(20),
            paddingBottom: 40,
          }}
        >
          <Animated.View
            style={{
              opacity: keyboardShift.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
              height: keyboardShift.interpolate({ inputRange: [0, 1], outputRange: [verticalScale(410), 0] }),
              overflow: 'hidden',
              marginBottom: keyboardShift.interpolate({ inputRange: [0, 1], outputRange: [verticalScale(0), 0] }),
              marginTop: keyboardShift.interpolate({ inputRange: [0, 1], outputRange: [verticalScale(4), 0] }),
            }}
          >
            <Text style={[styles.description, { marginTop: 0 }]}>
              This action is permanent and all your data will be lost forever.
            </Text>

            <Text style={[styles.sectionTitle, { color: '#FFFFFF', marginTop: 4, fontSize: 16, marginLeft: 0, marginBottom: 0 }]}>
              Why are you leaving?
            </Text>
            <View style={[styles.reasonsContainer, { marginTop: 0 }]}>
              {deletionReasons.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonItem,
                    deleteReason === reason && { 
                      borderColor: theme.colors.error,
                      backgroundColor: theme.colors.error + '15'
                    }
                  ]}
                  onPress={() => setDeleteReason(reason)}
                >
                  <Ionicons 
                    name={deleteReason === reason ? "radio-button-on" : "radio-button-off"} 
                    size={18} 
                    color={deleteReason === reason ? theme.colors.error : '#9CA3AF'} 
                  />
                  <Text style={styles.reasonText}>{reason}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          <Text style={[styles.sectionTitle, { color: '#FFFFFF', marginTop: 0, fontSize: 16, marginLeft: 0, marginBottom: 0 }]}>
            Type "DELETE MY ACCOUNT" to confirm
          </Text>
          <TextInput
            style={[styles.input, { marginTop: 4 }]}
            value={deleteConfirmationText}
            onChangeText={setDeleteConfirmationText}
            placeholder="DELETE MY ACCOUNT"
            placeholderTextColor="#9CA3AF80"
            autoCapitalize="characters"
          />

          <View style={[styles.modalButtons, { marginTop: 16 }]}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
              disabled={isDeleting}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalButton, 
                { backgroundColor: theme.colors.error, opacity: (deleteReason && deleteConfirmationText === 'DELETE MY ACCOUNT') ? 1 : 0.5 }
              ]}
              onPress={handleConfirm}
              disabled={isDeleting || !deleteReason || deleteConfirmationText !== 'DELETE MY ACCOUNT'}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.modalButtonText}>Delete Permanently</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </DraggableModal>
  );
};

const styles = StyleSheet.create({
  modalTitleContainer: {
    flex: 1,
    marginRight: scale(16),
  },
  modalTitle: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: moderateScale(13),
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: verticalScale(2),
  },
  modalCloseButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: moderateScale(18),
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  description: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
    color: '#9CA3AF',
  },
  sectionTitle: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  reasonsContainer: {
    marginTop: 8,
    gap: 6,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(12),
    borderRadius: moderateScale(12),
    borderWidth: 1.5,
    borderColor: '#333333',
    backgroundColor: '#1A1A1A',
    gap: 12,
  },
  reasonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: moderateScale(14),
    padding: scale(16),
    fontSize: moderateScale(16),
    marginBottom: verticalScale(24),
    backgroundColor: '#1A1A1A',
    borderColor: '#333333',
    color: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: scale(12),
  },
  modalButton: {
    flex: 1,
    padding: scale(16),
    borderRadius: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1.5,
    borderColor: '#333333',
    backgroundColor: 'transparent',
  },
  modalButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default DeleteAccountModal;
