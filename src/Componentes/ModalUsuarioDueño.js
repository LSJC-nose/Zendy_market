import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Modal,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../database/firebaseConfig.js';

export default function ModalUsuarioDueño({
    visible,
    modalVisible,
    onClose,
    setModalVisible,
    tiendaId,
}) {
    const isVisible = visible ?? modalVisible ?? false;
    const handleClose = onClose ?? (() => setModalVisible?.(false));
    const [nombreTienda, setNombreTienda] = useState('');

    const [usuarioDueño, setUsuarioDueño] = useState([]);
    const [loading, setLoading] = useState(true);

    const cargarUsers = async () => {
        try {
            if (!tiendaId) {
                setUsuarioDueño([]);
                return;
            }

            // Buscar usuarios relacionados a la tienda por array-contains en campo `tiendas`
            const usuariosRef = collection(db, 'usuario');
            const q = query(usuariosRef, where('tiendas', 'array-contains', tiendaId));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            // Si existe campo rol, priorizar mostrar dueños
            const propietarios = data.filter((u) => (u.rol || '').toLowerCase() === 'dueño');
            setUsuarioDueño(propietarios.length > 0 ? propietarios : data);
        } catch (error) {
            console.error('Error al cargar los usuarios:', error);
            Alert.alert('Error', 'No se pudieron cargar los usuarios.');
        } finally {
            setLoading(false);
        }
    };

    const cargarNombreTienda = async () => {
  try {
    if (!tiendaId) return;

    const tiendaRef = collection(db, 'tienda');
    const q = query(tiendaRef, where('__name__', '==', tiendaId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const tiendaData = querySnapshot.docs[0].data();
      setNombreTienda(tiendaData.nombre || 'Tienda sin nombre');
    } else {
      setNombreTienda('Tienda no encontrada');
    }
  } catch (error) {
    console.error('Error al obtener la tienda:', error);
    setNombreTienda('Error al cargar la tienda');
  }
};

    useEffect(() => {
        if (isVisible) {
            cargarUsers();
            cargarNombreTienda();
        }
    }, [isVisible]);

    return (
        <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={handleClose}>
            <View style={styles.backdrop}>
                <View style={styles.container}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <AntDesign name="close" size={24} color="black" />
                    </TouchableOpacity>
                    {usuarioDueño.map((item) => (
                        <View key={item.id} >
                            <Text style={styles.nombre}>Tienda: {nombreTienda}</Text>
                            <View style={styles.tarjeta}>
                                <View style={styles.info}>
                                    <Text style={styles.nombre}>Dueño: {item.nombre}</Text>
                                    <Text style={styles.nombre}>Correo: {item.correo}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    container: {
        borderWidth: 1,
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#b7e9ecff',
        borderRadius: 12,
        paddingTop: 8,
        paddingBottom: 16,
        paddingHorizontal: 16,
        maxHeight: '80%',
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 4,
    },
    tarjeta: {
        elevation: 6,

        flexDirection: 'row',
        backgroundColor: '#e0f7f5ff',
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    nombre: {
        margin: 7,
        fontSize: 16,
        fontWeight: 'bold',
    },
});