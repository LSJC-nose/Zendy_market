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
import { collection, getDocs, addDoc, doc, updateDoc, query, where, getDoc } from "firebase/firestore";
import { db, auth } from "../database/firebaseConfig.js";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system'; // si no se usa, puedes quitarlo

const ModalRegistrarTienda = ({ modalVisible, setModalVisible, recargarTiendas }) => {
    const [nuevaTienda, setNuevaTienda] = useState({ nombre: '', foto:'' });
    const [tienda, setTienda] = useState([]);
    const [foto, setFoto] = useState('');
    const [nombre, setNombreTienda] = useState('');
    const [horas, setHoras] = useState(''); // por si quieres usarlo más adelante


    const limpiarFormulario = () => {
        setFoto('');
        setNombreTienda('');
        setHoras('');
    };

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

    useEffect(() => {
        cargarDatos();
    }, []);

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

    const validarDatos = async (datos) => {
        try {
            const response = await fetch("https://45nxa849s1.execute-api.us-east-1.amazonaws.com/validartiendas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos),
            });

            const resultado = await response.json();

            if (resultado.success) {
                return resultado.data; // Datos limpios y validados
            } else {
                const errores = Array.isArray(resultado.errors) ? resultado.errors : [resultado.errors];
                Alert.alert("Errores en los datos", errores.join("\n"));
                return null;
            }
        } catch (error) {
            console.error("Error al validar con Lambda:", error);
            Alert.alert("Error", "No se pudo validar la información con el servidor.");
            return null;
        }
    };

    const guardarTienda = async () => {
        //const datosValidados = await validarDatos({ nuevaTienda });

        //if (datosValidados) {
            try {
                const tiendaRef = await addDoc(collection(db, 'tienda'), {
                    nombre,
                    foto,
                    fechaCreacion: new Date(),
                    admins: auth.currentUser ? [auth.currentUser.email] : [],
                });

                // Vincular tienda al usuario administrador actual (array tiendas)
                const current = auth.currentUser;
                if (current && current.email) {
                    const usuarioQuery = query(collection(db, 'usuario'), 
                    where('correo', '==', current.email));
                    const usuarioSnap = await getDocs(usuarioQuery);
                    if (!usuarioSnap.empty) {
                        const userDoc = usuarioSnap.docs[0];
                        const userRef = doc(db, 'usuario', userDoc.id);
                        const userData = userDoc.data();
                        const actuales = Array.isArray(userData.tiendas) ? userData.tiendas : [];
                        const nuevas = actuales.includes(tiendaRef.id) ? actuales : [...actuales, tiendaRef.id];
                        await updateDoc(userRef, { tiendas: nuevas });
                    }
                }

                // limpiar y cerrar
                limpiarFormulario();
                setModalVisible(false);
                recargarTiendas();
                setNuevaTienda({ nombre: "",  foto: "" });
                Alert.alert('Éxito', 'Tienda agregada correctamente 🎉');
            } catch (error) {
                console.error('Error al guardar tienda: ', error);
                Alert.alert('Error', 'No se pudo guardar la tienda.');
            }
        //}
    };


    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(false);
                limpiarFormulario();
            }}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.encabezadoIcono}>
                            <Text style={styles.iconoEmoji}>🛍️</Text>
                            <Text style={styles.iconoSub}>Crea y administra tus tiendas</Text>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.label}>Foto</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="URL o nombre del archivo"
                                placeholderTextColor="#999"
                                value={foto}
                                onChangeText={setFoto}
                                keyboardType="default"
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
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.label}>Nombre de la tienda</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre de la tienda"
                                value={nombre}
                                onChangeText={setNombreTienda}
                            />
                        </View>


                        <View style={styles.spacer} />
                    </ScrollView>

                    <View style={styles.barraAcciones}>
                        <TouchableOpacity
                            style={styles.botonCerrar}
                            onPress={() => {
                                setModalVisible(false);
                                limpiarFormulario();
                            }}
                        >
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
        paddingHorizontal: 12,
    },
    modal: {
        backgroundColor: "#fff",
        borderRadius: 20,
        paddingVertical: 14,
        width: "92%",
        maxHeight: "88%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    scrollContent: {
        paddingHorizontal: 18,
        paddingBottom: 8,
    },
    encabezadoIcono: {
        alignItems: 'center',
        marginVertical: 6,
        padding: 6,
        borderRadius: 12,
        backgroundColor: '#e6f7f0',
        borderWidth: 1,
        borderColor: '#c7f0e0',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    iconoEmoji: {
        fontSize: 20,
        marginRight: 6,
    },
    iconoSub: {
        fontSize: 14,
        color: '#2a7a62',
        fontWeight: '600',
    },
    card: {
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
    label: {
        fontSize: 14,
        color: '#2b5d4e',
        marginBottom: 6,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: "#25c510ff",
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#fff',
        marginBottom: 6,
    },
    preview: {
        width: 180,
        height: 180,
        marginTop: 8,
        alignSelf: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#d6f3ea',
    },
    mensajePreview: {
        textAlign: 'center',
        color: '#777',
        fontSize: 12,
        marginTop: 6,
    },
    barraAcciones: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        borderTopWidth: 1,
        borderColor: '#eee',
        backgroundColor: '#fff',
        borderRadius: 0,
    },
    botonGuardar: {
        backgroundColor: "#2bb673",
        paddingVertical: 12,
        paddingHorizontal: 22,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120,
    },
    botonCerrar: {
        backgroundColor: "#e74c3c",
        paddingVertical: 12,
        paddingHorizontal: 22,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120,
    },
    textoBoton: {
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 16,
    },
    botonSeleccionar: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 6,
        alignItems: 'center',
    },
    spacer: {
        height: 8,
    },
    scroll: {
        marginVertical: 6,
    },
});

export default ModalRegistrarTienda;