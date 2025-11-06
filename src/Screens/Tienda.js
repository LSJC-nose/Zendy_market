import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Image } from "react-native";
import Entypo from '@expo/vector-icons/Entypo';
import ModalRegistrarTienda from '../Componentes/ModalRegistrarTienda.js';
import TarjetaTienda from "../Componentes/TarjetaTienda.js";
import { collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { db, auth } from "../database/firebaseConfig.js";


export default function Tienda() {
    const [tiendas, setTiendas] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);

    const cargarDatos = async () => {
        try {
            // Obtener usuario actual
            const currentUser = auth.currentUser;
            if (!currentUser) {
                setTiendas([]);
                return;
            }

            // Buscar documento en 'usuario' por correo para obtener tiendas asignadas
            const usuarioSnap = await getDocs(query(collection(db, 'usuario'),
             where('correo', '==', currentUser.email)));
            let tiendasAsignadas = [];
            usuarioSnap.forEach((d) => {
                const data = d.data();
                if (Array.isArray(data.tiendas)) tiendasAsignadas = data.tiendas;
            });

            // Si no hay asignadas, lista vacía
            if (!Array.isArray(tiendasAsignadas) || tiendasAsignadas.length === 0) {
                setTiendas([]);
                return;
            }

            // Cargar todas y filtrar por ids asignados 
            const tiendasSnap = await getDocs(collection(db, 'tienda'));
            const todas = tiendasSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
            const filtradas = todas.filter(t => tiendasAsignadas.includes(t.id));
            setTiendas(filtradas);
        } catch (error) {
            console.error("Error al obtener documentos:", error);
        }
    };

    useEffect(() => {
        cargarDatos();
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