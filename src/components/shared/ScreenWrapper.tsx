import React from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StyleProp,
  ViewStyle,
  StatusBar,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

interface ScreenProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  safeAreaEdges?: Edge[];
  keyboardOffset?: number;
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
  translucent?: boolean;
}

export const ScreenWrapper: React.FC<ScreenProps> = ({
  children,
  style,
  safeAreaEdges = ['top', 'bottom', 'left', 'right'],
  keyboardOffset = 0,
  backgroundColor,
  statusBarStyle,
  translucent = false,
}) => {
  const { theme } = useTheme();
  const bgColor = backgroundColor || theme.colors.background;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.keyboardAvoidingView, { backgroundColor: bgColor }]}
      keyboardVerticalOffset={keyboardOffset}
    >
      <StatusBar
        barStyle={statusBarStyle || (theme.id === 'dark' ? 'light-content' : 'dark-content')}
        backgroundColor={translucent ? 'transparent' : bgColor}
        translucent={translucent}
      />
      <SafeAreaView
        style={[styles.container, style]}
        edges={safeAreaEdges}
      >
        {children}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});
