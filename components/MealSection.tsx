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
      <View style={styles.sectionWrapper}>

        <View style={styles.hudHeader}>
                <Text style={styles.headerTitle}>{title.toUpperCase()}</Text>
                <Text style={styles.headerTitle}>{totalCals}</Text>
        </View>

        {sectionMeals
            .map((meal, index) => {
                const isLastItem = index === sectionMeals.length - 1;
                return (
            
            <MealRow key={meal.id} meal={meal} onDelete={onDelete} isLast={isLastItem}/>
            );
        })}
        

            <TouchableOpacity style={styles.hudButton} onPress={onAdd} activeOpacity={0.6}>
            <Text style={styles.buttonText}>ADD FOOD</Text>  
            <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
      </View>
    )
  }
  export default MealSection;

  const styles = StyleSheet.create({
    hudButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        marginTop: 5,
        marginBottom: 15,
        backgroundColor: 'rgba(0, 242, 255, 0.05)',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(0, 242, 255, 0.5)'
    },
    buttonText: {
        color: THEME.color.accent,
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1.5,
        textShadowColor: 'rgba(0, 242, 255, 0.8)',
        textShadowOffset: {width: 0, height: 0},
        textShadowRadius: 8,
    },
    sectionWrapper: {
        width: '100%',
        marginBottom: 30,
        paddingHorizontal: 15
    },
    hudHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#00f2ff',
        marginBottom: 10,
        shadowColor: '#00f2ff',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 5
    },
    headerTitle: {
        color: '#00f2ff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 2
    },
  })