import React, { useState, useEffect } from 'react';
import {
    TextInput, View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Modal, Button, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BotonEliminarTienda from './BotonEliminarTienda';
import TablaProductos from './TablaProductos';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../database/firebaseConfig';
import { getDocs, collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import ModalEditarTienda from './BotonActualizarTienda';
import FormularioRegistrarProducto from './FormularioRegistrarProducto';
import ModalSeleccionarCategoria from './ModalSeleccionarCategoria';
import ModalProducto from './ModalProducto';
import ModalRegistrarTienda from './ModalRegistrarTienda';
import Entypo from '@expo/vector-icons/Entypo';


const TarjetaTienda = ({ tienda, eliminarTienda }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [categoriaModalVisible, setCategoriaModalVisible] = useState(false);
    const [tiendaSeleccionada, setTiendaSeleccionada] = useState(null);
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [productoForm, setProductoForm] = useState({
        nombre: '',
        precio: '',
        precioCompra: '',
        stock: '',
        Categoria: '',
        foto: ''
    });
    const [modoEdicion, setModoEdicion] = useState(false);
    const [productoId, setProductoId] = useState(null);

    const cargarDatos = async () => {
        setIsLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'productos'));
            const data = querySnapshot.docs
                .map((doc) => ({ id: doc.id, ...doc.data() }))
                .filter((producto) => producto.tiendaId === tiendaSeleccionada?.id);
            setProductos(data);
        } catch (error) {
            console.error('Error al obtener documentos:', error);
            Alert.alert('Error', 'No se pudieron cargar los productos.');
        } finally {
            setIsLoading(false);
        }
    };

    const cargarCategorias = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'categoria'));
            const data = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            setCategorias(data);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            Alert.alert('Error', 'No se pudieron cargar las categorías.');
        }
    };

    useEffect(() => {
        if (modalVisible && tiendaSeleccionada) {
            cargarDatos();
            cargarCategorias();
        }
    }, [modalVisible, tiendaSeleccionada]);


    const eliminarProducto = async (id) => {
        setIsLoading(true);
        try {
            await deleteDoc(doc(db, 'productos', id));
            cargarDatos();
        } catch (error) {
            console.error('Error al eliminar:', error);
            Alert.alert('Error', 'No se pudo eliminar el producto.');
        } finally {
            setIsLoading(false);
        }
    };

    const manejoCambio = (nombre, valor) => {
        setProductoForm((prev) => ({
            ...prev,
            [nombre]: valor
        }));
    };

    const guardarProducto = async () => {
        const { nombre, precio, precioCompra, stock, Categoria, foto } = productoForm;
        if (!nombre || isNaN(precio) || isNaN(precioCompra) || isNaN(stock) || !Categoria || !foto || !tiendaSeleccionada?.id) {
            Alert.alert('Error', 'Por favor, complete todos los campos con valores válidos.');
            return;
        }
        setIsLoading(true);
        try {
            await addDoc(collection(db, 'productos'), {
                nombre,
                precio: parseFloat(precio),
                precioCompra: parseFloat(precioCompra),
                stock: parseFloat(stock),
                Categoria,
                imagen: foto,
                tiendaId: tiendaSeleccionada.id
            });
            cargarDatos();
            setProductoForm({ nombre: '', precio: '', precioCompra: '', stock: '', Categoria: '', foto: '' });
        } catch (error) {
            console.error('Error al registrar producto:', error);
            Alert.alert('Error', 'No se pudo registrar el producto.');
        } finally {
            setIsLoading(false);
        }
    };

    const actualizarProducto = async () => {
        const { nombre, precio, precioCompra, stock, Categoria, foto } = productoForm;
        if (!nombre || isNaN(precio) || isNaN(precioCompra) || isNaN(stock) || !Categoria || !foto) {
            Alert.alert('Error', 'Por favor, complete todos los campos con valores válidos.');
            return;
        }
        setIsLoading(true);
        try {
            await updateDoc(doc(db, 'productos', productoId), {
                nombre,
                precio: parseFloat(precio),
                precioCompra: parseFloat(precioCompra),
                stock: parseFloat(stock),
                Categoria,
                imagen: foto
            });
            setProductoForm({ nombre: '', precio: '', precioCompra: '', stock: '', Categoria: '', foto: '' });
            setModoEdicion(false);
            setProductoId(null);
            cargarDatos();
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            Alert.alert('Error', 'No se pudo actualizar el producto.');
        } finally {
            setIsLoading(false);
        }
    };

    const iniciarEdicionProducto = (producto) => {
        setProductoForm({
            nombre: producto.nombre,
            precio: producto.precio.toString(),
            precioCompra: producto.precioCompra ? producto.precioCompra.toString() : '',
            stock: producto.stock.toString(),
            Categoria: producto.Categoria,
            foto: producto.imagen
        });
        setProductoId(producto.id);
        setModoEdicion(true);
    };

    const limpiarFormulario = () => {
        setProductoForm({ nombre: '', precio: '', precioCompra: '', stock: '', Categoria: '', foto: '' });
        setModoEdicion(false);
        setProductoId(null);
    };

    const seleccionarCategoria = (categoria) => {
        setProductoForm(prev => ({
            ...prev,
            Categoria: categoria.nombre
        }));
        setCategoriaModalVisible(false);
    };

    const abrirModalCategorias = () => {
        setCategoriaModalVisible(true);
    };

    const seleccionarImagen = async () => {
        const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permiso.status !== 'granted') {
            Alert.alert(
                'Permiso denegado',
                'Necesitamos acceso a tus fotos. Por favor, habilita los permisos en la configuración.',
                [{ text: 'OK' }]
            );
            return;
        }
        const resultado = await ImagePicker.launchImageLibraryAsync({
            base64: true,
            quality: 0.5
        });
        if (!resultado.canceled) {
            setProductoForm((prev) => ({
                ...prev,
                foto: `data:image/jpeg;base64,${resultado.assets[0].base64}`
            }));
        }
    };

    const gradientes = [
        ['#dcf1f1', '#B5FFFC'],
        ['#d3f0ce', '#a8e0d9'],
        ['#c5e9ebff', '#d3f3f0'],
        ['#c6d6f0ff', '#C2E9FB'],
        ['#ddd8f3', '#ebf3de']
    ];

    const abrirModal = (item) => {
        setTiendaSeleccionada(item);
        setModalVisible(true);
    };




    return (
        <View style={styles.container}>
            <ScrollView>
                {tienda.length === 0 ? (
                    <Text style={styles.mensajeVacio}>No hay tiendas registradas.</Text>
                ) : (
                    tienda.map((item, index) => {
                        const colores = gradientes[index % gradientes.length];
                        return (
                            <TouchableOpacity key={item.id} onPress={() => abrirModal(item)}>
                                <LinearGradient colors={colores} style={styles.tarjeta}>
                                    <Image source={{ uri: item.foto }} style={styles.imagen} />
                                    <View style={styles.info}>
                                        <Text style={styles.nombre}>{item.nombre ?? 'Sin nombre'}</Text>
                                    </View>
                                    <BotonEliminarTienda id={item.id} eliminarTienda={eliminarTienda} />
                                    <ModalEditarTienda id={item.id} tiendaData={item} />
                                </LinearGradient>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>

            <ModalProducto
                visible={modalVisible}
                 setModalVisible={setModalVisible}
                onClose={() => { setModalVisible(false); limpiarFormulario(); }}
                styles={styles}
                isLoading={isLoading}
                tiendaSeleccionada={tiendaSeleccionada}
                productoForm={productoForm}
                manejoCambio={manejoCambio}
                abrirModalCategorias={abrirModalCategorias}
                seleccionarImagen={seleccionarImagen}
                modoEdicion={modoEdicion}
                onSubmit={modoEdicion ? actualizarProducto : guardarProducto}
                productos={productos}
                editarProducto={iniciarEdicionProducto}
                eliminarProducto={eliminarProducto}
            />
           
                    
            <ModalSeleccionarCategoria
                visible={categoriaModalVisible}
                categorias={categorias}
                onClose={() => setCategoriaModalVisible(false)}
                onSeleccionar={seleccionarCategoria}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
    },
    tarjeta: {
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        marginBottom: 12
    },
    imagen: {
        width: 72,
        height: 72,
        borderRadius: 36,
        marginRight: 12
    },
    info: {
        flex: 1
    },
    nombre: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a'
    },
    mensajeVacio: {
        textAlign: 'center',
        fontSize: 16,
        color: '#df3232',
        marginTop: 20
    },
    modalContainer: {
        marginRight: 10,
        height: 350,
        width: "100%",
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',

    },
    modalContent: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        alignSelf: 'center',
        width: '100%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    modalCloseButton: {
        padding: 4
    },
    input: {
        borderWidth: 1,
        borderColor: '#c5c210ff',
        padding: 12,
        marginVertical: 6,
        borderRadius: 12,
        backgroundColor: '#fff'
    },
    botonSeleccionar: {
        backgroundColor: '#93ccb0ff',
        width: 350,
        paddingVertical: 12,
        borderRadius: 20,
        marginVertical: 8,
        alignSelf: 'center'
    },
    preview: {
        backgroundColor: "#cde4e7ff",
        borderWidth: 1,
        width: 250,
        height: 139,
        marginVertical: 8,
        borderRadius: 20,
        alignSelf: 'center'
    },
    mensajePreview: {
        textAlign: 'center',
        color: '#666',
        marginVertical: 6
    },
    titulo: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 8,
        textAlign: 'center'
    },
    textoBoton: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    loadingIndicator: {
        marginBottom: 8
    },
    modalScroll: {
        paddingBottom: 8
    },
    accionBoton: {
        borderRadius: 20,
        alignItems: "center",
        alignSelf: "center",
        backgroundColor: "#a5dee6ff",
        width: 350,
        height: 40
    },
    accionTexto: {
        marginTop: 4,
        fontSize: 20,
    },
    tarjeta_input: {
        backgroundColor: '#f9fffe',
        borderRadius: 14,
        padding: 12,
        marginVertical: 6,
        borderWidth: 1,
        borderColor: '#e1f3ed',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    categoriaContainer: {
        marginVertical: 6,
    },
    categoriaLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 8,
    },
    categoriaButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#c5c210ff',
        borderRadius: 12,
        padding: 12,
        backgroundColor: '#fff',
    },
    categoriaButtonText: {
        fontSize: 16,
        color: '#2c3e50',
        flex: 1,
    }

});

export default TarjetaTienda;