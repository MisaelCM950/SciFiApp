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
}

interface FoodContextType{
    totalCalories: number;
    meals: Meal[];
    addCalories: (food: Meal) => void;
    deleteMeal: (id: string) => void;
    updateMeal: (food: Meal) => void;
}

const FoodContext = createContext <FoodContextType | undefined> (undefined);

export function FoodProvider({children}: {children: React.ReactNode}) {
    const [meals, setMeals] = useState<Meal[]>([]);

    
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

    const deleteMeal = (id: string)=> {
        const mealToDelete = meals.find(m => m.id === id);
        if(mealToDelete){

            setMeals((prevMeals)=> prevMeals.filter((meal) => meal.id !== id));
        }
    };
//
    const addCalories = (food: Meal) => {
        setMeals((prevMeals) => [...prevMeals, food])
    };


    const updateMeal = (updatedFood: Meal) => {
        const oldMeal = meals.find(m => m.id === updatedFood.id);
        if (oldMeal) {
            setMeals((prevMeals) => prevMeals.map(meal => meal.id === updatedFood.id ? updatedFood: meal ));
        }
    };

    return(
        <FoodContext.Provider value = {{totalCalories, meals, addCalories, deleteMeal, updateMeal}}>
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
