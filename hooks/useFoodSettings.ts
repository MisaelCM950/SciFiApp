import { useSound } from '@/SoundContext';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useFood } from '../storage';

export function useFoodSettings(params: any) {
    const router = useRouter(); 
    const {addMeal, updateMeal, selectedDate} = useFood();
    const {id, name, calories, brand, carbs, fat, protein, baseCalories, quantity: savedQuantity, 
        selectedCategory, isEditing, servingSize, servingName, unitName: savedUnitName, 
        originalGramWeight: savedGramWeight, baseProtein, baseFat, baseCarbs, fatSecretId} = params;
    
    const [quantity, setQuantity] = useState((savedQuantity as string) || '1');
    const [mealType, setMealType] = useState(selectedCategory ||'Breakfast');
    const [isLoadingServings, setIsLoadingServings] = useState(false);

    const safeServingAmount = parseFloat(servingSize as string) || 1;
    let smartMultiplier =  safeServingAmount;

    if(!savedGramWeight && servingName) {
        const match = String(servingName).match(/([\d.]+)\s*g/i);
        if (match) {
            smartMultiplier = parseFloat(match[1]);
        }
    }

        const baseCal = Number(baseCalories) || Number(calories) || 0;
        const finalBaseProtein = Number(baseProtein) || Number(protein) || 0;
        const finalBaseCarbs = Number(baseCarbs) || Number(carbs) || 0;
        const finalBaseFat = Number(baseFat) || Number(fat) || 0;

        

    if (smartMultiplier === 1 && baseCal > 9) {
        const macroMass = finalBaseProtein + finalBaseCarbs + finalBaseFat;
        smartMultiplier = macroMass > 0 ? Math.round(macroMass * 3) : 150; 
    }

    const fallbackMultiplier = savedGramWeight ? Number(savedGramWeight) : smartMultiplier;

    const initialDropdownList = [    
        {label: '1 g', gramMultiplier: 1},
        {label: '1 oz', gramMultiplier: 28.35},
        {label: '1 kg', gramMultiplier: 1000}
    ];

    if (servingName && servingName !== 'g' && servingName !== 'oz') {
        initialDropdownList.unshift({ 
            label: servingName as string, 
            gramMultiplier: fallbackMultiplier 
        });
    }
    
    const [availableUnits, setAvailableUnits] = useState(initialDropdownList);
    const initialUnit = availableUnits.find(u => u.label === savedUnitName) || availableUnits[0];
    const [selectedUnit, setSelectedUnit] = useState(initialUnit);
    const [originalServingGrams, setOriginalServingGrams] = useState(fallbackMultiplier);

    useEffect(()=>{
            async function fetchDetailedServings() {
                const searchId = fatSecretId || id
                if(!searchId || String(searchId).startsWith("AI-")) return;
                
                setIsLoadingServings(true);
                try {
                    const clientId = process.env.EXPO_PUBLIC_FS_CLIENT_ID;
                    const clientSecret = process.env.EXPO_PUBLIC_FS_CLIENT_SECRET;
    
                    const tokenResponse = await fetch('https://oauth.fatsecret.com/connect/token', {
                        method: 'POST',
                        headers: {"Content-Type": 'application/x-www-form-urlencoded'},
                        body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
                    });
    
                    if(!tokenResponse.ok) throw new Error('Auth Failed');
                    const tokenData = await tokenResponse.json();
                    const accessToken = tokenData.access_token;
    
                    const response = await fetch(`https://platform.fatsecret.com/rest/server.api?method=food.get.v2&food_id=${searchId}&format=json`, {
                        method: "GET", 
                        headers: {'Authorization': `Bearer ${accessToken}`}
                    });
                    const result = await response.json()
                    
                    if(result.food && result.food.servings && result.food.servings.serving){
                        const rawServings = Array.isArray(result.food.servings.serving)
                            ? result.food.servings.serving
                            : [result.food.servings.serving]
    
                        const formattedUnits = rawServings.map((s: any)=>({
                            label: s.serving_description,
                            gramMultiplier: parseFloat(s.metric_serving_amount) || fallbackMultiplier
                        }));
                        
                        formattedUnits.push({label: '1 g',  gramMultiplier: 1});
                        formattedUnits.push({label: "1 oz", gramMultiplier: 28.35});
                        formattedUnits.push({label: '1 kg', gramMultiplier: 1000})
                        
                        setAvailableUnits(formattedUnits);
    
                        if(isEditing !== 'true'){
                            const originalUnitData = formattedUnits.find((u : any) => 
                                u.label.toLowerCase().includes(String(servingName).toLowerCase()));
    
                            if (originalUnitData) {
                            setOriginalServingGrams(originalUnitData.gramMultiplier);
                            if (selectedUnit.label === servingName) {
                                setSelectedUnit(originalUnitData);
                            }
                        }
                        } else {
                            const realSavedUnit = formattedUnits.find((u: any) => u.label === savedUnitName);
                            if(realSavedUnit){
                                setSelectedUnit(realSavedUnit);
                            }
                        };
    
                    }
                } catch (error){
                    console.error("Failed to load servings", error);
                } finally {
                    setIsLoadingServings(false);
                }
            }
            fetchDetailedServings();
        }, [id]);
        
        const userTypedAmount = parseFloat(quantity) || 0;
        const trueGramWeight = userTypedAmount * selectedUnit.gramMultiplier;
        
        
        
    
        const baseCalPerGram = baseCal / originalServingGrams;
        const carbsPerGram = finalBaseCarbs / originalServingGrams;
        const fatPerGram = finalBaseFat / originalServingGrams;
        const proteinPerGram = finalBaseProtein / originalServingGrams;

        
    
        const calculatedCalories = Math.round(baseCalPerGram * trueGramWeight) || 0;
        const c = Math.round(carbsPerGram * trueGramWeight * 10) / 10;
        const f = Math.round(fatPerGram * trueGramWeight * 10) / 10;
        const p = Math.round(proteinPerGram * trueGramWeight * 10) / 10;
    
        const totalMacros = c + f + p;
        const carbsPct = totalMacros > 0 ? (c/totalMacros) * 100 : 0;
        const fatPct = totalMacros > 0 ? (f/totalMacros) * 100 : 0;
        const proteinPct = totalMacros > 0 ? (p/totalMacros) * 100: 0;

        const {playSuccess} = useSound();

        
        const handleAdd = () => {
                const mealData = {
                    id: isEditing === 'true' ? (id as string) : Date.now().toString(),
                    fatSecretId: fatSecretId ? (fatSecretId as string) : (id as string),
                    name: name as string,
                    baseCalories: baseCal, 
                    carbs: c, 
                    fat: f, 
                    protein: p,
                    quantity: Number(quantity),
                    unitName: selectedUnit.label,
                    servingSize: safeServingAmount,
                    servingName: servingName as string,
                    calories: calculatedCalories,
                    brand: brand as string,
                    mealType: mealType as string,
                    date: selectedDate,
                    originalGramWeight: originalServingGrams,
                    baseProtein: finalBaseProtein,
                    baseCarbs: finalBaseCarbs,
                    baseFat: finalBaseFat
                };
                if(isEditing === 'true') {
                    updateMeal(mealData);
                } else {
                    addMeal(mealData);               
                }
                    playSuccess();
                    router.dismissAll()        
    
            }   

            return {
                quantity, setQuantity,
                mealType, setMealType,
                availableUnits,
                selectedUnit, setSelectedUnit,
                isLoadingServings,
                calculatedCalories, c, f, p,
                carbsPct, fatPct, proteinPct,
                handleAdd,
                router
            }
}