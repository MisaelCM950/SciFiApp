import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { FoodProvider } from '../storage';


export default function RootLayout() {

  return (
    <GestureHandlerRootView style={{flex: 1}}>
    <FoodProvider>
      <Stack screenOptions={{headerShown: false}}>
        <Stack.Screen name = "(tabs)" />
        <Stack.Screen
        name='add-food'
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }}
        />
        <Stack.Screen
        name='add-food-setting'
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }}
        />
      </Stack>
    </FoodProvider>
    </GestureHandlerRootView>
  );
}
