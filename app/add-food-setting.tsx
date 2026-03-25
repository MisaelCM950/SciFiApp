import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFood } from '../storage';

export default function AddFoodSettingScreen(){

const {name, calories, brand, selectedCategory} = useLocalSearchParams();
    const [unit, setUnit] = useState('g');
    const [quantity, setQuantity] = useState('1');
    const [mealType, setMealType] = useState(selectedCategory ||'Breakfast');

   

    const {addCalories} = useFood();
   const router = useRouter(); 

    const calculatedCalories = Number(calories) * Number(quantity || 0);

    const handleAdd = () => {
        addCalories({
            id:Date.now().toString(),
            name: name as string,
            calories: calculatedCalories,
            brand: brand as string,
            mealType: mealType as string,
        });
        router.dismissAll();
    }   

   
    return(
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.buttonStyle}onPress={()=> router.back()}>
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.buttonStyle}  onPress={handleAdd}>
                    <Text style= {styles.backText}>Add</Text>
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
