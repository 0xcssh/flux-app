import 'react-native-reanimated';

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as SplashScreen from 'expo-splash-screen';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import './i18n';
import { initAnalytics, track, AnalyticsEvents } from './lib/analytics';
import { initNotificationHandler } from './lib/notifications';
import { requestTrackingPermission, hasAskedForTrackingPermission } from './lib/tracking';
import { useSettingsStore } from './store/settingsStore';
import { useSmartReminders } from './hooks/useNotifications';
import { darkPalette } from './theme/colors';
import { ErrorBoundary } from './components/shared/ErrorBoundary';

// --- ALL screens lazy loaded ---
const WelcomeScreen = React.lazy(() => import('./app/(onboarding)/welcome'));
const CircadianScreen = React.lazy(() => import('./app/(onboarding)/circadian'));
const InfradianScreen = React.lazy(() => import('./app/(onboarding)/infradian'));
const QuizScreen = React.lazy(() => import('./app/(onboarding)/quiz'));
const SetupScreen = React.lazy(() => import('./app/(onboarding)/setup'));
const TrialScreen = React.lazy(() => import('./app/(onboarding)/trial'));

const LoginScreen = React.lazy(() => import('./app/(auth)/login'));
const SignupScreen = React.lazy(() => import('./app/(auth)/signup'));
const ForgotPasswordScreen = React.lazy(() => import('./app/(auth)/forgot-password'));

const DashboardScreen = React.lazy(() => import('./app/(tabs)/index'));
const CycleScreen = React.lazy(() => import('./app/(tabs)/cycle'));
const LogScreen = React.lazy(() => import('./app/(tabs)/log'));
const InsightsScreen = React.lazy(() => import('./app/(tabs)/insights'));
const ProfileScreen = React.lazy(() => import('./app/(tabs)/profile'));

const PaywallScreen = React.lazy(() => import('./app/(modals)/paywall'));
const ArticleScreen = React.lazy(() => import('./app/(modals)/article/[id]'));
const PdfPreviewScreen = React.lazy(() => import('./app/(modals)/pdf-preview'));
const NoFapDetailsScreen = React.lazy(() => import('./app/(modals)/nofap-details'));
const ActionPlanModal = React.lazy(() => import('./app/(modals)/action-plan'));

// --- Navigators ---
const RootStack = createStackNavigator();
const OnboardingStack = createStackNavigator();
const AuthStack = createStackNavigator();
const Tab = createBottomTabNavigator();

// --- Suspense wrapper ---
function withSuspense(LazyComponent: React.LazyExoticComponent<any>) {
  return function SuspenseWrapper(props: any) {
    return (
      <React.Suspense fallback={<View style={{ flex: 1, backgroundColor: '#0A0A0F' }} />}>
        <LazyComponent {...props} />
      </React.Suspense>
    );
  };
}

// --- Tab Bar Icon ---
function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={22} style={{ marginBottom: -3 }} {...props} />;
}

// --- Nested Navigators ---
function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false, gestureEnabled: true }}>
      <OnboardingStack.Screen name="Welcome" component={withSuspense(WelcomeScreen)} />
      <OnboardingStack.Screen name="Circadian" component={withSuspense(CircadianScreen)} />
      <OnboardingStack.Screen name="Infradian" component={withSuspense(InfradianScreen)} />
      <OnboardingStack.Screen name="Quiz" component={withSuspense(QuizScreen)} />
      <OnboardingStack.Screen name="Setup" component={withSuspense(SetupScreen)} />
      <OnboardingStack.Screen name="Trial" component={withSuspense(TrialScreen)} />
    </OnboardingStack.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#0A0A0F' } }}>
      <AuthStack.Screen name="Login" component={withSuspense(LoginScreen)} />
      <AuthStack.Screen name="Signup" component={withSuspense(SignupScreen)} />
      <AuthStack.Screen name="ForgotPassword" component={withSuspense(ForgotPasswordScreen)} />
    </AuthStack.Navigator>
  );
}

function NotificationsManager() {
  useSmartReminders();
  return null;
}

