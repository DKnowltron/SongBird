import { Tabs } from 'expo-router';
import { colors } from '../../src/lib/theme';
import { Text } from 'react-native';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '◻',
    Tracks: '♫',
    Record: '●',
    Alerts: '◈',
    Profile: '○',
  };
  return (
    <Text style={{ fontSize: label === 'Record' ? 28 : 20, color: focused ? colors.primary : colors.mutedForeground }}>
      {icons[label] || '•'}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: { borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tracks"
        options={{
          title: 'Tracks',
          tabBarIcon: ({ focused }) => <TabIcon label="Tracks" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: 'Record',
          tabBarIcon: ({ focused }) => <TabIcon label="Record" focused={focused} />,
          tabBarItemStyle: { marginTop: -4 },
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ focused }) => <TabIcon label="Alerts" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon label="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
