import React from 'react';
import { StyleSheet, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { lightPalette } from '@/theme/colors';

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
        tabBarActiveTintColor: lightPalette.primary,
        tabBarInactiveTintColor: lightPalette.textTertiary,
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
      />
      <Tabs.Screen
        name="cycle"
        options={{
          title: t('nav.cycle'),
          headerTitle: t('nav.cycle'),
          headerStyle: styles.header,
          tabBarIcon: ({ color }) => <TabBarIcon name="refresh" color={color} />,
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: t('nav.log'),
          headerTitle: t('nav.log'),
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.logIconContainer,
                focused && styles.logIconContainerActive,
              ]}
            >
              <FontAwesome
                name="plus-circle"
                size={28}
                color={focused ? '#FFFFFF' : color}
              />
            </View>
          ),
          tabBarLabelStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: t('nav.insights'),
          headerTitle: t('nav.insights'),
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="lightbulb-o" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('nav.profile'),
          headerTitle: t('nav.profile'),
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
      {/* Hide the old two.tsx route */}
      <Tabs.Screen
        name="two"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: lightPalette.surface,
    borderTopWidth: 1,
    borderTopColor: lightPalette.border,
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  header: {
    backgroundColor: lightPalette.background,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: lightPalette.text,
  },
  logIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -12,
  },
  logIconContainerActive: {
    backgroundColor: lightPalette.primary,
    shadowColor: lightPalette.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
