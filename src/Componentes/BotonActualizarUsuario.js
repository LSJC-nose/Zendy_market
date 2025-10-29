// ../Componentes/BotonActualizarUsuario.js
import React, { useState, useEffect } from 'react';
import { Modal, Text, TouchableOpacity, View, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { db } from '../database/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const BotonActualizarUsuario = ({ id, usuarioData, onUpdated }) => {
  const [visible, setVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Carga datos cuando cambia usuarioData
  useEffect(() => {
    if (usuarioData && id) {
      setNombre(usuarioData.nombre || '');
      setCorreo(usuarioData.correo || '');
      setContraseña(usuarioData.contraseña || '');
    }
  }, [usuarioData, id]);

  const abrirModal = () => {
    if (!usuarioData || !id) {
      Alert.alert('Error', 'Datos del usuario no disponibles');
      return;
    }
    setVisible(true);
  };

  const guardarCambios = async () => {
    if (!nombre.trim() || !correo.trim()) {
      Alert.alert('Error', 'Nombre y correo son obligatorios');
      return;
    }

    if (!id) {
      Alert.alert('Error', 'ID del usuario no válido');
      return;
    }

    setIsLoading(true);
    try {
      const usuarioRef = doc(db, 'usuario', id);
      await updateDoc(usuarioRef, {
        nombre: nombre.trim(),
        correo: correo.trim(),
        contraseña: contraseña || '',
      });

      Alert.alert('Éxito', 'Usuario actualizado correctamente');
      setVisible(false);
      if (onUpdated) onUpdated(); // ← Recarga la lista
    } catch (error) {
      console.error('Error al actualizar:', error);
      Alert.alert('Error', `No se pudo actualizar: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      <TouchableOpacity style={styles.boton} onPress={abrirModal}>
        <AntDesign name="edit" size={20} color="#0066cc" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.titulo}>Editar Usuario</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={nombre}
              onChangeText={setNombre}
            />
            <TextInput
              style={styles.input}
              placeholder="Correo"
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña (dejar vacío para no cambiar)"
              value={contraseña}
              onChangeText={setContraseña}
              secureTextEntry
            />

            {isLoading ? (
              <ActivityIndicator size="large" color="#47acb9" />
            ) : (
              <View style={styles.filaBoton}>
                <TouchableOpacity
                  style={[styles.botonAccion, styles.cancelar]}
                  onPress={() => setVisible(false)}
                >
                  <Text style={styles.textoAccion}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.botonAccion, styles.confirmar]}
                  onPress={guardarCambios}
                >
                  <Text style={styles.textoAccion}>Guardar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  boton: { padding: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: 'white', padding: 20, borderRadius: 12, width: '85%', elevation: 5 },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#2c3e50' },
  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 12, backgroundColor: '#f9f9f9' },
  filaBoton: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  botonAccion: { flex: 1, marginHorizontal: 5, padding: 12, borderRadius: 8, alignItems: 'center' },
  cancelar: { backgroundColor: '#e74c3c' },
  confirmar: { backgroundColor: '#27ae60' },
  textoAccion: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default BotonActualizarUsuario;