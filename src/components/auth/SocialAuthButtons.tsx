import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import { jwtDecode } from 'jwt-decode';
import GoogleIcon from '../shared/icons/GoogleIcon';
import AppleIcon from '../shared/icons/AppleIcon';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

interface SocialAuthButtonsProps {
  onAuthStart?: () => void;
  onAuthSuccess?: (user: User) => void;
  onAuthError?: (error: string) => void;
}


// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: '622776222056-525403iu1ku11l2hetgt1t4bkj54ok0m.apps.googleusercontent.com',
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onAuthStart,
  onAuthSuccess,
  onAuthError,
}) => {
  const { login } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {

      onAuthStart?.();
      setGoogleLoading(true);

      // Check if Play Services are available (Android only)
      await GoogleSignin.hasPlayServices();

      // Trigger Google Sign-In
      const response = await GoogleSignin.signIn();
      
      if (response.type === 'success') {
        const { idToken, user } = response.data;


        if (!idToken) {
          throw new Error('Failed to get Google ID token');
        }

        // Send to backend

        const apiResponse = await authAPI.oauthLogin({ 
          idToken, 
          provider: 'GOOGLE',
          fullName: user.name || undefined
        });

        const { token, email, name, newUser } = apiResponse.data;

        // Decode JWT for user info
        const payload: any = jwtDecode(token);
        const userId = payload.userId;

        const userData: User = {
          id: userId,
          token,
          phone: payload.phone || '',
          role: 'ROLE_USER',
          name: name || payload.name,
          email,
          isNewUser: newUser,
          walletBalance: 0,
        };

        await login(userData);
        onAuthSuccess?.(userData);
      } else {
        // Handle cancellation (type === 'cancelled' or others)

      }
    } catch (error: any) {

      // Handle specific Google Sign-In errors (though most are now in response.type)
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      } else if (error.code === statusCodes.IN_PROGRESS) {
        return;
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        onAuthError?.('Google Play Services not available');
      } else {
        onAuthError?.(error.response?.data?.message || error.message || 'Google sign-in failed');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {

      onAuthStart?.();
      setAppleLoading(true);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });

      const idToken = credential.identityToken;


      if (!idToken) {
        throw new Error('Failed to get Apple ID token');
      }

      // Send to backend

      const fullName = credential.fullName?.givenName 
        ? `${credential.fullName.givenName} ${credential.fullName.familyName || ''}`.trim()
        : undefined;

      const response = await authAPI.oauthLogin({ 
        idToken, 
        provider: 'APPLE',
        fullName
      });

      const { token, email, name, newUser } = response.data;

      // Decode JWT for user info
      const payload: any = jwtDecode(token);
      const userId = payload.userId;

      // Apple only returns name on first sign-in, use credential name if available
      const userName = name || 
        (credential.fullName?.givenName 
          ? `${credential.fullName.givenName} ${credential.fullName.familyName || ''}`.trim()
          : payload.name);

      const userData: User = {
        id: userId,
        token,
        phone: payload.phone || '',
        role: 'ROLE_USER',
        name: userName,
        email: email || credential.email || '',
        isNewUser: newUser,
        walletBalance: 0,
      };

      await login(userData);
      onAuthSuccess?.(userData);
    } catch (error: any) {

      if (error.code === 'ERR_REQUEST_CANCELED') {
        // User cancelled - silently ignore
        return;
      }
      onAuthError?.(error.response?.data?.message || error.message || 'Apple sign-in failed');
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or login with</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Buttons */}
      <View style={styles.buttonsContainer}>
        {/* Google Button */}
        <TouchableOpacity
          style={[styles.socialButton, styles.googleButton]}
          onPress={handleGoogleSignIn}
          disabled={googleLoading || appleLoading}
          activeOpacity={0.7}
        >
          {googleLoading ? (
            <ActivityIndicator size="small" color="#DB4437" />
          ) : (
            <GoogleIcon width={scale(24)} height={scale(24)} />
          )}
        </TouchableOpacity>

        {/* Apple Button - iOS Only */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={[styles.socialButton, styles.appleButton]}
            onPress={handleAppleSignIn}
            disabled={googleLoading || appleLoading}
            activeOpacity={0.7}
          >
            {appleLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <AppleIcon width={scale(24)} height={scale(24)} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: verticalScale(24),
    paddingHorizontal: scale(4),
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: scale(16),
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(20),
    marginBottom: verticalScale(16),
  },
  socialButton: {
    width: scale(56),
    height: scale(56),
    borderRadius: moderateScale(28),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.08,
    shadowRadius: moderateScale(10),
    elevation: 3,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EFEFEF',
  },
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
});

export default SocialAuthButtons;
