import FoodResultItem from '@/components/FoodResultItem';
import { THEME } from '@/constants/theme';
import { useFood } from '@/storage';
import { FontAwesome } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Audio } from 'expo-av';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FOOD_DATABASE } from '../constants/Food-data';

// Capitalize Food Names
function formatFoodName(text: string){
    if (!text) return "Uknown Food";
    return text
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Check value and make the macros have one decimal
function parseMacro(value: any){
    if(value === undefined || value === null || isNaN(value)) return 0;
    const rawNumber = Number(value);
    return Math.round(rawNumber * 10) / 10;
}

export default function AddFoodScreen(){

    const {addMeal, meals} = useFood();
    const uniqueRecentFoods = Array.from(
        new Map(meals.map(meal => [meal.name, meal])).values()
    )
   const router = useRouter(); 
   const {selectedCategory} = useLocalSearchParams();
   const [searchQuery, setSearchQuery] = useState('');
   const [suggestions, setSuggestions] = useState<any[]>([]);

   const handleTextChange = (text: any) => {
    setSearchQuery(text);
    if (text.trim() === ''){
        setSuggestions([]);
        return;
    }
    const matches = uniqueRecentFoods.filter((meal) =>
        meal.name.toLocaleLowerCase().includes(text.toLowerCase())
    );
    setSuggestions(matches.slice(0,4));
   }

   const handleSuggestionClick =(meal: any)=> {
    router.push({
        pathname: '/add-food-setting',
        params: {
            id: Date.now().toString(),
            fatSecretId: meal.fatSecretId,
            name: meal.name,
            brand: meal.brand,
            calories: meal.calories,
            baseCalories: meal.baseCalories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            baseProtein: meal.baseProtein,
            baseCarbs: meal.baseCarbs,
            baseFat: meal.baseFat,
            unitName: meal.unitName,
            originalGramWeight: meal.originalGramWeight,
            servingName: meal.servingName,
            servingSize: meal.servingSize,
            isEditing: 'false'
        }
    });
   };
   
   //Searching Food
   const filteredFood = FOOD_DATABASE.filter((item) =>{
    const itemName = item.name.toLowerCase();
    const userTyped = searchQuery.toLowerCase();
    
    return itemName.includes(userTyped);
   });


   // Barcode Scanning Variables
   const [cameraPermission, requestCameraPermission] = useCameraPermissions();
   const [isScanning, setIsScanning] = useState(false);
   const [isLookingUp, setIsLookingUp] = useState(false);
   const scanLock = useRef(false);


   // --- Scanner Animation Engine ---

   const scanLineAnim = useRef(new Animated.Value(0)).current;

   useEffect(()=>{
    if(isScanning){
        Animated.loop(
          Animated.sequence([
            Animated.timing(scanLineAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.ease)
            }),
            Animated.timing(scanLineAnim, {
                toValue: 0,
                duration: 2000,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.ease)
            })
          ])  
        ).start();
    } else {
        scanLineAnim.setValue(0);
    }
   }, [isScanning]);

   const scanLineTranslateY = scanLineAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 248]
   });

   // Open Camera
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
    
   // USDA API for Search Feature
   const [searchResults, setSearchResults] = useState<any[]>([]);
   const [isSearchingText, setIsSearchingText] = useState(false);
   const [AISpinner, setAISpinner] = useState(false)
   async function fallbackToAI(query: string){
        try{
            setAISpinner(true)
            console.log("Asking AI to estimate:", query);
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
                            content: "You are an expert nutritionist API. The user searched for a food that is missing from the database. Estimate the macros for exactly 100g of this food. Respond ONLY with a valid JSON object using these exact keys: name (string), calories (number), protein (number), carbs (number), fat (number). Make the name clean and capitalized"
                        },
                        {role: 'user', content: query}
                    ],
                    temperature: 0.2
                })
            });
            const data = await response.json();
            const macroData = JSON.parse(data.choices[0].message.content);

            const aiResult = {
               id: "AI-" + Date.now().toString(),
               name: formatFoodName(macroData.name) + " (AI Estimate)",
               brand: "AI Generated",
               calories: Math.round(macroData.calories),
               protein: parseMacro(macroData.protein) / 100,
               carbs: parseMacro(macroData.carbs) / 100,
               fat: parseMacro(macroData.fat) / 100,
               baseCalories: macroData.calories / 100,
               servingSize: 100,
               servingName: "100g",
               quantity: 1,
               mealType: (selectedCategory as string) || "Breakfast",
               date: dayjs().format('YYYY-MM-DD')
           };
           router.push({
            pathname: '/add-food-setting',
            params: {
                ...aiResult,
                selectedCategory
            }
           });
        } catch (error) {
            console.error("AI Fallback failed:", error);
            alert("AI could not estimate the food");
        } finally {
            setIsSearchingText(false)
            setAISpinner(false)
        }
   }
   async function searchFoodAPI(query: string){
        if (!query.trim()) return;

        setIsSearchingText(true);
        try {
            console.log("Searching FatSecret for:", query);
            const clientSecret = process.env.EXPO_PUBLIC_FS_CLIENT_SECRET;
            const clientId = process.env.EXPO_PUBLIC_FS_CLIENT_ID;
            

            if(!clientId || !clientSecret){
                alert("Missing FatSecret keys in .env!");
                    setIsSearchingText(false);
                    return;
            }
            const tokenResponse = await fetch('https://oauth.fatsecret.com/connect/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
            });
            
            if(!tokenResponse.ok){
                console.error("Auth failed:", await tokenResponse.text())
                alert("Server error from database.");
                setIsSearchingText(false);
                return;
            }

            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;
//
            const safeQuery = encodeURIComponent(query);
            const searchResponse = await fetch(`https://platform.fatsecret.com/rest/server.api?method=foods.search&search_expression=${safeQuery}&format=json&max_results=10&region=MX`, {
                method: 'GET',
                headers: {'Authorization': `Bearer ${accessToken}`}
            });

            const result = await searchResponse.json();
            console.log("FatSecret Raw Data:", JSON.stringify(result, null, 2));
//
            if(result.foods && result.foods.food){
                const foodArray  = Array.isArray(result.foods.food) ? result.foods.food : [result.foods.food];
                const formattedResults = foodArray.map((food: any)=> {
                    const desc = food.food_description || "";
                    
                    const calMatch = desc.match(/Calories:\s*([\d.]+)\s*kcal/i);
                    const fatMatch = desc.match(/Fat:\s*([\d.]+)\s*g/i);
                    const carbMatch = desc.match(/Carbs?:\s*([\d.]+)\s*g/i);
                    const proMatch = desc.match(/Protein:\s*([\d.]+)\s*g/i);
                    const servingMatch = desc.match(/Per\s*([\d.]+)\s*([a-zA-Z]+)/i)
                    const rawServingSize = servingMatch ? parseFloat(servingMatch[1]) : 100;
                    const rawServingName = servingMatch ? servingMatch[2] : 'g';

                    const rawCalories = calMatch ? parseFloat(calMatch[1]) : 0;
                    const rawFat = fatMatch ? parseFloat(fatMatch[1]) : 0;
                    const rawCarbs = carbMatch ? parseFloat(carbMatch[1]) : 0;
                    const rawProtein = proMatch ? parseFloat(proMatch[1]) : 0;

                    return {
                        id: food.food_id || Date.now().toString() + Math.random(),
                        name: formatFoodName(food.food_name || "Unknown Food"),
                        brand: formatFoodName(food.brand_name),
                        calories: Math.round(rawCalories),
                        protein: parseMacro(rawProtein),
                        carbs: parseMacro(rawCarbs),
                        fat: parseMacro(rawFat),
                        baseCalories: rawCalories,
                        servingSize: rawServingSize,
                        servingName: rawServingName,
                        quantity: 1,
                        mealType: (selectedCategory as string) || "Breakfast",
                        date: dayjs().format('YYYY-MM-DD')
                    };
                });
                setSearchResults(formattedResults);
            } else {
                alert("No foods found matching that search.");
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Text search failed:", error);
            alert("Network error while searching.");
        } finally{
            setIsSearchingText(false);
        }
   }
        
   // Scan the Barcode
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

                const servingGrams = parseFloat(product.serving_quantity) || 100;
                const servingText = product.serving_size || '100g';
                const rawBrand = product.brands ? product.brands.split(',')[0] : "Generic";
                const cleanBrand = formatFoodName(rawBrand);

                const scannedItem = {
                    id: Date.now().toString(),
                    name: formatFoodName(product.product_name || "Scanned Food"),
                    calories:cals100 / 100,
                    protein: protein100 / 100,
                    carbs: carbs100 / 100,
                    fat: fat100 / 100,
                    date: localDate,
                    baseCalories: cals100 / 100,
                    mealType: (selectedCategory as string) || "Breakfast",
                    servingSize: servingGrams,
                    servingName: servingText,
                    quantity: 1,
                    brand: cleanBrand
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

   // Transcribe Speech to Audio
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
                onChangeText={handleTextChange}
                value={searchQuery}
                returnKeyType = "search"
                onSubmitEditing={()=> searchFoodAPI(searchQuery)}
                selectTextOnFocus={true}
                />
                <View style={styles.glowLine}/>
            </View>
            {suggestions.length > 0 && (
                <View style={styles.suggestionBox}>
                    {suggestions.map((meal)=> (
                        <TouchableOpacity
                            key={meal.id}
                            style={styles.suggestionItem}
                            onPress={()=> handleSuggestionClick(meal)}
                        >
                            <Text style={styles.suggestionText}>{meal.name}</Text>
                            <Text style={styles.suggestionDetails}>{meal.brand} {meal.calories} kcal</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <Text style={styles.debugText}>SEARCHING FOR: {searchQuery.toUpperCase()}</Text>

        {/* Results*/}
            <ScrollView style={styles.resultsContainer}>
                {isSearchingText && <ActivityIndicator size='large' color='#00f2ff' style={{marginTop: 20}}/>}
                {!isSearchingText && searchResults.map((item) =>(
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
                            name= 'barcode'
                            size= {24}
                            color= "#00f2ff"
                        />
                    </TouchableOpacity>
                </View>

                {AISpinner && (
                    <View style={[StyleSheet.absoluteFillObject, {
                        backgroundColor: 'rgba(0, 26, 28, 0.8)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 999
                    }]}>
                        <ActivityIndicator size="large" color="#00f2ff"/>
                    </View>
                )}
                 
                <View style={{alignItems: 'center', marginBottom: 20}}>
                    {searchResults.length > 0 && !isSearchingText &&(
                    <TouchableOpacity style={styles.optionButtons} onPress={()=> fallbackToAI(searchQuery)}>
                            <Text style={[styles.buttonText, {fontSize: 15}]}>AI Estimate</Text>
                    </TouchableOpacity>
                    )}
                    
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
                    >
                        <View style={styles.scannerContainer}>
                            <View style={styles.scannerBox}>
                                <Animated.View 
                                    style={[styles.scannerLine, {transform: [{translateY: scanLineTranslateY}]}]}
                                />
                            </View>
                        </View>
                    </CameraView>

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
    suggestionBox: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 10,
        padding: 10,
        marginTop: 5,
        width: "100%",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
    },
    suggestionItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)'
    },
    suggestionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    suggestionDetails: {
        color: '#00f2ff',
        fontSize: 12,
        marginTop: 2,
    },

    scannerContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center'
    },
    scannerBox: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#00f2ff',
        backgroundColor: 'rgba(0, 242, 255, 0.05)',
        borderRadius: 15,
        overflow: 'hidden',
    },
    scannerLine: {
        width: '100%',
        height: 3,
        backgroundColor: '#00f2ff',
        shadowColor: '#00f2ff',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 5,
    },
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
