import React from 'react';
import { StyleSheet, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { darkPalette } from '@/theme/colors';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  size?: number;
}) {
  return (
    <FontAwesome
      size={props.size ?? 22}
      style={{ marginBottom: -3 }}
      {...props}
    />
  );
}

export default function TabLayout() {
  const { t } = useTranslation('common');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: darkPalette.primary,
        tabBarInactiveTintColor: darkPalette.textTertiary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.dashboard'),
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
      />
      <Tabs.Screen
        name="cycle"
        options={{
          title: t('nav.cycle'),
          headerTitle: t('nav.cycle'),
          tabBarIcon: ({ color }) => <TabBarIcon name="refresh" color={color} />,
        }}
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: t('nav.log'),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.logIconContainer, focused && styles.logIconActive]}>
              <FontAwesome
                name="plus"
                size={24}
                color={focused ? '#FFFFFF' : color}
              />
            </View>
          ),
          tabBarLabelStyle: { display: 'none' },
        }}
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: t('nav.insights'),
          headerTitle: t('nav.insights'),
          tabBarIcon: ({ color }) => <TabBarIcon name="lightbulb-o" color={color} />,
        }}
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('nav.profile'),
          headerTitle: t('nav.profile'),
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: darkPalette.background,
    borderTopWidth: 1,
    borderTopColor: darkPalette.border,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 0,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  header: {
    backgroundColor: darkPalette.background,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: darkPalette.text,
  },
  logIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -16,
    backgroundColor: darkPalette.surface,
    borderWidth: 2,
    borderColor: darkPalette.border,
  },
  logIconActive: {
    backgroundColor: darkPalette.primary,
    borderColor: darkPalette.primary,
    shadowColor: darkPalette.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
});
