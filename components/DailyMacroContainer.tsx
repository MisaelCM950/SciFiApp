import { THEME } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

interface Props{
    totalMacro: number;
    totalGoal: number;
    label: string;
    goalLeft: number;
    color: string;
}


export const MacroContainer = ({label, totalMacro, totalGoal, goalLeft, color}: Props) => {
    
const fillPercentage = Math.min((totalMacro / totalGoal) * 100, 100);

return(
    <View style={styles.sectionContainer}>
                        <View style={styles.macroHeader}>
                            <Text style={styles.sectionTitle}>{label}</Text>
                            <View style={styles.grams}>
                                <Text style={[styles.statsText, {color: color, fontWeight: 'bold', fontSize: 20}]}>{totalMacro}g</Text> 
                                <Text style={styles.statsText}> / {totalGoal}g</Text>
                            </View>
                        </View>
                        <View style={styles.macroRow}>
                                <View style={styles.barTrack}>
                                    <View style={[styles.barFill, {width: `${fillPercentage}%`, backgroundColor: color}]}/>
                                </View>
                        </View>
                        <View style={styles.macroDetails}>
                            <View style={[styles.detailContainer, {borderColor: color}]}>
                                <Text style={styles.statsText}>Consumed</Text>
                                <Text style = {[styles.statsTextMacro, {color: color}]}>{totalMacro}</Text>
                            </View >
                            <View style={[styles.detailContainer, {borderWidth: 0}]}>
                                <Text style={styles.statsText}>Goal</Text>
                                <Text style={[styles.statsTextMacro, {color: '#aaa'}]}>{totalGoal}g</Text>
                            </View>
                            <View style={[styles.detailContainer, {borderColor: color}]}>
                                <Text style={styles.statsText}>Remaining</Text>
                                <Text style={[styles.statsTextMacro, {color: '#00ff44'}]}>{goalLeft}</Text>
                            </View>
                        </View>
            </View>
)}
const styles = StyleSheet.create({
    grams: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    sectionContainer: {
    width: '100%', 
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 20,
    borderRadius: 15,
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: THEME.color.border
    },
    barFill:{
        height: '100%',
        borderRadius: 5
    },
    barTrack:{
        flex: 1,
        height: 10,
        backgroundColor: THEME.color.border,
        borderRadius: 5,
        marginHorizontal:10,
        overflow: 'hidden',
    },
    statsTextMacro: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    macroRow:{
    flexDirection: 'row',
    alignItems:'center',
    justifyContent: 'space-between',
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5
    },
    detailContainer: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignItems: 'center',
        borderWidth: 0.2,
    },
    macroDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10
    },
    macroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    statsText: {
        color: '#aaa',
        fontSize: 14,
        fontWeight: '600'
    },
})
