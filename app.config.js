module.exports = {
  expo: {
    name: 'Flux',
    slug: 'flux-app',
    version: '1.1.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'fluxapp',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0A0A0F',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.fluxcycle.app',
      googleServicesFile: process.env.GOOGLE_SERVICES_INFO_PLIST ?? './GoogleService-Info.plist',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSUserTrackingUsageDescription:
          'This allows Flux to deliver more relevant content and measure the effectiveness of the features you use. Your data is never sold.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#0A0A0F',
      },
      package: 'com.fluxcycle.app',
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          resizeMode: 'contain',
          backgroundColor: '#0A0A0F',
        },
      ],
      'expo-localization',
      [
        'expo-notifications',
        {
          icon: './assets/images/icon.png',
          color: '#2563EB',
        },
      ],
      'expo-secure-store',
      'expo-font',
      [
        'expo-tracking-transparency',
        {
          userTrackingPermission:
            'This allows Flux to deliver more relevant content and measure the effectiveness of the features you use. Your data is never sold.',
        },
      ],
      '@react-native-firebase/app',
    ],
    extra: {
      eas: {
        projectId: '95419e85-708b-4512-98c0-a42043d82b34',
      },
    },
    owner: 'cashin31',
  },
};
