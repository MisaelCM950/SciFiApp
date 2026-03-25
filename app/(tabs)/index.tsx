import { useFood } from '@/storage';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

export default function CalTracker() {
  // 2. Create a "State" variable. 
  // 'calories' is the value, 'setCalories' is the function to change it.
  const {totalCalories, meals, deleteMeal} = useFood();
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const GOAL = 2500;
  const exercise = 0;
  const remaining = 2500 - totalCalories;

  const renderRightActions = () => {//
    return (
    <View style={styles.deleteBackground}>
      <Text style={styles.deleteText}>DELETE</Text>
    </View>
    );
};

  useEffect(()=>{
    setTimeout(()=>{
      setIsLoading(false);
    }, 3000);
  }, []);

  if(isLoading){
    return(
      <View style={styles.loadingContainer}>
        <Image source={require('../../assets/images/splash-icon.png')}
        style={styles.logo}/>
        <Text style={styles.loaderText}>Loading...</Text>
        <ActivityIndicator size='large' color={"#00f0ff"}/>
      </View>
    );
  }

  return (
  <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.mainWrapper} simultaneousHandlers={[]} waitFor ={[]}>
    <View style={styles.container}>
      {/* Block 1: Goal */}
      <View style={styles.dashboardContainer}>
        <View style={styles.statBlock}>
          <Text style={styles.statNumber}>{GOAL.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Goal</Text>
        </View>

        <Text style={styles.symbol}>-</Text>
        {/* Block 2: Food */}
        <View style={styles.statBlock}>
          <Text style={styles.statNumber}>{totalCalories}</Text>
          <Text style={styles.statLabel}>Food</Text>
        </View>

        <Text style={styles.symbol}>+</Text>
        {/* Block 3: Exercise */}
        <View style={styles.statBlock}>
          <Text style={styles.statNumber}>{exercise}</Text>
          <Text style={styles.statLabel}>Exercise</Text>
        </View>

        <Text style={styles.symbol}>=</Text>
        {/* Block 4: Remaining */}

        <View style={styles.statBlock}>
          <Text style={[styles.statNumber, {color: '#02f0ff', fontWeight: 'bold'}]}>{remaining}</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
      </View>
     



      {/* 1. Breakfast */}
      <View style={[styles.diaryItem,{borderBottomColor: '#004042', borderBottomWidth: 1}]}>
        <View style={styles.leftColumn}>
          <Text style={[styles.baseText,  styles.category]}>Breakfast</Text>  
        </View>
          <Text style={[styles.baseText, styles.category]}>
            {meals.filter(m => m.mealType === 'Breakfast').reduce((sum, m) => sum + m.calories, 0)}
          </Text>
      </View>
    {meals
  .filter((meal) => meal.mealType === 'Breakfast')
  .map((meal) => (
    <Swipeable 
      key={meal.id} 
      friction={1}
      rightThreshold={60}
      renderRightActions={renderRightActions} 
      containerStyle={{ flex: 1, backgroundColor: '#003135' }} 
      activeOpacity={0.6}
      onSwipeableWillOpen={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      deleteMeal(meal.id);
  }}
    >
      <View style={[styles.diaryItem, { borderTopWidth: 0, backgroundColor: '#003135' }]}>
        <View style={styles.leftColumn}>
          <Text style={styles.baseText}>{meal.name}</Text>
          <View style={styles.detailsRow}>
              <Text style={[styles.baseText, styles.details]}>{meal.brand || 'Generic'}</Text> 
              <Text style={[styles.baseText, styles.details]}>1 Serving</Text>
          </View>
        </View>
        <Text style={styles.baseText}>{meal.calories}</Text>
      </View>
    </Swipeable>
  ))
}

      {/*Add Food */}

      <View style={[styles.addFoodRow, styles.diaryItem]}>
        <TouchableOpacity style={styles.leftColumn} onPress={ ()=>
        router.push({
          pathname: '/add-food',
          params: {selectedCategory: 'Breakfast'}
        })
        }>
          <Text style={[styles.baseText,  styles.addFoodText]}>ADD FOOD</Text>  
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={[styles.baseText, styles.addFoodText]}>+</Text>
        </TouchableOpacity>
      </View>

      { /*2. Lunch*/}
      <View style={[styles.diaryItem,{borderBottomColor: '#004042', borderBottomWidth: 1}]}>
        <View style={styles.leftColumn}>
          <Text style={[styles.baseText,  styles.category]}>Lunch</Text>  
        </View>
          <Text style={[styles.baseText, styles.category]}>
            {meals.filter(m => m.mealType === "Lunch").reduce((sum, m) => sum + m.calories, 0)}
          </Text>
      </View>

    {meals  
    .filter((meal) => meal.mealType === 'Lunch')
    .map((meal, index) => (
      <Swipeable 
        key={meal.id}
        friction={1}
        rightThreshold={60}
        renderRightActions={renderRightActions}
        containerStyle={{flex: 1, backgroundColor: '#003135'}}
        activeOpacity={0.6}
        onSwipeableWillOpen={ () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          deleteMeal(meal.id);
          }
        }
      >
       <View style={[styles.diaryItem, {borderTopWidth: 0, backgroundColor: "#003135"} ]}>
        {/* The left column */}
        <View style={styles.leftColumn}>
          <Text style={[styles.baseText]}>{meal.name}</Text>
          {/* The details row */}
          <View style={styles.detailsRow}>
              <Text style={[styles.baseText, styles.details]}>{meal.brand || 'Generic'}</Text> 
              <Text style={[styles.baseText, styles.details]}>1</Text>
              <Text style={[styles.baseText, styles.details]}>Serving</Text>
          </View>
        </View>
        {/* The right column */}
          <Text style={[styles.baseText]}>{meal.calories}</Text>
      </View>
      </Swipeable>
    ))
    }

      {/*Add Food */}

      <View style={[styles.addFoodRow, styles.diaryItem]}>
        <TouchableOpacity style={styles.leftColumn} onPress={ ()=>
        router.push({
          pathname: '/add-food',
          params: {selectedCategory: 'Lunch'}
        })
        }>
          <Text style={[styles.baseText,  styles.addFoodText]}>ADD FOOD</Text>  
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={[styles.baseText, styles.addFoodText]}>+</Text>
        </TouchableOpacity>
      </View>

      { /*3. Dinner*/}
      <View style={[styles.diaryItem,{borderBottomColor: '#004042', borderBottomWidth: 1}]}>
        <View style={styles.leftColumn}>
          <Text style={[styles.baseText,  styles.category]}>Dinner</Text>  
        </View>
          <Text style={[styles.baseText, styles.category]}>
            {meals.filter(m => m.mealType === 'Dinner').reduce((sum, m)=> sum + m.calories, 0)}
          </Text>
      </View>

    {meals.
      filter((meal)=> meal.mealType === 'Dinner')
      .map((meal, index) =>(
        <Swipeable 
          key={meal.id}
          friction={1}
          rightThreshold={60}
          containerStyle={{flex: 1, backgroundColor: '#003135'}}
          renderRightActions={renderRightActions}
          activeOpacity= {0.6}
          onSwipeableWillOpen={()=>{
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            deleteMeal(meal.id);
          }}
        >
        <View style={[styles.diaryItem, {borderTopWidth: 0, backgroundColor: '#003135'}]}>
        {/* The left column */}
        <View style={styles.leftColumn}>
          <Text style={[styles.baseText]}>{meal.name}</Text>
          {/* The details row */}
          <View style={styles.detailsRow}>
              <Text style={[styles.baseText, styles.details]}>{meal.brand || 'Generic'}</Text> 
              <Text style={[styles.baseText, styles.details]}>1</Text>
              <Text style={[styles.baseText, styles.details]}>Serving</Text>
          </View>
        </View>
        {/* The right column */}
          <Text style={[styles.baseText]}>{meal.calories}</Text>
      </View>
      </Swipeable>
      ))
      }
      

      {/*Add Food */}

      <View style={[styles.addFoodRow, styles.diaryItem]}>
        <TouchableOpacity style={styles.leftColumn} onPress={ ()=>
        router.push({
          pathname: '/add-food',
          params: {selectedCategory: 'Dinner'}
        })
        }>
          <Text style={[styles.baseText,  styles.addFoodText]}>ADD FOOD</Text>  
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={[styles.baseText, styles.addFoodText]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:{
    flex:1
  },
 deleteBackground: {
  backgroundColor: '#ff4444',
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
},
  mainWrapper:{
    flex:1,
    backgroundColor: '#003135',
  },
  scrollContainer:{
    paddingBottom: 50
  },
  addFoodRow: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#004042",
  },
  addFoodText: {
    color: '#00f2ff',
    fontWeight: 'bold',
  },
  dashboardContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 30
  },
  statBlock: {
      alignItems: 'center'
  },
  statNumber: {
    color: '#fff',
    fontSize: 18,
  },
  statLabel:{
    color: '#aaa',
    fontSize: 12,
    marginTop: 4
  },
  symbol:{
    color: '#fff',
    fontSize: 16,
    opacity: 0.6,
    paddingBottom: 20
  },
  baseText: {fontSize: 18, color:'#fff'},
  details:{opacity:0.5},
  diaryItem: {
    flexDirection: 'row', 
    width: '100%',  
    paddingHorizontal: 20, 
    paddingVertical: 15,
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#004042',
 },
  leftColumn:{
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
  },
  detailsRow:{
    flexDirection: 'row',
    gap: 4,
  },
  category:{
    fontWeight: 'bold',
    fontSize: 20,
  },

  loadingContainer: {flex: 1, backgroundColor: '#003135', justifyContent: 'center', alignItems:'center' },
  loaderText: {color: '#00f0ff', letterSpacing: 5, marginBottom: 20, fontSize: 20, fontWeight: 'bold'},
  container: { flex: 1, backgroundColor: '#003135', justifyContent: 'flex-start', paddingTop:100, alignItems: 'center' },
  header: { color: '#00f2ff', letterSpacing: 5, marginBottom: 10 },
  number: { color: '#fff', fontSize: 48, fontWeight: 'bold' },
  logo: {width: 250, height: 250, marginBottom: 20, resizeMode: 'contain'}
});