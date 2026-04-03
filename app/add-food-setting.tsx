import { Macrobar } from '@/components/barchart';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFood } from '../storage';

export default function AddFoodSettingScreen(){
// Receive properties
const {id, name, calories, brand, carbs, fat, protein, baseCalories, quantity: savedQuantity, selectedCategory, isEditing} = useLocalSearchParams();
    const [unit, setUnit] = useState('g');
    const [quantity, setQuantity] = useState(savedQuantity ? String(savedQuantity): '1');
    const [mealType, setMealType] = useState(selectedCategory ||'Breakfast');

   

    const {addCalories, updateMeal, selectedDate} = useFood();
   const router = useRouter(); 
// Convert strings to numbers
    const c = Number(carbs) * Number(quantity || 0);
    const f = Number(fat) * Number(quantity || 0);
    const p = Number(protein) * Number(quantity || 0);
    const baseCal = Number(baseCalories) || Number(calories) || 0;
    const calculatedCalories = baseCal * Number(quantity) || 0;

    const totalMacros = c + f + p;

// Prevent diving by 0 if a food has 0 macros (like water)
    const carbsPct = totalMacros > 0 ? (c/totalMacros) * 100 : 0;
    const fatPct = totalMacros > 0 ? (f/totalMacros) * 100 : 0
    const proteinPct = totalMacros > 0 ? (p/totalMacros) * 100: 0

    const handleAdd = () => {

        const mealData = {
            id: isEditing === 'true' ? (id as string) : Date.now().toString(),
            name: name as string,
            baseCalories: baseCal,
            carbs: Number(carbs),
            fat: Number(fat),
            protein: Number(protein),
            quantity: Number(quantity),
            calories: calculatedCalories,
            brand: brand as string,
            mealType: mealType as string,
            date: selectedDate
        };
        if(isEditing === 'true') {
            updateMeal(mealData);
        } else{
            addCalories(mealData);
        }
        router.dismissAll();
    }   

   
    return(
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.buttonStyle}onPress={()=> router.back()}>
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.buttonStyle}  onPress={handleAdd}>
                    <Text style= {styles.backText}>{isEditing === 'true' ? 'Update' : 'Add'}</Text>
                </TouchableOpacity>
            </View>
            
            <Text style={styles.title}>Add {name}</Text>

            <View style={[styles.formContainer]}>
                <View style={styles.settingsRow}>
                    <Text style={styles.baseText}>Serving Size</Text>
                        <View style={styles.inputContainer}>
                            <TextInput style={styles.optionInput} 
                            placeholder='1 g' 
                            placeholderTextColor= '#00f2ff'
                            />
                            <View style={styles.glowLine}/>
                        </View>
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
                        <Macrobar label="Carbs" grams={Math.round(c)} percentage={carbsPct} color="#00f2ff"/>
                        <Macrobar label="Fat" grams={Math.round(f)} percentage={fatPct} color="#ff4444"/>
                        <Macrobar label="Protein" grams={Math.round(p)} percentage={proteinPct} color="#00ff44"/>
                    </View>
                </View>
            </View>
            <Text style={styles.baseText}>{calculatedCalories} Kcal</Text>
            


           
        </View>

    
)};
const styles = StyleSheet.create({
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
        paddingTop: 10
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
    title:{color: '#fff', fontSize:24, fontWeight: 'bold', letterSpacing: 2, marginBottom: 40},
    buttonStyle:{borderColor: "#00f2ff", borderWidth: 1, padding: 15, borderStyle: 'dashed'},
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
