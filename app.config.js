require('dotenv').config();

module.exports = {
  expo: {
    name: "HYPER",
    slug: "TurfBookingApp",
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
      bundleIdentifier: "com.hitendras940.TurfBookingApp",
      infoPlist: {
        LSApplicationQueriesSchemes: [
          "phonepe",
          "tez",
          "paytmmp",
          "bhim",
          "amazonpay",
          "credpay"
        ],
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      package: "com.hitendras940.TurfBookingApp",
      adaptiveIcon: {
        foregroundImage: "./assets/hy_logo.png",
        backgroundColor: "#1E1B4B"
      },
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
        projectId: "5aedd132-3f9e-418d-824a-2f74565ea37d"
      }
    },
    owner: "hitendras940",
    plugins: [
      "expo-font"
    ]
  }
};
