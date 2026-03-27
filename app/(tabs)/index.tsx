import { useFood } from '@/storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import MealSection from '../../components/MealSection';
import { THEME } from '../../constants/theme';

export default function CalTracker() {
  const {totalCalories, meals, deleteMeal} = useFood();
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
  <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.mainWrapper}>
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
   <MealSection
    title= "Breakfast"
    type= "Breakfast"
    meals={meals}
    onDelete={deleteMeal}
    onAdd={() => router.push({pathname: '/add-food', params: {selectedCategory: 'Breakfast'}})}/>

      { /*2. Lunch*/}
    <MealSection 
      title='Lunch'
      type='Lunch'
      meals={meals}
      onDelete={deleteMeal}
      onAdd={() => router.push({pathname: '/add-food', params: {selectedCategory: 'Lunch'}})}
    />

      { /*3. Dinner*/}
      <MealSection 
        title='Dinner'
        type='Dinner'
        meals={meals}
        onDelete={deleteMeal}
        onAdd={() => router.push({pathname: '/add-food', params: {selectedCategory: 'Dinner'}})}
      />
    </View>
  </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:{
    flex:1
  },
  mainWrapper:{
    flex:1,
    backgroundColor: THEME.color.background,
  },
  scrollContainer:{
    paddingBottom: 50
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
  loadingContainer: {flex: 1, backgroundColor: THEME.color.background , justifyContent: 'center', alignItems:'center' },
  loaderText: {color: '#00f0ff', letterSpacing: 5, marginBottom: 20, fontSize: 20, fontWeight: 'bold'},
  container: { flex: 1, backgroundColor: THEME.color.background, justifyContent: 'flex-start', paddingTop:100, alignItems: 'center' },
  header: { color: THEME.color.accent, letterSpacing: 5, marginBottom: 10 },
  number: { color: '#fff', fontSize: 48, fontWeight: 'bold' },
  logo: {width: 250, height: 250, marginBottom: 20, resizeMode: 'contain'}
});