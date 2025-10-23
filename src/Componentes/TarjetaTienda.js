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
        const { nombre, precio, stock, Categoria, foto } = productoForm;
        if (!nombre || isNaN(precio) || isNaN(stock) || !Categoria || !foto || !tiendaSeleccionada?.id) {
            Alert.alert('Error', 'Por favor, complete todos los campos con valores válidos.');
            return;
        }
        setIsLoading(true);
        try {
            await addDoc(collection(db, 'productos'), {
                nombre,
                precio: parseFloat(precio),
                stock: parseFloat(stock),
                Categoria,
                imagen: foto,
                tiendaId: tiendaSeleccionada.id
            });
            cargarDatos();
            setProductoForm({ nombre: '', precio: '', stock: '', Categoria: '', foto: '' });
        } catch (error) {
            console.error('Error al registrar producto:', error);
            Alert.alert('Error', 'No se pudo registrar el producto.');
        } finally {
            setIsLoading(false);
        }
    };

    const actualizarProducto = async () => {
        const { nombre, precio, stock, Categoria, foto } = productoForm;
        if (!nombre || isNaN(precio) || isNaN(stock) || !Categoria || !foto) {
            Alert.alert('Error', 'Por favor, complete todos los campos con valores válidos.');
            return;
        }
        setIsLoading(true);
        try {
            await updateDoc(doc(db, 'productos', productoId), {
                nombre,
                precio: parseFloat(precio),
                stock: parseFloat(stock),
                Categoria,
                imagen: foto
            });
            setProductoForm({ nombre: '', precio: '', stock: '', Categoria: '', foto: '' });
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
            stock: producto.stock.toString(),
            Categoria: producto.Categoria,
            foto: producto.imagen
        });
        setProductoId(producto.id);
        setModoEdicion(true);
    };

    const limpiarFormulario = () => {
        setProductoForm({ nombre: '', precio: '', stock: '', Categoria: '', foto: '' });
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


    const ModalHeader = () => (
        <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
                {modoEdicion ? 'Actualizar Producto' : 'Registro de Productos'} en {tiendaSeleccionada?.nombre ?? 'Tienda'}
            </Text>
            <TouchableOpacity onPress={() => { setModalVisible(false); limpiarFormulario(); }} style={styles.modalCloseButton}>
                <AntDesign name="close" size={24} color="black" />
            </TouchableOpacity>
        </View>
    );

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
                                </LinearGradient>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
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
                                    <ModalHeader />
                                    <View style={styles.tarjeta_input}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nombre del producto"
                                        value={productoForm.nombre}
                                        onChangeText={(nombre) => manejoCambio('nombre', nombre)}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Precio"
                                        value={productoForm.precio}
                                        onChangeText={(precio) => manejoCambio('precio', precio)}
                                        keyboardType="numeric"
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Stock"
                                        value={productoForm.stock}
                                        onChangeText={(stock) => manejoCambio('stock', stock)}
                                        keyboardType="numeric"
                                    />
                                    <View style={styles.categoriaContainer}>
                                        <Text style={styles.categoriaLabel}>Categoría:</Text>
                                        <TouchableOpacity 
                                            style={styles.categoriaButton} 
                                            onPress={abrirModalCategorias}
                                        >
                                            <Text style={styles.categoriaButtonText}>
                                                {productoForm.Categoria || 'Selecciona una categoría'}
                                            </Text>
                                            <AntDesign name="down" size={16} color="#666" />
                                        </TouchableOpacity>
                                    </View>
                                     </View>
                                     <View style={styles.tarjeta_input}>
                                    {productoForm.foto ? (
                                        <Image
                                            source={{ uri: productoForm.foto }}
                                            style={styles.preview}
                                            resizeMode="contain"
                                            onError={() => Alert.alert('Error', 'No se pudo cargar la imagen')}
                                        />
                                        
                                    ) : (
                                        <Text style={styles.mensajePreview}>La imagen se mostrará aquí</Text>
                                    )}
                                    <TouchableOpacity style={styles.botonSeleccionar} onPress={seleccionarImagen}>
                                        <Text style={styles.textoBoton}>Seleccionar Imagen</Text>
                                    </TouchableOpacity>

                                    <View style={styles.actionsRow}>
                                        <TouchableOpacity
                                            style={styles.accionBoton}
                                            onPress={modoEdicion ? actualizarProducto : guardarProducto}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={styles.accionTexto}>
                                                {modoEdicion ? 'Actualizar' : 'Guardar'}
                                            </Text>
                                        </TouchableOpacity>

                                    </View>
                                    </View>
                                    <ScrollView>
                                        <TablaProductos
                                            productos={productos}
                                            editarProducto={iniciarEdicionProducto}
                                            eliminarProducto={eliminarProducto}
                                        />
                                    </ScrollView>
                                
                               
                                </>
                            )}
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

          
            <Modal
                visible={categoriaModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setCategoriaModalVisible(false)}
            >
                <View style={styles.categoriaModalContainer}>
                    <View style={styles.categoriaModalContent}>
                        <View style={styles.categoriaModalHeader}>
                            <Text style={styles.categoriaModalTitle}>Seleccionar Categoría</Text>
                            <TouchableOpacity 
                                onPress={() => setCategoriaModalVisible(false)}
                                style={styles.categoriaModalCloseButton}
                            >
                                <AntDesign name="close" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.categoriaList}>
                            {categorias.length === 0 ? (
                                <Text style={styles.categoriaEmptyText}>
                                    No hay categorías disponibles. Crea una categoría primero.
                                </Text>
                            ) : (
                                categorias.map((categoria) => (
                                    <TouchableOpacity
                                        key={categoria.id}
                                        style={styles.categoriaItem}
                                        onPress={() => seleccionarCategoria(categoria)}
                                    >
                                        <Text style={styles.categoriaItemText}>{categoria.nombre}</Text>
                                        <AntDesign name="right" size={16} color="#666" />
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
    tarjeta_input:{
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
    },
    categoriaModalContainer: {
        flex: 1,
        backgroundColor: 'rgba(234, 243, 245, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoriaModalContent: {
        backgroundColor: "#e5f3f5ff",
        borderRadius: 12,
        width: '90%',
        maxHeight: '70%',
        padding: 16,
    },
    categoriaModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e1f3ed',
        paddingBottom: 12,
    },
    categoriaModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    categoriaModalCloseButton: {
        padding: 4,
    },
    categoriaList: {
        maxHeight: 300,
    },
    categoriaItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    categoriaItemText: {
        fontSize: 16,
        color: '#2c3e50',
        flex: 1,
    },
    categoriaEmptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        padding: 20,
        fontStyle: 'italic',
    }

});

export default TarjetaTienda;