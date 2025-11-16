import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Image, Button } from "react-native";
import Entypo from '@expo/vector-icons/Entypo';
import ModalRegistrarTienda from '../Componentes/ModalRegistrarTienda.js';
import TarjetaTienda from "../Componentes/TarjetaTienda.js";
import { collection, getDocs, deleteDoc, doc, query, where, getDoc, addDoc } from "firebase/firestore";
import { db, auth } from "../database/firebaseConfig.js";
import { onAuthStateChanged } from 'firebase/auth';
import * as DocumentPicker from "expo-document-picker";
import { Alert } from "react-native";
import * as FileSystem from "expo-file-system/legacy";


export default function Tienda() {
    const [tiendas, setTiendas] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Cargar tiendas para el usuario especificado (o para auth.currentUser si no se pasa)
    const cargarDatos = async (userParam) => {
        try {
            const usuarioActual = userParam || auth.currentUser;
            console.log('cargarDatos - usuarioActual:', usuarioActual && { uid: usuarioActual.uid, email: usuarioActual.email });
            if (!usuarioActual) {
                setTiendas([]);
                return;
            }

            // Intentar obtener el documento del usuario por UID (más fiable)
            let tiendasAsignadas = [];
            try {
                const userRef = doc(db, 'usuario', usuarioActual.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    if (Array.isArray(data.tiendas)) tiendasAsignadas = data.tiendas;
                } else {
                    console.log('No existe documento usuario/{uid}, fallback a query por correo');
                    // Fallback a query por correo
                    const usuarioSnap = await getDocs(query(collection(db, 'usuario'), where('correo', '==', usuarioActual.email)));
                    usuarioSnap.forEach((d) => {
                        const data = d.data();
                        if (Array.isArray(data.tiendas)) tiendasAsignadas = data.tiendas;
                    });
                }
            } catch (err) {
                console.error('Error consultando usuario por UID:', err);
            }

            // Si no hay asignadas, lista vacía
            if (!Array.isArray(tiendasAsignadas) || tiendasAsignadas.length === 0) {
                setTiendas([]);
                return;
            }

            // Cargar todas y filtrar por ids asignados 
            const tiendasSnap = await getDocs(collection(db, 'tienda'));
            const todas = tiendasSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
            console.log('tiendasAsignadas:', tiendasAsignadas);
            const filtradas = todas.filter(t => tiendasAsignadas.includes(t.id));
            console.log('tiendas filtradas count:', filtradas.length);
            setTiendas(filtradas);
        } catch (error) {
            console.error("Error al obtener documentos:", error);
        }
    };

    // Escuchar el estado de autenticación y cargar las tiendas cuando el usuario esté disponible
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (user) {
                cargarDatos(user);
            } else {
                setTiendas([]);
            }
        });
        return () => unsubscribe();
    }, []);

    const eliminarTienda = async (id) => {
        try {
            await deleteDoc(doc(db, "tienda", id));
            await cargarDatos();
        } catch (error) {
            console.error("Error al eliminar:", error)
        }
    };


const extraerYGuardarTiendas = async () => {
  try {
    // Abrir selector de documentos para elegir archivo Excel
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      Alert.alert("Cancelado", "No se seleccionó ningún archivo.");
      return;
    }

    const { uri, name } = result.assets[0];
    console.log(`Archivo seleccionado: ${name} en ${uri}`);

    // Leer archivo como base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Enviar a Lambda
    const response = await fetch("https://thzg0v3rj9.execute-api.us-east-1.amazonaws.com/extraerexcel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ archivoBase64: base64 }),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP en Lambda: ${response.status}`);
    }

    const body = await response.json();
    const { datos } = body;

    if (!datos || !Array.isArray(datos) || datos.length === 0) {
      Alert.alert("Error", "No se encontraron datos en el Excel o el archivo está vacío.");
      return;
    }

    console.log("Datos extraídos del Excel:", datos);

    // Guardar en Firestore
    let guardados = 0;
    let errores = 0;

    for (const tienda of datos) {
      try {
        // Validación mínima para evitar guardar basura (descartar foto si existe)
        if (!tienda.nombre) {
          console.log("Fila inválida, se ignora:", tienda);
          continue;
        }

        // Preparar datos, descartando foto
        const datosTienda = {
          nombre: tienda.nombre || "",
          admin: tienda.admin || "",
          // foto: descartada, no se incluye
          // fechaCreacion: se puede agregar serverTimestamp() si es un campo de Firestore con timestamp automático
        };

        await addDoc(collection(db, "tiendas"), datosTienda);

        guardados++;
      } catch (err) {
        console.error("Error guardando tienda:", tienda, err);
        errores++;
      }
    }

    Alert.alert(
      "Éxito",
      `Se guardaron ${guardados} tiendas. Errores: ${errores}.`,
      [{ text: "OK" }]
    );

  } catch (error) {
    console.error("Error en extraerYGuardarTiendas:", error);
    Alert.alert("Error", `Error procesando el Excel: ${error.message}`);
  }
};



    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.registrarTienda} onPress={() => setModalVisible(true)}>
                <Entypo name="shop" size={30} color="black" />
            </TouchableOpacity>

            <ModalRegistrarTienda
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                recargarTiendas={cargarDatos}

            />
 <TarjetaTienda
                eliminarTienda={eliminarTienda}
                tienda={tiendas} />
            <View style={{ marginVertical: 10, padding: 10, margin: 10 }}>
                <Button title="Insertar datos desde archivo excel" onPress={extraerYGuardarTiendas} />

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
         backgroundColor:"#c6cfccff",
        flex: 1,
        padding: 20,
    },
    registrarTienda: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
});