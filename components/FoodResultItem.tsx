import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/theme';

interface Props{
    item: any;
    onPress: ()=> void;
}

export default function FoodResultItem({item, onPress}: Props){
    return(
        <TouchableOpacity style={styles.resultItem} onPress={onPress}>
            <Text style={styles.resultText}>{item.name}</Text>
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
        borderBottomColor: THEME.color.border
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