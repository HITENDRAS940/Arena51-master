# 📱 Turf Booking App - React Native

A comprehensive mobile application for booking sports turfs with advanced features including real-time slot availability, theme system, payment simulation, and full admin management capabilities. Built with React Native, Expo, and TypeScript.

![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-blue)
![Framework](https://img.shields.io/badge/Framework-React%20Native-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6)
![Expo](https://img.shields.io/badge/Expo-Latest-000020)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green)

## Features

### 🎯 User Features
- ✅ **Authentication**: Phone number authentication with OTP verification
- ✅ **Name Setup**: New user onboarding with name registration  
- ✅ **Turf Discovery**: Browse available turfs with ratings and pricing
- ✅ **Enhanced Turf Details**: 
  - Animated image galleries with smooth parallax effects
  - Real-time pricing information with lowest price display
  - Direct call functionality with phone dialer integration
  - Comprehensive turf information display
- ✅ **Advanced Booking System**:
  - Interactive calendar with custom date selection
  - Real-time slot availability with 24-hour time slots (00:00-23:00)
  - Individual slot pricing with chronological ordering
  - Past time slot prevention (cannot book expired slots)
  - Multi-slot selection with total cost calculation
  - Payment simulation with mock payment processing
- ✅ **Booking Management**:
  - Complete booking history with detailed information
  - Booking cancellation with optimistic UI updates
  - Status tracking (CONFIRMED, CANCELLED, PENDING, COMPLETED)
  - Reference number tracking for each booking
- ✅ **User Profile**: Profile management with theme preferences
- ✅ **Theme System**: 4 professional themes (Blue, Green, Purple, Orange)

### 🛠️ Admin Features
- ✅ **Comprehensive Dashboard**: Statistics overview with total bookings, revenue, and active turfs
- ✅ **Advanced Turf Management**:
  - Complete CRUD operations for turfs
  - Image upload and management
  - Pricing and availability management
  - Slot-specific pricing configuration
  - Skip to slots feature for quick slot management
- ✅ **Complete Booking Management**:
  - View all bookings with enhanced filtering (All, Confirmed, Pending, Cancelled, Completed)
  - Detailed booking cards with customer information
  - Reference number tracking and slot breakdown
  - Individual slot pricing display
- ✅ **Slot Management**: 24-hour slot availability with individual pricing control
- ✅ **Clean UI**: Tab headers removed for seamless navigation experience

## Tech Stack

- **Framework**: React Native with Expo SDK 51+
- **Language**: TypeScript 5.0+
- **Navigation**: React Navigation v6 (Stack & Bottom Tabs)
- **State Management**: React Context API for auth and theme management
- **API Client**: Axios with interceptors for authentication
- **Storage**: AsyncStorage for persistent data
- **UI Components**: Custom components with comprehensive styling system
- **Icons**: Expo Vector Icons (Ionicons)
- **Date Handling**: date-fns for date formatting and manipulation
- **OTP Input**: react-native-otp-entry for secure OTP verification
- **Notifications**: react-native-toast-message for user feedback
- **Calendar**: Custom calendar component with date restrictions
- **Animations**: React Native Animated API with parallax effects
- **Platform**: iOS and Android optimized with platform-specific code

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo Go app (for testing on physical device)
- iOS Simulator or Android Emulator (optional)

## Installation

1. **Navigate to the project directory:**
   ```bash
   cd TurfBookingApp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator:**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser

## Project Structure

```
TurfBookingApp/
├── App.tsx                 # Main app entry point with theme provider
├── app.json               # Expo configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies and scripts
├── assets/                # App icons and splash screens
│   ├── icon.png
│   ├── adaptive-icon.png
│   ├── splash-icon.png
│   └── favicon.png
└── src/
    ├── navigation/         # Navigation configuration
    │   ├── AppNavigator.tsx      # Main app navigation logic
    │   ├── AuthNavigator.tsx     # Authentication flow
    │   ├── UserNavigator.tsx     # User bottom tab navigation
    │   └── AdminNavigator.tsx    # Admin navigation with tab headers removed
    ├── screens/            # Application screens
    │   ├── auth/
    │   │   ├── PhoneEntryScreen.tsx      # Phone number entry with validation
    │   │   ├── OTPVerificationScreen.tsx # OTP verification with auto-detection
    │   │   └── SetNameScreen.tsx         # Name setup for new users
    │   ├── user/
    │   │   ├── TurfListScreen.tsx        # Enhanced turf listing with search
    │   │   ├── TurfDetailScreen.tsx      # Advanced turf details with booking
    │   │   ├── MyBookingsScreen.tsx      # Complete booking management
    │   │   ├── BookingSummaryScreen.tsx  # Booking confirmation with payment
    │   │   └── ProfileScreen.tsx         # User profile with theme selection
    │   └── admin/
    │       ├── DashboardScreen.tsx       # Admin dashboard with statistics
    │       ├── TurfManagementScreen.tsx  # Complete turf CRUD operations
    │       ├── AllBookingsScreen.tsx     # Enhanced booking management
    │       └── AdminMoreScreen.tsx       # Additional admin features
    ├── components/         # Reusable UI components
    │   ├── shared/
    │   │   ├── Button.tsx               # Enhanced button with animations
    │   │   ├── LoadingState.tsx         # Loading states for async operations
    │   │   ├── EmptyState.tsx           # Empty state with icons and messages
    │   │   ├── StatusBadge.tsx          # Status badges with all booking states
    │   │   └── ThemeSelector.tsx        # Theme selection component
    │   ├── user/
    │   │   ├── TurfCard.tsx             # Turf listing cards
    │   │   ├── TimeSlotCard.tsx         # Interactive time slot selection
    │   │   ├── CustomCalendar.tsx       # Advanced calendar with restrictions
    │   │   └── BookingCard.tsx          # Booking display cards
    │   └── admin/
    │       ├── AdminTurfCard.tsx        # Admin turf management cards
    │       └── StatCard.tsx             # Dashboard statistics cards
    ├── services/           # API and external services
    │   └── api.ts                       # Comprehensive API client with all endpoints
    ├── contexts/           # React Context providers
    │   ├── AuthContext.tsx              # Authentication state management
    │   └── ThemeContext.tsx             # Theme system management
    ├── types/              # TypeScript type definitions
    │   └── index.ts                     # All interface definitions
    ├── constants/          # App constants and configuration
    │   ├── colors.ts                    # Color schemes for all themes
    │   └── config.ts                    # API endpoints and app config
    └── utils/              # Utility functions
        ├── phoneUtils.ts                # Phone number formatting utilities
        ├── paymentUtils.ts              # Payment simulation utilities
        ├── helpers.ts                   # General helper functions
        └── constants.ts                 # App-wide constants
```

## API Integration

The app integrates with a comprehensive backend API at:
```
http://turfbackend-env.eba-yrja2qmi.ap-south-1.elasticbeanstalk.com
```

### Key API Endpoints:
- **Authentication**: `/auth/login`, `/auth/verify-otp`, `/auth/set-name`
- **Turfs**: `/turfs`, `/turfs/{id}`, `/turfs/{id}/lowest-price`
- **Slot Availability**: `/turf-slots/{turfId}/availability?date={date}`
- **User Bookings**: `/user/bookings` (GET, POST, DELETE)
- **Admin Operations**: `/admin/turfs`, `/admin/bookings`, `/admin/dashboard`

### Features:
- **Real-time Data**: Live slot availability and pricing
- **Authentication**: JWT token-based authentication with auto-refresh
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Optimistic Updates**: Immediate UI updates for better user experience

You can change the API base URL in `src/constants/config.ts`.

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator  
- `npm run web` - Run on web browser
- `npx expo start -c` - Clear cache and start development server
- `npx expo install` - Install Expo-compatible dependencies

## Key Features Implementation

### 🎨 **Theme System**
- 4 professional color schemes: Blue, Green, Purple, Orange
- System-wide theme consistency across all components
- User preference persistence with AsyncStorage
- Real-time theme switching without app restart

### 📅 **Advanced Booking System**
- **Smart Time Slot Management**: 24-hour slots (00:00-23:00) with real-time availability
- **Past Time Prevention**: Automatically disables expired slots for today's date
- **Individual Slot Pricing**: Each slot can have different pricing
- **Chronological Ordering**: Slots displayed in proper time sequence
- **Multi-slot Selection**: Users can book multiple consecutive or separate slots

### 🎭 **Enhanced UI/UX**
- **Parallax Image Galleries**: Smooth scrolling effects with multiple images
- **Platform Optimization**: iOS and Android specific optimizations
- **Loading States**: Skeleton loaders and smooth transitions
- **Error Handling**: User-friendly error messages with retry options
- **Responsive Design**: Adapts to different screen sizes and orientations

### 💳 **Payment Simulation**
- **Mock Payment Processing**: Simulates real payment flow
- **Multiple Payment Methods**: Credit Card, Debit Card, UPI simulation
- **Payment Details Generation**: Random but realistic payment information
- **Transaction References**: Unique booking reference numbers

### 📱 **Mobile-First Features**
- **Direct Phone Calls**: Tap-to-call turf contact numbers
- **Optimized Scrolling**: Smooth performance on both platforms
- **Safe Area Handling**: Proper notch and status bar management
- **Gesture Navigation**: Intuitive touch interactions

## Building for Production

### Using EAS (Expo Application Services)

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure project:**
   ```bash
   eas build:configure
   ```

4. **Build for Android:**
   ```bash
   eas build --platform android
   ```

5. **Build for iOS:**
   ```bash
   eas build --platform ios
   ```

## Testing

### 🧪 Comprehensive Testing Scenarios

#### Authentication Flow
- [ ] Phone number validation with Indian number format
- [ ] OTP verification with auto-detection
- [ ] New user name setup flow
- [ ] Token persistence and auto-login

#### User Booking Flow  
- [ ] Turf listing with search and filters
- [ ] Turf detail view with image gallery
- [ ] Calendar date selection with restrictions
- [ ] Time slot selection with past time prevention
- [ ] Multi-slot booking with cost calculation
- [ ] Payment simulation flow
- [ ] Booking confirmation and reference generation

#### Admin Management
- [ ] Dashboard statistics display
- [ ] Turf creation with image upload
- [ ] Slot pricing management
- [ ] Booking overview with filtering
- [ ] Theme switching across admin panels

#### Cross-Platform Testing
- [ ] Test on iOS devices (iPhone 12+)
- [ ] Test on Android devices (Android 8+)
- [ ] Test on different screen sizes (phones, tablets)
- [ ] Test theme switching on both platforms
- [ ] Test keyboard handling and form interactions

#### Performance Testing
- [ ] Image loading and caching
- [ ] Smooth scrolling with large lists
- [ ] API response handling and error states
- [ ] Memory usage with multiple bookings

## Future Enhancements

### 🚀 Planned Features
- [ ] **Push Notifications**: Real-time booking confirmations and reminders
- [ ] **Maps Integration**: Interactive maps for turf locations with directions
- [ ] **Advanced Search**: Filters by location, price range, sport type, ratings
- [ ] **Social Features**: User reviews, ratings, and photo sharing
- [ ] **Payment Gateway**: Integration with Razorpay, Stripe, or PayU
- [ ] **Multi-language Support**: Hindi, Tamil, Telugu, and other regional languages
- [ ] **Offline Mode**: Local caching for core functionality
- [ ] **Weather Integration**: Weather information for outdoor turfs

### 🔧 Technical Improvements
- [ ] **Performance Optimization**: Image optimization and lazy loading
- [ ] **Analytics Integration**: User behavior tracking with Firebase Analytics
- [ ] **Crash Reporting**: Integration with Sentry or Crashlytics
- [ ] **Code Splitting**: Optimize bundle size for faster loading
- [ ] **Accessibility**: Screen reader support and accessibility improvements
- [ ] **CI/CD Pipeline**: Automated testing and deployment
- [ ] **E2E Testing**: Comprehensive automated testing with Detox

### 🎨 UI/UX Enhancements
- [ ] **Dark Mode**: Complete dark theme implementation
- [ ] **Custom Animations**: Micro-interactions and page transitions
- [ ] **Gesture Navigation**: Swipe gestures for common actions
- [ ] **Voice Search**: Voice-powered turf search
- [ ] **AR Integration**: Augmented reality turf preview

## Troubleshooting

### 🔧 Common Issues and Solutions

#### Metro Bundler Issues
```bash
# Clear Metro cache
npx expo start -c

# Reset Metro cache completely  
npx expo start --clear
```

#### Dependencies Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Fix Expo dependencies
npx expo install --fix
```

#### iOS Simulator Issues
```bash
# Run iOS with specific simulator
npx expo run:ios --simulator="iPhone 14"

# Clear iOS build cache
npx expo run:ios --clear
```

#### Android Build Issues
```bash
# Ensure Android SDK is properly installed
npx expo run:android --clear

# Check Android environment
npx @react-native-community/cli doctor
```

#### API Connection Issues
- Check network connectivity
- Verify API endpoint in `src/constants/config.ts`
- Check if backend server is running
- Verify authentication tokens are not expired

#### Theme Issues
- Clear AsyncStorage: `npx expo r --clear`
- Reset theme preference in Profile screen
- Check theme persistence in `ThemeContext.tsx`

#### Performance Issues
- Enable Hermes engine for better performance
- Optimize images for mobile devices
- Use `getSize` for dynamic image sizing
- Implement proper list virtualization for large datasets

## Contributing

We welcome contributions to improve the Turf Booking App! Here's how you can help:

### 🤝 How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/TurfBookingApp.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow TypeScript best practices
   - Maintain consistent code formatting
   - Add comments for complex logic
   - Test on both iOS and Android

4. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```

5. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### 📋 Contribution Guidelines

- **Code Style**: Follow existing TypeScript and React Native patterns
- **Testing**: Test your changes on both platforms
- **Documentation**: Update README if you add new features
- **API Changes**: Document any new API endpoints or changes
- **Theme Compatibility**: Ensure new UI works with all 4 themes

### 🎯 Areas for Contribution

- Bug fixes and performance improvements
- New features and enhancements
- UI/UX improvements
- Documentation updates
- Test coverage improvements
- Accessibility enhancements

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For issues, questions, or contributions:

- **Create an Issue**: [GitHub Issues](https://github.com/yourusername/TurfBookingApp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/TurfBookingApp/discussions)
- **Email**: your.email@example.com

## Acknowledgments

- Built with ❤️ using React Native and Expo
- Icons provided by Expo Vector Icons
- UI inspired by modern sports booking applications
- Thanks to the React Native community for continuous support

---

**Made with ❤️ for sports enthusiasts and developers**
