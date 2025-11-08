import { StyleSheet, Text, View, TextInput, Image, Button, TouchableOpacity } from 'react-native'
import { useState } from 'react';
import { db } from "../database/firebaseConfig";
import { collection, addDoc, setDoc, doc } from "firebase/firestore";
import { Picker } from '@react-native-picker/picker';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';


export default function FormularioRegistrarUsuarios({ cargarDatos }) {
    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [contraseña, setContraseña] = useState("");
    const [rol, setRol] = useState("");
    const navigation = useNavigation();

    const auth = getAuth();

    const guardarUsuarios = async () => {
        if (nombre && correo && contraseña && rol) {
            try {

                const userCredential = await createUserWithEmailAndPassword(auth, correo, contraseña);
                const user = userCredential.user;

                await setDoc(doc(collection(db, "usuario"), user.uid), {
                    uid: user.uid,
                    nombre: nombre,
                    correo: correo,
                    rol: rol,
                    creadoEn: new Date()
                });

                // Limpiar campos
                setNombre("");
                setCorreo("");
                setContraseña("");
                setRol("");
                navigation.replace('MyTabsCliente');
            } catch (error) {
                console.error("Error al registrar usuario:", error);
                alert("Hubo un error al registrar el usuario. Verifica los datos o intenta más tarde.");
            }
        } else {
            alert("Por favor, complete todos los campos.");
        }
    };


    const rolesDisponibles = [
        { valor: 'Administrador', label: 'Administrador' },
        { valor: 'Cliente', label: 'Cliente' },

    ];

    return (
        <View style={styles.containerPrincipal}>
            <Image source={require('../../IMAGENES/logo_zendy.png')} style={styles.logo} />
            <View style={styles.container}>
                <View style={styles.formulario}>
                    <Text style={styles.encabezado}>Registrate</Text>
                    <Text style={styles.label}>Selecciona un rol:</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={rol}
                            onValueChange={(itemValue) => setRol(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Seleccione un rol..." value="" />
                            {rolesDisponibles.map((item) => (
                                <Picker.Item key={item.valor} label={item.label} value={item.valor} />
                            ))}
                        </Picker>
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Nombre completo"
                        value={nombre}
                        onChangeText={setNombre}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Correo electrónico"
                        value={correo}
                        keyboardType="email-address"
                        onChangeText={setCorreo}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña"
                        value={contraseña}
                        onChangeText={setContraseña}
                        secureTextEntry
                    />
                    <Text style={styles.textoServiciosCuenta}>Al crear una cuenta, acepto los Términos y la Política de privacidad.</Text>
                    <TouchableOpacity style={styles.btnRegistro} onPress={guardarUsuarios} >
                        <Text>Ingresar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    containerPrincipal: {
        backgroundColor: "#addbd1ff",
    },
    container: {
        elevation: 10,
        borderWidth: 1,
        borderColor: "#b1d844ff",
        borderTopEndRadius: 30,
        borderTopStartRadius: 30,
        marginTop: 4,
        padding: 20,
        alignSelf: "center",
        height: "100%",
        backgroundColor: "#daeceaff",
    },
    titulo: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10
    },
    formulario: {
        marginTop: 40
    },
    input: {
        borderRadius: 20,
        borderBottomWidth: 2,
        borderColor: 'rgba(34, 186, 197, 1)',
        padding: 10,
        marginBottom: 10
    },
    btnRegistro: {
        borderWidth: 1,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        width: 330,
        height: 39,
        borderRadius: 20,
        borderColor: "#3110c5ff",
        backgroundColor: "#76c2c5ff"
    },
    textoServiciosCuenta: {
        padding: 20
    },
    encabezado: {
        alignSelf: "center",
        fontSize: 40,
        padding: 10
    },
    logo: {
        alignSelf: "center",
        marginTop: 35,
    },
    label: {
        marginBottom: 5,
        fontSize: 16,
        fontWeight: 'bold'
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#63d3dbff',
        borderRadius: 20,
        marginBottom: 10,
        overflow: 'hidden'
    },
    picker: {
        height: 55,
        width: '100%',
    }

})