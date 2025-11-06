import React, { useState, useEffect } from 'react';
import {
    Image,
    Modal,
    View,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    TouchableOpacity,
    Text,
    StyleSheet
} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import FormularioRegistrarProducto from './FormularioRegistrarProducto';
import TablaProductos from './TablaProductos';
import ModalRegistroProductos from './ModalRegistroProductos';
import Entypo from '@expo/vector-icons/Entypo';
import { db } from '../database/firebaseConfig.js';
import { collection, getDocs } from 'firebase/firestore';
import { useRoute, useNavigation } from '@react-navigation/native';

const ModalProducto = ({
    imagen,
    visible,
    onClose,
    styles,
    isLoading,
    tiendaSeleccionada,
    productoForm,
    manejoCambio,
    abrirModalCategorias,
    seleccionarImagen,
    modoEdicion,
    onSubmit,
    productos,
    editarProducto,
    eliminarProducto
}) => {
    const [modalRegistroVisible, setModalVisibleRegistro] = useState(false);
    const [tiendas, setTiendas] = useState([]);
    const { producto } = useState([]);
    const route = useRoute();

    const ModalHeader = () => (
        <View style={styles.modalHeader}>
            {/*
      <Text style={styles.modalTitle}>
        {modoEdicion ? 'Actualizar Producto' : 'Registro de Productos'} en {tiendaSeleccionada?.nombre ?? 'Tienda'}
      </Text>
      */}

        </View>
    );

    const cargarTiendas = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'tienda'));
            const tiendasData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTiendas(tiendasData);

            if (producto?.tiendaId) {
                const tienda = tiendasData.find((t) => t.id === producto.tiendaId);
                setTiendaInfo(tienda || null);
            }
        } catch (error) {
            console.error('Error al cargar las tiendas:', error);
        }
    };

    useEffect(() => {
        cargarTiendas();
    }, []);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContainer}
            >
                <View style={styles.modalContent}>
                    {isLoading && <ActivityIndicator size="large" color="#47acb9" style={styles.loadingIndicator} />}
                    <ScrollView contentContainerStyle={styles.modalScroll}>
                        {tiendaSeleccionada && (
                            <>
                                <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                                    <AntDesign name="close" size={24} color="black" />
                                </TouchableOpacity>
                                <View style={styles.tiendaInfoContainer}>

                                    {tiendaSeleccionada?.foto && (
                                        <Image source={{ uri: tiendaSeleccionada.foto }} style={styles.tiendaImagen} />
                                    )}

                                    <Text style={styles.tiendaNombre}>
                                        {tiendaSeleccionada.nombre}
                                    </Text>
                                </View>

                                <ModalHeader />

                                <ScrollView>
                                    <TouchableOpacity style={styles.registrarProducto} onPress={() => setModalVisibleRegistro(true)}>
                                        <Text>Registrar productos</Text>
                                    </TouchableOpacity>

                                    <TablaProductos
                                        productos={productos}
                                        editarProducto={editarProducto}
                                        eliminarProducto={eliminarProducto}
                                    />
                                </ScrollView>

                                <ModalRegistroProductos
                                    visible={modalRegistroVisible}
                                    onClose={() => setModalVisibleRegistro(false)}
                                    styles={styles}
                                    isLoading={isLoading}
                                    tiendaSeleccionada={tiendaSeleccionada}
                                    productoForm={productoForm}
                                    manejoCambio={manejoCambio}
                                    abrirModalCategorias={abrirModalCategorias}
                                    seleccionarImagen={seleccionarImagen}
                                    modoEdicion={modoEdicion}
                                    onSubmit={onSubmit}
                                    productos={productos}
                                    editarProducto={editarProducto}
                                    eliminarProducto={eliminarProducto}
                                />
                            </>
                        )}
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    imagen: {
        width: 72,
        height: 72,
        borderRadius: 36,
        marginRight: 12
    },
    tiendaInfoContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    tiendaImagen: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 8,
        resizeMode: 'cover',

    },
    tiendaNombre: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        margin: 20,
        borderRadius: 10,
        padding: 16,
        maxHeight: '90%',
    },
    modalScroll: {
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalCloseButton: {
        padding: 4,
    },
    loadingIndicator: {
        marginVertical: 20,
    },
    registrarProducto: {
        width: 100,
        padding: 10,
        backgroundColor: '#e2fae0ff',
        borderRadius: 8,
        alignItems: 'center',
    },
});

export default ModalProducto;