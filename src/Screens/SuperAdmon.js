import { View, Text,TouchableOpacity,StyleSheet,Alert } from 'react-native'
import React from 'react';
import { useNavigation } from '@react-navigation/native';

const SuperAdmon = () => {
   const navigation = useNavigation();
  const handleLogout = () => {
      Alert.alert(
        'Cerrar Sesión',
        '¿Estás seguro de que quieres cerrar sesión?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Cerrar Sesión',
            style: 'destructive',
            onPress: async () => {
              try {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              } catch (error) {
                console.error('Error al cerrar sesión:', error);
              }
            },
          },
        ]
      );
    };
  
  return (
    <View style={styles.container}>
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <Text style={styles.logoutText}>Cerrar Sesión</Text>
    </TouchableOpacity>
    </View>
  )
}


const styles = StyleSheet.create({
  container:{
     alignContent:"center",
     marginTop:100
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
})

export default SuperAdmon