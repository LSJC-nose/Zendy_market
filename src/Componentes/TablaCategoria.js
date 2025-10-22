import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import BotonEliminarProducto from './BotonEliminarProducto';

const TablaCategorias = ({ productos, eliminarProducto, editarProducto }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Lista de Categorías</Text>

      <View style={[styles.fila, styles.encabezado]}>
        <Text style={[styles.celda, styles.textoEncabezado]}>Imagen</Text>
        <Text style={[styles.celda, styles.textoEncabezado]}>Nombre</Text>
        <Text style={[styles.celda, styles.textoEncabezado]}>Acciones</Text>
      </View>

      <ScrollView style={styles.scroll}>
        {productos.map((item) => (
          <View key={item.id} style={styles.fila}>
            <View style={styles.celda}>
              {item.foto ? (
                <Image
                  source={{ uri: item.foto }}
                  style={styles.imagen}
                />
              ) : (
                <Text style={styles.sinImagen}>Sin imagen</Text>
              )}
            </View>
            <Text style={styles.celda}>{item.nombre}</Text>
            <View style={styles.celdaAcciones}>
              <BotonEliminarProducto
                id={item.id}
                eliminarProducto={eliminarProducto} // ← ¡EXACTO!
              />
              <TouchableOpacity
                style={styles.botonEditar}
                onPress={() => editarProducto(item)}
              >
                <Text>Editar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    elevation: 3,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#2c3e50',
  },
  scroll: {
    maxHeight: 400,
  },
  fila: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  encabezado: {
    backgroundColor: '#d48d7b',
    paddingVertical: 8,
  },
  celda: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },
  celdaAcciones: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  textoEncabezado: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 15,
  },
  imagen: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  sinImagen: {
    fontSize: 12,
    color: '#999',
  },
  botonEditar: {
    backgroundColor: '#f39c12',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
});

export default TablaCategorias;