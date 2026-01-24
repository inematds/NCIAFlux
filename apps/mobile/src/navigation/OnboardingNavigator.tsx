import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DiscoveryScreen } from '../screens/discovery/DiscoveryScreen';
import { DiscoveryResultScreen } from '../screens/discovery/DiscoveryResultScreen';
import { PlanSelectionScreen } from '../screens/onboarding/PlanSelectionScreen';

export type OnboardingStackParamList = {
  Discovery: undefined;
  DiscoveryResult: { profileId: string };
  PlanSelection: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Discovery" component={DiscoveryScreen} />
      <Stack.Screen name="DiscoveryResult" component={DiscoveryResultScreen} />
      <Stack.Screen name="PlanSelection" component={PlanSelectionScreen} />
    </Stack.Navigator>
  );
}
