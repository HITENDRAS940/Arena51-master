import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import DraggableModal from '../../shared/DraggableModal';

interface LegalModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

const LegalModal: React.FC<LegalModalProps> = ({ isVisible, onClose, title, content }) => {
  return (
    <DraggableModal
      visible={isVisible}
      onClose={onClose}
      height="80%"
    >
      <View style={styles.modalHeader}>
        <View style={styles.modalTitleContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={[styles.modalInner, { flex: 1, paddingTop: 0 }]}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={styles.legalScroll}
          contentContainerStyle={styles.legalScrollContent}
        >
          <Text style={styles.legalText}>
            {content}
          </Text>
        </ScrollView>
      </View>
    </DraggableModal>
  );
};

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(20),
  },
  modalTitleContainer: {
    flex: 1,
    marginRight: scale(16),
  },
  modalTitle: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
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
  modalInner: {
    padding: scale(24),
  },
  legalScroll: {
    flex: 1,
  },
  legalScrollContent: {
    paddingBottom: verticalScale(60),
  },
  legalText: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(22),
    fontWeight: '500',
    color: '#D1D5DB',
  },
});

export default LegalModal;
