import FoodResultItem from '@/components/FoodResultItem';
import { THEME } from '@/constants/theme';
import { useFood } from '@/storage';
import { FontAwesome } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Audio } from 'expo-av';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FOOD_DATABASE } from '../constants/Food-data';

export default function AddFoodScreen(){
    const {addCalories} = useFood();

   const router = useRouter(); 
   const {selectedCategory} = useLocalSearchParams();
   const [searchQuery, setSearchQuery] = useState('');
   
   
   const filteredFood = FOOD_DATABASE.filter((item) =>{
    const itemName = item.name.toLowerCase();
    const userTyped = searchQuery.toLowerCase();
    
    return itemName.includes(userTyped);
   });


   // Barcode Scanning
   const [cameraPermission, requestCameraPermission] = useCameraPermissions();
   const [isScanning, setIsScanning] = useState(false);
   const [isLookingUp, setIsLookingUp] = useState(false);
   const scanLock = useRef(false);

   async function openScanner(){
    scanLock.current = false;
    if(!cameraPermission?.granted) {
        const permission = await requestCameraPermission();
        if(!permission.granted){
            alert("We need camera permission to scan barcodes!");
            return;
        }
    }
    setIsScanning(true);
   }
    
   function parseMacro(value: any){
        if(value === undefined || value === null || isNaN(value)) return 0;
        const rawNumber = Number(value);
        return Math.round(rawNumber * 10) / 10;
   }
   async function handleBarcodeScanned({data}: {data: string}){

        if(scanLock.current) return;
        scanLock.current = true;
        setIsLookingUp(true);

        try{
            console.log("Scanned Barcode:", data);
            const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${data}.json`);
            if(!response.ok){
                alert("This barcode isn't in the database yet!");
                setIsScanning(false);
                setIsLookingUp(false);
                scanLock.current = false;
                return;
            }
            const result = await response.json();

            if(result.status === 1){
                const product = result.product;
                const nutriments = product.nutriments;

                const localDate = dayjs().format('YYYY-MM-DD');

                const cals100 = parseMacro(nutriments['energy-kcal_100g'] || nutriments['energy-kcal']);
                const protein100 = parseMacro(nutriments.proteins_100g);
                const carbs100 = parseMacro(nutriments.carbohydrates_100g);
                const fat100 = parseMacro(nutriments.fat_100g);

                const scannedItem = {
                    id: Date.now().toString(),
                    name: `${product.product_name || "Scanned Food"}`,
                    calories:cals100 / 100,
                    protein: protein100 / 100,
                    carbs: carbs100 / 100,
                    fat: fat100 / 100,
                    date: localDate,
                    quantity: 100, 
                    baseCalories: cals100 / 100,
                    mealType: (selectedCategory as string) || "Breakfast"
                };
                
                setIsScanning(false);

                router.push({
                    pathname: '/add-food-setting',
                    params: {
                        ...scannedItem,
                        selectedCategory
                    }
                })
            } else {
                alert("Food not found in database! Try typing it or using your voice.");
                setIsScanning(false);
            } 
        } catch (error){
            console.error("Barcode lookup failed", error);
            alert("Network error while looking up barcode.");
            setIsScanning(false)
        } finally {
            setIsLookingUp(false);
        }
   }


   // Voice Recording Feature

   const [recording, setRecording] = useState<Audio.Recording | undefined>(undefined);
   const [permissionResponse, requestPermission] = Audio.usePermissions();
   const [isRecording, setIsRecording] = useState(false);

   const [isAnalyzing, setIsAnalyzing] = useState(false);
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
            name: macroData.name,
            calories: macroData.calories,
            protein: macroData.protein,
            carbs: macroData.carbs,
            fat: macroData.fat,
            date: localDate,
            baseCalories: macroData.calories / (macroData.quantity || 1),
            quantity: macroData.quantity || 1,
            mealType: (selectedCategory as string)|| 'Breakfast'
        };

        addCalories(newMeal);
        setIsAnalyzing(false)
        router.back();
        
    } catch (error){
        console.error("Failed to analyze macros", error);
        alert("AI couldn't figure out the macros. Try speaking clearer!");
        setIsAnalyzing(false);
    }
   }

    return(
 
        <View style={styles.container}>
                   {/*Back Button*/}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.backButton}onPress={()=> router.back()}>
                    <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
            </View>
                    {/*Header*/}
            <Text style={styles.title}>Add Food</Text>
                {/*Search Input*/}
            <View style={styles.inputContainer}>
                <TextInput style={styles.searchInput} 
                placeholder='Add Food' 
                placeholderTextColor= '#00f2ff'
                onChangeText={(text) => setSearchQuery(text)}
                value={searchQuery}
                />
                <View style={styles.glowLine}/>
            </View>

            <Text style={styles.debugText}>SEARCHING FOR: {searchQuery.toUpperCase()}</Text>

            <ScrollView style={styles.resultsContainer}>
                {filteredFood.map((item) =>(
                    <FoodResultItem
                    key={item.id}
                    item={item}
                    onPress={() => {
                        router.push({
                            pathname: '/add-food-setting',
                            params: {
                                ...item, selectedCategory
                            }
                        });
                    }}/>
                ))}
                <View style={{gap: 15, flexDirection: 'row', justifyContent: 'center'}}>
                    <TouchableOpacity style={styles.optionButtons} onPress={() => router.push({
                        pathname: '/custom-food',
                        params: {selectedCategory}
                    })}>
                        <Text style={[styles.buttonText, {fontSize: 15}]}>Custom Food?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style ={styles.optionButtons} 
                    onPress={recording ? stopRecording : startRecording}
                    disabled={isAnalyzing}
                    >
                        {isAnalyzing ? (
                            <ActivityIndicator size='small' color="#00f2ff"/>
                        ) : (
                        <FontAwesome
                            name= 'microphone'
                            size={24}
                            color={isRecording ? '#ff4444' : '#00f2ff'}
                        />)}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionButtons} onPress={openScanner}>
                        <FontAwesome        
                            name= 'camera'
                            size= {24}
                            color= "#00f2ff"
                        />
                    </TouchableOpacity>
                </View>
            </ScrollView>
            
            {/* Modal Camera Screen */}
            <Modal visible={isScanning} animationType='slide' presentationStyle='pageSheet'>
                <View style={{flex:1, backgroundColor: '#000', justifyContent: 'center'}}>
                    <CameraView
                        style={{flex: 1}}
                        facing='back'
                        onBarcodeScanned={isLookingUp ? undefined : handleBarcodeScanned}
                        barcodeScannerSettings={{
                            barcodeTypes: ['upc_a', 'upc_e', "ean8", 'ean13']
                        }}
                    />

                    {isLookingUp && (
                        <View style={[StyleSheet.absoluteFillObject, {backgroundColor: 'rgba(0,0,0,0.6)', justifyContent:"center", alignItems: 'center'}]}>
                            <ActivityIndicator size="large" color='#00f2ff'/>
                            <Text style={{color: "#00f2ff", marginTop: 10, fontWeight: 'bold'}}>Looking up food...</Text>
                        </View>
                    )}

                    <TouchableOpacity style={{position: 'absolute', top: 50, right: 20, backgroundColor: '#333', padding: 15, borderRadius: 50}}
                    onPress={()=> setIsScanning(false)}
                    >
                        <Text style={{color: '#fff', fontWeight: 'bold'}}>Close</Text>
                    </TouchableOpacity>

                </View>
            </Modal>
        </View>

    
)};
const styles = StyleSheet.create({
    optionButtons: {
        marginTop: 30,
        borderWidth: 1,
        borderStyle: 'dashed',
        padding: 15,
        borderColor: THEME.color.accent
    },
    resultText:{
        color: '#fff',
        fontSize: 18,
        fontWeight:'bold'
    },
    resultCalories: {
        color: '#00f2ff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    buttonContainer: {width: '100%',paddingHorizontal: 20, alignItems: 'flex-start'},
    inputContainer:{width:'80%', marginBottom: 20},
    resultItem:{
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#004042'
    },
    container: {flex: 1, backgroundColor: '#001a1c', alignItems: 'center', paddingTop: 5},
    title:{color: '#fff', fontSize:24, fontWeight: 'bold', letterSpacing: 2, marginBottom: 40},
    backButton:{borderColor: "#00f2ff", borderWidth: 1, padding: 15, borderStyle: 'dashed'},
    searchInput:{height:50, color: '#00f2ff', fontSize: 20, paddingHorizontal: 10},
    debugText: {color:'#005d61', fontSize: 12, marginTop: 10},
    buttonText: {color: '#00f2ff', fontWeight: 'bold'},
    resultsContainer:{
        width: '100%',
        marginTop: 20,
    },
    glowLine:{backgroundColor: '#00f2ff', height: 2, shadowColor: "#00f2ff", shadowRadius: 10, shadowOpacity: 1, elevation: 5},
});
