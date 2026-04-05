import { useFood } from '@/storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MealSection from '../../components/MealSection';
import { THEME } from '../../constants/theme';


export default function CalTracker() {
  const {totalCalories, meals, deleteMeal, selectedDate, setSelectedDate, calorieGoal} = useFood();
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const GOAL = calorieGoal;
  const exercise = 0;
  const remaining = Number(calorieGoal) - totalCalories;

  const getDisplayDate = () => {
    const today = new Date().toISOString().split('T')[0];
    if(selectedDate === today) return "Today";
    
    const [year, month, day] = selectedDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
    }

  const changeDate = (direction: 'prev'| 'next') => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const newDate  = new Date(year, month - 1, day);

    if(direction === 'prev') newDate.setDate(newDate.getDate() - 1);
    if(direction === 'next') newDate.setDate(newDate.getDate() + 1);

    const y = newDate.getFullYear();
    const m = String(newDate.getMonth() + 1).padStart(2, '0');
    const d = String(newDate.getDate()).padStart(2, '0');

    setSelectedDate(`${y}-${m}-${d}`);
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
  <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.mainWrapper}>
    <View style={styles.container}>

        <View style={styles.dateHeader}>
          <TouchableOpacity onPress={() => changeDate('prev')} style={styles.arrowButton}>
            <Text style={styles.arrowText}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={styles.dateText}>{getDisplayDate()}</Text>
          
          <TouchableOpacity onPress={() => changeDate('next')} style ={styles.arrowButton}>
            <Text style = {styles.arrowText}>{">"}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Progress</Text>
        </View>

      {/* Block 1: Goal */}
      <Pressable style={styles.dashboardContainer} onPress={ () =>
        router.push({
          pathname: '/Macros'
          
        })
      }>
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
      </Pressable>
     



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
  dateText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  dateHeader:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20
  },
  arrowText: {
    color: '#00f2ff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  arrowButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
  },
  root:{
    flex:1
  },
  mainWrapper:{
    flex:1,
    backgroundColor: THEME.color.background,
  },
  title: {
    color: THEME.color.accent, 
    fontWeight: 'bold', 
    fontSize: 17, 
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
  headerContainer: {
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingHorizontal: 20
  },
  loadingContainer: {flex: 1, backgroundColor: THEME.color.background , justifyContent: 'center', alignItems:'center' },
  loaderText: {color: '#00f0ff', letterSpacing: 5, marginBottom: 20, fontSize: 20, fontWeight: 'bold'},
  container: { flex: 1, backgroundColor: THEME.color.background, justifyContent: 'flex-start', paddingTop: 70, alignItems: 'center' },
  number: { color: '#fff', fontSize: 48, fontWeight: 'bold' },
  logo: {width: 250, height: 250, marginBottom: 20, resizeMode: 'contain'}
});