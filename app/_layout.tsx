import { SoundContext } from '@/SoundContext';
import { useAudioPlayer } from 'expo-audio';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { FoodProvider } from '../storage';


export default function RootLayout() {
    const successSound = useAudioPlayer(require('@/assets/Sounds/Add-food.mp3'));
  return (
    <GestureHandlerRootView style={{flex: 1}}>
    <SoundContext.Provider value={{ 
        playSuccess: () => {
            console.log("Playing sound...");
            successSound.seekTo(0);
            successSound.play();
        } 
    }}>
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
    </SoundContext.Provider>
    </GestureHandlerRootView>
  );
}
