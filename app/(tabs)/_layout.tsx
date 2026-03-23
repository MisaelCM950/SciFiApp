import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00f2ff',
        tabBarInactiveTintColor: '#aaa',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {backgroundColor: '#134647'}
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Diary',
          tabBarIcon: ({color}) => <IconSymbol size={28} name="book.pages" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="1.magnifyingglass.ar" color={color} />,
        }}
      />
    </Tabs>
  );
}
