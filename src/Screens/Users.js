import React, { useState } from 'react';
import {
  TouchableOpacity,
  Modal,
  Text,
  StyleSheet,
  View,
  TextInput,
  FlatList,
  Image,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { Button } from 'react-native';
import Foundation from '@expo/vector-icons/Foundation';
import { useNavigation } from '@react-navigation/native';



const Users = () => {
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);

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
      <Text style={styles.texto}>Hola Jose</Text>

      <View style={styles.contenedor1}>
        <Text style={styles.texto1}>Tu cuenta</Text>
      </View>

      <View style={styles.contenedor2}>
        <Text style={styles.texto}>Tus direcciones</Text>
        <Text style={styles.texto}>Métodos de pagos</Text>
        <Text style={styles.texto}>Preferencias de entregas</Text>
      </View>

      <View style={styles.contenedor2}>
        <Text style={styles.texto}>Opciones de notificaciones</Text>
        <Text style={styles.texto}>Valorar aplicación</Text>
        <Text style={styles.texto}>Preferencias de catálogos</Text>
      </View>

      <View style={styles.contenedor2}>
        <Text style={styles.texto}>Idiomas</Text>
        <Text style={styles.texto}>Políticas de privacidad</Text>
     
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.texto_modal}>Quieres vender tus productos.</Text>
                <View style={styles.content}>
                  <View style={styles.icono}>
                    <Foundation name="shopping-bag" size={24} color="black" style={styles.icono_modal} />
                  </View>

                  <TouchableOpacity
                    style={styles.texto_modal2}
                    onPress={() => {
                      setModalVisible(false);
                      navigation.navigate('Tienda');
                    }}
                  >
                    <Text style={styles.textoBoton}>Registra tu tienda →</Text>
                  </TouchableOpacity>

                </View>

              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(209, 230, 235, 1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contenedor1: {
    width: '100%',
    height: 60,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  contenedor2: {
    width: '100%',
    height: 190,
    backgroundColor: 'white',
    borderRadius: 10,
    marginVertical: 5,
  },
  texto1: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  texto: {
    margin: 5,
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 10,
    marginTop: 16,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',

  },
  modalContent: {
    height: 290,
    backgroundColor: 'rgba(222, 234, 236, 1)',
    padding: 35,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(177, 208, 216, 1)',
  },
  texto_modal: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  texto_modal2: {
    fontSize: 16,
    marginLeft: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },

  icono: {
    backgroundColor: 'rgba(190, 190, 190, 1)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Users;