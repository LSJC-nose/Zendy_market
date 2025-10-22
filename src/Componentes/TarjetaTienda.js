import React, { useState, useEffect } from 'react';
import {
    TextInput,
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    Modal,
    Button,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator
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
    const [tiendaSeleccionada, setTiendaSeleccionada] = useState(null);
    const [productos, setProductos] = useState([]);
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

    useEffect(() => {
        if (modalVisible && tiendaSeleccionada) {
            cargarDatos();
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
        ['#eedabd', '#d3f3f0'],
        ['#A1C4FD', '#C2E9FB'],
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
                        {isLoading && <ActivityIndicator size="large" color="#47acb9" />}
                        <ScrollView>
                            {tiendaSeleccionada && (
                                <>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <AntDesign style={styles.cerrarmodal} name="close" size={24} color="black" />
                                    </TouchableOpacity>
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
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Categoría"
                                        value={productoForm.Categoria}
                                        onChangeText={(Categoria) => manejoCambio('Categoria', Categoria)}
                                    />
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
                                    <Text style={styles.titulo}>
                                        {modoEdicion ? 'Actualizar Producto' : 'Registro de Productos'}
                                    </Text>
                                    <Button
                                        title={modoEdicion ? 'Actualizar' : 'Guardar'}
                                        onPress={modoEdicion ? actualizarProducto : guardarProducto}
                                    />
                                    <Button
                                        title="Cancelar"
                                        onPress={() => {
                                            setProductoForm({ nombre: '', precio: '', stock: '', Categoria: '', foto: '' });
                                            setModoEdicion(false);
                                            setModalVisible(false);
                                        }}
                                    />
                                    <TablaProductos
                                        productos={productos}
                                        editarProducto={iniciarEdicionProducto}
                                        eliminarProducto={eliminarProducto}
                                    />
                                </>
                            )}
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
    },
    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10
    },
    input: {
        borderWidth: 1,
        borderColor: '#25c510',
        padding: 10,
        marginBottom: 10,
        borderRadius: 20
    },
    tarjeta: {
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        marginBottom: 12
    },
    imagen: {
        width: 80,
        height: 80,
        borderRadius: 50,
        marginRight: 15
    },
    mensajePreview: {
        textAlign: 'center',
        color: '#999',
        marginBottom: 10
    },
    info: {
        flex: 1
    },
    nombre: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#0f0e0e',
        marginBottom: 50
    },
    mensajeVacio: {
        textAlign: 'center',
        fontSize: 16,
        color: '#df3232',
        marginTop: 20
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(191, 206, 219, 0.5)'
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        width: '96%',
        maxHeight: '90%'
    },
    botonSeleccionar: {
        backgroundColor: '#47acb9',
        width: 200,
        paddingVertical: 12,
        borderRadius: 10,
        marginBottom: 10
    },
    cerrarmodal: {
        marginLeft: 300
    },
    preview: {
        width: 200,
        height: 200,
        marginBottom: 10,
        borderRadius: 10,
        alignSelf: 'center'
    },
    textoBoton: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold'
    }
});

export default TarjetaTienda;