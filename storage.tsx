import React, { createContext, useContext, useState } from 'react';

interface Meal{
    id: string;
    name: string;
    calories: number;
    brand?: string;
    mealType: string;
}

interface FoodContextType{
    totalCalories: number;
    meals: Meal[];
    addCalories: (food: Meal) => void;
}

const FoodContext = createContext <FoodContextType | undefined> (undefined);

export function FoodProvider({children}: {children: React.ReactNode}) {
    const [totalCalories, setTotalCalories] = useState(0);
    const [meals, setMeals] = useState<Meal[]>([]);

    const addCalories = (food: Meal) => {
        setTotalCalories((prev) => prev + food.calories);
        setMeals((prevMeals) => [...prevMeals, food])
    };

    return(
        <FoodContext.Provider value = {{totalCalories, meals, addCalories}}>
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
