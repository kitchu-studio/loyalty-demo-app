import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../auth/AuthContext';
import { AssistantScreen } from '../screens/AssistantScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { RewardsScreen } from '../screens/RewardsScreen';
import { StaffScreen } from '../screens/StaffScreen';
import { colors, fonts } from '../theme';

type IconName = keyof typeof Ionicons.glyphMap;

const Tab = createBottomTabNavigator();

function icon(name: IconName) {
  return ({ color, size }: { color: string; size: number }) => <Ionicons name={name} size={size} color={color} />;
}

export function Tabs() {
  const { user } = useAuth();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 12 },
        tabBarStyle: { backgroundColor: colors.paper, borderTopColor: colors.rule },
      }}
    >
      <Tab.Screen name="การ์ดแต้ม" component={HomeScreen} options={{ tabBarIcon: icon('card-outline') }} />
      <Tab.Screen name="ของรางวัล" component={RewardsScreen} options={{ tabBarIcon: icon('gift-outline') }} />
      <Tab.Screen
        name="ถามร้าน"
        component={AssistantScreen}
        options={{ tabBarIcon: icon('chatbubble-ellipses-outline') }}
      />
      {user?.is_admin && (
        <Tab.Screen name="หน้าร้าน" component={StaffScreen} options={{ tabBarIcon: icon('storefront-outline') }} />
      )}
    </Tab.Navigator>
  );
}
