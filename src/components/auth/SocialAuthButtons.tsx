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
      console.log('🔄 Starting Google Sign-In...');
      onAuthStart?.();
      setGoogleLoading(true);

      // Check if Play Services are available (Android only)
      await GoogleSignin.hasPlayServices();

      // Trigger Google Sign-In
      const response = await GoogleSignin.signIn();
      
      if (response.type === 'success') {
        const { idToken, user } = response.data;
        console.log('✅ Google Sign-In successful, ID Token obtained');

        if (!idToken) {
          throw new Error('Failed to get Google ID token');
        }

        // Send to backend
        console.log('🔄 Authenticating with backend...');
        const apiResponse = await authAPI.oauthLogin({ 
          idToken, 
          provider: 'GOOGLE',
          fullName: user.name || undefined
        });
        console.log('✅ Backend authentication successful');
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
        console.log('ℹ️ Google Sign-In cancelled or other status:', response.type);
      }
    } catch (error: any) {
      console.error('❌ Google Sign-In Error:', error);
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
      console.log('🔄 Starting Apple Sign-In...');
      onAuthStart?.();
      setAppleLoading(true);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });

      const idToken = credential.identityToken;
      console.log('✅ Apple Sign-In successful, ID Token obtained');

      if (!idToken) {
        throw new Error('Failed to get Apple ID token');
      }

      // Send to backend
      console.log('🔄 Authenticating with backend...');
      const fullName = credential.fullName?.givenName 
        ? `${credential.fullName.givenName} ${credential.fullName.familyName || ''}`.trim()
        : undefined;

      const response = await authAPI.oauthLogin({ 
        idToken, 
        provider: 'APPLE',
        fullName
      });
      console.log('✅ Backend authentication successful');
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
      console.error('❌ Apple Sign-In Error:', error);
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
            <>
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </>
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
              <>
                <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                <Text style={[styles.socialButtonText, styles.appleButtonText]}>Continue with Apple</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonsContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  appleButtonText: {
    color: '#FFFFFF',
  },
});

export default SocialAuthButtons;
