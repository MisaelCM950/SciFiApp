import FoodResultItem from '@/components/FoodResultItem';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FOOD_DATABASE } from '../constants/Food-data';

export default function AddFoodScreen(){
   const router = useRouter(); 
   const {selectedCategory} = useLocalSearchParams();
   const [searchQuery, setSearchQuery] = useState('');
   
   const filteredFood = FOOD_DATABASE.filter((item) =>{
    const itemName = item.name.toLowerCase();
    const userTyped = searchQuery.toLowerCase();
    
    return itemName.includes(userTyped);
   });
   
    return(
 
        <View style={styles.container}>
                   {/*Back Button*/}
            <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.backButton}onPress={()=> router.back()}>
                <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
        </View>
                    {/*Header*/}
            <Text style={styles.title}>Add Food</Text>
                {/*Search Input*/}
            <View style={styles.inputContainer}>
                <TextInput style={styles.searchInput} 
                placeholder='Add Food' 
                placeholderTextColor= '#00f2ff'
                autoFocus= {true}
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
            </ScrollView>
        </View>

    
)};
const styles = StyleSheet.create({
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
    backText: {color: '#00f2ff', fontWeight: 'bold'},
    resultsContainer:{
        width: '100%',
        marginTop: 20
    },
    glowLine:{backgroundColor: '#00f2ff', height: 2, shadowColor: "#00f2ff", shadowRadius: 10, shadowOpacity: 1, elevation: 5},
});
