import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFood } from '../storage';

export default function AddFoodSettingScreen(){
   const {name, calories, brand} = useLocalSearchParams(); //1

    const {addCalories} = useFood();
   const router = useRouter(); 

    const [quantity, setQuantity] = useState('1'); //2

    const calculatedCalories = Number(calories) * Number(quantity || 0);

    const handleAdd = () => {
        addCalories({
            id:Date.now().toString(),
            name: name as string,
            calories: calculatedCalories,
            brand: brand as string,
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
            <View style={[styles.settingsContainer,{flexDirection: 'column'}]}>
                <View style={styles.settingsContainer}>
                    <Text style={styles.baseText}>Serving Size</Text>
                        <View style={styles.inputContainer}>
                            <TextInput style={styles.searchInput} 
                            placeholder='g' 
                            placeholderTextColor= '#00f2ff'
                            />
                            <View style={styles.glowLine}/>
                        </View>
                </View>

                <View style={styles.settingsContainer}>
                    <Text style={styles.baseText}>Number of Servings</Text>
                        <View style={styles.inputContainer}>
                            <TextInput style={styles.searchInput} 
                            placeholder='0' 
                            keyboardType='numeric'
                            placeholderTextColor= '#00f2ff'
                            value={quantity}
                            onChangeText ={setQuantity}
                            />
                            <View style={styles.glowLine}/>
                        </View>
                </View>

                <View style={styles.settingsContainer}>
                    <Text style={styles.baseText}>Meal</Text>
                        <View style={styles.inputContainer}>
                            <TextInput style={styles.searchInput} 
                            placeholder='0' 
                            placeholderTextColor= '#00f2ff'
                            />
                            <View style={styles.glowLine}/>
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
    resultCalories: {
        color: '#00f2ff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    buttonContainer: {width: '100%',paddingHorizontal: 20,justifyContent:'space-between', flexDirection:'row', paddingTop: 10},
    inputContainer:{width:'30%'},
    settingsContainer:{
        flexDirection: 'row', 
        width: '100%',
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingVertical: 5,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#004042',
        height: 'auto'
    },
    container: {flex: 1, backgroundColor: '#001a1c', alignItems: 'center', paddingTop: 5},
    title:{color: '#fff', fontSize:24, fontWeight: 'bold', letterSpacing: 2, marginBottom: 40},
    buttonStyle:{borderColor: "#00f2ff", borderWidth: 1, padding: 15, borderStyle: 'dashed'},
    searchInput:{
        height:50, 
        color: '#00f2ff', 
        fontSize: 20, 
        paddingHorizontal: 10,
        textAlign: 'center'
    },
    debugText: {color:'#005d61', fontSize: 12, marginTop: 10},
    backText: {color: '#00f2ff', fontWeight: 'bold'},
    resultsContainer:{
        width: '100%',
        marginTop: 20
    },
    glowLine:{backgroundColor: '#00f2ff', height: 2, shadowColor: "#00f2ff", shadowRadius: 10, shadowOpacity: 1, elevation: 5},
});
