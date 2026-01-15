import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useBookingStatusPolling } from '../../hooks/useBookingStatusPolling';

/**
 * BookingConfirmationLoaderScreen
 * 
 * Full-screen loader that polls backend and displays final booking state.
 * 
 * WHY this works reliably:
 * - Screen mounts FRESH after navigation.replace from PaymentLauncherScreen
 * - useEffect runs on mount, starting polling immediately
 * - No stale timers, no AppState complexity, no focus effects
 * - Android timer pause is fine: polling resumes when JS thread resumes
 * 
 * This matches Swiggy/Zomato behavior: show loader → auto-confirm/fail
 */
const BookingConfirmationLoaderScreen = ({ route, navigation }: any) => {
  const { bookingId } = route.params;
  const { theme } = useTheme();
  
  // Polling starts automatically on mount (inside the hook's useEffect)
  const { status, bookingData } = useBookingStatusPolling(bookingId);

  // ─────────────────────────────────────────────
  // SUCCESS STATE
  // ─────────────────────────────────────────────
  if (status === 'confirmed') {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={100} color={theme.colors.primary} />
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Booking Confirmed!
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          ID: #{bookingData?.bookingId || bookingId}
        </Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.popToTop()}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─────────────────────────────────────────────
  // FAILURE STATE
  // ─────────────────────────────────────────────
  if (status === 'failed') {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.iconContainer}>
          <Ionicons name="close-circle" size={100} color={theme.colors.error} />
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Booking Failed
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Your payment could not be confirmed
        </Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.text }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─────────────────────────────────────────────
  // LOADING STATE (polling in progress)
  // ─────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator 
        size="large" 
        color={theme.colors.primary} 
        style={{ transform: [{ scale: 2 }] }} 
      />
      <Text style={[styles.loadingText, { color: theme.colors.text }]}>
        Confirming your booking...
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Please do not close the app
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 40 
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 16, 
    marginTop: 12,
    textAlign: 'center' 
  },
  loadingText: { 
    fontSize: 20, 
    fontWeight: '600', 
    marginTop: 40 
  },
  button: { 
    width: '100%', 
    height: 56, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 40 
  },
  buttonText: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});

export default BookingConfirmationLoaderScreen;
