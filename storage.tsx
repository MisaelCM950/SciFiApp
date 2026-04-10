import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface Meal{
    id: string;
    name: string;
    baseCalories: number;
    carbs: number;
    fat: number;
    protein: number;
    quantity: number;
    calories: number;
    brand?: string;
    mealType: string;
    date: string;
}

interface FoodContextType{
    totalCalories: number;
    meals: Meal[];
    selectedDate: string;
    calorieGoal: string;
    carbGoal: string;
    fatGoal: string;
    proteinGoal: string;
    setCalorieGoal: (val: string) => void;
    setCarbGoal:(val: string) => void;
    setFatGoal:(val: string) => void;
    setProteinGoal:(val: string) => void;
    setSelectedDate: (date: string) => void;
    addCalories: (food: Meal) => void;
    deleteMeal: (id: string) => void;
    updateMeal: (food: Meal) => void;
}

const FoodContext = createContext <FoodContextType | undefined> (undefined);

export function FoodProvider({children}: {children: React.ReactNode}) {
    const [calorieGoal, setCalorieGoal] = useState('2500');
    const [carbGoal, setCarbGoal] = useState('300g');
    const [fatGoal, setFatGoal] = useState('80g');
    const [proteinGoal, setProteinGoal] = useState('150g')
    const [isloaded, setIsLoaded] = useState(false);
    const [allMeals, setAllMeals] = useState<Meal[]>([]);


    useEffect(()=>{
        const loadData = async()=>{
            try{
                const savedMeals = await AsyncStorage.getItem('allMeals');
                const savedCal = await AsyncStorage.getItem('calorieGoal');
                const savedCarb = await AsyncStorage.getItem('carbGoal');
                const savedFat = await AsyncStorage.getItem('fatGoal')
                const savedProtein = await AsyncStorage.getItem('proteinGoal');

                if(savedMeals) setAllMeals(JSON.parse(savedMeals));
                if(savedCal) setCalorieGoal(savedCal);
                if(savedCarb) setCarbGoal(savedCarb);
                if(savedFat) setFatGoal(savedFat);
                if(savedProtein) setProteinGoal(savedProtein);
            } catch (error){
                console.error('Failed to load data', error);
            } finally{
                setIsLoaded(true);
            }
        };
        loadData();
    }, []);


    useEffect(()=>{
        if(!isloaded) return;

        const saveData = async ()=> {
            try{
                await AsyncStorage.setItem('allMeals', JSON.stringify(allMeals));
                await AsyncStorage.setItem('calorieGoal', calorieGoal);
                await AsyncStorage.setItem('carbGoal', carbGoal);
                await AsyncStorage.setItem('fatGoal', fatGoal);
                await AsyncStorage.setItem('proteinGoal', proteinGoal);
            } catch (error) {
                console.error("Failed to save data", error)
            }
        };
        saveData();
    }, [allMeals, calorieGoal, carbGoal, fatGoal, proteinGoal]);

    const now = new Date();
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
    

    const filteredMeals = allMeals.filter(meal => meal.date === selectedDate);
    
    const totalCalories = filteredMeals.reduce((sum, meal) => sum + meal.calories, 0);

    const deleteMeal = (id: string)=> {
            setAllMeals((prevMeals)=> prevMeals.filter((meal) => meal.id !== id));
    };
//
    const addCalories = (food: Meal) => {
        setAllMeals((prevMeals) => [...prevMeals, food])
    };


    const updateMeal = (updatedFood: Meal) => {
            setAllMeals((prevMeals) => prevMeals.map(meal => meal.id === updatedFood.id ? updatedFood: meal ));
    };

    return(
        <FoodContext.Provider value = {{
            totalCalories, 
            meals: filteredMeals, 
            addCalories, 
            deleteMeal, 
            updateMeal, 
            setSelectedDate, 
            selectedDate, 
            
            calorieGoal, setCalorieGoal,
            carbGoal, setCarbGoal,
            fatGoal, setFatGoal,
            proteinGoal, setProteinGoal
            }}>
            {children}
        </FoodContext.Provider>
    );
}

export function useFood(){
    const context = useContext(FoodContext);
    if(!context){
        throw new Error('useFood must be used within a FoodProvider');
    }
    return context;
}
