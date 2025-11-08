import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Image } from "react-native";
import Entypo from '@expo/vector-icons/Entypo';
import ModalRegistrarTienda from '../Componentes/ModalRegistrarTienda.js';
import TarjetaTienda from "../Componentes/TarjetaTienda.js";
import { collection, getDocs, deleteDoc, doc, query, where, getDoc } from "firebase/firestore";
import { db, auth } from "../database/firebaseConfig.js";
import { onAuthStateChanged } from 'firebase/auth';


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