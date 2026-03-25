import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { THEME } from '../constants/theme';

export default function MealRow ({meal, onDelete}: {meal: any, onDelete: (id:string) => void}) {
  const renderRightActions = () => (
    <View style={styles.deleteBackground}>
      <Text style={styles.deleteText}>DELETE</Text>
    </View>
    );
    return (
      <Swipeable 
      friction={1}
      rightThreshold={60}
      renderRightActions={renderRightActions} 
      containerStyle={{ flex: 1, backgroundColor: '#003135' }} 
      onSwipeableWillOpen={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      onDelete(meal.id);
  }}
    >
      <View style={[styles.diaryItem, { borderTopWidth: 0, backgroundColor: '#003135' }]}>
        <View style={styles.leftColumn}>
          <Text style={styles.baseText}>{meal.name}</Text>
          <View style={styles.detailsRow}>
              <Text style={[styles.baseText, styles.details]}>{meal.brand || 'Generic'}</Text> 
              <Text style={[styles.baseText, styles.details]}>1 Serving</Text>
          </View>
        </View>
        <Text style={styles.baseText}>{meal.calories}</Text>
      </View>
    </Swipeable>
    );
    };

const styles= StyleSheet.create({
    baseText: {fontSize: 18, color:'#fff'},
    details:{opacity:0.5},
    detailsRow:{
    flexDirection: 'row',
    gap: 4,
  },
  diaryItem: {
    flexDirection: 'row', 
    width: '100%',  
    paddingHorizontal: 20, 
    paddingVertical: 15,
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: THEME.color.border,
 },
 leftColumn:{
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
  },
  deleteText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 16,
},
 deleteBackground: {
  backgroundColor: THEME.color.danger,
  justifyContent: 'center',
  alignItems: 'flex-end',
  paddingRight: 30,
  height: '100%', 
  width: '100%'
},
})