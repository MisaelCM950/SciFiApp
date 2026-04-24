import { useFood } from '@/storage';
import dayjs from 'dayjs';
import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
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
    const {allMeals, addMeal, selectedDate} = useFood();

    const sectionMeals = meals.filter(m =>  m.mealType === type);
    const totalCals = sectionMeals.reduce((sum, m) => sum + m.calories, 0);

    const yesterday = dayjs(selectedDate).subtract(1, 'day').format('YYYY-MM-DD');
    const yesterdayMeals = allMeals.filter(m => m.date === yesterday && m.mealType === type);


    const handleCopyYesterday= () => {
        yesterdayMeals.forEach((meal, index)=> {
            const copiedMeal = {
                ...meal,
                id: Date.now().toString() + index.toString(),
                date: selectedDate
            };
            addMeal(copiedMeal);
        })
    }

    const renderLeftActions = () => (
        <View style={styles.copyBackground}>
            <Text style={styles.copyText}>Copy</Text>
        </View>
    )

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

        {type === 'Breakfast' && sectionMeals.length === 0 && yesterdayMeals.length > 0 && (
            <Swipeable
                friction={1}
                leftThreshold={60}
                renderLeftActions={renderLeftActions}
                containerStyle={{flex: 1, marginBottom: 5}}
                onSwipeableWillOpen={()=>{
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    handleCopyYesterday();
                }}
            >

            <View style={styles.ghostRow}>
                <Text style={styles.ghostText}>Swipe to Copy Yesterday's Breakfast</Text>
            </View>
            </Swipeable>
        )}
        

            <TouchableOpacity style={styles.hudButton} onPress={onAdd} activeOpacity={0.6}>
            <Text style={styles.buttonText}>ADD FOOD</Text>  
            <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
      </View>
    )
  }
  export default MealSection;

  const styles = StyleSheet.create({
    ghostRow: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(0,255,68,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(0,255,68,0.3)',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center'
    },
    ghostText: {
        color: 'rgba(0, 255, 68, 0.8)',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    copyBackground: {
        backgroundColor: 'rgba(0,255,68,0.6)',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft: 30,
        height: '100%',
        width: '100%'
    },
    copyText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 2,
    },
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