import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Image } from "react-native";
import Entypo from '@expo/vector-icons/Entypo';
import ModalRegistrarTienda from '../Componentes/ModalRegistrarTienda.js';
import TarjetaTienda from "../Componentes/TarjetaTienda.js";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../database/firebaseConfig.js";


export default function Tienda() {
    const [tiendas, setTiendas] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);

    const cargarDatos = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "tienda"));
            const data = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTiendas(data);
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
        flex: 1,
        padding: 20,
    },
    registrarTienda: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
});