import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function TabLayout() {
  const [isBooting, setIsBooting] = useState(true)

  useEffect(()=>{
    setTimeout(()=>{
        setIsBooting(false);
    }, 3000)
  }, [])

  if(isBooting) {
    return (
        <View style={styles.bootContainer}>
            <Image source={require('@/assets/images/splash-icon.png')} style={styles.logo}/>
            <Text style={styles.bootText}>Loading...</Text>
            <ActivityIndicator size='large' color={'#00f2ff'}/>
        </View>
    )
  }
    
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00f2ff',
        tabBarInactiveTintColor: '#aaa',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
            backgroundColor: 'rgba(0, 242, 255, 0.3)',
            marginTop: 20,
            position: 'absolute',
            borderTopWidth: 1,
            borderColor: '#00f2ff',
            elevation: 0,
            
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Diary',
          tabBarIcon: ({color}) => <IconSymbol size={28} name="book.pages" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
    bootContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center'
    },
    bootText: {
        color: '#00f2ff',
        letterSpacing: 4,
        marginBottom: 20,
        fontSize: 14,
        fontWeight: 'bold',
        opacity: 0.8
    },
    logo: {
        width: 200,
        height: 200,
        marginBottom: 30,
        resizeMode: 'contain'
    }
})