import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import { COLORS, CheckInType } from '@nciaflux/shared';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { PlanScreen } from '../screens/main/PlanScreen';
import { ChatScreen } from '../screens/main/ChatScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { CrisisModeScreen } from '../screens/main/CrisisModeScreen';
import { FocusBlockScreen } from '../screens/main/FocusBlockScreen';
import { TaskDetailScreen } from '../screens/main/TaskDetailScreen';
import { CheckInScreen } from '../screens/main/CheckInScreen';
import { ReportsScreen } from '../screens/main/ReportsScreen';
import { NotificationSettingsScreen } from '../screens/main/NotificationSettingsScreen';
import { ReportsLibraryScreen } from '../screens/main/ReportsLibraryScreen';
import { EducationalContentScreen } from '../screens/main/EducationalContentScreen';
import { CommunityScreen } from '../screens/main/CommunityScreen';
import { TeamDetailScreen } from '../screens/main/TeamDetailScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  Plan: undefined;
  Chat: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  CrisisMode: undefined;
  FocusBlock: { taskId?: string };
  TaskDetail: { taskId: string };
  CheckIn: { type?: CheckInType };
  Reports: undefined;
  NotificationSettings: undefined;
  ReportsLibrary: undefined;
  EducationalContent: undefined;
  Community: undefined;
  TeamDetail: { teamId: string };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '🏠',
    Plan: '📋',
    Chat: '💬',
    Profile: '👤',
  };

  return (
    <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.6 }}>
      {icons[name]}
    </Text>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: COLORS.primary.main,
        tabBarInactiveTintColor: COLORS.neutral.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.neutral.white,
          borderTopColor: COLORS.neutral.border,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Início' }}
      />
      <Tab.Screen
        name="Plan"
        component={PlanScreen}
        options={{ tabBarLabel: 'Plano' }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{ tabBarLabel: 'Chat' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

export function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="CrisisMode"
        component={CrisisModeScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="FocusBlock"
        component={FocusBlockScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen
        name="CheckIn"
        component={CheckInScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen name="ReportsLibrary" component={ReportsLibraryScreen} />
      <Stack.Screen name="EducationalContent" component={EducationalContentScreen} />
      <Stack.Screen name="Community" component={CommunityScreen} />
      <Stack.Screen name="TeamDetail" component={TeamDetailScreen} />
    </Stack.Navigator>
  );
}
