import React, { useState, useEffect } from 'react';
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
  Button,
  ScrollView,
} from 'react-native';
import Foundation from '@expo/vector-icons/Foundation';
import { useNavigation } from '@react-navigation/native';
import { db } from "../database/firebaseConfig.js";
import { collection, getDocs, getDoc, doc, deleteDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, deleteUser, signOut, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from '@expo/vector-icons/AntDesign';
// ScrollView se importa desde 'react-native' arriba
const Users = () => {
  const [nombreActual, setNombreActual] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const navigation = useNavigation();

  // Arreglo de usuarios y posible usuario actual
  const [usuarios, setUsuarios] = useState([]);
  // Si quieres, puedes mantener un nombre de usuario actual separado
  // const [nombreUsuarioActual, setNombreUsuarioActual] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');

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

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Opción 1: usar displayName de Auth
        // setNombreActual(user.displayName ?? 'Usuario');

        // Opción 2: leer desde Firestore con UID
        const docRef = doc(db, 'usuario', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNombreActual(data.nombre ?? user.displayName ?? 'Usuario');
        } else {
          setNombreActual(user.displayName ?? 'Usuario');
        }
      } else {
        setNombreActual(null);
      }
    });

    // Leer la bandera de modo anónimo al montar
    (async () => {
      try {
        const val = await AsyncStorage.getItem('isAnonymous');
        setIsAnonymous(val === 'true');
      } catch (e) {
        console.error('Error leyendo isAnonymous en Users:', e);
      }
    })();

    return () => unsubscribe();
  }, []);


  const EliminarCuenta = () => {
    Alert.alert(
      'Eliminar cuenta',
      '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) {
              setLoading(false);
              Alert.alert('Error', 'No hay un usuario autenticado.');
              return;
            }

            // Intentar eliminar la cuenta de Authentication primero
            try {
              await deleteUser(user);
            } catch (authErr) {
              // Si requiere reautenticación, mostrar modal para pedir contraseña (si es usuario con email/password)
              if (authErr && authErr.code === 'auth/requires-recent-login') {
                const hasPasswordProvider = (user.providerData || []).some(p => p.providerId === 'password');
                if (hasPasswordProvider) {
                  // Abrir modal para reautenticación
                  setShowReauthModal(true);
                  setLoading(false);
                  return;
                } else {
                  // Si no es password provider (Google, Facebook...), pedir al usuario que inicie sesión con su proveedor
                  Alert.alert('Reautenticación requerida', 'Por seguridad, vuelve a iniciar sesión con tu proveedor (Google/Facebook) y luego elimina la cuenta.');
                  try {
                    await signOut(auth);
                  } catch (e) {
                    // ignorar
                  }
                  navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                  setLoading(false);
                  return;
                }
              }

              console.error('No se pudo eliminar el usuario de Auth:', authErr);
              Alert.alert('Error', 'No se pudo eliminar la cuenta. Intenta nuevamente.');
              setLoading(false);
              return;
            }

            // Si la cuenta de Auth se eliminó correctamente, eliminar el documento en Firestore
            try {
              await deleteDoc(doc(db, 'usuario', user.uid));
            } catch (errDoc) {
              console.warn('No se pudo eliminar el documento de Firestore:', errDoc);
              // continuar: la cuenta de Auth al menos fue eliminada
            }

            // Hacer signOut (puede fallar si ya se eliminó el usuario, lo ignoramos)
            try {
              await signOut(auth);
            } catch (e) {
              // ignorar
            }

            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            setLoading(false);
          },
        },
      ]
    );
  };

  

  return (
    <View style={styles.container}>

      <View style={styles.contenedortextoBienvenida}>
        <View>
          <AntDesign style={styles.iconoUser} name="user" size={40} color="black" />
          <Text style={styles.textoBienvenida}>
            {isAnonymous ? ' ' : `'Bienvenido, ${nombreActual ?? 'Inicializando'}'`}
          </Text>
        </View>
      </View>
      <ScrollView>
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

      <View style={styles.contenedor4}>
        <Text style={styles.texto}>Idiomas</Text>
        <Text style={styles.texto}>Políticas de privacidad</Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
        {!isAnonymous && (
          <TouchableOpacity style={styles.EliminarCuentaButton} onPress={EliminarCuenta}>
            <Text style={styles.logoutText}>Eliminar Cuenta</Text>
          </TouchableOpacity>
        )}
      </View>
      </ScrollView>
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
  usuarioContainer: {
    marginVertical: 8,
  },
  textoNombre: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  contenedor1: {
    width: 380,
    height: 60,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    
  },
  contenedor2: {
    width: 380,
    height: 190,
    backgroundColor: 'white',
    borderRadius: 10,
    marginVertical: 5,
  },
  contenedor4: {
    width: '100%',
    height: 230,
    backgroundColor: 'white',
    borderRadius: 10,
    marginVertical: 5,
  },
  contenedortextoBienvenida: {
    backgroundColor: 'rgba(142, 211, 228, 1)',
    marginTop: -10,
    elevation: 3,
    width: '100%',
    height: 160,
    backgroundColor: 'white',
    marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
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
    alignSelf: 'center',
    width: '80%',
    backgroundColor: '#e2e04fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutText: {
    color: '#ad9d9dff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textoBienvenida: {
    borderBottomWidth: 2,
    borderColor: 'rgba(34, 186, 197, 1)',
    marginBottom: 10,
    fontSize: 19,
    fontWeight: 'bold',
  },
  EliminarCuentaButton: {
    alignSelf: 'center',
    width: '80%',
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  iconoUser: {
    marginTop: 45,
    alignSelf: 'center',
    marginBottom: 10,
  },
});

export default Users;