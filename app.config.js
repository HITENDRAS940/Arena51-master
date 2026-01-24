require('dotenv').config();

module.exports = {
  expo: {
    name: "HYPER",
    slug: "hyper",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/hy_logo.png",
      resizeMode: "contain",
      backgroundColor: "#1E1B4B"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.hitendras940.hyper",
      usesAppleSignIn: true,
      infoPlist: {
        LSApplicationQueriesSchemes: [
          "phonepe",
          "tez",
          "paytmmp",
          "bhim",
          "amazonpay",
          "credpay",
          "upi",
          "razorpay"
        ],
        ITSAppUsesNonExemptEncryption: false,
        NSLocationWhenInUseUsageDescription: "HYPER needs your location to show nearby sports venues and calculate distances.",
        NSPhotoLibraryUsageDescription: "HYPER needs access to your photos to let you set a profile picture.",
        NSCameraUsageDescription: "HYPER needs access to your camera to let you take a profile picture."
      }
    },
    android: {
      package: "com.hitendras940.hyper",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/hy_logo.png",
        backgroundColor: "#10B981"
      },
      permissions: [
        "ACCESS_FINE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ],
      intentFilters: [
        {
          action: "VIEW",
          data: {
            scheme: "io.razorpay"
          },
          category: ["BROWSABLE", "DEFAULT"]
        }
      ],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      "eas": {
        "projectId": "a1aa533f-8f16-4640-8307-9394a40ebdc9"
      },
      // OAuth Configuration - Replace with your actual credentials
      googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
      googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
    },
    owner: "hitendrasingh",
    plugins: [
      "expo-font",
      "expo-apple-authentication",
      "@react-native-google-signin/google-signin"
    ]
  }
};
