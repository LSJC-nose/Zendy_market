import { StyleSheet, Text, View } from 'react-native'
import {useEffect,useState} from 'react';
import { collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from "../database/firebaseConfig.js";
import TarjetaTodasTiendas from '../Componentes/TarjetaTodasTiendas.js';

export default function TodasTiendasSuper() {
  const [todasTiendas, setTodasTiendas] = useState([]);

  // CARGAR CATEGORÍAS
  const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "tienda"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTodasTiendas(data);
    } catch (error) {
      console.error("Error al cargar las tiendas:", error);
      Alert.alert("Error", "No se pudieron cargar las tiendas.");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <View>
     <TarjetaTodasTiendas
     tienda={todasTiendas}
     />
    </View>
  )
}

const styles = StyleSheet.create({})