require('dotenv').config();

module.exports = {
  expo: {
    name: "ARENA51",
    slug: "TurfBookingApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/arena_logo.jpg",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
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
        foregroundImage: "./assets/images/arena_logo.jpg",
        backgroundColor: "#ffffff"
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
    owner: "hitendras940"
  }
};
