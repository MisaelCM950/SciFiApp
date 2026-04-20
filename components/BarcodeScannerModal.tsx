import { formatFoodName, parseMacro } from '@/app/helpers';
import dayjs from 'dayjs';
import { CameraView } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BarcodeScannerModalProps{
    isVisible: boolean,
    onClose: () => void;
}
export default function BarcodeScannerModal({isVisible, onClose}: BarcodeScannerModalProps){

    const router = useRouter();
    const {selectedCategory} = useLocalSearchParams();

// Barcode Scanning Variables
    const [isLookingUp, setIsLookingUp] = useState(false);
    const scanLock = useRef(false);
    const scanLineAnim = useRef(new Animated.Value(0)).current;

// The Animation Engine
    useEffect(()=>{
    if(isVisible){
        Animated.loop(
          Animated.sequence([
            Animated.timing(scanLineAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.ease)
            }),
            Animated.timing(scanLineAnim, {
                toValue: 0,
                duration: 2000,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.ease)
            })
          ])  
        ).start();
    } else {
        scanLineAnim.setValue(0);
        scanLock.current = false;
    }
   }, [isVisible]);

   const scanLineTranslateY = scanLineAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 248]
   });
    
   async function handleBarcodeScanned({data}: {data: string}){
   
           if(scanLock.current) return;
           scanLock.current = true;
           setIsLookingUp(true);
   
           try{
               console.log("Scanned Barcode:", data);
               const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${data}.json`);
               if(!response.ok){
                   alert("This barcode isn't in the database yet!");
                   onClose();
                   setIsLookingUp(false);
                   scanLock.current = false;
                   return;
               }
               const result = await response.json();
   
               if(result.status === 1){
                   const product = result.product;
                   const nutriments = product.nutriments;
   
                   const localDate = dayjs().format('YYYY-MM-DD');
   
                   const cals100 = parseMacro(nutriments['energy-kcal_100g'] || nutriments['energy-kcal']);
                   const protein100 = parseMacro(nutriments.proteins_100g);
                   const carbs100 = parseMacro(nutriments.carbohydrates_100g);
                   const fat100 = parseMacro(nutriments.fat_100g);
   
                   const servingGrams = parseFloat(product.serving_quantity) || 100;
                   const servingText = product.serving_size || '100g';
                   const rawBrand = product.brands ? product.brands.split(',')[0] : "Generic";
                   const cleanBrand = formatFoodName(rawBrand);
   
                   const scannedItem = {
                       id: Date.now().toString(),
                       name: formatFoodName(product.product_name || "Scanned Food"),
                       calories:cals100 / 100,
                       protein: protein100 / 100,
                       carbs: carbs100 / 100,
                       fat: fat100 / 100,
                       date: localDate,
                       baseCalories: cals100 / 100,
                       mealType: (selectedCategory as string) || "Breakfast",
                       servingSize: servingGrams,
                       servingName: servingText,
                       quantity: 1,
                       brand: cleanBrand
                   };
                   
                   onClose();
   
                   router.push({
                       pathname: '/add-food-setting',
                       params: {
                           ...scannedItem,
                           selectedCategory
                       }
                   })
               } else {
                   alert("Food not found in database! Try typing it or using your voice.");
                   onClose();
               } 
           } catch (error){
               console.error("Barcode lookup failed", error);
               alert("Network error while looking up barcode.");
               onClose();
           } finally {
               setIsLookingUp(false);
           }
   }
   
   return (
    <Modal visible={isVisible} animationType='slide' presentationStyle='pageSheet'>
                <View style={{flex:1, backgroundColor: '#000', justifyContent: 'center'}}>
                    <CameraView
                        style={{flex: 1}}
                        facing='back'
                        onBarcodeScanned={isLookingUp ? undefined : handleBarcodeScanned}
                        barcodeScannerSettings={{
                            barcodeTypes: ['upc_a', 'upc_e', "ean8", 'ean13']
                        }}
                    >
                        <View style={styles.scannerContainer}>
                            <View style={styles.scannerBox}>
                                <Animated.View 
                                    style={[styles.scannerLine, {transform: [{translateY: scanLineTranslateY}]}]}
                                />
                            </View>
                        </View>
                    </CameraView>

                    {isLookingUp && (
                        <View style={[StyleSheet.absoluteFillObject, {backgroundColor: 'rgba(0,0,0,0.6)', justifyContent:"center", alignItems: 'center'}]}>
                            <ActivityIndicator size="large" color='#00f2ff'/>
                            <Text style={{color: "#00f2ff", marginTop: 10, fontWeight: 'bold'}}>Looking up food...</Text>
                        </View>
                    )}
                        

                    <TouchableOpacity style={{position: 'absolute', top: 50, right: 20, backgroundColor: '#333', padding: 15, borderRadius: 50}}
                    onPress={onClose}
                    >
                        <Text style={{color: '#fff', fontWeight: 'bold'}}>Close</Text>
                    </TouchableOpacity>

                </View>
            </Modal>
   )
}

const styles = StyleSheet.create({
    scannerContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center'
    },
    scannerBox: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#00f2ff',
        backgroundColor: 'rgba(0, 242, 255, 0.05)',
        borderRadius: 15,
        overflow: 'hidden',
    },
    scannerLine: {
        width: '100%',
        height: 3,
        backgroundColor: '#00f2ff',
        shadowColor: '#00f2ff',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 5,
    },  
})