import { THEME } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
    label: string;
    grams: number;
    percentage: number;
    color: string;
}

export const Macrobar = ({label, grams, percentage, color}: Props) => (

    <View style={styles.macroRow}>
        <Text style={styles.macroLabel}>{label}</Text>
        <View style={styles.barTrack}>
            <View style={[styles.barFill, {width: `${percentage}%`, backgroundColor: color}]}/>
        </View>
        <Text style={styles.macroValue}>{grams}g</Text>
    </View>

)

const styles = StyleSheet.create({
    macroRow:{
        flexDirection: 'row',
        alignItems:'center',
        justifyContent: 'space-between',
    },
    macroLabel:{
        color: '#fff',
        width: 60,
        fontSize: 16
    },
    macroValue: {
        color: '#aaa',
        fontSize: 16,
        width:35,
        textAlign: 'center'
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
        overflow: 'hidden'
    }
})