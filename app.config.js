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
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      package: "com.hitendras940.hyper",
      adaptiveIcon: {
        foregroundImage: "./assets/hy_logo.png",
        backgroundColor: "#1E1B4B"
      },
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
      eas: {
        projectId: "d4b5fd29-d745-4050-8e10-86fae4a20c8f"
      },
      // OAuth Configuration - Replace with your actual credentials
      googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
      googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
    },
    owner: "hitendras940",
    plugins: [
      "expo-font",
      "expo-apple-authentication",
      "@react-native-google-signin/google-signin"
    ]
  }
};
