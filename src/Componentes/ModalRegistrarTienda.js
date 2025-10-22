import React, { useState, useEffect } from 'react';
import {
    Image,
    Modal,
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert
} from 'react-native';
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../database/firebaseConfig.js";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const ModalRegistrarTienda = ({ modalVisible, setModalVisible, recargarTiendas }) => {
    const [tienda, setTienda] = useState([]);
    const [foto, setFoto] = useState('');
    const [nombre, setNombreTienda] = useState('');
    const [horas, setHoras] = useState('');

    const cargarDatos = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "tienda"));
            const data = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTienda(data);
        } catch (error) {
            console.error("Error al obtener documentos:", error);
        }
    };

    const guardarTienda = async () => {
        try {
            await addDoc(collection(db, 'tienda'), {
                foto,
                nombre,
                fechaCreacion: new Date(),
            });

            setFoto('');
            setNombreTienda('');
            setHoras('');

            Alert.alert(
                'Éxito',
                'Tienda agregada correctamente 🎉',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setModalVisible(false);
                            recargarTiendas();
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error al guardar tienda: ', error);
            Alert.alert('Error', 'No se pudo guardar la tienda.');
        }
    };


    useEffect(() => {
    }, []);

    // Función para seleccionar imagen y convertirla a Base64
    const seleccionarImagen = async () => {
        const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permiso.granted) {
            Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos.');
            return;
        }

        const resultado = await ImagePicker.launchImageLibraryAsync({
            base64: true,
            quality: 0.5, // reducir tamaño
        });

        if (!resultado.canceled) {
            setFoto(`data:image/jpeg;base64,${resultado.assets[0].base64}`);
        }
    };


    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <ScrollView>
                        <Text style={styles.titulo}>🛍️ Registrar Tienda</Text>

                        <Text style={styles.label}>Foto (URL o nombre del archivo)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej. https://miimagen.com/foto.png"
                            placeholderTextColor="#999"
                            value={foto}
                            onChangeText={setFoto}
                        />

                        {foto ? (
                            <Image
                                source={{ uri: foto }}
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

                        <Text style={styles.label}>Nombre de la tienda</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre de la tienda"
                            value={nombre}
                            onChangeText={setNombreTienda}
                        />
                    </ScrollView>

                    {/*
          <ScrollView style={styles.scroll}>
            <TablaTienda tienda={tienda} />
          </ScrollView>
         */}

                    <View style={styles.botones}>
                        <TouchableOpacity style={styles.botonCerrar} onPress={() => setModalVisible(false)}>
                            <Text style={styles.textoBoton}>Cerrar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.botonGuardar} onPress={guardarTienda}>
                            <Text style={styles.textoBoton}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 10,
    },
    modal: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        width: "95%",
        maxHeight: "90%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    titulo: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
        color: "#333",
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: "#555",
    },
    input: {
        borderWidth: 1,
        borderColor: "#25c510ff",
        padding: 10,
        marginBottom: 10,
        borderRadius: 8,
    },
    preview: {
        width: 200,
        height: 200,
        marginBottom: 10,
        borderRadius: 10,
        alignSelf: 'center',
    },
    mensajePreview: {
        textAlign: 'center',
        color: '#999',
        marginBottom: 10,
    },
    scroll: {
        marginBottom: 20,
    },
    botones: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    botonGuardar: {
        backgroundColor: "#4CAF50",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    botonCerrar: {
        backgroundColor: "#f44336",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    textoBoton: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
        textAlign: "center",
    },
    botonSeleccionar: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        borderRadius: 10,
        marginBottom: 10,
    },
});

export default ModalRegistrarTienda;