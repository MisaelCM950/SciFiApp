import { Macrobar } from '@/components/Barchart';
import { THEME } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useFood } from '../storage';

export default function AddFoodSettingScreen() {
    
    const router = useRouter(); 
    // 1. Receive properties
    const {id, name, calories, brand, carbs, fat, protein, baseCalories, quantity: savedQuantity, 
        selectedCategory, isEditing, servingSize, servingName, unitName: savedUnitName, 
        originalGramWeight: savedGramWeight, baseProtein, baseFat, baseCarbs, fatSecretId} = useLocalSearchParams();
    
    const [quantity, setQuantity] = useState((savedQuantity as string) || '1');
    const [mealType, setMealType] = useState(selectedCategory ||'Breakfast');

    const safeServingAmount = parseFloat(servingSize as string) || 1;

    const fallbackMultiplier = savedGramWeight ? Number(savedGramWeight) : (parseFloat(servingSize as string) || 1);

    const initialDropdownList = [    
        {label: '1 g', gramMultiplier: 1},
        {label: '1 oz', gramMultiplier: 28.35},
        {label: '1 kg', gramMultiplier: 1000}
    ];

    if (servingName && servingName !== 'g' && servingName !== 'oz') {
        initialDropdownList.unshift({ 
            label: servingName as string, 
            gramMultiplier: fallbackMultiplier 
        });
    }

    const [availableUnits, setAvailableUnits] = useState(initialDropdownList);
    const initialUnit = availableUnits.find(u => u.label === savedUnitName) || availableUnits[0];
    const [selectedUnit, setSelectedUnit] = useState(initialUnit);
    
   
    const [originalServingGrams, setOriginalServingGrams] = useState(savedGramWeight ? Number(savedGramWeight) : 1);
    const [isLoadingServings, setIsLoadingServings] = useState(false);


    const userTypedAmount = parseFloat(quantity) || 0;
    const trueGramWeight = userTypedAmount * selectedUnit.gramMultiplier;


    useEffect(()=>{
        async function fetchDetailedServings() {
            const searchId = fatSecretId || id
            if(!searchId || String(searchId).startsWith("AI-")) return;
            
            setIsLoadingServings(true);
            try {
                const clientId = process.env.EXPO_PUBLIC_FS_CLIENT_ID;
                const clientSecret = process.env.EXPO_PUBLIC_FS_CLIENT_SECRET;

                const tokenResponse = await fetch('https://oauth.fatsecret.com/connect/token', {
                    method: 'POST',
                    headers: {"Content-Type": 'application/x-www-form-urlencoded'},
                    body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
                });

                if(!tokenResponse.ok) throw new Error('Auth Failed');
                const tokenData = await tokenResponse.json();
                const accessToken = tokenData.access_token;

                const response = await fetch(`https://platform.fatsecret.com/rest/server.api?method=food.get.v2&food_id=${searchId}&format=json`, {
                    method: "GET", 
                    headers: {'Authorization': `Bearer ${accessToken}`}
                });
                const result = await response.json()
                
                if(result.food && result.food.servings && result.food.servings.serving){
                    const rawServings = Array.isArray(result.food.servings.serving)
                        ? result.food.servings.serving
                        : [result.food.servings.serving]

                    const formattedUnits = rawServings.map((s: any)=>({
                        label: s.serving_description,
                        gramMultiplier: parseFloat(s.metric_serving_amount) || 1
                    }));
                    
                    formattedUnits.push({label: '1 g',  gramMultiplier: 1});
                    formattedUnits.push({label: "1 oz", gramMultiplier: 28.35});
                    formattedUnits.push({label: '1 kg', gramMultiplier: 1000})
                    
                    setAvailableUnits(formattedUnits);

                    if(isEditing !== 'true'){
                        const originalUnitData = formattedUnits.find((u : any) => 
                            u.label.toLowerCase().includes(String(servingName).toLowerCase()));

                        if (originalUnitData) {
                        setOriginalServingGrams(originalUnitData.gramMultiplier);
                        if (selectedUnit.label === servingName) {
                            setSelectedUnit(originalUnitData);
                        }
                    }
                    } else {
                        const realSavedUnit = formattedUnits.find((u: any) => u.label === savedUnitName);
                        if(realSavedUnit){
                            setSelectedUnit(realSavedUnit);
                        }
                    };

                }
            } catch (error){
                console.error("Failed to load servings", error);
            } finally {
                setIsLoadingServings(false);
            }
        }
        fetchDetailedServings();
    }, [id]);
    
    const {addMeal, updateMeal, selectedDate} = useFood();
    

    // --- NEW MATH LOGIC ---
    const baseCal = Number(baseCalories) || Number(calories) || 0;
    const finalBaseProtein = Number(baseProtein) || Number(protein);
    const finalBaseCarbs = Number(baseCarbs) || Number(carbs);
    const finalBaseFat = Number(baseFat) || Number(fat);

    const baseCalPerGram = baseCal / originalServingGrams;
    const carbsPerGram = finalBaseCarbs / originalServingGrams;
    const fatPerGram = finalBaseFat / originalServingGrams;
    const proteinPerGram = finalBaseProtein / originalServingGrams;

    const calculatedCalories = Math.round(baseCalPerGram * trueGramWeight) || 0;
    const c = Math.round(carbsPerGram * trueGramWeight * 10) / 10;
    const f = Math.round(fatPerGram * trueGramWeight * 10) / 10;
    const p = Math.round(proteinPerGram * trueGramWeight * 10) / 10;

    const totalMacros = c + f + p;
    const carbsPct = totalMacros > 0 ? (c/totalMacros) * 100 : 0;
    const fatPct = totalMacros > 0 ? (f/totalMacros) * 100 : 0;
    const proteinPct = totalMacros > 0 ? (p/totalMacros) * 100: 0;

    // Dropdown Render Item
    const renderItem = (item: any) => {
        return(
            <View style={[styles.dropdownItem, item.label === selectedUnit.label && {backgroundColor: '#004042'}]}>
                <Text style={styles.textItem}>{item.label}</Text>
            </View>
        );
    };

    const handleAdd = () => {
        const mealData = {
            id: isEditing === 'true' ? (id as string) : Date.now().toString(),
            fatSecretId: fatSecretId ? (fatSecretId as string) : (id as string),
            name: name as string,
            baseCalories: baseCal, 
            carbs: c, 
            fat: f, 
            protein: p,
            quantity: Number(quantity),
            unitName: selectedUnit.label,
            servingSize: safeServingAmount,
            servingName: servingName as string,
            calories: calculatedCalories,
            brand: brand as string,
            mealType: mealType as string,
            date: selectedDate,
            originalGramWeight: originalServingGrams,
            baseProtein: finalBaseProtein,
            baseCarbs: finalBaseCarbs,
            baseFat: finalBaseFat
        };
        if(isEditing === 'true') {
            updateMeal(mealData);
        } else {
            addMeal(mealData);
        }
        router.dismissAll();
    }   

    return(
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.buttonStyle} onPress={()=> router.back()}>
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.buttonStyle}  onPress={handleAdd}>
                    <Text style= {styles.backText}>{isEditing === 'true' ? 'Update' : 'Add'}</Text>
                </TouchableOpacity>
            </View>
            
            <Text style={[styles.title, {marginBottom: 20, textAlign: 'center'}]}>
                <Text style={{color: THEME.color.accent}}>Add </Text>
                <Text>{name}</Text>
            </Text>
            <Text style={{color: '#fff', marginBottom: 20, fontWeight: 'bold'}}>{brand}</Text>

            <View style={[styles.formContainer]}>
                <View style={styles.settingsRow}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                        <Text style={styles.baseText}>Serving Size</Text>
                        {isLoadingServings && <ActivityIndicator size="small" color="#00f2ff"/>}
                    </View>
                    
                        <Dropdown
                            style={styles.dropdown}
                            selectedTextStyle={styles.selectedTextStyle}
                            data={availableUnits}
                            maxHeight={300}
                            labelField="label"
                            valueField="label"
                            placeholder={selectedUnit.label}
                            value={selectedUnit}
                            onChange={item => setSelectedUnit(item)}
                            renderItem={renderItem}
                        />
                </View>

                <View style={styles.settingsRow}>
                    <Text style={styles.baseText}>Number of Servings</Text>
                        <View style={styles.inputContainer}>
                            <TextInput style={styles.optionInput} 
                            placeholder='0' 
                            keyboardType='numeric'
                            placeholderTextColor= '#00f2ff'
                            value={quantity}
                            onChangeText ={setQuantity}
                            selectTextOnFocus ={true}
                            />
                            <View style={styles.glowLine}/>
                        </View>
                </View>

                <View style= {styles.selectRow}>
                    {['Breakfast', 'Lunch', 'Dinner'].map((type) =>(
                        <TouchableOpacity
                        key={type}
                        style={[styles.select, mealType == type && styles.activeSelect]}
                        onPress={() => setMealType(type)}
                        >
                            <Text style={[styles.selectText, mealType === type && styles.activeSelectText]}>
                                {type.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                         
                <View style={styles.macrosContainer}>
                    <Text style={styles.sectionTitle}>Macros</Text>
                    <View style={styles.chartArea}>
                        <Macrobar label="Carbs" grams={c} percentage={carbsPct} color="#00f2ff"/>
                        <Macrobar label="Fat" grams={f} percentage={fatPct} color="#ff4444"/>
                        <Macrobar label="Protein" grams={p} percentage={proteinPct} color="#00ff44"/>
                    </View>
                </View>
            </View>
            <Text style={styles.baseText}>{calculatedCalories} Kcal</Text>
        </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    dropdown:{
        backgroundColor: THEME.color.border,
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 10,
        width: 110
    },
    selectedTextStyle:{
        color: THEME.color.accent,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    dropdownItem: {
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#001a1c',
        borderBottomWidth: 1,
        borderBottomColor: '#004042'
    },
    textItem:{
        color: '#fff',
        fontSize: 16
    },
   baseText:{
        color: '#fff',
        fontSize: 18,
        fontWeight:'bold'
    },
    sectionTitle:{
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    macrosContainer:{
        width: '100%',
        marginBottom: 20
    },
    chartArea: {
        width: '100%',
        gap: 15
    },
    formContainer:{
        width: '90%'
    },
    settingsRow:{
        flexDirection: 'row', 
        width: '100%',
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingVertical: 5,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#004042',
    },
    resultCalories: {
        color: '#00f2ff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    selectRow:{
        width: '100%',
        flexDirection: 'row',
        justifyContent:'space-between',
        marginTop: 20,
        marginBottom: 20
    },
    select:{
        borderWidth: 1,
        borderColor: '#004042',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5
    },
    activeSelect: {
        borderColor: '#004042',
        backgroundColor: '#004042'
    },
    selectText: {
        color: '#aaa',
        fontSize: 12,
        fontWeight: 'bold'
    },
    activeSelectText: {
        color: '#00f2ff'
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: 20,
        justifyContent:'space-between', 
        flexDirection:'row', 
        paddingTop: 10,
        marginBottom: 10
    },
    inputContainer:{
        width:'30%'
    },
    container: {
        flex: 1, 
        backgroundColor: '#001a1c', 
        alignItems: 'center',
        paddingTop: 5
        },
    title:{color: '#fff', fontSize:24, fontWeight: 'bold', letterSpacing: 2},
    buttonStyle:{borderColor: THEME.color.accent, borderWidth: 1, padding: 15, borderStyle: 'dashed'},
    optionInput:{
        height:50, 
        color: '#00f2ff', 
        fontSize: 20, 
        paddingHorizontal: 10,
        textAlign: 'center'
    },
    backText: {color: '#00f2ff', fontWeight: 'bold'},
    glowLine:{backgroundColor: '#00f2ff', height: 2, shadowColor: "#00f2ff", shadowRadius: 10, shadowOpacity: 1, elevation: 5},
});
