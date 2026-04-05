import { THEME } from '@/constants/theme';
import { useFood } from '@/storage';
import { FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';
import { Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function Settings() {

  const [isLocked, setIsLocked] = useState(true);
  const {
    calorieGoal, setCalorieGoal,
    carbGoal, setCarbGoal,
    fatGoal, setFatGoal,
    proteinGoal, setProteinGoal
  } = useFood();

  const GoalRow = ({label, value, setValue, color}: {label:string, color: string, value: string, setValue: (val: string)=> void})=>(
    <View style= {styles.optionContainer}>
        <Text style={styles.settingOption}>{label}</Text>
        <View style={styles.inputContainer}>
            {isLocked ? (
                <Text style={[styles.lockedText, {color: color}]}>{value}</Text>
            ): (
                <View>
                    <TextInput
                        style={styles.optionInput}
                        value={value}
                        onChangeText={setValue}
                        keyboardType='numeric'
                        selectTextOnFocus= {true}
                    />
                    <View style={styles.glowLine}/>
            
                </View>
            )}
        </View>
      
    </View>
  )
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible ={false}>
      <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>
            <View style={styles.goalSettings}>
                <View style={styles.headerRow}>
                    <Text style={styles.baseText}>Customize Your Goals</Text>
                    <TouchableOpacity onPress={()=> setIsLocked(!isLocked)} style={styles.lockButton} >
                        <FontAwesome 
                            name={isLocked ? 'lock' : 'unlock'}
                            size={24}
                            color={isLocked ? '#aaa' : "#00f2ff"}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.customGoals}>
                    <GoalRow label='Calories' value={calorieGoal} setValue={setCalorieGoal} color='#aaa'/>
                    <GoalRow label='Carbs' value={carbGoal} setValue={setCarbGoal}color = {THEME.color.accent} />
                    <GoalRow label='Fat' value={fatGoal} setValue={setFatGoal} color='#ff4444'/>
                    <GoalRow label='Protein' value={proteinGoal} setValue={setProteinGoal} color='#00ff44'/>
                </View>

          </View>
      </View>

    </TouchableWithoutFeedback>
  
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.color.background,
    paddingTop: 70,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10
  },
  lockedText: {
    color: '#aaa',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
    paddingRight: 10,
    height: 50,
    lineHeight: 50
  },
  lockButton: {
    padding: 10
  },
  title:{
    color: '#fff', 
    fontSize:24, 
    fontWeight: 'bold', 
    letterSpacing: 2, 
    marginBottom: 40
  },
  baseText:{
        color: '#fff',
        fontSize: 18,
        fontWeight:'bold'
  },
  goalSettings:{
    width: '100%',
  },
  customGoals: {
    gap: 10
  },
  settingOption: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15
  },
  optionContainer: {
    borderWidth: 1,
    width: '100%',
    borderColor: THEME.color.border,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  optionInput:{
        height:50, 
        color: '#00f2ff', 
        fontSize: 20, 
        paddingHorizontal: 10,
        textAlign: 'right'
  },
  glowLine:{
    backgroundColor: '#00f2ff', 
    height: 2, shadowColor: "#00f2ff", 
    shadowRadius: 10, 
    shadowOpacity: 1, 
    elevation: 5
  },
  inputContainer: {
    width: '30%',
  }
});
