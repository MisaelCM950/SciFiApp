import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEME } from '../constants/theme';

interface Props{
    item: any;
    onPress: ()=> void;
}

export default function FoodResultItem({item, onPress}: Props){

    return(
        
        <TouchableOpacity style={styles.resultItem} onPress={onPress}>
            <View style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                <Text style={styles.resultText}>{item.name}</Text>
                <Text style={[styles.resultText, {color: '#fff', fontSize: 15, fontWeight: '200'}]}>{item.brand}</Text>
            </View>
            <Text style={styles.resultCalories}>{item.calories} Kcal</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    resultItem:{
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: THEME.color.border,   
    },
    resultText:{
        color: '#fff',
        fontSize: 18,
        fontWeight:'bold'
    },
    resultCalories: {
        color: THEME.color.accent,
        fontSize: 16,
        fontWeight: 'bold'
    },
})