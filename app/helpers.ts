// Capitalize Food Names
export function formatFoodName(text: string){
    if (!text) return "Uknown Food";
    return text
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}
// Check value and make the macros have one decimal
export function parseMacro(value: any){
    if(value === undefined || value === null || isNaN(value)) return 0;
    const rawNumber = Number(value);
    return Math.round(rawNumber * 10) / 10;
}
