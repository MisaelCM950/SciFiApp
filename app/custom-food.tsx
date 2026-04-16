import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useFood } from '../storage';

export default function AddFoodSettingScreen(){
    const {selectedCategory} = useLocalSearchParams();
    const router = useRouter(); 
    const {addMeal, selectedDate} = useFood();


    const [name, setName] = useState('');
    const [calories, setCalories] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fat, setFat] = useState('');
    const [protein, setProtein] = useState('');


    const handleAdd = () => {

        if(!name.trim()){
            alert('Please enter a food name.');
            return;
        }

        const newFood = {
            id: Date.now().toString(),
            name: name,
            baseCalories: Number(calories),
            carbs: Number(carbs) || 0,
            fat: Number(fat) || 0,
            protein: Number(protein) || 0,
            quantity: 1,
            calories: Number(calories),
            brand: 'Custom',
            mealType: selectedCategory as string,
            date: selectedDate
        };
        addMeal(newFood);
        router.dismissAll();
    }   

   
    return(
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible ={false}>
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.buttonStyle}onPress={()=> router.back()}>
                    <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.buttonStyle}  onPress={handleAdd}>
                    <Text style= {styles.buttonText}>Add</Text>
                </TouchableOpacity>
            </View>
            
            <Text style={styles.title}>Add Custom Food</Text>

            <View style={[styles.formContainer]}>
                <View style={styles.settingsRow}>
                    <Text style={styles.baseText}>Food Name</Text>
                        <View style={styles.inputContainer}>
                            <TextInput style={styles.optionInput} 
                            placeholder='Homemade....' 
                            placeholderTextColor= '#00f2ff'
                            onChangeText={setName}
                            value={name}
                            selectTextOnFocus = {true}
                            />
                            <View style={styles.glowLine}/>
                        </View>
                </View>

                <View style={styles.settingsRow}>
                    <Text style={styles.baseText}>Calories</Text>
                        <View style={styles.inputContainer}>
                            <TextInput style={styles.optionInput} 
                            placeholder='0' 
                            placeholderTextColor= '#00f2ff'
                            onChangeText={setCalories}
                            value={calories}
                            selectTextOnFocus= {true}
                            />
                            <View style={styles.glowLine}/>
                        </View>
                </View>

                <View style={styles.settingsRow}>
                    <Text style={styles.baseText}>Carbs</Text>
                        <View style={styles.inputContainer}>
                            <TextInput style={styles.optionInput} 
                            placeholder='0g' 
                            placeholderTextColor= '#0ddee9'
                            onChangeText={setCarbs}
                            value={carbs}
                            selectTextOnFocus = {true}
                            />
                            <View style={styles.glowLine}/>
                        </View>
                </View>  

                <View style={styles.settingsRow}>
                    <Text style={styles.baseText}>Fat</Text>
                        <View style={styles.inputContainer}>
                            <TextInput style={styles.optionInput} 
                            placeholder='0g' 
                            placeholderTextColor= '#0ddee9'
                            onChangeText={setFat}
                            value={fat}
                            selectTextOnFocus = {true}
                            />
                            <View style={[styles.glowLine, {backgroundColor: '#ff4444'}]}/>
                        </View>
                </View>  

                <View style={styles.settingsRow}>
                    <Text style={styles.baseText}>Protein</Text>
                        <View style={styles.inputContainer}>
                            <TextInput style={styles.optionInput} 
                            placeholder='0g' 
                            placeholderTextColor= '#0ddee9'
                            onChangeText={setProtein}
                            value={protein}
                            selectTextOnFocus ={true}
                            />
                            <View style={[styles.glowLine, {backgroundColor: '#00ff44'}]}/>
                        </View>
                </View>  
            </View>
        </View>
        </TouchableWithoutFeedback>

    
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
    buttonContainer: {
        width: '100%',
        paddingHorizontal: 20,
        justifyContent:'space-between', 
        flexDirection:'row', 
        paddingTop: 10,
        marginBottom: 10
    },
    inputContainer:{
        width:'50%'
    },
    container: {
        flex: 1, 
        backgroundColor: '#001a1c', 
        alignItems: 'center',
        paddingTop: 10
        },
    title:{color: '#fff', fontSize:24, fontWeight: 'bold', letterSpacing: 2, marginBottom: 40},
    buttonStyle:{borderColor: "#00f2ff", borderWidth: 1, padding: 15, borderStyle: 'dashed'},
    optionInput:{
        height:50, 
        color: '#00f2ff', 
        fontSize: 20, 
        paddingHorizontal: 10,
        textAlign: 'right'
    },
    buttonText: {color: '#00f2ff', fontWeight: 'bold'},
    glowLine:{backgroundColor: '#00f2ff', height: 2, shadowColor: "#00f2ff", shadowRadius: 10, shadowOpacity: 1, elevation: 5},
});
