import { useFood } from '@/storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react'; // 1. Import the state "Hook"
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CalTracker() {
  // 2. Create a "State" variable. 
  // 'calories' is the value, 'setCalories' is the function to change it.
  const {totalCalories, meals} = useFood();
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const GOAL = 2500;
  const exercise = 0;
  const remaining = 2500 - totalCalories;

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
     



      {/* Category */}
      <View style={[styles.diaryItem,{borderBottomColor: '#004042', borderWidth: 1}]}>
        <View style={styles.leftColumn}>
          <Text style={[styles.baseText,  styles.category]}>Breakfast</Text>  
        </View>
          <Text style={[styles.baseText, styles.category]}>{totalCalories}</Text>
      </View>

    {meals.map((meal,index)=> (
      <View key={index} style={[styles.diaryItem, {borderTopWidth: 0}]}>
        {/* The left column */}
        <View style={styles.leftColumn}>
          <Text style={[styles.baseText]}>{meal.name}</Text>
          {/* The details row */}
          <View style={styles.detailsRow}>
              <Text style={[styles.baseText, styles.details]}>{meal.brand}</Text> 
              <Text style={[styles.baseText, styles.details]}>1</Text>
              <Text style={[styles.baseText, styles.details]}>Serving</Text>
          </View>
        </View>
        {/* The right column */}
          <Text style={[styles.baseText]}>{meal.calories}</Text>
      </View>
      ))}

      {/*Add Food */}

      <View style={[styles.addFoodRow, styles.diaryItem]}>
        <TouchableOpacity style={styles.leftColumn} onPress={ ()=>
        router.push('/add-food')
        }>
          <Text style={[styles.baseText,  styles.addFoodText]}>ADD FOOD</Text>  
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={[styles.baseText, styles.addFoodText]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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