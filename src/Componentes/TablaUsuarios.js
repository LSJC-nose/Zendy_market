// ../Componentes/TablaUsuarios.js
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import BotonActualizarUsuario from '../Componentes/BotonActualizarUsuario';

const TablaUsuarios = ({ usuarios, cargarDatos }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Tabla de usuarios</Text>

      <ScrollView horizontal>
        <View>
          {/* Encabezado */}
          <View style={[styles.fila, styles.encabezado]}>
            <Text style={[styles.celda, styles.textoEncabezado, styles.colNombre]}>Nombre</Text>
            <Text style={[styles.celda, styles.textoEncabezado, styles.colCorreo]}>Correo</Text>
            <Text style={[styles.celda, styles.textoEncabezado, styles.colContraseña]}>Contraseña</Text>
            <Text style={[styles.celda, styles.textoEncabezado, styles.colRol]}>Rol</Text>
            <Text style={[styles.celda, styles.textoEncabezado, styles.colAcciones]}>Acciones</Text>
          </View>

          {/* Lista de usuarios */}
          <ScrollView style={{ maxHeight: 400 }}>
            {usuarios.map((item) => (
              <View key={item.id} style={styles.fila}>
                <Text style={[styles.celda, styles.colNombre]}>{item.nombre}</Text>
                <Text style={[styles.celda, styles.colCorreo]}>{item.correo}</Text>
                <Text style={[styles.celda, styles.colContraseña]}>
                  {item.contraseña ? '••••••' : '—'}
                </Text>
                <Text style={[styles.celda, styles.colRol]}>{item.rol}</Text>

                {/* Celda con el botón de editar centrado */}
                <View style={[styles.celdaAcciones, styles.colAcciones]}>
                  <BotonActualizarUsuario
                    id={item.id}
                    usuarioData={item}  
                    onUpdated={cargarDatos}  // ← AÑADE ESTO
                  />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  fila: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 8,
    alignItems: "center",
  },
  encabezado: {
    backgroundColor: "#d5f5f5ff",
  },
  celda: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 6,
  },
  textoEncabezado: {
    fontWeight: "bold",
    fontSize: 17,
  },
  celdaAcciones: {
    flexDirection: "row",
    justifyContent: "center", // 🔹 centramos horizontalmente el lápiz
    alignItems: "center", // 🔹 centramos verticalmente
  },
  colNombre: { width: 120 },
  colCorreo: { width: 150 },
  colContraseña: { width: 110 },
  colRol: { width: 80 },
  colAcciones: { width: 100 }, // ancho justo para un solo botón
});

export default TablaUsuarios;
