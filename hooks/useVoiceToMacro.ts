import { formatFoodName } from '@/app/helpers';
import { useFood } from '@/storage';
import dayjs from 'dayjs';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export function useVoiceToMacro() {

    const router = useRouter(); 
    const {addMeal, allMeals} = useFood();
    const {selectedCategory} = useLocalSearchParams();

   // Variables
   const [recording, setRecording] = useState<Audio.Recording | undefined>(undefined);
   const [permissionResponse, requestPermission] = Audio.usePermissions();
   const [isRecording, setIsRecording] = useState(false);
   const [isAnalyzing, setIsAnalyzing] = useState(false);

   // Prevent Microphone From Staying On
   useEffect(()=>{
        return() =>{
            if (recording){
                console.log("Cleaning up recording...");
                recording.stopAndUnloadAsync().catch((err)=>{});
            }
        };
   }, [recording]);
   
   async function startRecording(){
    try{
        if (recording){
            console.warn("Hardware is busy, cannot start a new recording.");
            return;
        }
        if (permissionResponse?.status !== 'granted'){
            await requestPermission();
        }
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
        });
        const {recording: newRecording} = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

        setRecording(newRecording);
        setIsRecording(true);
    } catch (error){
        console.error('Failed to start recording', error);
    }
   }

   async function stopRecording() {
    if (!recording) return;
    try{
         await recording.stopAndUnloadAsync();

         await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
         });

        const uri = recording.getURI();
        console.log('Recording stopped! The file is saved at: ', uri);

        setIsRecording(false);
        setRecording(undefined);

        if(uri) {
            setIsAnalyzing(true);
            await transcribeAudio(uri);
        }
    } catch (error){
        console.error("Failed to stop recording cleanly", error);
        setIsRecording(false); 
        setRecording(undefined);
    }
    
   }

   //API
   // Transcribe Speech to Audio with whisper-1
   async function transcribeAudio(audioUri: string){
    try{
        console.log("Sending to OpenAI...");
        const formData = new FormData();

        formData.append('file', {
            uri: audioUri,
            type: 'audio/m4a',
            name: 'audio.m4a',
        } as any);

        formData.append('model', 'whisper-1');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_KEY}`,
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        });

        const data = await response.json();
        
        if(data.text) {
            console.log("AI Heard:", data.text);
            await analyzeFoodText(data.text);
        } else{
            console.error('OpenAI Error:', data)
        }

    } catch (error) {
        console.error("Failed to transcribe", error)
        setIsAnalyzing(false)
    }
   }

   // Analyze Text with GPT-4o-mini
   async function analyzeFoodText(foodSentence: string){
    try{
        console.log("Asking AI for macros...");

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_KEY}`,
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: "You are an expert nutritionist API. The user will tell you what they ate and how much. You must estimate the macros for the ENTIRE amount mentioned. You must respond ONLY with a valid, flat JSON object. The JSON must have these exact keys: name (string), calories (number), protein (number), carbs (number), fat (number), quantity (number), unitName (string). If no quantity is mentioned, assume 1. The 'name' key should be the clean, simple name of the food without quantities (e.g. 'Pizza', not '3 slices of pizza')."
                    },
                    {
                        role: 'user',
                        content: foodSentence
                    }
                ],
                temperature: 0.2
            })
        });
        
        const data = await response.json();
        const aiReply = data.choices[0].message.content;
        const macroData = JSON.parse(aiReply);
        const localDate = dayjs().format('YYYY-MM-DD');
        
        console.log("AI Extracted Macros:", macroData)
        const newMeal = {
            id: Date.now().toString(),
            name: formatFoodName(macroData.name),
            calories: macroData.calories,
            protein: macroData.protein,
            carbs: macroData.carbs,
            fat: macroData.fat,
            date: localDate,
            baseCalories: macroData.calories / (macroData.quantity || 1),
            quantity: macroData.quantity || 1,
            mealType: (selectedCategory as string)|| 'Breakfast'
        };

        addMeal(newMeal);
        setIsAnalyzing(false)
        router.back();
        
    } catch (error){
        console.error("Failed to analyze macros", error);
        alert("AI couldn't figure out the macros. Try speaking clearer!");
        setIsAnalyzing(false);
    }
   }
   
   return{
        recording,
        isRecording,
        isAnalyzing,
        startRecording,
        stopRecording
   };
   }