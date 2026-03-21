import { useRouter } from 'expo-router';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddFoodScreen(){
   const router = useRouter(); 
   
    return(
        <View style= {styles.container}>
            <TextInput style={styles.title}>Test</TextInput>
            <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                <Text style={styles.buttonText}>Add Food</Text>
            </TouchableOpacity>
        </View>
    
)};
const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#001a1c', justifyContent: 'center', alignItems: 'center'},
    title:{color: '#fff', fontSize:24, fontWeight: 'bold', letterSpacing: 2,},
    button:{borderWidth:1, borderColor: '#00f2ff', marginTop:50, padding:20, borderStyle: 'dashed',  },
    buttonText:{color:'#fff'}
});
