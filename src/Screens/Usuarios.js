// src/Screens/Usuarios.js
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { db } from "../database/firebaseConfig.js";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import TablaUsuarios from "../Componentes/TablaUsuarios.js";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // FILTRAR USUARIOS
  const usuariosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return usuarios;
    const term = busqueda.toLowerCase();
    return usuarios.filter(
      (u) =>
        u.nombre?.toLowerCase().includes(term) ||
        u.correo?.toLowerCase().includes(term)
    );
  }, [usuarios, busqueda]);

  // ELIMINAR USUARIO
  const eliminarUsuario = async (id) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "usuario", id));
      cargarDatos(); // ← Recarga automática
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Lista de Usuarios</Text>

      {/* BUSCADOR */}
      <View style={styles.buscadorContainer}>
        <TextInput
          style={styles.buscador}
          placeholder="Buscar por nombre o correo..."
          value={busqueda}
          onChangeText={setBusqueda}
          clearButtonMode="while-editing"
        />
      </View>

      {/* TABLA */}
      <View style={styles.tablaContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#3498db" />
        ) : (
          <TablaUsuarios
            usuarios={usuariosFiltrados}
            eliminarUsuario={eliminarUsuario}
            cargarDatos={cargarDatos}  // ← PASA LA FUNCIÓN
          />
        )}
      </View>

      {/*
      FORMULARIO DE REGISTRO / EDICIÓN
      */}
      {/*
      <Text style={styles.titulo}>
        {modoEdicion ? "Editar Usuario" : "Registrar Usuario"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={nuevaUsuario.nombre}
        onChangeText={(t) => manejarCambio("nombre", t)}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={nuevaUsuario.correo}
        onChangeText={(t) => manejarCambio("correo", t)}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña (opcional)"
        value={nuevaUsuario.contraseña}
        onChangeText={(t) => manejarCambio("contraseña", t)}
        secureTextEntry
      />

      <Button
        title={loading ? "Guardando..." : modoEdicion ? "Actualizar" : "Guardar"}
        onPress={modoEdicion ? actualizarUsuario : guardarUsuario}
        disabled={loading}
        color={modoEdicion ? "#e67e22" : "#27ae60"}
      />
      */}
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
  buscadorContainer: {
    marginBottom: 20,
  },
  buscador: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fff",
    fontSize: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tablaContainer: {
    flex: 1,
  },
});

export default Usuarios;