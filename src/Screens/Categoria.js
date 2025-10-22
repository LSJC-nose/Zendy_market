// src/Screens/Categoria.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { db } from "../database/firebaseConfig.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import TablaCategorias from "../Componentes/TablaCategoria.js";

const Categoria = () => {
  const [categorias, setCategorias] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre: "",
    foto: "",
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [categoriaId, setCategoriaId] = useState(null);
  const [loading, setLoading] = useState(false);

  // CARGAR CATEGORÍAS
  const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "categoria"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategorias(data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      Alert.alert("Error", "No se pudieron cargar las categorías.");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

    // ELIMINAR CATEGORÍA
  const eliminarCategoria = async (id) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "categoria", id)); // ← CORREGIDO: "categoria"
      Alert.alert("Éxito", "Categoría eliminada");
      cargarDatos();
    } catch (error) {
      console.error("Error al eliminar:", error);
      Alert.alert("Error", "No se pudo eliminar.");
    } finally {
      setLoading(false);
    }
  };

  // EDITAR CATEGORÍA
  const editarCategoria = (cat) => {
    setNuevaCategoria({
      nombre: cat.nombre || "",
      foto: cat.foto || "",
    });
    setCategoriaId(cat.id);
    setModoEdicion(true);
  };

  // MANEJO DE INPUTS
  const manejarCambio = (campo, valor) => {
    setNuevaCategoria((prev) => ({ ...prev, [campo]: valor }));
  };

  // GUARDAR NUEVA CATEGORÍA
  const guardarCategoria = async () => {
    if (!nuevaCategoria.nombre.trim()) {
      Alert.alert("Error", "El nombre es obligatorio");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "categoria"), {
        nombre: nuevaCategoria.nombre,
        foto: nuevaCategoria.foto,
        fechaCreacion: new Date(),
      });

      setNuevaCategoria({ nombre: "", foto: "" });
      Alert.alert("Éxito", "Categoría agregada");
      cargarDatos();
    } catch (error) {
      console.error("Error al guardar:", error);
      Alert.alert("Error", "No se pudo guardar.");
    } finally {
      setLoading(false);
    }
  };

  // ACTUALIZAR CATEGORÍA
  const actualizarCategoria = async () => {
    if (!nuevaCategoria.nombre.trim()) {
      Alert.alert("Error", "El nombre es obligatorio");
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, "categoria", categoriaId), {
        nombre: nuevaCategoria.nombre,
        foto: nuevaCategoria.foto,
      });

      setNuevaCategoria({ nombre: "", foto: "" });
      setModoEdicion(false);
      setCategoriaId(null);
      Alert.alert("Éxito", "Categoría actualizada");
      cargarDatos();
    } catch (error) {
      console.error("Error al actualizar:", error);
      Alert.alert("Error", "No se pudo actualizar.");
    } finally {
      setLoading(false);
    }
  };

  // SELECCIONAR IMAGEN
  const seleccionarImagen = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert("Permiso denegado", "Necesitamos acceso a tus fotos.");
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!resultado.canceled) {
      setNuevaCategoria((prev) => ({
        ...prev,
        foto: `data:image/jpeg;base64,${resultado.assets[0].base64}`,
      }));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>
        {modoEdicion ? "Editar Categoría" : "Registrar Categoría"}
      </Text>

      {/* FORMULARIO */}
      <TextInput
        style={styles.input}
        placeholder="Nombre de la categoría"
        value={nuevaCategoria.nombre}
        onChangeText={(texto) => manejarCambio("nombre", texto)}
      />

      <TouchableOpacity style={styles.botonSeleccionar} onPress={seleccionarImagen}>
        <Text style={styles.textoBoton}>Seleccionar Imagen</Text>
      </TouchableOpacity>

      {nuevaCategoria.foto ? (
        <Image source={{ uri: nuevaCategoria.foto }} style={styles.preview} />
      ) : (
        <Text style={styles.mensajePreview}>La imagen se mostrará aquí</Text>
      )}

      <Button
        title={loading ? "Guardando..." : modoEdicion ? "Actualizar" : "Guardar"}
        onPress={modoEdicion ? actualizarCategoria : guardarCategoria}
        disabled={loading}
        color={modoEdicion ? "#e67e22" : "#27ae60"}
      />

      {/* TABLA */}
      <View style={styles.tablaContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#3498db" />
        ) : (
          <TablaCategorias
            productos={categorias}
            eliminarProducto={eliminarCategoria}
            editarProducto={editarCategoria}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#2c3e50",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  botonSeleccionar: {
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  textoBoton: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  preview: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  mensajePreview: {
    textAlign: "center",
    color: "#777",
    marginBottom: 12,
    fontStyle: "italic",
  },
  tablaContainer: {
    marginTop: 30,
  },
});

export default Categoria;