import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEME } from '../constants/theme';
import MealRow from './MealRow';

    interface MealSectionProps{
        title: string;
        type: string;
        meals: any[];
        onDelete: (id:string) => void;
        onAdd: () => void;
    }
    
 const MealSection = ({title, type, meals, onDelete, onAdd} : MealSectionProps) => {
    const sectionMeals = meals.filter(m =>  m.mealType === type);
    const totalCals = sectionMeals.reduce((sum, m) => sum + m.calories, 0);

    return (
      <View style={{width: '100%'}}>
      <View style={[styles.diaryItem,{borderBottomColor: '#004042', borderBottomWidth: 1}]}>
        <View style={styles.leftColumn}>
          <Text style={[styles.baseText,  styles.category]}>{title}</Text>  
        </View>
          <Text style={[styles.baseText, styles.category]}>
            {totalCals}
          </Text>
      </View>

      {sectionMeals
        .map((meal) => (
          <MealRow key={meal.id} meal={meal} onDelete={onDelete}/>
        ))
      }

      <View style={[styles.addFoodRow, styles.diaryItem]}>
        <TouchableOpacity style={styles.leftColumn} onPress={onAdd}>
          <Text style={[styles.baseText,  styles.addFoodText]}>ADD FOOD</Text>  
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={[styles.baseText, styles.addFoodText]}>+</Text>
        </TouchableOpacity>
      </View>
      </View>
    )
  }
  export default MealSection;

  const styles = StyleSheet.create({
    baseText: {fontSize: 18, color:'#fff'},
    addFoodText: {
        color: THEME.color.accent,
        fontWeight: 'bold',
    },
    leftColumn:{
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 2,
    },
    diaryItem: {
        flexDirection: 'row', 
        width: '100%',  
        paddingHorizontal: 20, 
        paddingVertical: 15,
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: THEME.color.border,
    },
    addFoodRow: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: THEME.color.border,
     },
     category:{
        fontWeight: 'bold',
        fontSize: 20,
     },

  })