// ../Componentes/BotonActualizarUsuario.js
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { db } from '../database/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const BotonActualizarUsuario = ({ id, usuarioData, onUpdated }) => {
  const [visible, setVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      if (onUpdated) onUpdated(); // ← RECARGA LA TABLA
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
              placeholder="Nombre completo"
              value={nombre}
              onChangeText={setNombre}
            />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
              autoCapitalize="none"
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
  boton: { padding: 8, backgroundColor: '#e3f2fd', borderRadius: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: 'white', padding: 22, borderRadius: 14, width: '88%', elevation: 10 },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 18, color: '#2c3e50', textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', backgroundColor: '#f9f9f9', padding: 14, borderRadius: 10, marginBottom: 14, fontSize: 16 },
  filaBoton: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  botonAccion: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center', marginHorizontal: 6 },
  cancelar: { backgroundColor: '#e74c3c' },
  confirmar: { backgroundColor: '#27ae60' },
  textoAccion: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default BotonActualizarUsuario;