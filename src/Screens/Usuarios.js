// src/Screens/Usuarios.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
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
import TablaUsuarios from "../Componentes/TablaUsuarios.js";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [nuevaUsuario, setNuevaUsuario] = useState({
    nombre: "",
    correo: "",
    contraseña: "",
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);
  const [loading, setLoading] = useState(false);

  // CARGAR USUARIOS
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "usuario"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsuarios(data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      Alert.alert("Error", "No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // ELIMINAR USUARIO
  const eliminarUsuario = async (id) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "usuario", id));
      Alert.alert("Éxito", "Usuario eliminado");
      cargarDatos();
    } catch (error) {
      console.error("Error al eliminar:", error);
      Alert.alert("Error", "No se pudo eliminar.");
    } finally {
      setLoading(false);
    }
  };

  // EDITAR USUARIO
  const editarUsuario = (usuario) => {
    setNuevaUsuario({
      nombre: usuario.nombre || "",
      correo: usuario.correo || "",
      contraseña: usuario.contraseña || "",
    });
    setUsuarioId(usuario.id);
    setModoEdicion(true);
  };

  // MANEJO DE INPUTS
  const manejarCambio = (campo, valor) => {
    setNuevaUsuario((prev) => ({ ...prev, [campo]: valor }));
  };

  // GUARDAR NUEVO USUARIO
  const guardarUsuario = async () => {
    if (!nuevaUsuario.nombre.trim() || !nuevaUsuario.correo.trim()) {
      Alert.alert("Error", "Nombre y correo son obligatorios");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "usuario"), {
        nombre: nuevaUsuario.nombre,
        correo: nuevaUsuario.correo,
        contraseña: nuevaUsuario.contraseña || "",
        fechaCreacion: new Date(),
      });

      setNuevaUsuario({ nombre: "", correo: "", contraseña: "" });
      Alert.alert("Éxito", "Usuario agregado");
      cargarDatos();
    } catch (error) {
      console.error("Error al guardar:", error);
      Alert.alert("Error", "No se pudo guardar.");
    } finally {
      setLoading(false);
    }
  };

  // ACTUALIZAR USUARIO
  const actualizarUsuario = async () => {
    if (!nuevaUsuario.nombre.trim() || !nuevaUsuario.correo.trim()) {
      Alert.alert("Error", "Nombre y correo son obligatorios");
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, "usuario", usuarioId), {
        nombre: nuevaUsuario.nombre,
        correo: nuevaUsuario.correo,
        contraseña: nuevaUsuario.contraseña || "",
      });

      setNuevaUsuario({ nombre: "", correo: "", contraseña: "" });
      setModoEdicion(false);
      setUsuarioId(null);
      Alert.alert("Éxito", "Usuario actualizado");
      cargarDatos();
    } catch (error) {
      console.error("Error al actualizar:", error);
      Alert.alert("Error", "No se pudo actualizar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>
        {modoEdicion ? "Editar Usuario" : "Registrar Usuario"}
      </Text>

      {/* FORMULARIO */}

      {/*
      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={nuevaUsuario.nombre}
        onChangeText={(texto) => manejarCambio("nombre", texto)}
      />

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={nuevaUsuario.correo}
        onChangeText={(texto) => manejarCambio("correo", texto)}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña (opcional)"
        value={nuevaUsuario.contraseña}
        onChangeText={(texto) => manejarCambio("contraseña", texto)}
        secureTextEntry
      />

      <Button
        title={loading ? "Guardando..." : modoEdicion ? "Actualizar" : "Guardar"}
        onPress={modoEdicion ? actualizarUsuario : guardarUsuario}
        disabled={loading}
        color={modoEdicion ? "#e67e22" : "#27ae60"}
      />

      */}

      {/* TABLA DE USUARIOS */}
      <View style={styles.tablaContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#3498db" />
        ) : (
          <TablaUsuarios
            usuarios={usuarios}
            eliminarUsuario={eliminarUsuario}
            editarUsuario={editarUsuario}
            onUpdated={cargarDatos}  // ← AÑADE ESTO
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
  tablaContainer: {
    marginTop: 30,
  },
});

export default Usuarios;