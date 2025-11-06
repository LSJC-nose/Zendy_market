import { StyleSheet, Text, View, TextInput } from 'react-native'
import {useEffect,useState} from 'react';
import { db } from "../database/firebaseConfig.js";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import FormularioRegistrarUsuarios from '../Componentes/FormularioRegistrarUsuarios';

export default function RegistrarUsuarios() {
     const [usuarios, setUsuarios] = useState([]);
    const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "usuario"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsuarios(data);
    } catch (error) {
      console.error("Error al obtener documentos:", error);
    }
  };

   useEffect(() => {
    cargarDatos();
  }, []);

    return (
        <View>
          <FormularioRegistrarUsuarios/> 
        </View>
    )
}

const styles = StyleSheet.create({})