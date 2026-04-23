import { THEME } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

export default function MealRow ({meal, onDelete, isLast}: {meal: any, onDelete: (id:string) => void, isLast?: boolean}) {
    const router = useRouter();

    let formattedServing = "";
    const q = meal.quantity || 1;
    if (meal.unitName === '1 g') formattedServing = `${q} g`;
    else if (meal.unitName=== '1 oz') formattedServing = `${q} oz`;
    else if (meal.unitName=== '1 kg') formattedServing = `${q} kg`;
    else{
        formattedServing = q ===  1 ? meal.unitName : `${q} x ${meal.unitName}`;
    }

    const renderRightActions = () => (
        <View style={styles.deleteBackground}>
            <Text style={styles.deleteText}>DELETE</Text>
        </View>
    );

    return (
      <Swipeable 
          friction={1}
          rightThreshold={60}
          renderRightActions={renderRightActions} 
          containerStyle={{ flex: 1 }} 
          onSwipeableWillOpen={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              onDelete(meal.id);
          }}
      >
          <Pressable 

              style={[styles.diaryItem, isLast && {borderBottomWidth: 0}]}
              onPress={ () => router.push({
                  pathname: '/add-food-setting',
                  params: {...meal, selectedCategory: meal.mealType, isEditing: 'true'}
              })}
          >
              <View style={styles.leftColumn}>
                  <Text style={styles.foodNameText}>{meal.name}</Text>
                  <View style={styles.detailsRow}>
                      <Text style={styles.detailsText}>{meal.brand}</Text> 
                      <Text style={styles.detailsText}>{formattedServing}</Text>
                  </View>
              </View>
              <Text style={styles.calorieText}>{meal.calories}</Text>
          </Pressable>
      </Swipeable>
    );
};

const styles= StyleSheet.create({
    diaryItem: {
        flexDirection: 'row', 
        width: '100%',  
        paddingHorizontal: 20, 
        paddingVertical: 15,
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: THEME.color.accent, 
        backgroundColor: 'transparent', 
    },
    leftColumn:{
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 4,
    },

    foodNameText: {
        fontSize: 16, 
        color: '#fff',
    },
    detailsRow:{
        flexDirection: 'row',
        gap: 8,
    },
    detailsText:{
        color: '#00f2ff',
        opacity: 0.6,
        fontSize: 14,
        textTransform: 'uppercase', 
    },
    calorieText: {
        fontSize: 18,
        color: '#00f2ff', 
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 242, 255, 0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    deleteBackground: {
        backgroundColor: 'rgba(255, 68, 68, 0.8)',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 30,
        height: '100%', 
        width: '100%'
    },
    deleteText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 2,
    },
});