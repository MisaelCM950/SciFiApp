import { MacroContainer } from '@/components/DailyMacroContainer';
import { useFood } from '@/storage';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MacroScreen(){
   const router = useRouter(); 
   const { meals, totalCalories, calorieGoal, carbGoal, proteinGoal, fatGoal } = useFood();

   const CALORIE_GOAL = Number(calorieGoal) || 2500;
   const CARB_GOAL = Number(carbGoal) || 300;
   const FAT_GOAL = Number(fatGoal) || 80;
   const PROTEIN_GOAL = Number(proteinGoal) || 150;

    const totalCarbs = meals.reduce((sum, meal) => sum + ((meal.carbs || 0) * (meal.quantity || 1)), 0);
    const totalFat = meals.reduce((sum, meal) => sum + ((meal.fat || 0) * (meal.quantity || 1)), 0);
    const totalProtein = meals.reduce((sum, meal) => sum + ((meal.protein || 0) * (meal.quantity || 1)), 0);

    const totalMacros = totalCarbs + totalFat + totalProtein;


    const caloriePct = (totalCalories / CALORIE_GOAL) * 100;
    const carbsPct= (totalCarbs / CARB_GOAL) * 100;
    const fatPct = (totalFat / FAT_GOAL) * 100;
    const proteinPct = (totalProtein / PROTEIN_GOAL) * 100;


    const calLeft = CALORIE_GOAL - totalCalories;
    const carbsLeft = CARB_GOAL - Math.round(totalCarbs);
    const fatLeft = FAT_GOAL - Math.round(totalFat);
    const proteinLeft = PROTEIN_GOAL - Math.round(totalProtein);
   
    return(
 
        <View style={styles.container}>
                   {/*Back Button*/}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.backButton}onPress={()=> router.back()}>
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
            </View>
                    {/*Header*/}
            <Text style={styles.title}>Daily Macros</Text>

                {/*The Bars*/}
            <View style={styles.barContainer}>

                {/* Calorie Section */}
                <View style={styles.sectionContainer}>
                    <View style={styles.calorieRow}>
                    {/* Circle */}
                        <View>
                            <Text style={styles.circlePercentage}>{Math.round(caloriePct)}%</Text>
                        </View>
                    {/* Text next to it */}
                        <View style={styles.calorieTextContainer}>
                            <Text style={styles.sectionTitle}>Calories</Text>
                            <Text style={styles.statsText}>
                                {totalCalories} / {CALORIE_GOAL} Kcal
                            </Text>
                            <Text style={[styles.statsText, {color: '#00f2ff', marginTop: 5}]}>
                                {calLeft} kcal remaining
                            </Text>

                        </View>
                    </View>
                </View>
                {/* Carbs */}
                <MacroContainer
                    label= 'Carbs'
                    totalMacro={Math.round(totalCarbs)}
                    totalGoal={CARB_GOAL}
                    goalLeft={carbsLeft}
                    color='#00f2ff'
                />
                
                <MacroContainer
                    label= 'Protein'
                    totalMacro={Math.round(totalProtein)}
                    totalGoal={PROTEIN_GOAL}
                    goalLeft={proteinLeft}
                    color='#00ff44'
                />

                <MacroContainer
                    label= 'Fat'
                    totalMacro={Math.round(totalFat)}
                    totalGoal={FAT_GOAL}
                    goalLeft={fatLeft}
                    color='#ff4444'
                /> 
            </View>
        </View>

    
)};
const styles = StyleSheet.create({
    statsText: {
        color: '#aaa',
        fontSize: 14,
        fontWeight: '600'
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5
    },
    calorieTextContainer: {
        flex: 1
    },
    circlePercentage: {
        color: "#fff",
        fontSize: 18,
        fontWeight: 'bold'
    },
    calorieRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20
    },
    sectionContainer: {
    width: '100%', 
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 20,
    borderRadius: 15,
    justifyContent: 'center',
    marginBottom: 20
    },
    buttonContainer: {width: '100%',paddingHorizontal: 20, alignItems: 'flex-start'},
    barContainer:{width:'95%', marginBottom: 20},
    container: {flex: 1, backgroundColor: '#001a1c', alignItems: 'center', paddingTop: 70},
    title:{color: '#fff', fontSize:24, fontWeight: 'bold', letterSpacing: 2, marginBottom: 40},
    backButton:{borderColor: "#00f2ff", borderWidth: 1, padding: 15, borderStyle: 'dashed'},
    backText: {color: '#00f2ff', fontWeight: 'bold'},
    glowLine:{backgroundColor: '#00f2ff', height: 2, shadowColor: "#00f2ff", shadowRadius: 10, shadowOpacity: 1, elevation: 5},
});
