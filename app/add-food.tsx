import BarcodeScannerModal from '@/components/BarcodeScannerModal';
import FoodResultItem from '@/components/FoodResultItem';
import { THEME } from '@/constants/theme';
import { useFoodSearch } from '@/hooks/useFoodSearch';
import { useVoiceToMacro } from '@/hooks/useVoiceToMacro';
import { useFood } from '@/storage';
import { FontAwesome } from '@expo/vector-icons';
import { useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function AddFoodScreen(){
    const router = useRouter(); 
    const {selectedCategory} = useLocalSearchParams();
// Brought in allMeals since app has been installed
    const {allMeals} = useFood();
// Created the variable to destroy all the duplicates
    const uniqueRecentFoods = Array.from(
        new Map(allMeals.map(meal => [meal.name, meal])).values()
    )
    
    const {
        searchQuery, suggestions, searchResults, isSearchingText, AISpinner, handleTextChange,
        searchFoodAPI, fallbackToAI
    } = useFoodSearch(uniqueRecentFoods, selectedCategory);
   
    const {startRecording, stopRecording, isRecording, isAnalyzing, recording} = useVoiceToMacro();

       // Open Camera
   const [cameraPermission, requestCameraPermission] = useCameraPermissions();
   const [isScanning, setIsScanning] = useState(false);
   
   async function openScanner(){
    if(!cameraPermission?.granted) {
        const permission = await requestCameraPermission();
        if(!permission.granted){
            alert("We need camera permission to scan barcodes!");
            return;
        }
    }
    setIsScanning(true);
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
            selectedCategory: selectedCategory,
            originalGramWeight: meal.originalGramWeight,
            servingName: meal.servingName,
            servingSize: meal.servingSize,
            isEditing: 'false'
        }
    });
   };



    return(
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.root}>
            <Image source={require('@/assets/images/hud-bg-add-food.png')} style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%' }]}
                contentFit='fill' cachePolicy='memory-disk'/>
                   {/*Back Button*/}
                   <View style={styles.container}>
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
            

            <Text style={styles.debugText}>SEARCHING FOR: {searchQuery.toUpperCase()}</Text>

        {/* Results*/}
            <ScrollView style={styles.resultsContainer}>
                {suggestions.length > 0 && suggestions.map((meal)=> (
                        <FoodResultItem
                            key={meal.id}
                            item={meal}
                            onPress={()=> handleSuggestionClick(meal)}
                        />
                    ))}

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
                {/*Action Buttons (Custom, Voice, Scan)*/}
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
            <BarcodeScannerModal
                isVisible={isScanning}
                onClose={()=> setIsScanning(false)}
            />
            </View>
        </View>
        </TouchableWithoutFeedback>

    
)};
const styles = StyleSheet.create({
    optionButtons: {
        marginTop: 30,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#00f2ff",
        backgroundColor: 'rgba(0, 242, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: THEME.color.accent,
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 3
    },
    root:{
    flex:1,
    backgroundColor: THEME.color.background
  },
    buttonContainer: {width: '100%',paddingHorizontal: 20, alignItems: 'flex-start'},
    inputContainer:{width:'80%', marginBottom: 20},
    container: {flex: 1, backgroundColor: 'transparent', alignItems: 'center', paddingTop: 20},
    title:{color: '#fff', fontSize:24, fontWeight: 'bold', letterSpacing: 2, marginBottom: 40},
    backButton: {
        marginTop: 30,
        padding: 15,
        borderWidth: 1,
        borderColor: "#00f2ff",
        backgroundColor: 'rgba(0, 242, 255, 0.1)',
        shadowColor: THEME.color.accent,
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 3
    },
    searchInput:{height:50, color: '#00f2ff', fontSize: 20, paddingHorizontal: 10},
    debugText: {color:'#005d61', fontSize: 12, marginTop: 10},
    buttonText: {color: '#00f2ff', fontWeight: 'bold'},
    resultsContainer:{
        width: '100%',
        marginTop: 20,
    },
    glowLine:{backgroundColor: '#00f2ff', height: 2, shadowColor: "#00f2ff", shadowRadius: 10, shadowOpacity: 1, elevation: 5},
});
