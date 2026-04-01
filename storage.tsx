import React, { createContext, useContext, useState } from 'react';

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
    setSelectedDate: (date: string) => void;
    addCalories: (food: Meal) => void;
    deleteMeal: (id: string) => void;
    updateMeal: (food: Meal) => void;
}

const FoodContext = createContext <FoodContextType | undefined> (undefined);

export function FoodProvider({children}: {children: React.ReactNode}) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [allMeals, setAllMeals] = useState<Meal[]>([]);

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
        <FoodContext.Provider value = {{totalCalories, meals: filteredMeals, addCalories, deleteMeal, updateMeal, setSelectedDate, selectedDate}}>
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
