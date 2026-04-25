import { Macrobar } from '@/components/Barchart';
import { THEME } from '@/constants/theme';
import { useFoodSettings } from '@/hooks/useFoodSettings';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

export default function AddFoodSettingScreen() {
    const params = useLocalSearchParams();
    const {name, brand, isEditing} = params;
    const {quantity, setQuantity, mealType, setMealType, availableUnits, selectedUnit,
        setSelectedUnit, isLoadingServings, calculatedCalories, c, f, p, carbsPct, fatPct,
        proteinPct, handleAdd, router
    } = useFoodSettings(params);

    // Dropdown Render Item
    const renderItem = (item: any) => {
        return(
            <View style={[styles.dropdownItem, item.label === selectedUnit.label && {backgroundColor: 'rgba(0, 242, 255, 0.4)'}]}>
                <Text style={[styles.textItem, item.label == selectedUnit.label && {color: 'rgba(18, 208, 218, 0.99)', fontWeight: 'bold'}]}>{item.label}</Text>
            </View>
        );
    };

    

    return(
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.root}>
                <Image source={require('@/assets/images/hud-bg-food-settings.png')} style={[StyleSheet.absoluteFillObject, {width: '100%', height: '100%'}]}
                    contentFit='fill' cachePolicy='memory-disk'
                />
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.buttonStyle} onPress={()=> router.back()}>
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.buttonStyle}  onPress={handleAdd}>
                    <Text style= {styles.backText}>{isEditing === 'true' ? 'Update' : 'Add'}</Text>
                </TouchableOpacity>
            </View>
            
            <Text style={[styles.title, {marginBottom: 20, textAlign: 'center'}]}>
                <Text style={{color: THEME.color.accent}}>Add </Text>
                <Text>{name}</Text>
            </Text>
            <Text style={{color: '#fff', marginBottom: 20, fontWeight: 'bold'}}>{brand}</Text>

            <View style={[styles.formContainer]}>
                <View style={styles.settingsRow}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                        <Text style={styles.baseText}>Serving Size</Text>
                        {isLoadingServings && <ActivityIndicator size="small" color="#00f2ff"/>}
                    </View>
                    
                        <Dropdown
                            style={styles.dropdown}
                            selectedTextStyle={styles.selectedTextStyle}
                            data={availableUnits}
                            maxHeight={300}
                            labelField="label"
                            valueField="label"
                            placeholder={selectedUnit.label}
                            value={selectedUnit}
                            onChange={item => setSelectedUnit(item)}
                            renderItem={renderItem}
                            containerStyle={styles.dropdownPopup}
                        />
                </View>

                <View style={styles.settingsRow}>
                    <Text style={styles.baseText}>Number of Servings</Text>
                        <View style={styles.inputContainer}>
                            <TextInput style={styles.optionInput} 
                            placeholder='0' 
                            keyboardType='numeric'
                            placeholderTextColor= '#00f2ff'
                            value={quantity}
                            onChangeText ={setQuantity}
                            selectTextOnFocus ={true}
                            />
                            <View style={styles.glowLine}/>
                        </View>
                </View>

                <View style= {styles.selectRow}>
                    {['Breakfast', 'Lunch', 'Dinner'].map((type) =>(
                        <TouchableOpacity
                        key={type}
                        style={[styles.select, mealType == type && styles.activeSelect]}
                        onPress={() => setMealType(type)}
                        >
                            <Text style={[styles.selectText, mealType === type && styles.activeSelectText]}>
                                {type.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                         
                <View style={styles.macrosContainer}>
                    <Text style={styles.sectionTitle}>Macros</Text>
                    <View style={styles.chartArea}>
                        <Macrobar label="Carbs" grams={c} percentage={carbsPct} color="#00f2ff"/>
                        <Macrobar label="Fat" grams={f} percentage={fatPct} color="#ff4444"/>
                        <Macrobar label="Protein" grams={p} percentage={proteinPct} color="#00ff44"/>
                    </View>
                </View>
            </View>
            <View style={{borderWidth: 1, padding: 15, borderRadius: 10, backgroundColor: 'rgba(0, 242, 255, 0.5)', borderColor: THEME.color.accent}}>
                <Text style={styles.baseText}>{calculatedCalories} Kcal</Text>
            </View>
        </View>
        </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    dropdownPopup: {
        backgroundColor: '#001a1c',
        borderWidth: 1,
        borderColor: '#00f2ff'
    },
    dropdown:{
        backgroundColor: 'rgba(47, 209, 218, 0.5)',
        borderWidth: 1,
        borderColor: THEME.color.accent,
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 10,
        width: 130
    },
    root:{
    flex:1,
    backgroundColor: THEME.color.background
    },
    selectedTextStyle:{
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center'
    },
    dropdownItem: {
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 242, 255, 0.5)',
        borderBottomWidth: 1,
        borderBottomColor: '#00f2ff'
    },
    textItem:{
        color: '#fff',
        fontSize: 16
    },
   baseText:{
        color: '#fff',
        fontSize: 18,
        fontWeight:'bold'
    },
    sectionTitle:{
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    macrosContainer:{
        width: '100%',
        marginBottom: 20,
        borderWidth: 1,
        padding: 10,
        borderColor: THEME.color.accent,
        backgroundColor: 'rgba(0, 242, 255, 0.1)'
    },
    chartArea: {
        width: '100%',
        gap: 15
    },
    formContainer:{
        width: '90%'
    },
    settingsRow:{
        flexDirection: 'row', 
        width: '100%',
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingVertical: 5,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#004042',
    },
    resultCalories: {
        color: '#00f2ff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    selectRow:{
        width: '100%',
        flexDirection: 'row',
        justifyContent:'space-between',
        marginTop: 20,
        marginBottom: 20
    },
    select:{
        borderWidth: 1,
        borderColor: THEME.color.accent,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5
    },
    activeSelect: {
        borderColor: THEME.color.accent,
        backgroundColor: 'rgba(0, 242, 255, 0.5)'
    },
    selectText: {
        color: '#aaa',
        fontSize: 12,
        fontWeight: 'bold'
    },
    activeSelectText: {
        color: '#ffffff',
        fontWeight: 'bold'
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: 20,
        justifyContent:'space-between', 
        flexDirection:'row', 
        paddingTop: 10,
        marginBottom: 10
    },
    inputContainer:{
        width:'30%'
    },
    container: {
        flex: 1, 
        backgroundColor: 'transparent', 
        alignItems: 'center',
        paddingTop: 20
        },
    title:{color: '#fff', fontSize:24, fontWeight: 'bold', letterSpacing: 2},
    buttonStyle:{
        marginTop: 5,
        padding: 15,
        borderWidth: 1,
        borderColor: "#00f2ff",
        backgroundColor: 'rgba(0, 242, 255, 0.1)',
        shadowColor: THEME.color.accent,
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 3
    },
    optionInput:{
        height:50, 
        color: '#feffff', 
        fontSize: 20, 
        paddingHorizontal: 10,
        textAlign: 'center'
    },
    backText: {color: '#00f2ff', fontWeight: 'bold'},
    glowLine:{backgroundColor: '#00f2ff', height: 2, shadowColor: "#00f2ff", shadowRadius: 10, shadowOpacity: 1, elevation: 5},
});
