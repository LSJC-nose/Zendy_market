// ../Componentes/TablaCategorias.js
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import BotonEliminarProducto from './BotonEliminarProducto';

const TablaCategorias = ({ productos, eliminarProducto, editarProducto }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Lista de Categorías</Text>

      {/* Encabezado */}
      <View style={[styles.fila, styles.encabezado]}>
        <Text style={[styles.celda, styles.textoEncabezado]}>Imagen</Text>
        <Text style={[styles.celda, styles.textoEncabezado]}>Nombre</Text>
        <Text style={[styles.celda, styles.textoEncabezado]}>Acciones</Text>
      </View>

      {/* Scroll horizontal */}
      <ScrollView horizontal style={styles.scrollHorizontal}>
        <View>
          {productos.map((item) => (
            <View key={item.id} style={styles.fila}>
              {/* IMAGEN */}
              <View style={styles.celda}>
                {item.foto ? (
                  <Image source={{ uri: item.foto }} style={styles.imagen} />
                ) : (
                  <Text style={styles.sinImagen}>Sin imagen</Text>
                )}
              </View>

              {/* NOMBRE */}
              <View style={styles.celda}>
                <Text style={styles.textoCelda}>{item.nombre}</Text>
              </View>

              {/* ACCIONES: SOLO EDITAR Y ELIMINAR */}
              <View style={styles.celdaAcciones}>
                <TouchableOpacity
                  style={styles.botonEditar}
                  onPress={() => editarProducto(item)}
                >
                  <Text style={styles.textoBoton}>Editar</Text>
                </TouchableOpacity>

                <BotonEliminarProducto
                  id={item.id}
                  eliminarProducto={eliminarProducto}
                />
              </View>
            </View>
          ))}
        </View>
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
  scrollHorizontal: {
    maxHeight: 400,
  },
  fila: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    minWidth: 450, // Ajustado: menos ancho sin "Ver"
  },
  encabezado: {
    backgroundColor: '#d48d7b',
    paddingVertical: 10,
    minWidth: 450,
  },
  celda: {
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  celdaAcciones: {
    width: 180, // Reducido: solo 2 botones
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 8,
  },
  textoEncabezado: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
  },
  textoCelda: {
    fontSize: 14,
    textAlign: 'center',
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
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
  },
  textoBoton: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default TablaCategorias;