function MainTabNavigator() {
  const { t } = useTranslation('common');

  return (
    <Tab.Navigator screenOptions={{
      tabBarActiveTintColor: darkPalette.primary,
      tabBarInactiveTintColor: darkPalette.textTertiary,
      tabBarStyle: tabStyles.tabBar,
      tabBarLabelStyle: tabStyles.tabBarLabel,
      headerShown: false,
    }}>
      <Tab.Screen name="Dashboard" component={withSuspense(DashboardScreen)}
        options={{ tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} /> }}
        listeners={{ tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }} />
      <Tab.Screen name="Cycle" component={withSuspense(CycleScreen)}
        options={{ tabBarIcon: ({ color }) => <TabBarIcon name="refresh" color={color} /> }}
        listeners={{ tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }} />
      <Tab.Screen name="Log" component={withSuspense(LogScreen)}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[tabStyles.logIcon, focused && tabStyles.logIconActive]}>
              <FontAwesome name="plus" size={24} color={focused ? '#FFFFFF' : color} />
            </View>
          ),
          tabBarLabel: () => null,
        }}
        listeners={{ tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }} />
      <Tab.Screen name="Insights" component={withSuspense(InsightsScreen)}
        options={{ tabBarIcon: ({ color }) => <TabBarIcon name="lightbulb-o" color={color} /> }}
        listeners={{ tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }} />
      <Tab.Screen name="Profile" component={withSuspense(ProfileScreen)}
        options={{ tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} /> }}
        listeners={{ tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }} />
    </Tab.Navigator>
  );
}

// --- Root App ---
SplashScreen.preventAutoHideAsync();

export default function App() {
  const onboardingSeen = useSettingsStore((s) => s.onboardingSeen);
  const hydrated = useSettingsStore((s) => s._hydrated);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.getItem('flux_installed').then((value) => {
      if (!value) {
        useSettingsStore.getState().setOnboardingSeen(false);
        AsyncStorage.setItem('flux_installed', '1');
      }
      SplashScreen.hideAsync();
    }).catch(() => {
      SplashScreen.hideAsync();
    });
  }, [hydrated]);

  useEffect(() => {
    try {
      initAnalytics();
      track(AnalyticsEvents.APP_OPENED);
    } catch (e) { console.error('[Analytics] init failed:', e); }
    try { initNotificationHandler(); } catch (e) { console.error('[Notifications] init failed:', e); }
  }, []);

  useEffect(() => {
    if (!hydrated || !onboardingSeen) return;
    (async () => {
      const asked = await hasAskedForTrackingPermission();
      if (asked) return;
      await new Promise((r) => setTimeout(r, 1500));
      await requestTrackingPermission();
    })();
  }, [hydrated, onboardingSeen]);

  if (!hydrated) {
    return <View style={{ flex: 1, backgroundColor: '#0A0A0F' }} />;
  }

  return (
    <ErrorBoundary>
    <React.Suspense fallback={<View style={{ flex: 1, backgroundColor: '#0A0A0F' }} />}>
      <NavigationContainer theme={{
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: darkPalette.primary,
          background: darkPalette.background,
          card: darkPalette.background,
          text: darkPalette.text,
          border: darkPalette.border,
        },
      }}>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {!onboardingSeen ? (
            <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
          ) : (
            <RootStack.Screen name="MainTabs">
              {() => (
                <>
                  <NotificationsManager />
                  <MainTabNavigator />
                </>
              )}
            </RootStack.Screen>
          )}
          <RootStack.Screen name="Auth" component={AuthNavigator} />
          <RootStack.Group screenOptions={{ presentation: 'modal', headerShown: false }}>
            <RootStack.Screen name="Paywall" component={withSuspense(PaywallScreen)} />
            <RootStack.Screen name="Article" component={withSuspense(ArticleScreen)} />
            <RootStack.Screen name="PdfPreview" component={withSuspense(PdfPreviewScreen)} />
            <RootStack.Screen name="NoFapDetails" component={withSuspense(NoFapDetailsScreen)} />
            <RootStack.Screen name="ActionPlan" component={withSuspense(ActionPlanModal)} />
          </RootStack.Group>
        </RootStack.Navigator>
      </NavigationContainer>
    </React.Suspense>
    </ErrorBoundary>
  );
}

// --- Tab Styles ---
const tabStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: darkPalette.background,
    borderTopWidth: 1,
    borderTopColor: darkPalette.border,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  logIcon: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center', marginTop: -16,
    backgroundColor: darkPalette.surface, borderWidth: 2, borderColor: darkPalette.border,
  },
  logIconActive: {
    backgroundColor: darkPalette.primary, borderColor: darkPalette.primary,
    shadowColor: darkPalette.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 12, elevation: 8,
  },
});
