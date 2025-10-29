import React, { useState, useEffect } from 'react';
import {
    Modal,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    TextInput,
    Image,
    Alert,
    ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AntDesign from '@expo/vector-icons/AntDesign';
import { db } from '../database/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const BotonActualizarTienda = ({ id, tiendaData, onUpdated }) => {
    const [visible, setVisible] = useState(false);
    const [nombre, setNombre] = useState('');
    const [foto, setFoto] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Sincroniza los datos cuando cambia la tienda seleccionada (por seguridad)
    useEffect(() => {
        if (tiendaData) {
            setNombre(tiendaData.nombre || '');
            setFoto(tiendaData.foto || '');
        }
    }, [tiendaData, id]);

    // ✅ Cuando el usuario presiona editar, carga los datos y abre el modal
    const abrirModal = () => {
        if (tiendaData) {
            setNombre(tiendaData.nombre || '');
            setFoto(tiendaData.foto || '');
        }
        setVisible(true);
    };

    const seleccionarImagen = async () => {
        const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permiso.granted) {
            Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos.');
            return;
        }

        const resultado = await ImagePicker.launchImageLibraryAsync({
            base64: true,
            quality: 0.5,
        });

        if (!resultado.canceled) {
            setFoto(`data:image/jpeg;base64,${resultado.assets[0].base64}`);
        }
    };

    const guardarCambios = async () => {
        if (!nombre.trim()) {
            Alert.alert('Error', 'El nombre no puede estar vacío.');
            return;
        }

        setIsLoading(true);
        try {
            await updateDoc(doc(db, 'tienda', id), {
                nombre,
                foto,
            });
            if (typeof onUpdated === 'function') {
                onUpdated({ id, nombre, foto });
            }
            Alert.alert('Éxito', 'La tienda se actualizó correctamente.');
            setVisible(false);
        } catch (error) {
            console.error('Error al actualizar tienda:', error);
            Alert.alert('Error', 'No se pudo actualizar la tienda.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View>
            {/* Botón de edición */}
            <TouchableOpacity style={styles.boton} onPress={abrirModal}>
                <AntDesign name="edit" size={20} color="black" />
            </TouchableOpacity>

            {/* Modal de edición */}
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <Text style={styles.titulo}>Editar Tienda</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Nombre de la tienda"
                            value={nombre}
                            onChangeText={setNombre}
                        />

                        {foto ? (
                            <Image
                                source={{ uri: foto }}
                                style={styles.preview}
                                resizeMode="contain"
                            />
                        ) : (
                            <Text style={styles.mensajePreview}>La imagen se mostrará aquí</Text>
                        )}

                        <TouchableOpacity style={styles.botonSeleccionar} onPress={seleccionarImagen}>
                            <Text style={styles.textoBoton}>Seleccionar Imagen</Text>
                        </TouchableOpacity>

                        {isLoading ? (
                            <ActivityIndicator size="large" color="#47acb9" />
                        ) : (
                            <View style={styles.filaBoton}>
                                <TouchableOpacity
                                    style={[styles.botonAccion, styles.cancelar]}
                                    onPress={() => setVisible(false)}
                                >
                                    <Text style={styles.textoAccion}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.botonAccion, styles.confirmar]}
                                    onPress={guardarCambios}
                                >
                                    <Text style={styles.textoAccion}>Guardar</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    boton: {
        backgroundColor: '#e3f2fd',
        padding: 8,
        borderRadius: 8,
        marginLeft: 4,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    titulo: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    preview: {
        width: 120,
        height: 120,
        borderRadius: 10,
        marginBottom: 10,
    },
    mensajePreview: {
        color: '#777',
        marginBottom: 10,
    },
    botonSeleccionar: {
        backgroundColor: '#0099cc',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 15,
    },
    textoBoton: {
        color: 'white',
        fontWeight: 'bold',
    },
    filaBoton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    botonAccion: {
        flex: 1,
        marginHorizontal: 5,
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelar: {
        backgroundColor: '#f44336',
    },
    confirmar: {
        backgroundColor: '#4CAF50',
    },
    textoAccion: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default BotonActualizarTienda;
