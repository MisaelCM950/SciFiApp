import { formatFoodName, parseMacro } from '@/shared/helpers';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { useState } from 'react';
export function useFoodSearch(uniqueRecentFoods: any[], selectedCategory: any){

    const router = useRouter(); 
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearchingText, setIsSearchingText] = useState(false);
    const [AISpinner, setAISpinner] = useState(false)
    const [suggestions, setSuggestions] = useState<any[]>([]);
   
   const handleTextChange = (text: any) => {
    setSearchQuery(text);
    if (text.trim() === ''){
        setSuggestions([]);
        return;
    }
    const matches = uniqueRecentFoods.filter((meal) =>
        meal.name.toLocaleLowerCase().includes(text.toLowerCase())
    );
    setSuggestions(matches.slice(0,4));
   }

   async function fallbackToAI(query: string){
        try{
            setAISpinner(true)
            console.log("Asking AI to estimate:", query);
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_KEY}`,
                    'Content-Type' : 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: "You are an expert nutritionist API. The user searched for a food that is missing from the database. Estimate the macros for exactly 100g of this food. Respond ONLY with a valid JSON object using these exact keys: name (string), calories (number), protein (number), carbs (number), fat (number). Make the name clean and capitalized"
                        },
                        {role: 'user', content: query}
                    ],
                    temperature: 0.2
                })
            });
            const data = await response.json();
            const macroData = JSON.parse(data.choices[0].message.content);

            const aiResult = {
               id: "AI-" + Date.now().toString(),
               name: formatFoodName(macroData.name) + " (AI Estimate)",
               brand: "AI Generated",
               calories: Math.round(macroData.calories),
               protein: parseMacro(macroData.protein) / 100,
               carbs: parseMacro(macroData.carbs) / 100,
               fat: parseMacro(macroData.fat) / 100,
               baseCalories: macroData.calories / 100,
               servingSize: 100,
               servingName: "100g",
               quantity: 1,
               mealType: (selectedCategory as string) || "Breakfast",
               date: dayjs().format('YYYY-MM-DD')
           };
           router.push({
            pathname: '/add-food-setting',
            params: {
                ...aiResult,
                selectedCategory
            }
           });
        } catch (error) {
            console.error("AI Fallback failed:", error);
            alert("AI could not estimate the food");
        } finally {
            setIsSearchingText(false)
            setAISpinner(false)
        }
   }

   async function searchFoodAPI(query: string){
        if (!query.trim()) return;

        setIsSearchingText(true);
        try {
            console.log("Searching FatSecret for:", query);
            const clientSecret = process.env.EXPO_PUBLIC_FS_CLIENT_SECRET;
            const clientId = process.env.EXPO_PUBLIC_FS_CLIENT_ID;
            

            if(!clientId || !clientSecret){
                alert("Missing FatSecret keys in .env!");
                    setIsSearchingText(false);
                    return;
            }
            const tokenResponse = await fetch('https://oauth.fatsecret.com/connect/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
            });
            
            if(!tokenResponse.ok){
                console.error("Auth failed:", await tokenResponse.text())
                alert("Server error from database.");
                setIsSearchingText(false);
                return;
            }

            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;
//
            const safeQuery = encodeURIComponent(query);
            const searchResponse = await fetch(`https://platform.fatsecret.com/rest/server.api?method=foods.search&search_expression=${safeQuery}&format=json&max_results=10&region=MX`, {
                method: 'GET',
                headers: {'Authorization': `Bearer ${accessToken}`}
            });

            const result = await searchResponse.json();
            console.log("FatSecret Raw Data:", JSON.stringify(result, null, 2));
//
            if(result.foods && result.foods.food){
                const foodArray  = Array.isArray(result.foods.food) ? result.foods.food : [result.foods.food];
                const formattedResults = foodArray.map((food: any)=> {
                    const desc = food.food_description || "";
                    
                    const calMatch = desc.match(/Calories:\s*([\d.]+)\s*kcal/i);
                    const fatMatch = desc.match(/Fat:\s*([\d.]+)\s*g/i);
                    const carbMatch = desc.match(/Carbs?:\s*([\d.]+)\s*g/i);
                    const proMatch = desc.match(/Protein:\s*([\d.]+)\s*g/i);
                    const servingMatch = desc.match(/Per\s*([\d.]+)\s*([a-zA-Z]+)/i)
                    const rawServingSize = servingMatch ? parseFloat(servingMatch[1]) : 100;
                    const rawServingName = servingMatch ? servingMatch[2] : 'g';

                    const rawCalories = calMatch ? parseFloat(calMatch[1]) : 0;
                    const rawFat = fatMatch ? parseFloat(fatMatch[1]) : 0;
                    const rawCarbs = carbMatch ? parseFloat(carbMatch[1]) : 0;
                    const rawProtein = proMatch ? parseFloat(proMatch[1]) : 0;

                    return {
                        id: food.food_id || Date.now().toString() + Math.random(),
                        name: formatFoodName(food.food_name || "Unknown Food"),
                        brand: formatFoodName(food.brand_name),
                        calories: Math.round(rawCalories),
                        protein: parseMacro(rawProtein),
                        carbs: parseMacro(rawCarbs),
                        fat: parseMacro(rawFat),
                        baseCalories: rawCalories,
                        servingSize: rawServingSize,
                        servingName: rawServingName,
                        quantity: 1,
                        mealType: (selectedCategory as string) || "Breakfast",
                        date: dayjs().format('YYYY-MM-DD')
                    };
                });
                setSearchResults(formattedResults);
            } else {
                alert("No foods found matching that search.");
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Text search failed:", error);
            alert("Network error while searching.");
        } finally{
            setIsSearchingText(false);
        }
   }

   return {    
    searchQuery,
    suggestions,
    searchResults,
    isSearchingText,
    AISpinner,
    handleTextChange,
    searchFoodAPI,
    fallbackToAI
   };
}