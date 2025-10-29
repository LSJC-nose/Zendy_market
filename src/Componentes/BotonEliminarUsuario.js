// ../Componentes/BotonEliminarUsuario.js
import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

const BotonEliminarUsuario = ({ id, eliminarUsuario }) => {
  const [visible, setVisible] = useState(false);

  const confirmarEliminar = () => {
    setVisible(false);
    eliminarUsuario(id);
  };

  return (
    <View>
      <TouchableOpacity style={styles.boton} onPress={() => setVisible(true)}>
        <AntDesign name="delete" size={20} color="#f82727ff" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.texto}>¿Eliminar este usuario?</Text>
            <View style={styles.filaBoton}>
              <TouchableOpacity style={[styles.botonAccion, styles.cancelar]} onPress={() => setVisible(false)}>
                <Text style={styles.textoAccion}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botonAccion, styles.confirmar]} onPress={confirmarEliminar}>
                <Text style={styles.textoAccion}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  boton: { padding: 8 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modal: { backgroundColor: "white", padding: 20, borderRadius: 10, width: "80%", alignItems: "center" },
  texto: { fontSize: 18, marginBottom: 20 },
  filaBoton: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  botonAccion: { flex: 1, marginHorizontal: 5, padding: 10, borderRadius: 10, alignItems: "center" },
  cancelar: { backgroundColor: "#96bb2fff" },
  confirmar: { backgroundColor: "#ed3946" },
  textoAccion: { color: "white", fontWeight: "bold" },
});

export default BotonEliminarUsuario;