import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { FoodProvider } from '../storage';


export default function RootLayout() {

  return (
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
      </Stack>
    </FoodProvider>
  );
}
