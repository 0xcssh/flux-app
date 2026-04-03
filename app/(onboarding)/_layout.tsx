import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="circadian" />
      <Stack.Screen name="infradian" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="setup" />
      <Stack.Screen name="trial" />
    </Stack>
  );
}
